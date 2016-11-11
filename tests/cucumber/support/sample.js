'use strict';

let observe = new(require('../../../lib/observable'))();

module.exports = function () {

    var started = false;

    this.Given('I perform some actions', function () {
        if(started) {
            return;
        }
        started = true;
        ['precondition', 'action', 'action 2', 'action 3'].reduce(function (prev, event) {
            return prev.then(function () {
                return new Promise(function (resolve) {
                    setTimeout(function () {
                        observe.trigger(event).then(resolve);
                    },500);
                });
            });
        }, Promise.resolve());
    });

    this.Then(/^testable outcome (\d+)$/, function (arg1, callback) {
         callback();
    });

    this.When(/^action (\d+)$/, function (arg1, callback) {
         observe.listen('action ' + arg1, callback);
    });

    this.When(/^action$/, function (callback) {
         observe.listen('action', callback);
    });

    this.Given(/^precondition$/, function (callback) {
         observe.listen('precondition', callback);
    });

}
