module.exports = createButton

function createButton(text, classes) {
  var button = document.createElement('button')
  classes.forEach(function (c) { button.classList.add(c) })
  button.textContent = text
  return button
}
