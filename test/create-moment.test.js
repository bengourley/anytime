var createMoment = require('../src/lib/create-moment')
  , assert = require('assert')

describe('createMoment()', function () {

  it('should use the `moment` setting to create the instance', function (done) {

    var value = '123'
    function spyMoment(val) {
      assert.equal(value, val)
      done()
    }

    createMoment.call({ options: { moment: spyMoment } }, value)

  })

  it('should use pass the format option so that dates are correctly parsed', function (done) {

    var value = '123'
      , format = 'YYYY-MM-DD'
    function spyMoment(val, f) {
      assert.equal(value, val)
      assert.equal(format, f)
      done()
    }

    createMoment.call({ options: { moment: spyMoment } }, value, format)

  })

})
