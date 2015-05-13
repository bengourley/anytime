var assert = require('assert')

describe('anytime', function () {

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
        , p = new Picker(
          { input: parent
          , timezone: 'America/New_York'
          , format: 'z'
          })

      p.render()

      p.emit('change', new Date(Date.UTC(2015, 4, 11, 0, 0, 0)))
      assert.equal(parent.value, 'EDT')
    })

    it('should display the correct time in the time input', function () {
      // 9am UTC may 11th is 5am new york time
      var Picker = require('../')
        , parent = document.createElement('input')
        , date = new Date(Date.UTC(2015, 4, 11, 9, 0, 0))
        , p = new Picker(
          { input: parent
          , timezone: 'America/New_York'
          , format: 'z'
          , initialValue: date
          })

      p.render()

      var hourSelected = p.el.querySelector('.anytime-picker__dropdown--hours option[selected]')
      assert.equal(hourSelected.value, 5)
    })
  })
})
