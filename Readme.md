# anytime

[![NPM](https://nodei.co/npm/anytime.png?compact=true)](https://nodei.co/npm/anytime/)

A date/time picker.

## Time, anyone?

I *really* didn't want to write this module but there are no good open source alternatives. In our CMSs at [clock](https://github.com/clocklimited/) we have tonnes of instances where a **time** needs to be selected: article live dates, offer expiry dates and other scheduling.

Until now we've made-do with the bloaty [jQuery UI datepicker](http://jqueryui.com/datepicker/) with the hacky [timepicker extension](http://trentrichardson.com/examples/timepicker/). I thought, "surely, someone must have built a decent, modular date *and* time picker by now?". [pikaday](https://github.com/dbushell/Pikaday) comes close – at least it's on npm, but you still have to rely on a choice of [three](https://github.com/stas/Pikaday) [different](https://github.com/xeeali/Pikaday) [forks](https://github.com/owenmead/Pikaday) for time picking.

So please join me, on a journey of modularity and package managed glory in creating a date/time picker once and for all!

Stay tuned.

## Usage
### `var picker = new AnyTime(options)`

Options can be the following:

- `input` - DOM input element for displaying the date
- `minYear` - minimum year. Defaults to `1960`
- `maxYear` - maximum year. Defaults to `2030`
- `offset` - number of pixels to offset the element top. Defaults to `5`
- `initialValue` - value to set the date picker to. Defaults to `new Date()`
- `format` - [moment-style](http://momentjs.com/docs/#/displaying/format/) date format string. Defaults to `'h:mma on dddd D MMMM YYYY'`
- `timezone` - [moment-style](http://momentjs.com/timezone/) timezone string (e.g. 'Europe/London'). Defaults to current timezone
- `moment` - by default moment uses english. If you want to use a different language, load in a locale to moment and pass it in. See [the i18n section](#i18n) for more info.
- `minuteIncrement` - defaults to 1 to show every minute. Set this to 5 or 15 etc to show fewer options at greater intervals.

#### `picker.render()` - Renders the date picker
#### `picker.show()` - Shows the date picker
#### `picker.hide()` - Hides the date picker
#### `picker.destroy()` - Destroys the date picker instance
#### `picker.on('change', function (value) {})` - when the user sets a new date value, the change event is emitted
#### `picker.update(function|Date|String)` - updates the internal date value and shows the update in corresponding views

#### Internal API methods - you probably won't need these
##### `picker.renderHeader()` - Renders the header
##### `picker.renderFooter()` - Renders the footer
##### `picker.renderTimeInput()` - Renders the time input
##### `picker.updateDisplay()` - Updates the elements to reflect the internal date state
##### `picker.showPrevMonth()` - Shows the previous month
##### `picker.showNextMonth()` - Shows the next month


### Updating the value

There are 2 main ways you can update the value:

1. Pass a value

```js
picker.update(new Date(2015, 4, 0)) // JS Date object
picker.update('2015-06-10T12:16:47.997Z') // String
picker.update(null) // Clear the value
```

2. Use a function to manipulate the internal moment object. The return value is used
to set the new date so you **must** return the moment object!

```js
picker.update(function (m) {
  return m.add(1, 'day') // increment the day
})
```

### i18n

To use anytime in a language other than the default (english) you need to load in your desired locale
to `moment` and pass it in as an option like so:

```js
var moment = require('moment')
require('moment/locale/fr')
moment.locale('fr')
var picker = new Anytime({ moment: moment })
```

If you want timezone support, you must pass in a `moment-timezone` instance:

```js
var moment = require('moment-timezone')
require('moment/locale/fr')
moment.locale('fr')
moment.timezone('Europe/Paris') // Either set the timezone here…
var picker = new Anytime({ moment: moment, timezone: 'Europe/Paris' }) // …or here
```

If you pass in a normal `moment` object, specifying a timezone will not work.

## Credits
* [Ben Gourley](https://github.com/bengourley/)

## Licence
Copyright (c) 2014, Ben Gourley

Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
