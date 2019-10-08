// BSD LICENSE - c John Nunley and Larson Rivera

// main index file to run
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import * as https from 'https';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const certs = { key: fs.readFileSync('certs/lt.key'),
                cert: fs.readFileSync('certs/lt.pem') };

app.get("/", function(req: express.Request, res: express.Response) {
  res.send(fs.readFileSync('html/template.html'));
});

const httpsServer = https.createServer(certs, app);
httpsServer.listen(8444);
