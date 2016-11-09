'use strict';

let navigation = new (require('../observables/sample-navigation'))();

module.exports = function () {

    this.Given(/^I perform duckduckgo navigation$/, {timeout:20000}, () =>
        navigation.start()
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

    this.When(/^I search '(.*)'$/, (keyword) =>
        navigation.listen('searched ' + keyword)
    );

    this.When(/^I search anything$/, () =>
        navigation.listen('searched')
    );

    this.When(/^I search a company$/, () =>
        navigation.listen('searched company')
    );

    this.Then(/^I should see the results for (.*)$/, (keyword) =>
        navigation.listen('searched ' + keyword, () =>
            browser.getText('.zci--meanings .metabar__primary-text')
                .should.eventually.equal('Resultados para ' + keyword)
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

    this.Then(/^I should not see the text results for (.*)$/, (keyword) =>
        navigation.listen('searched ' + keyword, () =>
            browser.isVisible('.zci--meanings .metabar__primary-text')
                .should.eventually.be.false
        )
    );

    this.Then(/^I should see company info for (.*)$/, (keyword) =>
        navigation.listen('searched company', () =>
            browser.getText('.c-info__title')
                .should.eventually.equal(keyword)
        )
    );


}
