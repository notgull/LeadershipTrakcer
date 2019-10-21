// BSD LICENSE - c John Nunley and Larson Rivera

import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { Nullable } from "./utils";
import { readFile } from "./promises";

const templates = path.join(process.cwd(), 'html');
let env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates), {
  autoescape: false,
});

let loggedinLbar: string;
let lbar: string;

(async () => {
  const results = await Promise.all([
    readFile(path.join(templates, "loggedinLbar.html")),
    readFile(path.join(templates, "lbar.html"))
  ]);

  loggedinLbar = results[0].toString();
  lbar = results[1].toString();
})();

export function render(content: string, username: Nullable<string>): string {
  let loginbar;
  if (username) {
    loginbar = nunjucks.renderString(loggedinLbar, { username: username });
  } else {
    loginbar = lbar;
  }
 
  return env.render('template.html', { 
    content: content,
    loginbar: loginbar
  });
}
