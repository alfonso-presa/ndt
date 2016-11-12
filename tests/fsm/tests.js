'use strict';

require('colors');

let browser = require('../../lib/tools/browser')();
let navigation = require('../observables/sample-navigation')();
let TestSuite = require('../../lib/tools/suite');

let suite = new TestSuite({

    features: {
        'Search engine': {

            //Scenarios
            'Search button': [
                //Steps
                'When I\'m in any page' ,
                'Then I should see the search button'
            ],

            'Simple search': [
                'Given I\'m in the web tab',
                'When I search "prueba"',
                'Then I should see the results for prueba',
            ],

            'Search tabs': [
                'When I search anything',
                'Then I should see the search tabs',
            ],

            'Search tabs for company': [
                'When I search a company',
                'Then I should see "Acerca De" in the tabs',
            ],

            'Company search': [
                'Given I\'m in the web tab',
                'When I search "google"',
                'Then I should not see the text results for Google',
                'And I should see company info for Google',
            ]
        }
    },

    stepDefinitions: {

        //Map steps with states
        Givens: {
            'I\'m in the web tab': 'web'
        },

        //Map steps with events
        Whens: {
            'I\'m in the wellcome screen': 'home',
            'I\'m in any page': 'navigate',
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
                browser.isVisible('.zci--meanings .metabar__primary-text')
                    .should.eventually.be.false,

            'I should see company info for (.*)': (company) =>
                browser.getText('.c-info__title')
                    .should.eventually.equal(company),

        }
    }

});

suite.watch(navigation);

navigation.start(browser);

console.log('NAVIGATION DRIVEN TEST'.blue);
console.log('======================'.blue);
console.log('You will se steps progress while they are being reached by the navigation.');
console.log('Scenarios will succed when all their steps are matched and their assertions are validated.');
console.log('');
