// BSD LICENSE - c John Nunley and Larson Rivera

// main index file to run
import * as https from "https";
import * as path from "path";

import { getServer } from "./server";
import { readFile } from "./promises";

// get version
const version = require(path.join(process.cwd(), "package.json")).version;
console.log(`LeadershipTrakcer Version ${version}`);

// run a handful of async tasks at once
(async () => {
  const results = await Promise.all([
    getServer(),
    readFile("certs/lt.key"),
    readFile("certs/lt.pem")
  ]);

  // ssl certifications
  const certs = { key: results[1],
                  cert: results[2] };

  const httpsServer = https.createServer(certs, results[0]);
  httpsServer.listen(8444);
})();
