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
  webSrcHtml : 'website/index.jade',
  webSrcJs   : 'website/js/index.js',
  webSrcScss : 'website/styles/index.scss',
  webDest    : 'website/build/',

  libSrcJs   : 'src/anytime.js',
  libDest    : 'dist/'
};


////////////////////////////////////////////////////////////////////////////////
// Gulp tasks                                                                 //
////////////////////////////////////////////////////////////////////////////////

// Delete generated website files
gulp.task('clean:web', function () {
  del.sync(paths.webDest, { force: true });
});

// Process main HTML file
gulp.task('html', function () {
  return gulp.src(paths.webSrcHtml)
    .pipe(jade())
    .pipe(htmlmin({
      removeComments: true,
      collapseWhitespace: true
    }))
    .pipe(gulp.dest(paths.webDest));
});

// Process SCSS files
gulp.task('styles', function () {
  return gulp.src(paths.webSrcScss)
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.webDest));
});

// Process JS scripts
gulp.task('scripts', function (cb) {
  browserify(paths.webSrcJs)
    .bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.webDest))
    .on('end', cb);
});

// Compile library website
gulp.task('build:web', ['clean:web', 'html', 'styles', 'scripts']);

// Delete generated Anytime files
gulp.task('clean:lib', function () {
  del.sync(paths.libDest, { force: true });
});

// Compile Anytime library
gulp.task('build:lib', ['clean:lib'], function (cb) {
  // Bundle with Browserify
  browserify(paths.libSrcJs)
    .bundle()
    .on('error', function (err) {
      console.error(err);
      this.emit('end');
    })

    // Normal file
    .pipe(source('anytime.js'))
    .pipe(gulp.dest(paths.libDest))

    // Minified file
    .pipe(buffer())
    .pipe(uglify())
    .pipe(rename('anytime.min.js'))
    .pipe(gulp.dest(paths.libDest))

    .on('end', cb);
});

// Deploy to GitHub Pages
gulp.task('deploy', ['build:web'], function() {
  return gulp.src(paths.webDest + '/**/*')
    .pipe(ghPages());
});
