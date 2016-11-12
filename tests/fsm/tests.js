'use strict';

require('colors');

let browser = require('../tools/browser')();
let navigation = new (require('../observables/sample-navigation'))();
let TestSuite = require('../tools/suite');

let suite = new TestSuite({

    features: {
        'Search engine': {
            //Scenarios
            'Search button': [

                //Steps
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
                'When I search "google2"',
                'Then I should not see the text results for Google',
                'And I should see company info for google',
            ]
        }
    },

    stepDefinitions: {

        //Map steps with events
        Whens: {
            'I\'m in the wellcome screen': 'home',
            'I search "(.*)"': 'searched $1',
            'I search a company': 'searched company',
            'I search anything': 'searched'
        },

        //Map steps with assertions
        Thens: {

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

});

suite.watch(navigation);

navigation.start(browser);
