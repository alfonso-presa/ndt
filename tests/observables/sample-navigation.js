'use strict';

let Navigation = require('../../lib/tools/navigation');

module.exports = function () {

    let walkThrough = [
        'Init',
        'Search word ejemplo',
        'Switch to images tab',
        'Search word pepito',
        'Switch to video tab',
        'Search word prueba',
        'Switch to web tab',
        'Search word prueba',
        'Search company google',
        'Search company pepito'
    ];

    let actions = {

        'Init': (browser, navigator) => browser
            .url('https://duckduckgo.com/')
            .then(() => navigator.observable.setStatus('page','home'))
            .then(() => navigator.observable.trigger('navigate')),

        'Search (.*) (.*)': (browser, navigator, type, text) => browser
            .setValue('.js-search-input', text)
            .click('.search__button')
            .then(() => {
                if(navigator.observable.getStatus('page') === 'home') {
                    return navigator.observable.setStatus('page', 'web');
                }
            })
            .then(() => navigator.observable.trigger('searched', type + ' search', 'navigate', {type: type, text:text})),

        'Switch to (.*) tab': (browser, navigator, tab) => browser
            .then(() => navigator.observable.setStatus('page', tab))
            .then(() => navigator.observable.trigger('navigate', {tab: tab}))

    };

    return new Navigation(walkThrough, actions);
}
