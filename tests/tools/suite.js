'use strict';

require('colors');

function attachSuite(suite, navigation, stack) {
    for(var test in suite) {
        var spec = suite[test];
        attachTest(test, spec, navigation, stack);
    }
}

function attachTest(test, spec, navigation, stack) {
    spec = Array.isArray(spec) ? spec : [spec];
    return spec.reduce((stack, step) =>
            attachStep(step, navigation, stack)
        , stack)
        .then(() => console.log('[OK] '.green + test))
        .catch((e) => console.error('[KO] '.red + test + '\n' + e));
}

function attachStep(step, navigation, stack, callback) {
    function reporter(step, callback) {
        return function () {
            console.log(('\t[' + step + ']').yellow + ' Reached');
            return callback ? callback() : undefined;
        };
    }

    if (typeof step === 'string' || step instanceof String) {
        return stack.then(() => navigation.listen(step, reporter(step, callback)));
    } else {
        for(var event in step) {
            stack = attachStep(event, navigation, stack, step[event]);
        }
        return stack;
    }
}

module.exports = {
    attach: function (suite, navigation, tracker) {
        attachSuite(suite, navigation, tracker);
    }
}
