const {src, dest, watch , series, parallel} = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss  = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const browserSync = require('browser-sync').create();
const tildeImporter = require('node-sass-tilde-importer');
const purgecss = require('gulp-purgecss');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const polyfill = require("@babel/polyfill");

//const gcmq                        = require('gulp-group-css-media-queries');


/* BrowserSync */
//Serve
function browseryncServe(cb){
  browserSync.init({
    server: {
      baseDir: '.'
    },
    port: 3000,
  });
  cb();
}
// Reload
function browseryncReload(cb){
  browserSync.reload();
  cb();
}

/* Sass */
function scssTask(){
  return src('src/scss/style.scss', {sourcemaps: true})
    .pipe(sass({importer: tildeImporter}))
    .pipe(dest('assets'), {sourcemaps: '.'});
}

/* JS */
function jsTask(){
  return src('src/js/script.js', {sourcemaps: true})
    //.pipe(terser()) //<--- move to prod
    .pipe(dest('assets'), {sourcemaps: '.'});
}

/* Watcher */
function watchTask(){
  watch('index.html', browseryncReload);
  watch(['src/scss/**/*.scss'], series(scssTask, browseryncReload));
  watch(['src/js/script.js'], series(jsTask, browseryncReload));
}

/* Production */

//Styles
function productionStyles(){
  return src('assets/style.css', {sourcemaps: true})
  .pipe(purgecss({ // <--- move to prod
    content: ['index.html']
  }))
  .pipe(postcss([cssnano()])) // <--- move to prod
  .pipe(autoprefixer({ // <--- move to prod
    overrideBrowserslist: ['last 5 versions']
  }))
  .pipe(dest('assets'), {sourcemaps: '.'});
}

//Scripts
function productionScripts(){
  return src('assets/script.js', {sourcemaps: true})
  .pipe(babel({
    presets: [
      [
        "@babel/env",
        {
          "targets": {
            "browsers": [
              "since 2015",
              "IE 11"
            ]
          }
        },
      ]
    ]
  }))
  .pipe(terser()) //<--- move to prod
  .pipe(dest('assets'), {sourcemaps: '.'});
}


/* Tasks */
//Default task
function defaultTask(cb) {
  console.log('This project uses Gulp 4!')
  cb();
}
exports.default = defaultTask;

/* Main tasks */
exports.watch = series(
  browseryncServe,
  watchTask
)

exports.production = parallel(productionStyles, productionScripts);