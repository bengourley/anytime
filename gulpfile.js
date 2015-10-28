'use strict';

////////////////////////////////////////////////////////////////////////////////
// Dependencies                                                               //
////////////////////////////////////////////////////////////////////////////////

var browserify = require('browserify'),
  buffer       = require('vinyl-buffer'),
  del          = require('del'),
  ghPages      = require('gulp-gh-pages'),
  gulp         = require('gulp'),
  htmlmin      = require('gulp-htmlmin'),
  jade         = require('gulp-jade'),
  minifyCss    = require('gulp-minify-css'),
  rename       = require('gulp-rename'),
  sass         = require('gulp-sass'),
  source       = require('vinyl-source-stream'),
  uglify       = require('gulp-uglify');


////////////////////////////////////////////////////////////////////////////////
// Paths                                                                      //
////////////////////////////////////////////////////////////////////////////////

var paths = {
  web_src_html : 'website/index.jade',
  web_src_js   : 'website/js/index.js',
  web_src_scss : 'website/styles/index.scss',
  web_dest     : 'website/build/',

  lib_src_js   : 'src/anytime.js',
  lib_dest     : 'dist/'
};


////////////////////////////////////////////////////////////////////////////////
// Gulp tasks                                                                 //
////////////////////////////////////////////////////////////////////////////////

// Delete generated website files
gulp.task('clean:web', function () {
  del.sync(paths.web_dest, { force: true });
});

// Process main HTML file
gulp.task('html', function () {
  return gulp.src(paths.web_src_html)
    .pipe(jade())
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      minifyJS: true
    }))
    .pipe(gulp.dest(paths.web_dest));
});

// Process SCSS files
gulp.task('styles', function () {
  return gulp.src(paths.web_src_scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.web_dest));
});

// Process JS scripts
gulp.task('scripts', function (cb) {
  browserify(paths.web_src_js)
    .bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.web_dest))
    .on('end', cb);
});

// Compile library website
gulp.task('build:web', ['clean:web', 'html', 'styles', 'scripts']);

// Delete generated Anytime files
gulp.task('clean:lib', function () {
  del.sync(paths.lib_dest, { force: true });
});

// Compile Anytime library
gulp.task('build:lib', ['clean:lib'], function (cb) {
  // Bundle with Browserify
  browserify(paths.lib_src_js)
    .bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })

    // Normal file
    .pipe(source('anytime.js'))
    .pipe(gulp.dest(paths.lib_dest))

    // Minified file
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('anytime.min.js'))
    .pipe(gulp.dest(paths.lib_dest))

    .on('end', cb);
});

// Deploy to GitHub Pages
gulp.task('deploy', ['build:web'], function() {
  return gulp.src(paths.web_dest + '/**/*')
    .pipe(ghPages());
});
