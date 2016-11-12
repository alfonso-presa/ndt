'use strict';

require('colors');

function attachSuiteToNavigation(suite, navigation) {
    let state = undefined;

    let stepToEvent = suite.stepDefinitions.Whens;
    let stepToAsertion = suite.stepDefinitions.Thens;
    let features = suite.features;

    let reporter = {
        step: {
            fail: (failure, step) => setTimeout(console.error(`\t[${step}] Failed`.red)),
            reach: (step) => console.log(`\t[${step}]` + ' Reached'.blue)
        },
        scenario: {
            fail: (failure, feature, scenario) =>
                console.error('[KO]  '.red + `${feature} => ${scenario}\n\t${failure}`),
            success: (feature, scenario) =>
                console.log('[OK] '.green + `${feature} => ${scenario}`),
            missing: (feature, scenario) =>
                console.log('[--] '.yellow + `${feature} => ${scenario}`)
        }
    };

    function processFeatures(features, stack) {
        for(let feature in features) {
            (function (feature) {
                let scenarios = features[feature];
                processScenarios(feature, scenarios, stack);
            })(feature);
        }
    }

    function processScenarios(feature, scenarios, stack) {
        for(let scenario in scenarios) {
            state = undefined;
            (function (scenario) {
                let done = false;
                let steps = scenarios[scenario];
                steps.reduce((stack,step) =>
                    processStep(step, stack)
                ,stack)
                    .then(() => reporter.scenario.success(feature, scenario))
                    .catch((e) => reporter.scenario.fail(e, feature, scenario))
                    .then(() => {done = true;});
                navigation.listen('end', () => !done && reporter.scenario.missing(feature, scenario));
            })(scenario);
        }
    }

    function processStep(step, stack) {
        function visitor(step, callback) {
            return function () {
                reporter.step.reach(step);
                if(callback) {
                    return new Promise((resolve, reject) => callback().then(resolve).catch((e) => {
                        reject(e);
                        setTimeout(() => reporter.step.fail(e, step));
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
                    visitor(step)
                )
            );
        } else if(type === 'then') {
            return stack.then(() =>
                navigation.listen(
                    '*',
                    visitor(step, findElement(stepToAsertion, step))
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

    processFeatures(features, navigation.started);
}

class TestSuite {
    constructor(features) {
        this.features = features;
    }

    watch (navigation) {
        attachSuiteToNavigation(this.features, navigation);
    }
}

module.exports = TestSuite;
