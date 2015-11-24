module.exports = createMoment

function createMoment(value) {
  var m = this.options.moment
    , args = [ value !== null ? value : undefined ]
  if (typeof value === 'string') args.push(this.options.format)
  if (this.options.timezone && typeof m.tz === 'function') {
    args.push(this.options.timezone)
    return m.tz.apply(m, args)
  }
  return m.apply(null, args)
}
