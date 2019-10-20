// BSD LICENSE - c John Nunley and Larson Rivera

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

gulp.task("default", gulp.series("backend", "frontend-ts", "frontend-browserify"));
