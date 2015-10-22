module.exports = createSlider

function createSlider(options) {

  var sliderEl = document.createElement('div')
  sliderEl.classList.add('anytime-picker__slider')
  sliderEl.classList.add(options.className)

  var sliderTitleEl = document.createElement('span')
  sliderTitleEl.classList.add('anytime-picker__slider--title')
  sliderTitleEl.textContent = options.title

  sliderEl.appendChild(sliderTitleEl)

  var sliderInputEl = document.createElement('input')
  sliderInputEl.classList.add('anytime-picker__slider--input')
  sliderInputEl.type = 'range'
  sliderInputEl.min = options.min
  sliderInputEl.max = options.max
  sliderInputEl.value = options.value

  sliderEl.appendChild(sliderInputEl)

  return sliderEl

}
