'use strict';

let Observable = require('../../lib/observable');
require('colors');

function reportAction(action) {
    console.log(('\n[ACTION] ' + action).bgWhite.black)
}

function runner(walkThrough, actions, browser, navigator) {

    function runAction(action) {
        for(var desc in actions) {
            let matches = (new RegExp(desc)).exec(action);
            if(matches) {
                reportAction(action);
                matches[0] = navigator;
                matches.unshift(browser);
                return actions[desc].apply(actions, matches);
            }
        }
    }

    return walkThrough.reduce((chain, action) =>
        chain.then(() => runAction(action, actions, browser))
    , Promise.resolve());
}

class Navigation {

    constructor(walkThrough, actions) {
        let self = this;
        this.walkThrough = walkThrough;
        this.actions = actions;
        this.observable = new Observable();
        this.started = new Promise((resolve) => {
            this._resolveStarted = resolve;
        })
    }

    start(browser) {
        let self = this;
        let page;
        let navigator = this;
        console.time('Navigation time');

        if(!this.browserBootstrapPromise) {
            this.browserBootstrapPromise = browser
                .init()
                .setViewportSize({
                    width: 900,
                    height: 800
                },false)
                .then(this._resolveStarted);

            runner(this.walkThrough, this.actions, this.browserBootstrapPromise, this)
                .then(() => reportAction('Finished'))
                .then(() => self.observable.trigger('end'))
                .then(() => this.browserBootstrapPromise.end())
                .catch((e) => console.error(e.stack))
                .then((e) => console.timeEnd('Navigation time'));

        }
        return this.browserBootstrapPromise;
    }
}

module.exports = Navigation;
