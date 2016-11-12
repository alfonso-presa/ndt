'use strict';

require('colors');

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
    }

    printSummary() {
        let counters = this._counters;

        //Let time for the test to completely end.
        return new Promise((resolve) => {
            setTimeout(() => {
                var coverage = Math.round(100 * (counters.scenarios.ok + counters.scenarios.ko) / (counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss));
                console.log(`\n${counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss} scenarios (` +
                    `${counters.scenarios.ko} failed`.red + ', ' +
                    `${counters.scenarios.cancel} aborted`.magenta + ', ' +
                    `${counters.scenarios.miss} uncovered`.yellow + ', ' +
                    `${counters.scenarios.repeated} repeated`.blue + ', ' +
                    `${counters.scenarios.ok} passed`.green + ')');

                console.log('Navigation coverage: ' + (coverage + '%').blue);

                console.log(`\n${counters.steps.reached + counters.steps.miss} steps (` +
                    `${counters.steps.ko} failed`.red + ', ' +
                    `${counters.steps.miss} missing`.yellow + ', ' +
                    `${counters.steps.reached - counters.steps.ko} passed`.green + ')\n');
                resolve();
            });
        })
    }

    feature(feature) {
        let counters = this._counters;
        return {
            scenario: (scenario) => {
                return {
                    fail: (failure) => {
                        counters.scenarios.ko++;
                        console.error('[KO]  '.red + `${feature} => ${scenario}\n\t${failure}`);
                    },
                    success: () => {
                        counters.scenarios.ok++;
                        console.log('[OK] '.green + `${feature} => ${scenario}`);
                    },
                    repeated: () => {
                        counters.scenarios.repeated++;
                        console.log('[OK] '.blue + `${feature} => ${scenario}`);
                    },
                    missing: () => {
                        counters.scenarios.miss++;
                        console.log('[--] '.yellow + `${feature} => ${scenario}`);
                    },
                    cancel: () => {
                        counters.scenarios.cancel++;
                        console.log('[==] '.magenta + `${feature} => ${scenario} - Canceled... retrying`);
                    },
                    step: (step) => {
                        return {
                            fail: (failure) => {
                                counters.steps.ko++;
                                setTimeout(console.error(`\t[${step}] Failed`.red));
                            },
                            reach: () => {
                                counters.steps.reached++;
                                console.log(`\t[${step}]` + ' Reached'.blue);
                            },
                            missing: () => {
                                counters.steps.miss++;
                                setTimeout(console.error(`\t[${step}] Missing`.yellow));
                            }
                        };
                    }
                };
            }
        };
    }
}

module.exports = Reporter;
