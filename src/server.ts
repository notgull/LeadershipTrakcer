// BSD LICENSE - c John Nunley and Larson Rivera

// contains the express server to run

import * as bodyParser from 'body-parser';
import * as cookieParser from "cookie-parser";
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as nunjucks from "nunjucks";
import * as path from "path";

import { Belt, parseBelt } from "./belt";
import { checkUsernameUsage, checkEmailUsage } from "./users/check-existence";
import { emailRegex, Nullable } from "./utils";
import { initializeSchema } from './schema';
import { readFile } from "./promises";
import { render } from "./render";
import { SessionTable } from "./users/sessions";
import { Student } from "./student";
import { User } from "./users/index";

import getDiagram from "./pages/diagram";
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

function cookieDuplicate(req: express.Request, res: express.Response) {
  if (req.cookies.sessionIdClone) {
    res.cookie("sessionId", req.cookies.sessionIdClone, { maxAge: 8640000 });
    res.clearCookie("sessionIdClone");
  }
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
        res.redirect("/login?errors=1");
        return;
      }

      if (!(await user.validate(password))) {
        res.redirect("/login?errors=1");
        return;
      }

      // add user to session table
      const id = sessionTable.addSession(user, false);
      res.cookie("sessionIdClone", id, { maxAge: 8640000 * 8 });
      res.redirect("/");
    } catch (e) {
      console.error(e);
      res.redirect("/login?errors=2");
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
        res.redirect(`/register?errors=${error}`);
        return;
      }

      // create a new user
      const user = await User.createNewUser(username, password, email, false);
      const id = sessionTable.addSession(user, false);
      res.cookie("sessionIdClone", id, { maxAge: 8640000 * 8 });
      res.redirect("/");
    } catch(e) {
      console.error(e);
      res.redirect("/register?errors=2048"); // internal error
      return;
    }
  });

  // get create student page
  app.get("/new-student", async function(req: express.Request, res: express.Response) {
    const newStudentPage = await readFile("html/createstudent.html");
    res.send(render(newStudentPage.toString(), getUsername(req)));
  });
 
  // process the creation of a new student
  app.post("/process-new-student", async function(req: express.Request, res: express.Response) {
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
        res.redirect(errUrl);
        return;
      } 

      // create a new student 
      let student = new Student(first, last, parseBelt(belt), 0);
      let user = await User.loadByUsername(username);
 
      student.userId = user.userId;
      await student.submit();
 
      res.redirect("/");
    } catch (e) {
      console.error(e);
      res.redirect("/new-student?errors=64");
      return;
    }
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

  app.post("/process-change-rp", async function(req: express.Request, res: express.Response) {
    if (adminLock(req, res)) { // todo: better admin lock?
      try {
        const { studentId, rp } = req.body;
        const student = await Student.loadById(studentId);

        if (!student) {
          res.redirect(`/change-rp?student-id=${student.studentId}&errors=1`);
          return;
        }

        student.rp = rp;
        await student.submit();
        res.redirect(`/change-rp?student-id=${studentId}&errors=8`);
      } catch (e) {
        res.redirect(`/change-rp?student-id=${req.body.studentId}&errors=4`);
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
    res.redirect("/");
  });

  app.get("/create-event", async function(req: express.Request, res: express.Response) {
    const page = await readFile("html/createEvent.html");
    res.send(render(page.toString(), getUsername(req)));
  });
 
  // main page
  app.get("/", async function(req: express.Request, res: express.Response) {
    cookieDuplicate(req, res);

    const page = req.query.page || 0;
	  res.send(render(await getDiagram(page), getUsername(req)));
  });
 
  return app;
}
