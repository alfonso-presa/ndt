'use strict';

let browser = require('../tools/browser')();
let navigation = new (require('../observables/sample-navigation'))();
let suite = require('../tools/suite');

const _ = undefined; //Undefined shortcut

var specs = {

    'Should see Acerca De for company': {
            'home':_,
            'searched company': () =>
                browser
                    .getText('.zcm__item')
                    .should.eventually.include('Acerca De')
    },

    'Should see results for prueba': {
        'home': _,
        'searched prueba': () =>
            browser
                .getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para prueba')
    },

    'Should see search button': {
        '*': () =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true
    }

};

suite.attach(specs, navigation, navigation.start(browser));

