'use strict';

let browser = require('../tools/browser')();
let navigation = new (require('../observables/sample-navigation'))();

var nProcess = navigation.start(browser);

nProcess
    .then(() => navigation.listen('home'))
    .then(() => navigation.listen('searched company', () =>
        browser
            .getText('.zcm__item')
            .should.eventually.include('Acerca De')
    ))
    .then(() => console.log('[OK] Should see Acerca De for company'))
    .catch((e) => console.error(e))

nProcess
    .then(() => navigation.listen('home'))
    .then(() => navigation.listen('searched prueba', () =>
        browser
            .getText('.zci--meanings .metabar__primary-text')
            .should.eventually.equal('Resultados para prueba')
    ))
    .then(() => console.log('[OK] Should see results for prueba'))
    .catch((e) => console.error(e))

nProcess
    .then(() => navigation.listen('home', () =>
        browser.isVisible('#search_button_homepage').then((visible) =>
            visible || browser.isVisible('#search_button')
        ).should.eventually.be.true
    ))
    .then(() => console.log('[OK] Should see search button in home'))
    .catch((e) => console.error(e))
