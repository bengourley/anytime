interface AnytimeOptions {
    /**
     * An input whose value should update when the picker’s value changes.
     * @default null
     */
    input?: HTMLInputElement;

    /**
     * An element that the picker will orient itself near when displayed. 
     * If options.input is not provided, this option is required.
     * @default options.input
     */
    anchor?: HTMLElement;

    /**
     * An element that when clicked will show/hide the picker interface.
     * @default null
     */
    button?: HTMLElement;

    /**
     * The earliest year that can be shown or selected in the picker interface.
     * @default 1960
     */
    minYear?: number;

    /**
     * The latest year that can be shown or selected in the picker interface.
     * @default 2030
     */
    maxYear?: number;

    /**
     * By default anytime will show every minute. 
     * Set this to 5 or 15 etc to show fewer options at greater intervals.
     * @default 1
     */
    minuteIncrement?: number;

    /**
     * The distance (px) from options.anchor the picker interface should be displayed.
     * @default 5
     */
    offset?: number;

    /**
     * The initial value to set the picker’s internal value.
     * @default null
     */
    initialValue?: Date;

    /**
     * Value to indicate which month/year to display when picker is first shown. 
     * If options.initialValue is selected, that will take precedence.
     * @default new Date()
     */
    initialView?: Date;

    /**
     * moment-style date format string.
     * @default 'h:mma on dddd D MMMM YYYY'
     */
    format?: string;

    /**
     * By default anytime uses an instance of moment in the browser’s timezone with the English locale. 
     * If you want to use a different language or a different timezone, you must load in a locale to moment 
     * and/or pass in a version of moment-timezone.
     * @type moment or moment-timezone
     * @default moment
     */
    moment?: any;

    /**
     * moment-style timezone string (e.g. 'Europe/London'). 
     * Only functions if moment-timezone is provided as options.moment!
     * @default Browser’s timezone
     */
    timezone?: string

    /**
     *
     */
    showTime?: boolean;

    /**
     * Use sliders instead of the default dropdowns for the time input.
     * @default false
     */
    timeSliders?: boolean;

    /**
     * Choose whether to abbreviate month names, e.g "Jan" vs. "January".
     * @default true
     */
    shortMonthNames?: boolean;

    /**
     * Set the text of the button that closes the picker interface.
     * @default 'Done'
     */
    doneText?: string;

    /**
     * Set the text of the button that clears the picker value and closes the picker interface.
     * @default 'Clear'
     */
    clearText?: string;

    /**
     * Set the text of the label before the time sliders.
     * @default 'Time:'
     */
    timeSlidersText?: string;

    /**
     * Set the text of the label before the hour slider.
     * @default 'Hour:'
     */
    timeSlidersHourText?: string;

    /**
     * Set the text of the label before the minute slider.
     * @default 'Minute:'
     */
    timeSlidersMinuteText?: string;
}

interface Anytime {
    /**
     * Instantiates and returns a new picker with the provided options.
     */
    new (options?: AnytimeOptions): Anytime;

    /**
     * Renders the picker interface. This method must be called before show() is called.
     */
    render(): void;

    /**
     * Displays the picker interface.
     */
    show(): void;

    /**
     * Removes the picker interface from display.
     */
    hide(): void;

    /**
     * Shows the picker if it is currently hidden, hides it if currently displayed.
     */
    toggle(): void;

    /**
     * Update the internal value of the picker. This will also update the related input (if there is one).
     * @param {string | Date} val  An ISO8601 string or Date object. Passing in null clears the picker.
     */
    update(val: string | Date): void;

    /**
     * Update the internal value of the picker. This will also update the related input (if there is one).
     * @param {function} fn  A function where you can manipulate the internal moment object. 
     *                       The moment object must be returned.
     */
    update(fn: (m: any) => any): void;
    
    /**
     * When a value is selected (or cleared) with the picker, the change event will emit with the new value.
     * @param {string} event  This must be "change".
     * @param {function} fn  A callback function with the new value.
     */
    on(event: string, fn: (d: Date) => any): void;

    /**
     * Removes all event listeners and removes the picker interface element from the DOM.
     */
    destroy(): void;
}

declare var anytime: Anytime;

declare module "anytime" {
    export = anytime;
}
