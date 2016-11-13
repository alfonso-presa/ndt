'use strict';

require('colors');


function pad(number, length) {

    var str = '' + number;
    while (str.length < length) {
        str = ' ' + str;
    }
    return str;
}

class Reporter {
    constructor() {
        this._counters = {
            steps: {
                ko: 0,
                reached: 0,
                miss: 0
            },
            scenarios: {
                cancel: 0,
                ko: 0,
                ok: 0,
                miss: 0,
                repeated: 0
            }
        };
        this._registry = {};
    }

    printSummary() {
        let counters = this._counters;
        let registry = this._registry;

        //Let time for the test to completely end.
        return new Promise((resolve) => {
            setTimeout(() => {
                var coverage = Math.round(100 * (counters.scenarios.ok + counters.scenarios.ko) / (counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss));
                var synergy = Math.round(100 * (counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.repeated) / (counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss));
                console.log(`\n${counters.steps.reached + counters.steps.miss} steps (` +
                    `${counters.steps.ko} failed`.red + ', ' +
                    `${counters.steps.miss} missing`.yellow + ', ' +
                    `${counters.steps.reached - counters.steps.ko} passed`.green + ')');
                console.log(`${counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss} scenarios (` +
                    `${counters.scenarios.ko} failed`.red + ', ' +
                    `${counters.scenarios.cancel} aborted`.magenta + ', ' +
                    `${counters.scenarios.miss} uncovered`.yellow + ', ' +
                    `${counters.scenarios.repeated} repeated`.blue + ', ' +
                    `${counters.scenarios.ok} passed`.green + ')');

                console.log('Navigation coverage: ' + (coverage + '%').blue);
                console.log('Navigation synergy:  ' + (synergy + '%').blue);
                for(var scenario in registry) {
                    console.log(`\t${pad(registry[scenario],4)} times`.green + ` -> ${scenario}`);
                }

                resolve();
            });
        })
    }

    feature(feature) {
        let counters = this._counters;
        let registry = this._registry;
        return {
            registry: registry,
            scenario: (scenario) => {
                let self;
                return self = {
                    fail: (failure) => {
                        counters.scenarios.ko++;
                        console.error('[KO]  '.red + `${feature} => ${scenario}\n\t${failure}`);
                        if(failure.stack) {
                            console.error(failure.stack);
                        }
                    },
                    success: () => {
                        if(registry[scenario]) {
                            return self.repeated();
                        }
                        counters.scenarios.ok++;
                        registry[scenario] = (registry[scenario] || 0)+1;
                        console.log('[OK] '.green + `${feature} => ${scenario}`);
                    },
                    repeated: () => {
                        counters.scenarios.repeated++;
                        registry[scenario] = (registry[scenario] || 0)+1;
                        console.log('[OK] '.blue + `${feature} => ${scenario}`);
                    },
                    missing: () => {
                        if(!registry[scenario]) {
                            counters.scenarios.miss++;
                            console.log('[--] '.yellow + `${feature} => ${scenario}`);
                        }
                    },
                    cancel: (why) => {
                        counters.scenarios.cancel++;
                        console.log('[==] '.magenta + `${feature} => ${scenario} - Canceled: ${why.reason}`);
                    },
                    step: (step) => {
                        return {
                            fail: (failure) => {
                                counters.steps.ko++;
                                setTimeout(console.error(`\t[${step}] Failed`.red));
                                console.error(failure);
                            },
                            reach: () => {
                                counters.steps.reached++;
                                console.log(`\t[${step}]` + ' Reached'.blue);
                            },
                            missing: () => {
                                counters.steps.miss++;
                                console.error(`\t[${step}] Missing`.yellow);
                            }
                        };
                    }
                };
            }
        };
    }
}

module.exports = Reporter;
