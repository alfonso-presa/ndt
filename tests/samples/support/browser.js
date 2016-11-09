'use strict';

let observe = require('../../../lib/observable');

module.exports = function () {

    {
        let browserBootstrapPromise;

        this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, () => {
            if(!browserBootstrapPromise) {
                browserBootstrapPromise = browser
                    .init()
                    .setViewportSize({
                        width: 900,
                        height: 800
                    },false)
                    .url('https://duckduckgo.com/')
                browserBootstrapPromise
                    .pause() //Needed to make next step async

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

    this.When(/^I'm in the wellcome screen$/, () =>
        observe.listen('home')
    );

    this.Then(/^I should see the search button$/, () =>
        observe.listen('*', () =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true
        )
    )

    this.When(/^I search '(.*)'$/, (keyword) =>
        observe.listen('searched ' + keyword)
    );

    this.When(/^I search anything$/, () =>
        observe.listen('searched')
    );

    this.When(/^I search a company$/, () =>
        observe.listen('searched company')
    );

    this.Then(/^I should see the results for (.*)$/, (keyword) =>
        observe.listen('searched ' + keyword, () =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + keyword)
        )
    )

    this.Then(/^I should see the search tabs$/, () =>
        observe.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos'])
        )
    );

    this.Then(/^I should see '(.*)' in the tabs$/, (title) =>
        observe.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include(title)
        )
    );

    this.Then(/^I should not see the text results for (.*)$/, (keyword) =>
        observe.listen('searched ' + keyword, () =>
            browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
        )
    );

    this.Then(/^I should see company info for (.*)$/, (keyword) =>
        observe.listen('searched company', () =>
            browser.getText('.c-info__title')
                .should.eventually.equal(keyword)
        )
    );


}
