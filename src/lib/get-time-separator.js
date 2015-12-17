module.exports = getTimeSeparator

function getTimeSeparator() {
  var colonEl = document.createElement('span')
  colonEl.classList.add('anytime-picker__time-separator')
  colonEl.textContent = ':'
  return colonEl
}
