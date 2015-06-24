var assert = require('assert')
  , moment = require('moment-timezone')
  , createBrowserEnv = require('./browser-env')

describe('anytime', function () {

  beforeEach(createBrowserEnv)

  // Clear the module cache for anytime so that it can be reloaded again.
  // This is needed to test option defaults that are set in the module scope
  beforeEach(function () { delete require.cache[require.resolve('../')] })

  describe('destroy()', function () {

    it('should remove any bound events', function () {

      var Picker = require('../')
        , p = new Picker({ input: document.createElement('input') })

      p.render()
      p.on('change', function () {})
      assert(Object.keys(p._events).length)
      p.destroy()
      assert.equal(Object.keys(p._events).length, 0)

    })

    it('should remove the element from the DOM', function () {

      var Picker = require('../')
        , parent = document.createElement('div')
        , p = new Picker({ input: document.createElement('input') })

      parent.appendChild(p.render().el)

      p.on('change', function () {})
      assert.equal(parent.childNodes.length, 1)
      p.destroy()
      assert.equal(parent.childNodes.length, 0)

    })

  })

  describe('timezone', function () {
    it('should allow you to pass in a timezone which modifies all displayed dates', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , moment = require('moment-timezone')
        , p = new Picker(
          { input: parent
          , moment: moment
          , timezone: 'America/New_York'
          , format: 'z'
          })

      p.render()

      p.update(new Date(Date.UTC(2015, 4, 11, 0, 0, 0)))
      assert.equal(parent.value, 'EDT')
    })

    it('should display the correct time in the time input', function () {
      // 9am UTC may 11th is 5am new york time
      var Picker = require('../')
        , parent = document.createElement('input')
        , date = new Date(Date.UTC(2015, 4, 11, 9, 0, 0))
        , moment = require('moment-timezone')
        , p = new Picker(
          { input: parent
          , moment: moment
          , timezone: 'America/New_York'
          , format: 'z'
          , initialValue: date
          })

      p.render()

      var hourSelected = p.el.querySelector('.anytime-picker__dropdown--hours option[selected]')
      assert.equal(hourSelected.value, 5)
    })
  })

  describe('selected day', function () {
    it('should add a class to the selected day', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent })
        , date = moment().toDate()

      p.render()
      p.update(date)

      var day = p.el.querySelector('button[data-date=\'' + date.getDate() + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--selected') > -1, 'Should have a class on it')
    })

    it('should update the class when the date changes', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent, initialValue: moment('2015-04-01') })
        , cls = 'anytime-picker__date--selected'

      p.render()
      p.update(moment('2015-04-10').toDate())
      p.update(moment('2015-04-12').toDate())

      var firstSelectedDay = p.el.querySelector('button[data-date=\'10\']')
        , secondSelectedDay = p.el.querySelector('button[data-date=\'12\']')

      assert(firstSelectedDay.getAttribute('class').indexOf(cls) === -1, 'Should not have a class on it')
      assert(secondSelectedDay.getAttribute('class').indexOf(cls) > -1, 'Should have a class on it')
    })

    it('should only have the class in the correct month', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , selectedDay = 13
        , p = new Picker({ input: parent, initialValue: moment('2015-02-' + selectedDay).toDate() })

      p.render()
      p.showNextMonth()

      var day = p.el.querySelector('button[data-date=\'' + selectedDay + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--selected') === -1, 'Should not have a class on it')
    })

    it('should only have the class in the correct year', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , selectedDay = 13
        , p = new Picker({ input: parent, initialValue: moment('2015-02-' + selectedDay).toDate() })

      p.render()

      // Pushing the date forward by a year
      for (var i = 0; i <= 11; i += 1) {
        p.showNextMonth()
      }

      var day = p.el.querySelector('button[data-date=\'' + selectedDay + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--selected') === -1, 'Should not have a class on it')
    })
  })

  describe('current day', function () {
    it('should add a class to the current day', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent })
        , date = moment()
        , currentDay = +date.format('D')

      p.render()

      var day = p.el.querySelector('button[data-date=\'' + currentDay + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--current') > -1, 'Should have a class on it')
    })

    it('should only have the class in the correct month', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent })
        , date = moment()
        , currentDay = +date.format('D')

      p.render()

      p.showNextMonth()

      var day = p.el.querySelector('button[data-date=\'' + currentDay + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--current') === -1, 'Should not have a class on it')
    })

    it('should only have the class in the correct year', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent })
        , date = moment()
        , currentDay = +date.format('D')

      p.render()

      // Pushing the date forward by a year
      for (var i = 0; i <= 11; i += 1) {
        p.showNextMonth()
      }

      var day = p.el.querySelector('button[data-date=\'' + currentDay + '\']')

      assert(day.getAttribute('class').indexOf('anytime-picker__date--current') === -1, 'Should not have a class on it')
    })
  })

  describe('minutes', function () {

    it('should output 60 minutes', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent })

      p.render()

      var minutes = p.el.querySelector('.anytime-picker__dropdown--minutes')
      assert.equal(minutes.length, 60)
    })

  })

  it('should not throw when rendered with a null initialValue', function () {
    var Picker = require('../')
      , parent = document.createElement('input')
      , p = new Picker({ input: parent, initialValue: null })

    assert.doesNotThrow(function () {
      p.render()
    }, /setAttribute/)
  })

  describe('locale', function () {

    it('should default to english', function () {

      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({ input: parent, initialValue: new Date() })

      assert.equal('January', p.monthNames[0])
      assert.equal('en', p.value.locale())

    })

    it('should use a provided locale', function () {

      var Picker = require('../')
        , parent = document.createElement('input')
        , moment = require('moment')

      moment.locale('fr')

      var p = new Picker({ input: parent, initialValue: new Date(), moment: moment })

      assert.equal('janvier', p.monthNames[0])
      assert.equal('fr', p.value.locale())

    })

    it('should set "done" and "clear" button text to provided option', function () {
      var Picker = require('../')
        , parent = document.createElement('input')
        , p = new Picker({
          input: parent,
          initialValue: null ,
          doneText: 'Set Time',
          clearText: 'Goodbye'
        })

      p.render()

      var doneButton = p.el.querySelector('.anytime-picker__button--done')
      assert.equal(doneButton.textContent, 'Set Time', 'should set done button text')
      var clearButton = p.el.querySelector('.anytime-picker__button--clear')
      assert.equal(clearButton.textContent, 'Goodbye', 'should set clear button text')
    })

  })

})
