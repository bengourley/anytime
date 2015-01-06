var jsdom = require('jsdom')

before(function (done) {
  jsdom.env('', function (errors, window) {
    if (errors) return done(new Error(errors))
    global.window = window
    global.document = window.document
    done()
  })
})

require('./anytime.test.js')
require('./get-month-details.test.js')
require('./get-year-list.test.js')
