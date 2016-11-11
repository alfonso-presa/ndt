'use strict';

let Observable = require('../../lib/observable');

class SampleNavigation {

    constructor() {
        this.observable = new Observable();
    }

    start() {
        let self = this;
        if(!this.browserBootstrapPromise) {
            this.browserBootstrapPromise = browser
                .init()
                .setViewportSize({
                    width: 900,
                    height: 800
                },false);

            //This is the navigation. It's executed in parallel making the other steps progress
            this.browserBootstrapPromise
                .url('https://duckduckgo.com/')

                .then(() => self.observable.trigger('home'))

                .setValue('#search_form_input_homepage', 'prueba')
                .then(() => self.observable.trigger('input prueba'))

                .click('#search_button_homepage')
                .then(() => self.observable.trigger('searched prueba'))

                .setValue('#search_form_input', 'google')
                .then(() => self.observable.trigger('input google'))

                .click('#search_button')
                .then(() => self.observable.trigger('searched','searched company','searched google'))

                .end();
        }
        return this.browserBootstrapPromise;
    }

    listen (event) {
        return this.observable.listen(event);
    }
}

module.exports = SampleNavigation;
