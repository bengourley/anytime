module.exports = getYearList

function getYearList(min, max) {
  if (parseInt(min, 10) !== min || parseInt(max, 10) !== max) throw new Error('min and max years must be integers')
  if (min > max) throw new Error('min year must be before max year')
  var years = []
  for (var i = min; i <= max; i++) years.push(i)
  return years
}
