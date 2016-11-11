'use strict';

require('colors');

module.exports = {
    attach: function (suite, navigation, tracker) {
        let state = undefined;

        let stepToEvent = suite.triggers;
        let stepToAsertion = suite.assertions;
        let scenarios = suite.scenarios;

        function processScenarios(scenarios, navigation, stack) {
            for(let scenario in scenarios) {
                state = undefined;
                (function (scenario) {
                    let steps = scenarios[scenario];
                    steps.reduce((stack,step) =>
                        processStep(step, navigation, stack)
                    ,stack)
                        .then(() => console.log('[OK] '.green + scenario))
                        .catch((e) => console.error('[KO] '.red + scenario + '\n' + e));
                })(scenario);
            }
        }

        function processStep(step, navigation, stack) {
            function reporter(step, callback) {
                return function () {
                    console.log(('\t[' + step + ']').yellow + ' Reached');
                    if(callback) {
                        return callback().catch((e) => {
                            console.error(('\t[' + step + ']').yellow + ' Failed'.red);
                            throw e;
                        });
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
                        reporter(step)
                    )
                );
            } else if(type === 'then') {
                return stack.then(() =>
                    navigation.listen(
                        '*',
                        reporter(step, findElement(stepToAsertion, step))
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

        processScenarios(scenarios, navigation, tracker);
    }
}
