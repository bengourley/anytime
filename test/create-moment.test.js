var createMoment = require('../lib/create-moment')
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

})
