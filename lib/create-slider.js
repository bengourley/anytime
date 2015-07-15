module.exports = createSlider

var classList = require('classlist')

function createSlider(options) {

  var slider = document.createElement('input')
  classList(slider).add('anytime-picker__slider', options.className)
  slider.type = 'range'
  slider.min = options.min
  slider.max = options.max
  slider.value = options.value
  return slider

}
