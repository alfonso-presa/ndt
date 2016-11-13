'use strict';

let navigation = require('../../observables/sample-navigation')();

module.exports = function () {

    this.setDefaultTimeout(10 * 1000);

    this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, () =>
        navigation.start(browser)
    );

    this.When(/^I'm in the wellcome screen$/, () =>
        navigation.listen('home')
    );

    this.Then(/^I should see the search button$/, () =>
        navigation.listen('*', () =>
            browser.isVisible('#search_button_homepage').then((visible) =>
                visible || browser.isVisible('#search_button')
            ).should.eventually.be.true
        )
    )

    this.When(/^I search anything$/, () =>
        navigation.listen('searched')
    );

    this.When(/^I search a (.*)$/, (type) =>
        navigation.listen(type + ' search')
    );

    this.Then(/^I should see the corresponding results$/, () =>
        navigation.listen('searched', (context) =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + context.text)
        )
    )

    this.Then(/^I should see the search tabs$/, () =>
        navigation.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include.members(['Web','Imágenes','Videos'])
        )
    );

    this.Then(/^I should see '(.*)' in the tabs$/, (title) =>
        navigation.listen('searched', () =>
            browser.getText('.zcm__item')
                .should.eventually.include(title)
        )
    );

    this.Then(/^I should not see the text results$/, () =>
        navigation.listen('searched', () =>
            browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
        )
    );

    this.Then(/^I should see company info$/, () =>
        navigation.listen('company search', (context) =>
            browser.getText('.c-info__title')
                .then((text) => text.toLowerCase())
                .should.eventually.equal(context.text)
        )
    );


}
