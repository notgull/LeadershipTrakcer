/*
 * src/server.ts
 * LeadershipTrakcer - Martial arts attendance logger
 *
 * Copyright (c) 2019, John Nunley and Larson Rivera
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// contains the express server to run
import * as assert from "assert";
import * as bodyParser from 'body-parser';
import * as cookieParser from "cookie-parser";
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as nunjucks from "nunjucks";
import * as path from "path";

import { Attendance } from "./attendance";
import { Belt, parseBelt } from "./belt";
import { ChangeAttendance } from "./attendance-common";
import { checkUsernameUsage, checkEmailUsage } from "./users/check-existence";
import { emailRegex, Nullable } from "./utils";
import { EventRecord } from "./eventRecord";
import { exists, readFile } from "./promises";
import { initializeSchema } from './schema';
import { render } from "./render";
import { SessionTable } from "./users/sessions";
import { Student } from "./student";
import { User } from "./users/index";

import getDiagram from "./pages/diagram";
import getLeaderboard from "./pages/leaderboard";
import getStudentManager from "./pages/manage-students";

const sessionTable = new SessionTable();

function getUser(req: express.Request): Nullable<User> {
  const sessionId = req.cookies["sessionId"];
  if (!sessionId) return null;

  return sessionTable.checkSession(sessionId);
}

function getUsername(req: express.Request): Nullable<string> {
  const user = getUser(req);
  if (user) return user.username;
  else return null;
}

function adminLock(req: express.Request, res: express.Response): boolean {
  const user = getUser(req);

  if (user && user.isAdmin) return true;
  else {
    res.status(403);
    res.send(render("This page requires administrator privileges. If you believe you are an administrator, log in. If you are already logged in, contact a system administrator for assistance.", getUsername(req)));
    return false;
  }
}

function doRedirect(res: express.Response, uri: string, cookies: any = {}) {
  let result = {
    redirect: uri,
    cookies: cookies
  };
  res.json(result);
}

// main function
export async function getServer(): Promise<express.Application> {
  // initialize schema
  await initializeSchema();

  // initialize express.js
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());

  // get bundled frontend script
  app.get("/bundle.js", async function(req: express.Request, res: express.Response) {
    const bundle = await readFile("dist/bundle.js"); // should be in dist/ root
    res.type("application/javascript");
    res.send(bundle);
  });

  // get login page
  app.get("/login", async function(req: express.Request, res: express.Response) {
    const loginPage = await readFile("html/login.html");
    res.send(render(loginPage.toString(), getUsername(req)));
  });

  // process a login request
  app.post("/process-login", async function(req: express.Request, res: express.Response) {
    const { username, password } = req.body;

    try {
      const user = await User.loadByUsername(username);
      if (!user) {
        doRedirect(res, "/login?errors=1");
        return;
      }

      if (!(await user.validate(password))) {
        doRedirect(res, "/login?errors=1");
        return;
      }

      // add user to session table
      const id = sessionTable.addSession(user, false);
      doRedirect(res, "/", { "sessionId": id});
    } catch (e) {
      console.error(e);
      doRedirect(res, "/login?errors=2");
    }
  });

  // get registration page
  app.get("/register", async function(req: express.Request, res: express.Response) {
    const registerPage = await readFile("html/register.html");
    res.send(render(registerPage.toString(), getUsername(req)));
  });

  // process a registration request
  app.post("/process-register", async function(req: express.Request, res: express.Response) {
    const { username, password, email } = req.body;

    // validate username/password
    try {
      let error = 0;
      if (username.trim().length === 0) error |= 1;

      if (password.trim().length === 0) error |= 2;
      else if (password.trim().length < 8) error |= 256;

      if (email.trim().length === 0) error |= 4;
      else if (!(emailRegex.test(email))) error |= 128;

      // tell if something is taken
      if (error === 0) {
        const taken = await Promise.all([
          checkUsernameUsage(username),
          checkEmailUsage(email)
        ]);

        if (taken[0]) error |= 512;
        if (taken[1]) error |= 1024;
      }

      if (error !== 0) {
        doRedirect(res, `/register?errors=${error}`);
        return;
      }

      // create a new user
      const user = await User.createNewUser(username, password, email, false);
      const id = sessionTable.addSession(user, false);
      doRedirect(res,"/",{"sessionId":id});
    } catch(e) {
      console.error(e);
      doRedirect(res, "/register?errors=2048"); // internal error
      return;
    }
  });

  // get create student page
  app.get("/new-student", async function(req: express.Request, res: express.Response) {
    //if (adminLock(req, res)) {
      const newStudentPage = await readFile("html/createstudent.html");
      res.send(render(newStudentPage.toString(), getUsername(req)));
    //}
  });

  // process the creation of a new student
  app.post("/process-new-student", async function(req: express.Request, res: express.Response) {
    //if (adminLock(req, res)) {
      const { first, last, belt } = req.body;

      try {
        let error = 0;
        if (first.trim().length === 0) error |= 4;
        if (first.trim().length === 0) error |= 8;

        if (belt.trim().length === 0) error |= 16;
        else if (!parseBelt(belt)) {
          error |= 2;
        }

        // check the session
        const username = getUsername(req);
        if (!username) {
          error |= 32;
        }

        // check for first/last combination
        if (error === 0) {
          if (await Student.checkCombination(first, last)) error |= 1;
        }

        if (error) {
          let errUrl = `/new-student?errors=${error}`;
          if (error & 2) errUrl += `&belt=${belt}`;
          doRedirect(res, errUrl);
          return;
        }

        // create a new student
        let student = new Student(first, last, parseBelt(belt), 0);
        let user = await User.loadByUsername(username);

        student.userId = user.userId;
        await student.submit();

        doRedirect(res, "/");
      } catch (e) {
        console.error(e);
        doRedirect(res, "/new-student?errors=64");
        return;
      }
    //}
  });

  // admin console to manage students
  app.get("/manage-students", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      const page = req.query.page || 0;
      res.send(render(await getStudentManager(page), getUsername(req)));
    }
  });

  // change a student's rp
  app.get("/change-rp", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      const studentId = req.query.studentid || -1;
      const results = await Promise.all([
        Student.loadById(studentId),
        readFile("html/change-rp.html")
      ]);

      if (!results[0]) {
        res.send(render(
          'This student does not exist. <a href="/manage-students">Go back to management console</a>',
           getUsername(req)
        ));
      }

      const page = nunjucks.renderString(results[1].toString(), {
        name: `${results[0].first} ${results[0].last}`,
        rp: results[0].rp
      });
      res.send(render(page, getUsername(req)));
    }
  });

  app.get("/delete-student", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
        let studentId = req.query.studentid || -1;

        try {
            const student = await Student.loadById(studentId);
            const html = await readFile("html/delete-student.html");

            if (!student) {
              res.send(render(
                'This student does not exist. <a href="/manage-students">Go back to management console</a>',
                getUsername(req)
              ));
            }

            const page = nunjucks.renderString(html.toString(), { name: `${student.first} ${student.last}` });
            res.send(render(page, getUsername(req)));
        } catch (e) {
            doRedirect(res, `/delete-student?studentid=${studentId}&errors=2`);
        }
    }
  });

  app.post("/process-delete-student", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      let studentId = req.body.studentid; 

      try {
          await Student.deleteById(studentId);
          doRedirect(res, `/manage-students`);
      } catch (e) {
          console.error(e);
          doRedirect(res, `/delete-student?studentid=${studentId}&errors=2`);
      }
    }
  });

  app.post("/process-change-rp", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) { // todo: better admin lock?
      try {
        const { studentId, rp } = req.body;
        const student = await Student.loadById(studentId);

        if (!student) {
          doRedirect(res, `/change-rp?student-id=${student.studentId}&errors=1`);
          return;
        }

        student.rp = rp;
        await student.submit();
        doRedirect(res, `/change-rp?student-id=${studentId}&errors=8`);
      } catch (e) {
        doRedirect(res, `/change-rp?student-id=${req.body.studentId}&errors=4`);
      }
    }
  });

  //New events
  app.get("/new-event", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      const newEventPage = await readFile("html/createEvent.html");
      res.send(render(newEventPage.toString(), getUsername(req)));
    }
  });

  app.post("/process-new-event", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      const {eventName, pts, date, description} = req.body;

      try {
        let error = 0;
        if (eventName.trim().length === 0) error |= 4;
        if (date.trim().length === 0) error |= 8;
        if (pts.trim().length === 0) error |= 16;
        if (description.trim().length === 0) error |= 32;

        // check the session
        const username = getUsername(req);
        if (!username) {
          error |= 32;
        }

        const event = new EventRecord(eventName, pts, new Date(date), description);

        // check for name/date combination
        if (error === 0) {
          if (await EventRecord.checkCombination(eventName, event.date)) error |= 1;
        }

        if (error) {
          let errUrl = `/new-event?errors=${error}`;
          doRedirect(res, errUrl);
          return;
        }

        await event.submit();

        doRedirect(res, "/");
      } catch (e) {
        console.error(e);
        doRedirect(res, "/new-event?errors=128");
      }
    }
  });

  // logout user
  app.post("/process-logout", function(req: express.Request, res: express.Response) {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      sessionTable.removeSession(sessionId);
      res.clearCookie("sessionId");
    }
    doRedirect(res, "/");
  });

  // process user's attendance
  app.post("/process-attendance", async function(req: express.Request, res: express.Response) {
    // TODO: make this less of a copy and paste
    let user = getUser(req);
    let key;

    try {
      if (!user) {
        key = [];
      } else if (user.isAdmin) {
        key = "admin";
      } else {
        key = (await Student.loadByUser(user.userId)).map((student: Student): number => {
          return student.studentId;
        });
      }     

      if (key.length === 0) {
        doRedirect(res, "/?errors=2");
      }

      console.log(`User key is ${JSON.stringify(key)}`);

      // check to see if their operation is valid
      let attendanceChanges: Array<ChangeAttendance> = JSON.parse(req.body.attendance);
      if (key !== "admin") {
        for (const change of attendanceChanges) {
          console.log(change);
          if ((<number[]>key).indexOf(change.studentId) === -1) {
            console.log(`Change ${change.studentId} not found in key`);
            doRedirect(res, "/?errors=1");
            return;
          }
        }
      }

      // make changes
      for (const change of attendanceChanges) {
        await Attendance.setAttendance(change.studentId, change.eventId, change.attendance);
      }

      doRedirect(res, "/?errors=8");
    } catch (err) {
      doRedirect(res, "/?errors=4");
      console.error(err);
    }
  });

  // leaderboard
  app.get("/leaderboard", async function(req: express.Request, res: express.Response) {
    const page = req.query.page || 0;
    const html = render(await getLeaderboard(page), getUsername(req));
    res.send(html);
  });

  // images needed for leaderboard
  app.get("/images/:img", async function(req: express.Request, res: express.Response) {
    const filename = path.join("images/", req.params.img);
    if (!(await exists(filename))) {
      res.status(404).send("Unable to retrieve image");
      return;
    }

    res.send(await readFile(filename));
  });

  // change the user id
  app.get("/change-userid", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      res.send(render((await readFile("html/change-userid.html")).toString(), getUsername(req)));
    }
  });
 
  app.post("/process-change-userid", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) {
      try {
        const { uid, sid } = req.body;
        console.log(uid + " " + sid);
        
        const student = await Student.loadById(sid);
        assert(await User.loadById(uid));
        student.userId = uid;
        await student.submit();

        doRedirect(res, "/?errors=8");
      } catch (err) {
        doRedirect(res, "/?errors=4");
        console.error(err);
      }
    }
  });

  // main page
  app.get("/", async function(req: express.Request, res: express.Response) {
    let user = getUser(req);
    let key;

    if (!user) {
      key = [];
    } else if (user.isAdmin) {
      key = "admin";
    } else {
      key = (await Student.loadByUser(user.userId)).map((student: Student): number => {
        return student.studentId;
      });
    }

    const page = req.query.page || 0;
    const eventPage = req.query.eventpage || 0;
    let eventsPerPage;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(req.headers["user-agent"])) {
      eventsPerPage = 3;
    } else {
      eventsPerPage = 8;
    }
    res.send(render(await getDiagram(page, eventPage, eventsPerPage, key), getUsername(req)));
  });

  return app;
}
