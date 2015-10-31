var Anytime = require('../../src/anytime')
  , time = document.getElementsByClassName('js-splash-input')[0]
  , button = document.getElementsByClassName('js-splash-button')[0]
  , picker = new Anytime({ input: time, button: button, anchor: button })

picker.render()
