module.exports = createSlider

var classList = require('classlist')

function createSlider(options) {

  var sliderEl = document.createElement('div')
  classList(sliderEl).add('anytime-picker__slider', options.className)

  var sliderTitleEl = document.createElement('span')
  classList(sliderTitleEl).add('anytime-picker__slider--title')
  sliderTitleEl.textContent = options.title

  sliderEl.appendChild(sliderTitleEl)

  var sliderInputEl = document.createElement('input')
  classList(sliderInputEl).add('anytime-picker__slider--input')
  sliderInputEl.type = 'range'
  sliderInputEl.min = options.min
  sliderInputEl.max = options.max
  sliderInputEl.value = options.value

  sliderEl.appendChild(sliderInputEl)

  return sliderEl

}
