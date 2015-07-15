var DatePicker = require('../..')
  , time = document.getElementsByClassName('js-splash-input')[0]
  , button = document.getElementsByClassName('js-splash-button')[0]
  , d = new DatePicker({ input: time, button: button, anchor: button })

d.render()
