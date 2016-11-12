'use strict';

var Reporter = require('./reporter');

function attachSuiteToNavigation(suite, navigation, reporter) {
    let state = undefined;

    let stepToEvent = suite.stepDefinitions.Whens;
    let stepToAsertion = suite.stepDefinitions.Thens;
    let stepToState = suite.stepDefinitions.Givens;
    let features = suite.features;

    class Canceler {
        constructor() {
            let self = this;
            this.canceled = new Promise((resolve) => {
                self.resolveCanceled = resolve;
            });
        }

        chain(canceler) {
            var self = this;
            return canceler.canceled.then(() => {
                self.resolveCanceled();
            });
        }
    }

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
            processScenario(feature, scenario, scenarios, stack, featureReporter);
        }
    }

    function processScenario(feature, scenario, scenarios, stack, featureReporter, done) {
        let reporter = featureReporter.scenario(scenario);
        let steps = scenarios[scenario];
        let canceler = new Canceler();
        steps.reduce((stack,step) =>
            processStep(step, stack, reporter, canceler)
        ,stack)
            .then(() => {
                if(!done) {
                    reporter.success();
                } else {
                    reporter.repeated();
                }
                //We can restart the scenario in case it can be accomplished again during the navigation
                navigation.listen('[postevent]').then(() =>
                    processScenario(feature, scenario, scenarios, stack, featureReporter, true)
                );
            })
            .catch((e) => {
                if(e === 'canceled') {
                    //Restart the scenario just in case it find's it way through again
                    reporter.cancel();
                    setTimeout(() =>
                        processScenario(feature, scenario, scenarios, stack, featureReporter)
                    );
                }
                else {
                    reporter.fail(e);
                }
            })
            .then(() => {
                done = true;
            });

        navigation.listen('end', () => !done && reporter.missing());
    }

    function processStep(step, stack, scenarioReporter, canceler) {
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

        let pos = step.indexOf(' ');

        if(pos < 0){
            throw 'Invalid step ' + step;
        }

        let type = step.substring(0, pos).toLowerCase();
        let text = step.substring(pos +1);

        if(type === 'and') {
            type = state;
        }
        state = type;

        if(type === 'when') {
            let event = findElement(stepToEvent, step);
            if(event) {
                return stack.then(() =>
                    navigation.listen(
                        event,
                        visitor(),
                        canceler
                    )
                );
            }
        } else if(type === 'given') {
            let state = findElement(stepToState, step);
            if(state) {
                return stack.then(() => {
                    return navigation.while(state, canceler).then((cancel) => {
                        canceler.chain(cancel);
                        visitor()();
                    });
                });
            }
        } else if(type === 'then') {
            let assertion = findElement(stepToAsertion, step);
            if(assertion) {
                return stack.then(() =>
                    navigation.listen(
                        '*',
                        visitor(assertion),
                        canceler
                    )
                );
            }
        } else {
            throw 'Invalid step ' + step;
        }
        reporter.missing();
        return new Promise(() => {});
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