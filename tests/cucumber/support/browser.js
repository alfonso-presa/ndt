'use strict';

let navigation = require('../../observables/sample-navigation')();

let observable = navigation.observable;

module.exports = function () {

    this.setDefaultTimeout(10 * 1000);

    this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, () =>
        navigation.start(browser)
    );

    this.When(/^I'm in the wellcome screen$/, () =>
        observable.while('page','home')
    );

    this.Then(/^I should see the search button$/, () =>
        observable.listen('*', () =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true
        )
    )

    this.When(/^I search anything$/, () =>
        observable.listen('searched')
    );

    this.When(/^I search a (.*)$/, (type) =>
        observable.listen(type + ' search')
    );

    this.Then(/^I should see the corresponding results$/, () =>
        observable.listen('searched', (context) =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + context.text)
        )
    )

    this.Then(/^I should see the search tabs$/, () =>
        observable.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos'])
        )
    );

    this.Then(/^I should see '(.*)' in the tabs$/, (title) =>
        observable.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include(title)
        )
    );

    this.Then(/^I should not see the text results$/, () =>
        observable.listen('searched', () =>
            browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
        )
    );

    this.Then(/^I should see company info$/, () =>
        observable.listen('company search', (context) =>
            browser.getText('.c-info__title')
                .then((text) => text.toLowerCase())
                .should.eventually.equal(context.text)
        )
    );


}
