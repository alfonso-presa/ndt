'use strict';

var Reporter = require('./reporter');

function attachSuiteToNavigation(suite, navigation, reporter) {
    let state = undefined;

    let stepToEvent = suite.stepDefinitions.Whens;
    let stepToAsertion = suite.stepDefinitions.Thens;
    let features = suite.features;

    function processFeatures(features, stack, reporter) {
        for(let feature in features) {
            (function (feature) {
                let scenarios = features[feature];
                processScenarios(feature, scenarios, stack, reporter.feature(feature));
            })(feature);
        }
    }

    function processScenarios(feature, scenarios, stack, featureReporter) {
        for(let scenario in scenarios) {
            state = undefined;
            (function (scenario) {
                let done = false;
                let steps = scenarios[scenario];
                let reporter = featureReporter.scenario(scenario);
                steps.reduce((stack,step) =>
                    processStep(step, stack, reporter)
                ,stack)
                    .then(reporter.success)
                    .catch(reporter.fail)
                    .then(() => {done = true;});
                navigation.listen('end', () => !done && reporter.missing());
            })(scenario);
        }
    }

    function processStep(step, stack, scenarioReporter) {
        let reporter = scenarioReporter.step(step);

        function visitor(callback) {
            return function () {
                reporter.reach();
                if(callback) {
                    return new Promise((resolve, reject) => callback().then(resolve).catch((e) => {
                        reject(e);
                        setTimeout(reporter.fail);
                    }));
                }
            };
        }

        if(step.length < 6){
            throw 'Invalid step ' + step;
        }

        let pos = step.indexOf(' ');
        let type = step.substring(0, pos).toLowerCase();
        let text = step.substring(pos +1);

        if(type === 'and') {
            type = state;
        }
        state = type;

        if(type === 'when') {
            return stack.then(() =>
                navigation.listen(
                    findElement(stepToEvent, step),
                    visitor()
                )
            );
        } else if(type === 'then') {
            return stack.then(() =>
                navigation.listen(
                    '*',
                    visitor(findElement(stepToAsertion, step))
                )
            );
        } else {
            throw 'Invalid step ' + step;
        }
    }

    function findElement(list, text) {
        for(let name in list) {
            let matcher = new RegExp(name);
            let matches = matcher.exec(text);
            if(matches) {
                let rt = list[name];
                if(typeof rt === 'string' || rt instanceof String) {
                    for(let i = 1; i < matches.length; i++) {
                        rt = rt.replace(new RegExp('\\$' + i, 'g'), matches[i]);
                    }
                } else {
                    matches.shift();
                    let fn = rt;
                    rt = function () {
                        return fn.apply(undefined, matches);
                    }
                }
                return rt;
            }
        }
    }
    processFeatures(features, navigation.started, reporter);
    return reporter;
}

class TestSuite {
    constructor(features) {
        this.features = features;
    }

    watch (navigation) {

        let reporter = new Reporter();
        attachSuiteToNavigation(this.features, navigation, reporter);
        navigation.listen('end', reporter.printSummary.bind(reporter));
    }
}

module.exports = TestSuite;
