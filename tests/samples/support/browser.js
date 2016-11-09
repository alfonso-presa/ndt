'use strict';

let observe = require('../../../lib/observable');

module.exports = function () {

    var browserBootstrapPromise;

    var log = function (data) {
        console.log(JSON.stringify(data));
        return data;
    }

    this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, function () {
        if(!browserBootstrapPromise) {
            browserBootstrapPromise = browser
                .init()
                .url('https://duckduckgo.com/')
            browserBootstrapPromise
                .pause(50)
                .then(function () {
                    return observe.trigger('home');
                })
                .setValue('#search_form_input_homepage', 'prueba')
                .then(function () {
                    return observe.trigger('input prueba');
                })
                .click('#search_button_homepage')
                .then(function () {
                    return observe.trigger('searched prueba');
                })
                .setValue('#search_form_input', 'google')
                .then(function () {
                    return observe.trigger('input google');
                })
                .click('#search_button')
                .then(function () {
                    return Promise.all(
                        observe.trigger('searched'),
                        observe.trigger('searched company'),
                        observe.trigger('searched google')
                    );
                })
                .end();
        }
        return browserBootstrapPromise;
    });

    this.Then(/^I should see the search button$/, function (callback) {
        observe.listen('home', callback);
    });

    this.When(/^I search '(.*)'$/, function (keyword, callback) {
        observe.listen('searched ' + keyword, callback);
    });

    this.When(/^I search anything$/, function (callback) {
        observe.listen('searched', callback);
    });

    this.When(/^I search a company$/, function (callback) {
        observe.listen('searched company', callback);
    });

    this.Then(/^I should see the results for (.*)$/, function (keyword, callback) {
        observe.listen('searched ' + keyword, function () {
            return browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + keyword)
                .then(() => callback());
        });
    });

    this.Then(/^I should see the search tabs$/, function (callback) {
        observe.listen('searched', function () {
            return browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos'])
                .then(() => callback())
                .catch(callback);
        });
    });

    this.Then(/^I should see '(.*)' in the tabs$/, function (title, callback) {
        observe.listen('searched', function () {
            return browser.getText('.zcm__item')
                .should.eventually.include(title)
                .then(() => callback())
                .catch(callback);
        });
    });

    this.Then(/^I should not see the text results for (.*)$/, function (keyword, callback) {
        observe.listen('searched ' + keyword, function () {
            return browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
                .then(() => callback());
        });
    });

    this.Then(/^I should see company info for (.*)$/, function (keyword, callback) {
        observe.listen('searched ' + keyword.toLowerCase(), function () {
            console.log('testing');
            return browser.getText('.c-info__title')
                .should.eventually.equal(keyword)
                .then(() => callback())
                .catch(callback);
        });
    });


}
