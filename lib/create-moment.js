module.exports = createMoment

function createMoment(value) {
  var m = this.options.moment
  value = value !== null ? value : undefined
  if (this.options.timezone) return m.tz(value, this.options.timezone)
  return m(value)
}
