// BSD LICENSE - c John Nunley and Larson Rivera

import * as nunjucks from 'nunjucks';
import * as path from 'path';

const templates = path.join(process.cwd(), 'html');
let env = new nunjucks.Environment(new nunjucks.FileSystemLoader(templates), {
  autoescape: false,
});

export function render(content: string): string {
  return env.render('template.j2', {
    content: content,
  });
}
