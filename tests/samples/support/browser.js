'use strict';

let observe = require('../../../lib/observable');

module.exports = function () {

    {
        var browserBootstrapPromise;

        this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, () => {
            if(!browserBootstrapPromise) {
                browserBootstrapPromise = browser
                    .init()
                    .setViewportSize({
                        width: 900,
                        height: 800
                    },false)
                    .url('https://duckduckgo.com/')
                browserBootstrapPromise.pause(50)

                    .then(() => observe.trigger('home'))

                    .setValue('#search_form_input_homepage', 'prueba')
                    .then(() => observe.trigger('input prueba'))

                    .click('#search_button_homepage')
                    .then(() => observe.trigger('searched prueba'))

                    .setValue('#search_form_input', 'google')
                    .then(() => observe.trigger('input google'))

                    .click('#search_button')
                    .then(() => observe.trigger('searched','searched company','searched google'))

                    .end();
            }
            return browserBootstrapPromise;
        });
    }

    this.When(/^I'm in the wellcome screen$/, (callback) => {
        observe.listen('home', callback);
    });

    this.Then(/^I should see the search button$/, () => {
        return observe.listen('*', () => {
            return browser.isVisible('#search_button_homepage').then((visible) => {
                return visible || browser.isVisible('#search_button');
            }).should.eventually.be.true
        });
    });

    this.When(/^I search '(.*)'$/, (keyword, callback) => {
        observe.listen('searched ' + keyword, callback);
    });

    this.When(/^I search anything$/, (callback) => {
        observe.listen('searched', callback);
    });

    this.When(/^I search a company$/, (callback) => {
        observe.listen('searched company', callback);
    });

    this.Then(/^I should see the results for (.*)$/, (keyword) => {
        return observe.listen('searched ' + keyword, () => {
            return browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + keyword);
        });
    });

    this.Then(/^I should see the search tabs$/, () => {
        return observe.listen('searched', () => {
            return browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos']);
        });
    });

    this.Then(/^I should see '(.*)' in the tabs$/, (title) => {
        return observe.listen('searched', () => {
            return browser.getText('.zcm__item')
                .should.eventually.include(title);
        });
    });

    this.Then(/^I should not see the text results for (.*)$/, (keyword) => {
        return observe.listen('searched ' + keyword, () => {
            return browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
        });
    });

    this.Then(/^I should see company info for (.*)$/, (keyword) => {
        return observe.listen('searched company', () => {
            return browser.getText('.c-info__title')
                .should.eventually.equal(keyword);
        });
    });


}
