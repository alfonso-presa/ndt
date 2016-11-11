'use strict';

require('colors');

let browser = require('../tools/browser')();
let navigation = new (require('../observables/sample-navigation'))();
let suite = require('../tools/suite');

let testSuite = {

    scenarios: {

        'Search button': [
            'When I\'m in the wellcome screen',
            'Then I should see the search button'
        ],

        'Simple search': [
            'When I search "prueba"',
            'Then I should see the results for prueba',
        ],

        'Search tabs': [
            'When I search anything',
            'Then I should see the search tabs',
            'And I should see the search button'
        ],

        'Search tabs for company': [
            'When I search a company',
            'Then I should see "AcercaDe" in the tabs',
        ],

        'Company search': [
            'When I search "google"',
            'Then I should not see the text results for Google',
            'And I should see company info for google',
        ]

    },

    triggers: {
        'I\'m in the wellcome screen': 'home',
        'I search "(.*)"': 'searched $1',
        'I search a company': 'searched company',
        'I search anything': 'searched'
    },

    assertions: {

        'I should see the search button': () =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true,

        'I should see the results for (.*)': (keyword) =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + keyword),

        'I should see the search tabs': () =>
            browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos']),

        'I should see "(.*)" in the tabs': (title) =>
            browser.getText('.zcm__item')
                .should.eventually.include(title),

        'I should not see the text results for (.*)': (keyword) =>
            browser.getText('.c-info__title')
                .should.eventually.equal(keyword),

    }

}

suite.attach(testSuite, navigation, navigation.start(browser));
