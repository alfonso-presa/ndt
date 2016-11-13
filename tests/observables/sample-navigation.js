'use strict';

let Navigation = require('../../lib/tools/navigation');

module.exports = function () {

    //TODO: There should be a better way to keep state....
    let page;

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
            .then(() => navigator.observable.trigger('home', 'navigate'))
            .then(() => {
                page = 'home';
                return navigator.observable.addStatus('home');
            }),

        'Search (.*) (.*)': (browser, navigator, type, text) => browser
            .setValue('.js-search-input', text)
            .click('.search__button')
            .then(() => {
                if(page === 'home') {
                    page = 'web';
                    return navigator.observable.removeStatus('home').then(()=>
                        navigator.observable.addStatus(page)
                    );
                }
            })
            .then(() => navigator.observable.trigger('searched', type + ' search', 'navigate', {type: type, text:text})),

        'Switch to (.*) tab': (browser, navigator, tab) => browser
            .then(() => navigator.observable.trigger('changed to ' + tab, 'navigate', {tab: tab}))
            .then(() => navigator.observable.removeStatus(page))
            .then(() => page = tab)
            .then(() => navigator.observable.addStatus(tab))

    };

    return new Navigation(walkThrough, actions);
}
