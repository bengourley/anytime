module.exports = AnytimePicker

var moment = require('moment')
  , months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
  // , days = [ 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday' ]
  , Emitter = require('events').EventEmitter
  , elementClass = require('element-class')
  , extend = require('lodash.assign')
  , pad = require('pad-number')
  , offset = require('document-offset')
  , getYearList = require('./lib/get-year-list')
  , createButton = require('./lib/create-button')
  , getMonthDetails = require('./lib/get-month-details')
  , defaults =
      { minYear: 1960
      , maxYear: 2030
      , offset: 5
      , initialValue: new Date()
      , format: 'h:mma on dddd D MMMM YYYY'
      }

function AnytimePicker(options) {

  this.options = extend({}, defaults, options)

  Emitter.call(this)

  this.el = document.createElement('div')
  this.el.className = 'js-anytime-picker anytime-picker'

  var initialValue = moment(this.options.initialValue)
  this.currentView = { month: initialValue.month(), year: initialValue.year() }

  this.value = moment(this.options.initialValue).seconds(0).milliseconds(0)

  this.el.addEventListener('click', function (e) {
    if (elementClass(e.target).has('js-anytime-picker-day')) {
      this.value.date(parseInt(e.target.getAttribute('data-date'), 10))
      this.value.month(parseInt(e.target.getAttribute('data-month'), 10))
      this.value.year(parseInt(e.target.getAttribute('data-year'), 10))
      this.emit('change', this.value)
    }
  }.bind(this))

  this.on('change', function (value) {
    if (value) value = moment(value).format(this.options.format)
    this.options.input.value = value
  }.bind(this))

  if (this.options.button) this.options.button.addEventListener('click', this.show.bind(this))
  this.options.input.addEventListener('click', this.show.bind(this))

  if (!this.options.anchor) this.options.anchor = this.options.input

}

AnytimePicker.prototype = Object.create(Emitter.prototype)

AnytimePicker.prototype.render = function () {

  // Header
  var header = document.createElement('div')
  elementClass(header).add('anytime-picker__header')
  this.renderHeader(header)

  // Dates
  var dates = document.createElement('div')
  elementClass(dates).add('anytime-picker__dates')
  elementClass(dates).add('js-anytime-picker-dates')

  // Time
  var time = document.createElement('div')
  elementClass(time).add('anytime-picker__time')
  elementClass(time).add('js-anytime-picker-time')
  this.renderTimeInput(time)

  // Footer
  var footer = document.createElement('div')
  elementClass(footer).add('anytime-picker__footer')
  this.renderFooter(footer)

  this.el.appendChild(header)
  this.el.appendChild(dates)
  this.el.appendChild(time)
  this.el.appendChild(footer)

  this.dateContainer = dates

  this.updateDisplay()

  return this
}

AnytimePicker.prototype.renderHeader = function (headerEl) {

  // Previous month button
  var prevBtn = createButton('<', [ 'anytime-picker__button', 'anytime-picker__button--prev' ])
  headerEl.appendChild(prevBtn)
  prevBtn.addEventListener('click', this.showPrevMonth.bind(this))

  // Months
  var monthSelect = document.createElement('select')
  elementClass(monthSelect).add('js-anytime-picker-month')
  elementClass(monthSelect).add('anytime-picker__dropdown')
  months.forEach(function (month, i) {
    var monthOption = document.createElement('option')
    monthOption.textContent = month
    if (i === this.currentView.month) monthOption.setAttribute('selected', true)
    monthSelect.appendChild(monthOption)
  }.bind(this))
  headerEl.appendChild(monthSelect)
  this.monthSelect = monthSelect

  monthSelect.addEventListener('change', function (e) {
    this.currentView.month = months.indexOf(e.target.value)
    this.updateDisplay()
  }.bind(this))

  // Years
  var yearSelect = document.createElement('select')
  elementClass(yearSelect).add('js-anytime-picker-year')
  elementClass(yearSelect).add('anytime-picker__dropdown')
  getYearList(this.options.minYear, this.options.maxYear).forEach(function (year) {
    var yearOption = document.createElement('option')
    yearOption.textContent = year
    if (year === this.currentView.year) yearOption.setAttribute('selected', true)
    yearSelect.appendChild(yearOption)
  }.bind(this))
  headerEl.appendChild(yearSelect)
  this.yearSelect = yearSelect

  yearSelect.addEventListener('change', function (e) {
    this.currentView.year = e.target.value
    this.updateDisplay()
  }.bind(this))

  // Next month button
  var nextBtn = createButton('>', [ 'anytime-picker__button', 'anytime-picker__button--prev' ])
  headerEl.appendChild(nextBtn)
  nextBtn.addEventListener('click', this.showNextMonth.bind(this))

}

AnytimePicker.prototype.renderFooter = function (footerEl) {

  // 'Done' button
  var doneBtn = document.createElement('button')
  elementClass(doneBtn).add('anytime-picker__button')
  elementClass(doneBtn).add('anytime-picker__button--done')
  doneBtn.textContent = 'Done'
  footerEl.appendChild(doneBtn)
  doneBtn.addEventListener('click', this.hide.bind(this))

  // 'Clear' button
  var clearBtn = document.createElement('button')
  elementClass(clearBtn).add('anytime-picker__button')
  elementClass(clearBtn).add('anytime-picker__button--next')
  clearBtn.textContent = 'Clear'
  footerEl.appendChild(clearBtn)
  clearBtn.addEventListener('click', function () {
    this.emit('change', null)
    this.hide()
  }.bind(this))

}

AnytimePicker.prototype.updateDisplay = function () {

  this.monthSelect.children[this.currentView.month].setAttribute('selected', true)
  Array.prototype.slice.call(this.yearSelect.children).some(function (yearEl) {
    if (yearEl.textContent !== '' + this.currentView.year) return false
    yearEl.setAttribute('selected', true)
    return true
  }.bind(this))

  // Days
  var daysEl = document.createElement('div')
    , monthDetails = getMonthDetails(this.currentView.month, this.currentView.year)

  for (var x = 1; x < monthDetails.startDay; x++) {
    var blank = document.createElement('span')
    blank.textContent = ''
    daysEl.appendChild(blank)
  }

  for (var y = 1; y <= monthDetails.length; y++) {
    var date = document.createElement('button')
    date.textContent = y
    elementClass(date).add('anytime-picker__date')
    elementClass(date).add('js-anytime-picker-day')
    date.setAttribute('data-date', y)
    date.setAttribute('data-month', this.currentView.month)
    date.setAttribute('data-year', this.currentView.year)
    daysEl.appendChild(date)
  }

  Array.prototype.slice.call(this.dateContainer.children).forEach(function (child) { child.remove() })
  Array.prototype.slice.call(daysEl.children).forEach(function (child) { this.dateContainer.appendChild(child) }.bind(this))

}

AnytimePicker.prototype.show = function () {
  elementClass(this.el).add('anytime-picker--is-visible')
  var position = offset(this.options.anchor)
  this.el.style.top = (position.top + this.options.anchor.offsetHeight + this.options.offset) + 'px'
  this.el.style.left = (position.left + this.options.anchor.offsetWidth - this.el.offsetWidth) + 'px'
}

AnytimePicker.prototype.hide = function () {
  elementClass(this.el).remove('anytime-picker--is-visible')
}

AnytimePicker.prototype.showPrevMonth = function () {
  if (this.currentView.month > 0) {
    this.currentView.month--
    this.updateDisplay()
    return
  }
  if (this.currentView.year - 1 > this.options.minYear) {
    this.currentView.month = 11
    this.currentView.year--
    this.updateDisplay()
  }
}

AnytimePicker.prototype.showNextMonth = function () {
  if (this.currentView.month < 11) {
    this.currentView.month++
    this.updateDisplay()
    return
  }
  if (this.currentView.year + 1 < this.options.maxYear) {
    this.currentView.month = 0
    this.currentView.year++
    this.updateDisplay()
  }
}

AnytimePicker.prototype.renderTimeInput = function (timeEl) {

  var hourSelect = document.createElement('select')
  elementClass(hourSelect).add('anytime-picker__dropdown')
  for (var i = 0; i < 24; i++) {
    var hour = document.createElement('option')
    hour.setAttribute('value', i)
    hour.textContent = pad(i, 2)
    if (moment(this.options.initialValue).hours() === i) hour.setAttribute('selected', true)
    hourSelect.appendChild(hour)
  }

  hourSelect.addEventListener('change', function (e) {
    this.value.hours(e.target.value)
    this.emit('change', this.value)
  }.bind(this))

  timeEl.appendChild(hourSelect)

  var colonEl = document.createElement('span')
  elementClass(minuteSelect).add('anytime-picker__time-separator')
  colonEl.textContent = ':'
  timeEl.appendChild(colonEl)

  var minuteSelect = document.createElement('select')
  elementClass(minuteSelect).add('anytime-picker__dropdown')
  for (var j = 0; j < 59; j++) {
    var minute = document.createElement('option')
    minute.setAttribute('value', j)
    minute.textContent = pad(j, 2)
    if (moment(this.options.initialValue).minutes() === j) minute.setAttribute('selected', true)
    minuteSelect.appendChild(minute)
  }

  minuteSelect.addEventListener('change', function (e) {
    this.value.minutes(e.target.value)
    this.emit('change', this.value)
  }.bind(this))

  timeEl.appendChild(minuteSelect)

}
