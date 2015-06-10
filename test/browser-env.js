module.exports = createBrowserEnv

var jsdom = require('jsdom')

function createBrowserEnv(cb) {
  jsdom.env('', function (errors, window) {
    if (errors) return cb(new Error(errors))
    global.window = window
    global.document = window.document
    cb()
  })
}
