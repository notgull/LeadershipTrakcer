/*
 * src/render.ts
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
 
  return env.render("template.html", { 
    content: content,
    loginbar: loginbar
  });
}
