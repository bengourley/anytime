'use strict'

////////////////////////////////////////////////////////////////////////////////
// Dependencies                                                               //
////////////////////////////////////////////////////////////////////////////////

var autoprefixer = require('gulp-autoprefixer')
  , browserify = require('browserify')
  , buffer = require('vinyl-buffer')
  , del = require('del')
  , ghPages = require('gulp-gh-pages')
  , gulp = require('gulp')
  , header = require('gulp-header')
  , htmlmin = require('gulp-htmlmin')
  , http = require('http')
  , jade = require('gulp-jade')
  , nano = require('gulp-cssnano')
  , sass = require('gulp-sass')
  , st = require('st')
  , rename = require('gulp-rename')
  , source = require('vinyl-source-stream')
  , uglify = require('gulp-uglify')


////////////////////////////////////////////////////////////////////////////////
// Paths                                                                      //
////////////////////////////////////////////////////////////////////////////////

var paths =
  { webSrcHtml: 'website/index.jade'
  , webSrcJs: 'website/js/index.js'
  , webSrcScss: 'website/styles/index.scss'
  , webDest: 'website/build/'
  , libSrcJs: 'src/anytime.js'
  , libDest: 'dist/'
  }


////////////////////////////////////////////////////////////////////////////////
// Gulp tasks                                                                 //
////////////////////////////////////////////////////////////////////////////////

// Delete generated website files
gulp.task('clean:web', function() {
  del.sync(paths.webDest, { force: true })
})

// Process main HTML file
gulp.task('html', function() {
  return gulp.src(paths.webSrcHtml)
    .pipe(jade())
    .pipe(htmlmin({ removeComments: true, collapseWhitespace: true }))
    .pipe(gulp.dest(paths.webDest))
})

// Process SCSS files
gulp.task('styles', function() {
  return gulp.src(paths.webSrcScss)
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(nano())
    .pipe(gulp.dest(paths.webDest))
})

// Process JS scripts
gulp.task('scripts', function(cb) {
  browserify(paths.webSrcJs)
    .bundle()
    .on('error', function(err) {
      console.error(err)
      this.emit('end')
    })
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.webDest))
    .on('end', cb)
})

// Compile library website
gulp.task('build:web', ['clean:web', 'html', 'styles', 'scripts'])

// Launch static server for website (localhost:8080) and watch for changes
gulp.task('watch:web', ['build:web'], function() {
  gulp.watch(paths.webSrcHtml, ['html'])
  gulp.watch(paths.webSrcScss, ['styles'])
  gulp.watch(paths.webSrcJs, ['scripts'])

  http.createServer(
    st(
      { path: paths.webDest
      , index: 'index.html'
      }
    )
  ).listen(8080)
})

// Delete generated Anytime files
gulp.task('clean:lib', function() {
  del.sync(paths.libDest, { force: true })
})

// Compile Anytime library
gulp.task('build:lib', ['clean:lib'], function(cb) {
  var pkg = require('./package.json')

  var banner =
    [ '/**'
    , ' * <%= pkg.name %> - <%= pkg.description %>'
    , ' * @version <%= pkg.version %>'
    , ' * @link <%= pkg.homepage %>'
    , ' * @license <%= pkg.license %>'
    , ' */'
    , ''
    ].join('\n')

  // Bundle with Browserify
  browserify(paths.libSrcJs, { standalone: 'Anytime' })
    .bundle()
    .on('error', function(err) {
      console.error(err)
      this.emit('end')
    })

    // Normal file
    .pipe(source('anytime.js'))
    .pipe(buffer())
    .pipe(header(banner, { pkg: pkg } ))
    .pipe(gulp.dest(paths.libDest))

    // Minified file
    .pipe(uglify())
    .pipe(rename('anytime.min.js'))
    .pipe(header(banner, { pkg: pkg } ))
    .pipe(gulp.dest(paths.libDest))

    .on('end', cb)
})

// Deploy to GitHub Pages
gulp.task('deploy', ['build:web'], function() {
  return gulp.src(paths.webDest + '/**/*')
    .pipe(ghPages())
})
