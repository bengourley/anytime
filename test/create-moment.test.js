var createMoment = require('../lib/moment')
  , assert = require('assert')

describe('createMoment()', function () {

  it('should use the `moment` option if provided', function (done) {

    var value = '123'
    function spyMoment(val) {
      assert.equal(value, val)
      done()
    }

    createMoment.call({ options: { moment: spyMoment } }, value)

  })

  it('should use `moment-timezone` module when `moment` option is not provided', function () {

    var m = createMoment.call({ options: {} })
    assert.equal('function', typeof m.tz)

  })

})
