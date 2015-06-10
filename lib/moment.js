module.exports = createMoment

var moment = require('moment-timezone')

function createMoment(value) {
  var m = this.options.moment || moment
  value = value !== null ? value : undefined
  if (this.options.timezone) return m.tz(value, this.options.timezone)
  return m(value)
}
