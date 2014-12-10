module.exports = createButton

var elementClass = require('element-class')

function createButton(text, classes) {
  var button = document.createElement('button')
  classes.forEach(function (c) { elementClass(button).add(c) })
  button.textContent = text
  return button
}
