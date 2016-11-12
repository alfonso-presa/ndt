'use strict';

require('colors');

class Reporter {
    constructor() {
        this._counters = {
            steps: {
                ko: 0,
                ok: 0
            },
            scenarios: {
                ko: 0,
                ok: 0,
                miss: 0
            }
        };
    }

    printSummary() {
        let counters = this._counters;
        console.log(`\n${counters.scenarios.ok + counters.scenarios.ko + counters.scenarios.miss} scenarios (` +
            `${counters.scenarios.ko} failed`.red + ', ' +
            `${counters.scenarios.miss} missing`.yellow + ', ' +
            `${counters.scenarios.ok} passed`.green + ')');
        console.log(`${counters.steps.ok + counters.steps.ko} steps (` +
            `${counters.steps.ko} failed`.red + ', ' +
            `${counters.steps.ok} passed`.green + ')\n');
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
                    missing: () => {
                        counters.scenarios.miss++;
                        console.log('[--] '.yellow + `${feature} => ${scenario}`);
                    },
                    step: (step) => {
                        return {
                            fail: (failure) => {
                                counters.steps.ko++;
                                setTimeout(console.error(`\t[${step}] Failed`.red));
                            },
                            reach: () => {
                                counters.steps.ok++;
                                console.log(`\t[${step}]` + ' Reached'.blue);
                            }
                        };
                    }
                };
            }
        };
    }
}

module.exports = Reporter;
