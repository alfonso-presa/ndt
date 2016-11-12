var webdriverio = require('webdriverio');
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');

module.exports = function () {
    var options = {
        desiredCapabilities: {
            browserName: 'chrome',
            chromeOptions: /darwin/.test(process.platform) && {
                binary: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary'
            }
        }
    };

    var client = webdriverio.remote(options);
    chai.Should();
    chai.use(chaiAsPromised);
    chaiAsPromised.transferPromiseness = client.transferPromiseness;

    return client;
}
