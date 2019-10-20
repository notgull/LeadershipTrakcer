// BSD LICENSE - c John Nunley and Larson Rivera

// main index file to run
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';
import * as path from "path";

import { initializeSchema } from './schema';
import { readFile } from "./promises";
import { render } from "./render";

import getDiagram from "./pages/diagram";

// get version
const version = require(path.join(process.cwd(), "package.json")).version;
console.log(`LeadershipTrakcer Version ${version}`);

// run this async
(async () => {
  await initializeSchema();

  // initialize express.js
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // ssl certifications
  const certs = { key: fs.readFileSync('certs/lt.key'),
                  cert: fs.readFileSync('certs/lt.pem') };

  // get bundled frontend script
  app.get("/bundle.js", async function(req: express.Request, res: express.Response) {
    const bundle = await readFile("dist/bundle.js"); // should be in dist/ root
    res.type("application/javascript");
    res.send(bundle);
  });

  // get registration page
  app.get("/register", async function(req: express.Request, res: express.Response) {
    const registerPage = await readFile("html/register.html");
    res.send(render(registerPage.toString()));
  });

  // process a registration request
  app.post("/process-register", async function(req: express.Request, res: express.Response) {
    
  });
 
  // main page
  app.get("/", async function(req: express.Request, res: express.Response) {
    const page = req.query.page || 0;
	  res.send(render(await getDiagram(page)));
  });

  const httpsServer = https.createServer(certs, app);
  httpsServer.listen(8444);
})();
