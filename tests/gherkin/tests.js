'use strict';

require('colors');

let browser = require('../../lib/browser')();
let navigation = require('../observables/sample-navigation')();
let TestSuite = require('../../lib/suite');

let suite = new TestSuite(__dirname + '/sample.feature', {

    //Map steps with states
    Givens: {
        'I\'m in the web tab': {
            page: 'web'
        }
    },

    //Map steps with events
    Whens: {
        'I\'m in the wellcome screen': 'home',
        'I\'m in any page': 'navigate',
        'I search a (.*)': '$1 search',
        'I search anything': 'searched',
    },

    //Map steps with assertions
    Thens: {

        'I should see the search button': (context) =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true,

        'I should see the corresponding results': (context) =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + context.text),

        'I should see the search tabs': () =>
            browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos']),

        'I should see "(.*)" in the tabs': (title) =>
            browser.getText('.zcm__item')
                .should.eventually.include(title),

        'I should not see the text results': () =>
            browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false,

        'I should see company info': (context) =>
            browser.getText('.c-info__title')
                .then((text) => text.toLowerCase())
                .should.eventually.equal(context.text),
    }

});

console.log('NAVIGATION DRIVEN TEST'.blue);
console.log('======================'.blue);
console.log('You will se steps progress while they are being reached by the navigation.');
console.log('Scenarios will succed when all their steps are matched and their assertions are validated.');
console.log('');

navigation.started.then((observable) => suite.watch(observable));
navigation.start(browser);
