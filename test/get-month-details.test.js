var getMonthDetails = require('../src/lib/get-month-details')
  , assert = require('assert')

describe('getMonthDetails()', function () {

  it('should respond with the correct length and start day for a variety of examples', function () {

    // NB. Month is 0-based, day is 1-based starting from Monday

    assert.deepEqual(getMonthDetails(11, 2014), { startDay: 1, length: 31 })
    assert.deepEqual(getMonthDetails(0, 2015), { startDay: 4, length: 31 })
    assert.deepEqual(getMonthDetails(8, 1988), { startDay: 4, length: 30 })
    assert.deepEqual(getMonthDetails(1, 2004), { startDay: 7, length: 29 })

  })

})
