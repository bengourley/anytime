'use strict'

////////////////////////////////////////////////////////////////////////////////
// Dependencies                                                               //
////////////////////////////////////////////////////////////////////////////////

var browserify = require('browserify')
  , buffer = require('vinyl-buffer')
  , del = require('del')
  , gulp = require('gulp')
  , header = require('gulp-header')
  , rename = require('gulp-rename')
  , source = require('vinyl-source-stream')
  , uglify = require('gulp-uglify')


////////////////////////////////////////////////////////////////////////////////
// Paths                                                                      //
////////////////////////////////////////////////////////////////////////////////

var paths =
  { libSrcJs: 'src/anytime.js'
  , libDest: 'dist/'
  }


////////////////////////////////////////////////////////////////////////////////
// Gulp tasks                                                                 //
////////////////////////////////////////////////////////////////////////////////

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
    , ' * @version v<%= pkg.version %>'
    , ' * @link <%= pkg.homepage %>'
    , ' * @license <%= pkg.license %>'
    , ' */'
    , ''
    ].join('\n')

  // Bundle with Browserify
  browserify(paths.libSrcJs, { standalone: 'AnytimePicker' })
    .bundle()
    .on('error', function (err) {
      console.error(err)
      this.emit('end')
    })

    // Normal file
    .pipe(source('anytime.js'))
    .pipe(buffer())
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.libDest))

    // Minified file
    .pipe(uglify())
    .pipe(rename('anytime.min.js'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest(paths.libDest))

    .on('end', cb)

})
