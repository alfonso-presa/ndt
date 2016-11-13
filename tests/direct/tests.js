'use strict';

let browser = require('../../lib/tools/browser')();
let navigation = require('../observables/sample-navigation')();

var nProcess = navigation.start(browser);

nProcess
    .then(() => navigation.listen('home'))
    .then(() => navigation.listen('company search', () =>
        browser
            .getText('.zcm__item')
            .should.eventually.include('Acerca De')
    ))
    .then(() => console.log('[OK] Should see Acerca De for company'))
    .catch((e) => console.error(e))

nProcess
    .then(() => navigation.listen('home'))
    .then(() => navigation.listen('word search', (context) =>
        browser
            .getText('.zci--meanings .metabar__primary-text')
            .should.eventually.equal('Resultados para ' + context.text)
    ))
    .then(() => console.log('[OK] Should see results for word'))
    .catch((e) => console.error(e))

nProcess
    .then(() => navigation.listen('home', () =>
        browser.isVisible('#search_button_homepage').then((visible) =>
            visible || browser.isVisible('#search_button')
        ).should.eventually.be.true
    ))
    .then(() => console.log('[OK] Should see search button in home'))
    .catch((e) => console.error(e))
