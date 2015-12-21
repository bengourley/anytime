'use strict'

////////////////////////////////////////////////////////////////////////////////
// Dependencies                                                               //
////////////////////////////////////////////////////////////////////////////////

var autoprefixer = require('gulp-autoprefixer')
  , del = require('del')
  , ghPages = require('gulp-gh-pages')
  , gulp = require('gulp')
  , header = require('gulp-header')
  , htmlmin = require('gulp-htmlmin')
  , http = require('http')
  , jade = require('gulp-jade')
  , minifyCss = require('gulp-minify-css')
  , sass = require('gulp-sass')
  , st = require('st')
  , webpack = require('webpack')


////////////////////////////////////////////////////////////////////////////////
// Paths                                                                      //
////////////////////////////////////////////////////////////////////////////////

var paths =
  { webSrcHtml: './website/index.jade'
  , webSrcJs: './website/js/index.js'
  , webSrcScss: './website/styles/index.scss'
  , webDest: './website/build/'
  , libSrcJs: './src/anytime.js'
  , libDest: './dist/'
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
    .pipe(minifyCss())
    .pipe(gulp.dest(paths.webDest))
})

// Process JS scripts
gulp.task('scripts', function(cb) {
  webpack(
    { entry: paths.webSrcJs
    , output:
      { path: paths.webDest
      , filename: 'index.js'
      }
    , plugins:
      [ new webpack.optimize.DedupePlugin()
      , new webpack.optimize.OccurenceOrderPlugin()
      , new webpack.optimize.UglifyJsPlugin(
          { compress: { warnings: false }
          , output: { comments: false }
          , sourceMap: false
          }
        )
      ]
    }
    , function(webpack_err, stats) {
      if (webpack_err) cb(webpack_err)
      cb()
    }
  )
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

  // Bundle with Webpack
  webpack(
    { entry: paths.libSrcJs
    , output:
      { path: paths.libDest
      , filename: 'anytime.js'
      , library: 'anytime'
      , libraryTarget: 'umd'
      }
    , plugins:
      [ new webpack.optimize.DedupePlugin()
      , new webpack.optimize.OccurenceOrderPlugin()
      , new webpack.optimize.UglifyJsPlugin(
          { compress: { warnings: false }
          , output: { comments: false }
          , sourceMap: false
          }
        )
      ]
    }
    , function(webpack_err, stats) {
      if (webpack_err) cb(webpack_err)

      gulp.src(paths.libDest + 'anytime.js')
        .pipe(header(banner, { pkg: pkg } ))
        .pipe(gulp.dest(paths.libDest))
        .on('end', cb)
    }
  )
})

// Deploy to GitHub Pages
gulp.task('deploy', ['build:web'], function() {
  return gulp.src(paths.webDest + '/**/*')
    .pipe(ghPages())
})
