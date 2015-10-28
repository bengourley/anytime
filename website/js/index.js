// Import Anytime
var Anytime = require('../../src/anytime');

// Example elements
var time   = document.getElementsByClassName('js-splash-input')[0],
    button = document.getElementsByClassName('js-splash-button')[0];

// Instantiate and render picker
var d = new Anytime({
    input  : time,
    button : button,
    anchor : button
});

d.render();
