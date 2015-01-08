module.exports = createButton

var classList = require('classlist')

function createButton(text, classes) {
  var button = document.createElement('button')
  classes.forEach(function (c) { classList(button).add(c) })
  button.textContent = text
  return button
}
