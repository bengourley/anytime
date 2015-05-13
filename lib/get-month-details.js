module.exports = getMonthDetails

var moment = require('moment-timezone')

/*
 * Given the year and month, this function returns which day of the
 * week that month starts, and how many days it has.
 */
function getMonthDetails(month, year) {
  var start = moment({ year: year, month: month })
  return { startDay: start.isoWeekday(), length: start.endOf('month').date() }
}
