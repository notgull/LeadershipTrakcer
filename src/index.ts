// BSD LICENSE - c John Nunley and Larson Rivera

// main index file to run
import * as bodyParser from 'body-parser';
import * as cookieParser from "cookie-parser";
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as path from "path";

import { checkUsernameUsage, checkEmailUsage } from "./users/check-existence";
import { emailRegex } from "./utils";
import { initializeSchema } from './schema';
import { readFile } from "./promises";
import { render } from "./render";
import { SessionTable } from "./users/sessions";
import { User } from "./users";

import getDiagram from "./pages/diagram";

// get version
const version = require(path.join(process.cwd(), "package.json")).version;
console.log(`LeadershipTrakcer Version ${version}`);

const sessionTable = new SessionTable();

// run this async
(async () => {
  await initializeSchema();

  // initialize express.js
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // ssl certifications
  const certs = { key: await readFile('certs/lt.key'),
                  cert: await readFile('certs/lt.pem') };

  // get bundled frontend script
  app.get("/bundle.js", async function(req: express.Request, res: express.Response) {
    const bundle = await readFile("dist/bundle.js"); // should be in dist/ root
    res.type("application/javascript");
    res.send(bundle);
  });

  // get login page
  app.get("/login", async function(req: express.Request, res: express.Response) {
    const loginPage = await readFile("html/login.html");
    res.send(render(loginPage.toString()));
  });

  // process a login request
  app.post("/process-login", async function(req: express.Request, res: express.Response) {
    const { username, password } = req.body;
   
    try {
      const user = await User.loadByUsername(username);
      if (!user) {
        res.redirect("/login?error=1");
        return;
      }

      if (!user.validate(password)) {
        res.redirect("/login?error=1");
        return;
      }

      // add user to session table
      const id = sessionTable.addSession(user, false);
      res.cookie("sessionId", id, { maxAge: 8640000 * 8 });
      res.redirect("/");
    } catch (e) {
      console.error(e);
      res.redirect("/login?error=2");
    }
  });

  // get registration page
  app.get("/register", async function(req: express.Request, res: express.Response) {
    const registerPage = await readFile("html/register.html");
    res.send(render(registerPage.toString()));
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
      if (error !== 0) {
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
      const user = await User.createNewUser(username, password, email, null, false);
      const id = sessionTable.addSession(user, false);
      res.cookie("sessionId", id, { maxAge: 8640000 * 8 });
      res.redirect("/");
    } catch(e) {
      console.error(e);
      res.redirect("/register?errors=2048"); // internal error
      return;
    }
  });
 
  // main page
  app.get("/", async function(req: express.Request, res: express.Response) {
    const page = req.query.page || 0;
	  res.send(render(await getDiagram(page)));
  });

  const httpsServer = https.createServer(certs, app);
  httpsServer.listen(8444);
})();
