module.exports = tasks

var jade = require('jade')
  , stylus = require('stylus')
  , fs = require('fs')
  , browserify = require('browserify')
  , st = require('st')
  , http = require('http')

function tasks(pliers) {

  pliers.filesets('jade', __dirname + '/www/**/*.jade')
  pliers.filesets('stylus', __dirname + '/www/**/*.styl')
  pliers.filesets('js', __dirname + '/www/js/index.js')

  pliers('watch', 'buildCss', 'buildHtml', function (cb) {
    pliers.watch(pliers.filesets.jade, function () { pliers.run('buildHtml', cb) })
    pliers.watch(pliers.filesets.stylus, function () { pliers.run('buildCss', cb) })
    pliers.watch(pliers.filesets.js, function () { pliers.run('buildJs', cb) })
    http.createServer(st({ path: __dirname, index: 'index.html', cache: false })).listen(8482, function () {
      pliers.logger.info('server running on http://localhost:8482')
      cb()
    })
  })

  pliers('buildHtml', function (cb) {
    fs.writeFile(__dirname + '/index.html', jade.renderFile(__dirname + '/www/index.jade'), cb)
  })

  pliers('buildCss', function (cb) {
    stylus(fs.readFileSync(__dirname + '/www/styles/index.styl', 'utf8'))
      .set('paths', [ __dirname + '/www/styles' ])
      .use(require('responsive-grid')())
      .render(function (err, css) {
        if (err) return cb(err)
        fs.writeFile(__dirname + '/index.css', css, cb)
      })
  })

  pliers('buildJs', function (cb) {
    var writeStream = fs.createWriteStream(__dirname + '/www/js/build.js')
    writeStream.on('close', cb)
    browserify()
      .add(__dirname + '/www/js/index.js')
      .bundle()
      .pipe(writeStream)
  })

}
