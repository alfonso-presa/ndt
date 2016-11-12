'use strict';

let Observable = require('../../lib/observable');

class SampleNavigation {

    constructor() {
        let self = this;
        this.observable = new Observable();
        this.started = new Promise((resolve) => {
            this._resolveStarted = resolve;
        })
    }

    start(browser) {
        let self = this;
        if(!this.browserBootstrapPromise) {
            this.browserBootstrapPromise = browser
                .init()
                .setViewportSize({
                    width: 900,
                    height: 800
                },false)
                .then(this._resolveStarted);

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

                .then(() => self.observable.trigger('end'))
                .end();
        }
        return this.browserBootstrapPromise;
    }

    listen (event, callback) {
        return this.observable.listen(event, callback);
    }
}

module.exports = SampleNavigation;
