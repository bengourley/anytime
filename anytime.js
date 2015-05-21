module.exports = AnytimePicker

var moment = require('moment-timezone')
  , months = [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ]
  , Emitter = require('events').EventEmitter
  , extend = require('lodash.assign')
  , pad = require('pad-number')
  , getYearList = require('./lib/get-year-list')
  , createButton = require('./lib/create-button')
  , getMonthDetails = require('./lib/get-month-details')
  , classList = require('classlist')
  , defaults =
      { minYear: 1960
      , maxYear: 2030
      , offset: 5
      , initialValue: new Date()
      , format: 'h:mma on dddd D MMMM YYYY'
      }

function createMoment(value) {
  value = value !== null ? value : undefined
  if (this.options.timezone) return moment.tz(value, this.options.timezone)

  return moment(value)
}

function AnytimePicker(options) {

  this.options = extend({}, defaults, options)

  Emitter.call(this)

  // A place to store references to event callback functions
  // so they can be specifically unbound later on
  this.__events = {}

  this.el = document.createElement('div')
  this.el.className = 'js-anytime-picker anytime-picker'

  var initialValue = createMoment.call(this, this.options.initialValue)
  this.currentView = { month: initialValue.month(), year: initialValue.year() }

  this.value = createMoment.call(this, this.options.initialValue).seconds(0).milliseconds(0)

  this.el.addEventListener('click', function (e) {
    if (classList(e.target).contains('js-anytime-picker-day')) {
      this.value.date(parseInt(e.target.getAttribute('data-date'), 10))
      this.value.month(parseInt(e.target.getAttribute('data-month'), 10))
      this.value.year(parseInt(e.target.getAttribute('data-year'), 10))
      this.emit('change', this.value)
    }
  }.bind(this))

  // If the target element is within a form element this stops button clicks from submitting it
  this.el.addEventListener('click', function (e) { e.preventDefault() })

  this.on('change', function (value) {
    if (!value) return
    value = createMoment.call(this, value)
    this.value = value
    this.options.input.value = value.format(this.options.format)
    this.updateDisplay()
  }.bind(this))

  this.__events['misc show'] = this.show.bind(this)
  if (this.options.button) this.options.button.addEventListener('click', this.__events['misc show'])
  this.options.input.addEventListener('click', this.__events['misc show'])

  this.root = this.options.anchor ? this.options.anchor : this.options.input

}

AnytimePicker.prototype = Object.create(Emitter.prototype)

AnytimePicker.prototype.render = function () {

  // Header
  var header = document.createElement('div')
  classList(header).add('anytime-picker__header')
  this.renderHeader(header)

  // Dates
  var dates = document.createElement('div')
  classList(dates).add('anytime-picker__dates')
  classList(dates).add('js-anytime-picker-dates')

  // Time
  var time = document.createElement('div')
  classList(time).add('anytime-picker__time')
  classList(time).add('js-anytime-picker-time')
  this.renderTimeInput(time)

  // Footer
  var footer = document.createElement('div')
  classList(footer).add('anytime-picker__footer')
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
  classList(monthSelect).add('js-anytime-picker-month', 'anytime-picker__dropdown')
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
  classList(yearSelect).add('js-anytime-picker-year', 'anytime-picker__dropdown')
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
  var nextBtn = createButton('>', [ 'anytime-picker__button', 'anytime-picker__button--next' ])
  headerEl.appendChild(nextBtn)
  nextBtn.addEventListener('click', this.showNextMonth.bind(this))

}

AnytimePicker.prototype.renderFooter = function (footerEl) {

  // 'Done' button
  var doneBtn = document.createElement('button')
  classList(doneBtn).add('anytime-picker__button', 'anytime-picker__button--done')
  doneBtn.textContent = 'Done'
  footerEl.appendChild(doneBtn)
  doneBtn.addEventListener('click', this.hide.bind(this))

  // 'Clear' button
  var clearBtn = document.createElement('button')
  classList(clearBtn).add('anytime-picker__button', 'anytime-picker__button--next')
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

  var currentDayOfMonth = +moment().format('D')
    , isCurrentMonth = +moment().month() === this.currentView.month
    , isCurrentYear = +moment().year() === this.currentView.year
    , selectedDayOfMonth = +createMoment.call(this, this.value).format('D')
    , isSelectedCurrentMonth = +createMoment.call(this, this.value).month() === this.currentView.month
    , isSelectedCurrentYear = +createMoment.call(this, this.value).year() === this.currentView.year

  for (var y = 1; y <= monthDetails.length; y++) {
    var date = document.createElement('button')
    date.textContent = y
    var cl = classList(date)
    cl.add('anytime-picker__date', 'js-anytime-picker-day')

    if (y === currentDayOfMonth && isCurrentMonth && isCurrentYear) {
      cl.add('anytime-picker__date--current')
    }

    // Needs to add or remove because the current selected day can change
    // within the current month and need to be cleared from others
    cl[y === selectedDayOfMonth && isSelectedCurrentMonth && isSelectedCurrentYear ? 'add' : 'remove']('anytime-picker__date--selected')

    date.setAttribute('data-date', y)
    date.setAttribute('data-month', this.currentView.month)
    date.setAttribute('data-year', this.currentView.year)
    daysEl.appendChild(date)
  }

  Array.prototype.slice.call(this.dateContainer.children).forEach(function (child) {
    if (child.parentNode) child.parentNode.removeChild(child)
  })
  Array.prototype.slice.call(daysEl.children).forEach(function (child) { this.dateContainer.appendChild(child) }.bind(this))

}

AnytimePicker.prototype.show = function () {

  this.root.offsetParent.appendChild(this.el)

  classList(this.el).add('anytime-picker--is-visible')

  var position = { top: this.root.offsetTop, left: this.root.offsetLeft }

  this.el.style.top = (position.top + this.root.offsetHeight + this.options.offset) + 'px'
  this.el.style.left = (position.left + this.root.offsetWidth - this.el.offsetWidth) + 'px'

  this.__events['doc escape keypress'] = function (e) {
    // Hide if escape is pressed
    if (e.keyCode === 27) this.hide()
  }.bind(this)

  this.__events['other anytime open'] = function (e) {
    // Hide if another instance is opened
    if (e.detail.instance !== this) this.hide()
  }.bind(this)

  document.addEventListener('keyup', this.__events['doc escape keypress'])
  document.addEventListener('anytime::open', this.__events['other anytime open'])

  document.dispatchEvent(new CustomEvent('anytime::open', { detail: { instance: this } }))

}

AnytimePicker.prototype.hide = function () {

  classList(this.el).remove('anytime-picker--is-visible')

  document.removeEventListener('keyup', this.__events['doc escape keypress'])
  delete this.__events['doc escape keypress']

  document.removeEventListener('anytime::open', this.__events['other anytime open'])
  delete this.__events['keyup escToClose']

  if (this.el.parentNode) this.el.parentNode.removeChild(this.el)

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
  classList(hourSelect).add('anytime-picker__dropdown', 'anytime-picker__dropdown--hours')
  for (var i = 0; i < 24; i++) {
    var hour = document.createElement('option')
    hour.setAttribute('value', i)
    hour.textContent = pad(i, 2)
    if (createMoment.call(this, this.options.initialValue).hours() === i) hour.setAttribute('selected', true)
    hourSelect.appendChild(hour)
  }

  hourSelect.addEventListener('change', function (e) {
    this.value.hours(e.target.value)
    this.emit('change', this.value)
  }.bind(this))

  timeEl.appendChild(hourSelect)

  var colonEl = document.createElement('span')
  classList(colonEl).add('anytime-picker__time-separator')
  colonEl.textContent = ':'
  timeEl.appendChild(colonEl)

  var minuteSelect = document.createElement('select')
  classList(minuteSelect).add('anytime-picker__dropdown', 'anytime-picker__dropdown--minutes')
  for (var j = 0; j < 60; j++) {
    var minute = document.createElement('option')
    minute.setAttribute('value', j)
    minute.textContent = pad(j, 2)
    if (createMoment.call(this, this.options.initialValue).minutes() === j) minute.setAttribute('selected', true)
    minuteSelect.appendChild(minute)
  }

  minuteSelect.addEventListener('change', function (e) {
    this.value.minutes(e.target.value)
    this.emit('change', this.value)
  }.bind(this))

  timeEl.appendChild(minuteSelect)

}

AnytimePicker.prototype.destroy = function () {
  this.hide()
  this.emit('destroy')
  this.removeAllListeners()
  if (this.options.button) this.options.button.removeEventListener('click', this.__events['misc show'])
  this.options.input.removeEventListener('click', this.__events['misc show'])
  delete this.__events['misc show']
  this.el = null
}
