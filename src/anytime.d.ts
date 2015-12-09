// Type definitions for anytime v1.3.0-0
// Project: https://github.com/bengourley/anytime

interface AnytimeOptions {
    input?: HTMLInputElement;
    anchor?: HTMLElement;
    button?: HTMLElement;
    minYear?: number;
    maxYear?: number;
    minuteIncrement?: number;
    offset?: number;
    initialValue?: Date;
    initialView?: Date;
    format?: string;
    moment?: any;  // moment or moment-timezone
    timezone?: string;
    doneText?: string;
    clearText?: string;
    timeSliders?: boolean;
}

interface Anytime {
    new (options?: AnytimeOptions): Anytime;

    render(): void;

    show(): void;

    hide(): void;

    toggle(): void;

    update(val: string | Date): void;
    update(fn: (m: any) => any): void;  // Function takes in and returns a moment instance

    on(event: string, fn: (d: Date) => any): void;

    destroy(): void;
}

declare var anytime: Anytime;

declare module "anytime" {
    export = anytime;
}
