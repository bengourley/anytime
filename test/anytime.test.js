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

})
