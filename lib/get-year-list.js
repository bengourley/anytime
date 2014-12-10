module.exports = getYearList

function getYearList(min, max) {
  var years = []
  for (var i = min; i < max; i++) {
    years.push(i)
  }
  return years
}
