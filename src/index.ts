// BSD LICENSE - c John Nunley and Larson Rivera

// main index file to run
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';

import { initializeSchema } from './schema';
import { render } from "./render";

import getLeaderboard from "./pages/leaderboard";

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

  // main page
  app.get("/", async function(req: express.Request, res: express.Response) {
    const page = req.query.page || 0;
	  res.send(render(await getLeaderboard(page)));
  });

  const httpsServer = https.createServer(certs, app);
  httpsServer.listen(8444);
})();
