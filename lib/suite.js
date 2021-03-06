'use strict';

let Reporter = require('./reporter');
let gherkin = require('gherkin');
let fs = require('fs');

function gherkinParser(file) {
    let parser = new gherkin.Parser();
    let content = fs.readFileSync(file);
    let doc = parser.parse(content.toString());

    let suiteDef = {};
    let scenarios = {};

    suiteDef[doc.feature.name] = scenarios;

    doc.feature.children.forEach((scenario) => {
        if(scenario.type === 'Scenario') {
            let steps = [];
            scenarios[scenario.name] = steps;

            scenario.steps.forEach((step) => {
                steps.push(step.keyword + step.text);
            });
        }
    });

    return suiteDef;
}


function attachSuiteToObservable(suite, observable, reporter) {
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
            this.done = false;
        }

        jobDone() {
            this.done = true;
        }

        chain(canceler) {
            var self = this;
            return new Promise((resolve) => canceler.canceled.then((why) => {
                if(!self.done) {
                    self.resolveCanceled(why);
                    resolve(why);
                }
            }));
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

    function processScenario(feature, scenario, scenarios, stack, featureReporter) {
        let reporter = featureReporter.scenario(scenario);
        let steps = scenarios[scenario];
        let canceler = new Canceler();
        let done = false;
        steps.reduce((stack,step) =>
            processStep(step, stack, reporter, canceler)
        ,stack)
            .then(() => {
                reporter.success();
                canceler.jobDone();
                //We can restart the scenario in case it can be accomplished again during the navigation
                observable.listen('[postevent]').then(() =>
                    processScenario(feature, scenario, scenarios, stack, featureReporter)
                );
            })
            .catch((e) => {
                if(e.type === 'canceled') {
                    //Restart the scenario just in case it find's it way through again
                    reporter.cancel(e);
                    setTimeout(() =>
                        processScenario(feature, scenario, scenarios, stack, featureReporter)
                    );
                }
                else {
                    reporter.fail(e);
                }
            })
            .then(() => done = true);

        observable.listen('end', () => !done && reporter.missing());
    }

    function processStep(step, stack, scenarioReporter, canceler) {
        let reporter = scenarioReporter.step(step);

        function visitor(callback) {
            return function (context) {
                reporter.reach();
                if(callback) {
                    return new Promise((resolve, reject) => callback(context).then(resolve).catch((e) => {
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
                    observable.listen(
                        event,
                        visitor(),
                        canceler
                    )
                );
            }
        } else if(type === 'given') {
            let state = findElement(stepToState, step);
            if(state) {
                for(var name in state) {
                    (function (name){
                        stack = stack.then(() => {
                            return observable.while(name, state[name], canceler).then((cancel) => {
                                canceler.chain(cancel).then(reporter.cancel);
                                visitor()();
                            });
                        });
                    })(name);
                }
                return stack;
            }
        } else if(type === 'then') {
            let assertion = findElement(stepToAsertion, step);
            if(assertion) {
                return stack.then(() =>
                    observable.listen(
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
        function replacer(string, matches) {
            for(let i = 1; i < matches.length; i++) {
                string = string.replace(new RegExp('\\$' + i, 'g'), matches[i]);
            }
            return string;
        }

        for(let name in list) {
            let matcher = new RegExp(name);
            let matches = matcher.exec(text);
            if(matches) {
                let rt = list[name];
                if(typeof rt === 'string' || rt instanceof String) {
                    rt = replacer(rt, matches);
                } else if(typeof rt === 'object') {
                    for(var item in rt) {
                        rt[item] = replacer(rt[item], matches);
                    }
                } else {
                    matches.shift();
                    let fn = rt;
                    rt = function (context) {
                        matches.push(context);
                        return fn.apply(undefined, matches);
                    }
                }
                return rt;
            }
        }
    }
    processFeatures(features, Promise.resolve(), reporter);
    return reporter;
}

class TestSuite {
    //If steps are provided def should be a file
    constructor(def, steps) {
        this.features = steps ? {
            features: gherkinParser(def),
            stepDefinitions: steps
        }: def;
    }

    watch (observable) {

        let reporter = new Reporter();
        attachSuiteToObservable(this.features, observable, reporter);
        observable.listen('end', reporter.printSummary.bind(reporter));
    }
}

module.exports = TestSuite;
