'use strict';

let Navigation = require('../../lib/tools/navigation');

module.exports = function () {

    let page;

    let walkThrough = [
        'Init',
        'Search hola',
        'Switch to images tab',
        'Search prueba',
        'Switch to web tab',
        'Search company google',
        'Search prueba'
    ];

    let actions = {

        _genericSearch: (browser, navigator, text) => browser
            .setValue('.js-search-input', text)
            .click('.search__button')
            .then(() => {
                if(page === 'home') {
                    page = 'web';
                    return navigator.observable.removeStatus('home').then(()=>
                        navigator.observable.addStatus(page)
                    );
                }
            }),

        'Init': (browser, navigator) => browser
            .url('https://duckduckgo.com/')
            .then(() => navigator.observable.trigger('home', 'navigate'))
            .then(() => {
                page = 'home';
                return navigator.observable.addStatus('home');
            }),

        'Search company (.*)': (browser, navigator, text) =>
            actions._genericSearch(browser, navigator, text)
                .then(() => navigator.observable.trigger('searched', 'searched company', 'searched ' + text, 'navigate')),

        'Search (.*)': (browser, navigator, text) =>
            actions._genericSearch(browser, navigator, text)
                .then(() => navigator.observable.trigger('searched','searched ' + text, 'navigate')),

        'Switch to (.*) tab': (browser, navigator, tab) => browser
            .then(() => navigator.observable.trigger('changed to ' + tab, 'navigate'))
            .then(() => navigator.observable.removeStatus(page))
            .then(() => page = tab)
            .then(() => navigator.observable.addStatus(tab))

    };

    return new Navigation(walkThrough, actions);
}
