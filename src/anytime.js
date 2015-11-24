module.exports = AnytimePicker

var Emitter = require('events').EventEmitter
  , extend = require('lodash.assign')
  , throttle = require('lodash.throttle')
  , pad = require('pad-number')
  , moment = require('moment')
  , getYearList = require('./lib/get-year-list')
  , createButton = require('./lib/create-button')
  , createSlider = require('./lib/create-slider')
  , getMonthDetails = require('./lib/get-month-details')
  , createMoment = require('./lib/create-moment')
  , defaults =
      { minYear: 1960
      , maxYear: 2030
      , offset: 5
      , initialValue: null
      , initialView: new Date()
      , format: 'h:mma on dddd D MMMM YYYY'
      , moment: moment
      , minuteIncrement: 1
      , doneText: 'Done'
      , clearText: 'Clear'
      , timeSliders: false
      , timeSlidersTitle: 'Time:'
      , timeSlidersHourTitle: 'Hour:'
      , timeSliderMinuteTitle: 'Minute:'
      , shortMonthNames: true
      }

function AnytimePicker(options) {

  this.options = extend({}, defaults, options)

  Emitter.call(this)

  // A place to store references to event callback functions so they can be specifically unbound later on
  this.__events = {}

  this.el = document.createElement('div')
  this.el.className = 'js-anytime-picker anytime-picker'

  this.options.initialValue = this.getInitialValue()

  var initialView = this.createMoment(this.options.initialValue || this.options.initialView)
  this.currentView = { month: initialView.month(), year: initialView.year() }

  this.value = this.options.initialValue ? this.createMoment(this.options.initialValue).seconds(0).milliseconds(0) : null
  this.monthNames = this.getMonthNames()

  this.el.addEventListener('click', function (e) {
    if (e.target.classList.contains('js-anytime-picker-day')) {
      e.stopPropagation()
      this.update(function (value) {
        return value
          .date(parseInt(e.target.getAttribute('data-date'), 10))
          .month(parseInt(e.target.getAttribute('data-month'), 10))
          .year(parseInt(e.target.getAttribute('data-year'), 10))
      })
    }
  }.bind(this))

  // If the target element is within a form element this stops button clicks from submitting it
  this.el.addEventListener('click', function (e) { e.preventDefault() })

  this.__events['misc toggle'] = this.toggle.bind(this)
  if (this.options.button) this.options.button.addEventListener('click', this.__events['misc toggle'])
  this.options.input.addEventListener('click', this.__events['misc toggle'])

  this.root = this.options.anchor ? this.options.anchor : this.options.input

  if (this.options.input) {
    this.updateInput(this)
    this.on('change', this.updateInput.bind(this))
  }

}

AnytimePicker.prototype = Object.create(Emitter.prototype)

AnytimePicker.prototype.createMoment = createMoment

AnytimePicker.prototype.updateInput = function () {
  this.options.input.value = this.value ? this.value.format(this.options.format) : ''
}

AnytimePicker.prototype.getInitialValue = function () {
  if (this.options.initialValue) return this.options.initialValue
  if (this.options.input && this.options.input.value) return this.options.input.value
  return null
}

AnytimePicker.prototype.getMonthNames = function () {
  return this.options.moment[this.options.shortMonthNames ? 'monthsShort' : 'months']()
}

AnytimePicker.prototype.update = function (update) {

  if (update === null || update === undefined) {
    this.value = null
    this.updateDisplay()
    this.emit('change', null)
    return
  }

  if (typeof update !== 'function') {
    var newVal = update
    update = function () { return this.createMoment(newVal) }.bind(this)
  }

  var updated = update(this.value || this.createMoment())
  this.value = updated
  this.updateDisplay()
  this.emit('change', this.value.toDate())

}

AnytimePicker.prototype.render = function () {

  // Header
  var header = document.createElement('div')
  header.classList.add('anytime-picker__header')
  this.renderHeader(header)

  // Dates
  var dates = document.createElement('div')
  dates.classList.add('anytime-picker__dates')
  dates.classList.add('js-anytime-picker-dates')

  // Time
  var time = document.createElement('div')
  time.classList.add('anytime-picker__time')
  time.classList.add('js-anytime-picker-time')
  this.renderTimeInput(time)

  // Footer
  var footer = document.createElement('div')
  footer.classList.add('anytime-picker__footer')
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
  monthSelect.classList.add('js-anytime-picker-month')
  monthSelect.classList.add('anytime-picker__dropdown')
  this.monthNames.forEach(function (month, i) {
    var monthOption = document.createElement('option')
    monthOption.textContent = month
    if (i === this.currentView.month) monthOption.selected = true
    monthSelect.appendChild(monthOption)
  }.bind(this))
  headerEl.appendChild(monthSelect)
  this.monthSelect = monthSelect

  monthSelect.addEventListener('change', function (e) {
    this.currentView.month = this.monthNames.indexOf(e.target.value)
    this.updateDisplay()
  }.bind(this))

  // Years
  var yearSelect = document.createElement('select')
  yearSelect.classList.add('js-anytime-picker-year')
  yearSelect.classList.add('anytime-picker__dropdown')
  getYearList(this.options.minYear, this.options.maxYear).forEach(function (year) {
    var yearOption = document.createElement('option')
    yearOption.textContent = year
    if (year === this.currentView.year) yearOption.selected = true
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
  var doneBtn = createButton(this.options.doneText, [ 'anytime-picker__button', 'anytime-picker__button--done' ])
  footerEl.appendChild(doneBtn)
  doneBtn.addEventListener('click', this.hide.bind(this))

  // 'Clear' button
  var clearBtn = createButton(this.options.clearText, [ 'anytime-picker__button', 'anytime-picker__button--clear' ])
  footerEl.appendChild(clearBtn)
  clearBtn.addEventListener('click', function () {
    this.update(null)
    this.hide()
  }.bind(this))

}

AnytimePicker.prototype.updateDisplay = function () {

  this.monthSelect.children[this.currentView.month].selected = true
  Array.prototype.slice.call(this.yearSelect.children).some(function (yearEl) {
    if (yearEl.textContent !== '' + this.currentView.year) return false
    yearEl.selected = true
    return true
  }.bind(this))

  var daysEl = document.createElement('div')
    , monthDetails = getMonthDetails(this.currentView.month, this.currentView.year)

  /*
   * Create the day column headers
   */
  function renderDayNames() {
    var names = this.options.moment.weekdaysMin()
    // Moment gives Sunday as the first item, but uses Monday as the first day of the week.
    // This is due to getMonthDetails returning the value of ISO weekday, which has Monday
    // as index 1 and Sunday at index 7. For this reason, Sunday is shifted from the from
    // of the array and pushed to the back.
    names.push(names.shift())
    names.forEach(function (d) {
      var dayName = document.createElement('span')
      dayName.textContent = d
      dayName.classList.add('anytime-picker__day-name')
      daysEl.appendChild(dayName)
    })
  }

  /*
   * Create the blank days ahead of the first day of the current month so that
   * the days appear in the corresponding columns of the days of the week
   */
  function padDays() {
    for (var x = 1; x < monthDetails.startDay; x++) {
      var blank = document.createElement('span')
      blank.textContent = ''
      daysEl.appendChild(blank)
    }
  }

  /*
   * Create a day element for each day of the current month
   */
  function populateDays() {
    var now = this.createMoment()
      , currentDayOfMonth = parseInt(now.format('D'), 10)
      , isCurrentMonth = parseInt(now.month(), 10) === this.currentView.month
      , isCurrentYear = parseInt(now.year(), 10) === this.currentView.year
      , selectedDayOfMonth = null
      , isSelectedCurrentMonth = false
      , isSelectedCurrentYear = false

    if (this.value) {
      selectedDayOfMonth = parseInt(this.value.format('D'), 10)
      isSelectedCurrentMonth =  parseInt(this.value.month(), 10) === this.currentView.month
      isSelectedCurrentYear =  parseInt(this.value.year(), 10) === this.currentView.year
    }

    for (var y = 1; y <= monthDetails.length; y++) {
      var date = createButton(y, [ 'anytime-picker__date', 'js-anytime-picker-day' ])

      if (y === currentDayOfMonth && isCurrentMonth && isCurrentYear) {
        date.classList.add('anytime-picker__date--current')
      }

      // Needs to add or remove because the current selected day can change
      // within the current month and need to be cleared from others
      var current = y === selectedDayOfMonth && isSelectedCurrentMonth && isSelectedCurrentYear
      date.classList.toggle('anytime-picker__date--selected', current)

      date.setAttribute('data-date', y)
      date.setAttribute('data-month', this.currentView.month)
      date.setAttribute('data-year', this.currentView.year)
      daysEl.appendChild(date)
    }
  }

  renderDayNames.call(this)
  padDays.call(this)
  populateDays.call(this)

  // Remove all of the old days
  Array.prototype.slice.call(this.dateContainer.children).forEach(function (child) {
    if (child.parentNode) child.parentNode.removeChild(child)
  })

  // Add all the new days
  Array.prototype.slice.call(daysEl.children).forEach(function (child) {
    this.dateContainer.appendChild(child)
  }.bind(this))

  if (this.value) {
    this.timeEls.hours.value = this.value.hour() + ''
    this.timeEls.minutes.value = this.value.minute() + ''
    if (this.timeEls.hourLabel) this.timeEls.hourLabel.textContent = pad(this.value.hour(), 2)
    if (this.timeEls.minuteLabel) this.timeEls.minuteLabel.textContent = pad(this.value.minute(), 2)
  }

}

AnytimePicker.prototype.show = function () {

  this.root.offsetParent.appendChild(this.el)

  this.el.classList.add('anytime-picker--is-visible')

  this.updatePosition()

  this.__events['doc escape hide'] = function (e) {
    // Hide if escape is pressed
    if (e.keyCode === 27) this.hide()
  }.bind(this)

  this.__events['doc click hide'] = function (e) {
    // Hide if document outside of anytime is clicked
    if (e.target === this.el) return
    if (this.el.contains(e.target)) return
    this.hide()
  }.bind(this)

  this.__events['other anytime open'] = function (e) {
    // Hide if another instance is opened
    if (e.detail.instance !== this) this.hide()
  }.bind(this)

  this.__events['window resize position'] = throttle(function () {
    // Update position when window is resized
    this.updatePosition()
  }.bind(this), 100)

  process.nextTick(function () {
    document.addEventListener('keyup', this.__events['doc escape hide'])
    document.addEventListener('click', this.__events['doc click hide'])
    document.addEventListener('anytime::open', this.__events['other anytime open'])
    window.addEventListener('resize', this.__events['window resize position'])
    document.dispatchEvent(new CustomEvent('anytime::open', { detail: { instance: this } }))
  }.bind(this))

}

AnytimePicker.prototype.hide = function () {

  this.el.classList.remove('anytime-picker--is-visible')

  document.removeEventListener('keyup', this.__events['doc escape hide'])
  delete this.__events['doc escape hide']

  document.removeEventListener('click', this.__events['doc click hide'])
  delete this.__events['doc click hide']

  document.removeEventListener('anytime::open', this.__events['other anytime open'])
  delete this.__events['keyup other anytime open']

  window.removeEventListener('resize', this.__events['window resize position'])
  delete this.__events['window resize position']

  if (this.el.parentNode) this.el.parentNode.removeChild(this.el)

}

AnytimePicker.prototype.updatePosition = function () {
  var position = { top: this.root.offsetTop, left: this.root.offsetLeft }
  var topOffset = (position.top + this.root.offsetHeight + this.options.offset)
  var leftOffset = (position.left + this.root.offsetWidth - this.el.offsetWidth)

  if (leftOffset < 0) {
    leftOffset = 0
  }

  var transformValue = 'translate(' + leftOffset + 'px, ' + topOffset + 'px)'

  this.el.style.webkitTransform = transformValue
  this.el.style.transform = transformValue
}

AnytimePicker.prototype.toggle = function () {
  if (this.el.classList.contains('anytime-picker--is-visible')) {
    this.hide()
  } else {
    this.show()
  }
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

AnytimePicker.prototype.renderTimeSelect = function (timeEl) {

  var hourSelect = document.createElement('select')
  hourSelect.classList.add('anytime-picker__dropdown')
  hourSelect.classList.add('anytime-picker__dropdown--hours')
  for (var i = 0; i < 24; i++) {
    var hour = document.createElement('option')
    hour.value = i
    hour.textContent = pad(i, 2)
    if (this.createMoment(this.options.initialValue).hours() === i) hour.selected = true
    hourSelect.appendChild(hour)
  }

  hourSelect.addEventListener('change', function (e) {
    this.update(function (value) {
      return value.hours(e.target.value)
    })
  }.bind(this))

  timeEl.appendChild(hourSelect)

  var colonEl = getTimeSeparator()
  timeEl.appendChild(colonEl)

  var minuteSelect = document.createElement('select')
  minuteSelect.classList.add('anytime-picker__dropdown')
  minuteSelect.classList.add('anytime-picker__dropdown--minutes')
  for (var j = 0; j < 60; j += this.options.minuteIncrement) {
    var minute = document.createElement('option')
    minute.value = j
    minute.textContent = pad(j, 2)
    if (this.createMoment(this.options.initialValue).minutes() === j) minute.selected = true
    minuteSelect.appendChild(minute)
  }

  minuteSelect.addEventListener('change', function (e) {
    this.update(function (value) {
      return value.minutes(e.target.value)
    })
  }.bind(this))

  timeEl.appendChild(minuteSelect)

  this.timeEls = { hours: hourSelect, minutes: minuteSelect }

}

AnytimePicker.prototype.renderTimeSliders = function (timeEl) {
  /* jshint maxstatements: 28 */
  var timeLabelEl = document.createElement('p')
  timeLabelEl.classList.add('anytime-picker__time-label')

  var timeLabelTitleEl = document.createElement('span')
  timeLabelTitleEl.classList.add('anytime-picker__time-label--title')
  timeLabelEl.appendChild(timeLabelTitleEl)
  timeLabelTitleEl.textContent = this.options.timeSlidersTitle

  var timeLabelHourEl = document.createElement('span')
  timeLabelHourEl.classList.add('anytime-picker__time-label--hour')
  timeLabelEl.appendChild(timeLabelHourEl)
  timeLabelHourEl.textContent = pad(this.createMoment(this.options.initialValue).hours(), 2)

  var colonEl = getTimeSeparator()
  timeLabelEl.appendChild(colonEl)

  var timeLabelMinuteEl = document.createElement('span')
  timeLabelMinuteEl.classList.add('anytime-picker__time-label--minute')
  timeLabelEl.appendChild(timeLabelMinuteEl)
  timeLabelMinuteEl.textContent = pad(this.createMoment(this.options.initialValue).minutes(), 2)

  timeEl.appendChild(timeLabelEl)

  var hourSlider = createSlider(
    { className: 'anytime-picker__slider--hours'
    , min: 0
    , max: 23
    , value: this.createMoment(this.options.initialValue).hours()
    , title: this.options.timeSlidersHourTitle
    })

  function updateHour(e) {
    this.update(function (value) {
      return value.hours(e.target.value)
    })
    timeLabelHourEl.textContent = pad(e.target.value, 2)
  }

  hourSlider.addEventListener('change', updateHour.bind(this))
  hourSlider.addEventListener('input', updateHour.bind(this))

  timeEl.appendChild(hourSlider)

  var minuteSlider = createSlider(
    { className: 'anytime-picker__slider--minutes'
    , min: 0
    , max: 59
    , value: this.createMoment(this.options.initialValue).minutes()
    , title: this.options.timeSliderMinuteTitle
    })

  function updateMinute(e) {
    this.update(function (value) {
      return value.minutes(e.target.value)
    })
    timeLabelMinuteEl.textContent = pad(e.target.value, 2)
  }

  minuteSlider.addEventListener('change', updateMinute.bind(this))
  minuteSlider.addEventListener('input', updateMinute.bind(this))

  timeEl.appendChild(minuteSlider)

  this.timeEls =
    { hours: hourSlider
    , minutes: minuteSlider
    , hourLabel: timeLabelHourEl
    , minuteLabel: timeLabelMinuteEl
    }

}

AnytimePicker.prototype.renderTimeInput = function (timeEl) {
  if (this.options.timeSliders) {
    this.renderTimeSliders(timeEl)
  } else {
    this.renderTimeSelect(timeEl)
  }
}

AnytimePicker.prototype.destroy = function () {
  if (this.el) {
    this.hide()
    this.emit('destroy')
    this.removeAllListeners()
    if (this.options.button) this.options.button.removeEventListener('click', this.__events['misc toggle'])
    this.options.input.removeEventListener('click', this.__events['misc toggle'])
    delete this.__events['misc toggle']
    this.el = null
  }
}

function getTimeSeparator() {
  var colonEl = document.createElement('span')
  colonEl.classList.add('anytime-picker__time-separator')
  colonEl.textContent = ':'
  return colonEl
}
