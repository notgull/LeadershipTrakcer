/*
 * gulpfile.js
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

const babelify = require("babelify");
const browserify = require("browserify");
const fs = require("fs");
const gulp = require("gulp");
const ts = require("gulp-typescript");

const tsProject = ts.createProject("tsconfig.json");
const tsFrontend = ts.createProject("tsconfig-frontend.json");

// create directory if it doesn't exist
function createDir(name) {
  if (!fs.existsSync(name)) fs.mkdirSync(name);
}

// set up backend scripts
gulp.task("backend", () => {
  createDir("dist");
  createDir("dist/backend");
  return gulp.src("src/**/*.ts")
    .pipe(tsProject())
    .pipe(gulp.dest("dist/backend"));
});

// set up frontend scripts
gulp.task("frontend-ts", () => {
  createDir("dist");
  createDir("dist/frontend");
  return tsFrontend.src()
    .pipe(tsFrontend())
    .js.pipe(gulp.dest("dist/frontend"));
});

gulp.task("frontend-browserify", () => {
  createDir("dist");
  return browserify("dist/frontend/bundle.js")
    .transform("babelify", { presets: ["@babel/preset-env"] })
    .bundle()
    .pipe(fs.createWriteStream("dist/bundle.js"));
});

gulp.task("default", gulp.parallel("backend", gulp.series("frontend-ts", "frontend-browserify")));
