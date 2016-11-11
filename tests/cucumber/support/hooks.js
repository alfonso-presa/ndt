'use strict';

module.exports = function (){

    var webdriverio = require('webdriverio');
    var options = {
        desiredCapabilities: {
            browserName: 'chrome',
            chromeOptions: {
                binary: /darwin/.test(process.platform) && '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary'
            }
        }
    };
    var chai = require('chai');
    var chaiAsPromised = require('chai-as-promised');

    var client = webdriverio.remote(options);
    chai.Should();
    chai.use(chaiAsPromised);
    chaiAsPromised.transferPromiseness = client.transferPromiseness;

    global.browser = client;

};
