var getYearList = require('../lib/get-year-list')
  , assert = require('assert')

describe('getYearList()', function () {

  it('should list years between and inclusive of the given start/end years', function () {
    assert.deepEqual(
        [ 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994
        , 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005
        ]
      , getYearList(1984, 2005))
  })

  it('should error if end year is less than start year', function () {
    assert.throws(function () { getYearList(2006, 2001) })
  })

  it('should error if either year is not an integer', function () {
    assert.throws(function () { getYearList('1996', 2001) })
    assert.throws(function () { getYearList('2006', '2050') })
    assert.throws(function () { getYearList(2006, '2050') })
    assert.throws(function () { getYearList(2.04, 2080) })
  })

  it('should work with a single year range', function () {
    assert.deepEqual([ 2015 ], getYearList(2015, 2015))
  })

})
