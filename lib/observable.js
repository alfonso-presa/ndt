'use strict';

class Observable {

    constructor() {
        this.listeners = {};
    }

    _queue(event) {
        return this.listeners[event] = this.listeners[event] || [];
    }

    listen(event, callback) {
        this._queue(event).push(callback);
        return Promise.resolve();
    }

    trigger() {
        //Argumets contain a list of event strings
        let events = Array.prototype.slice.call(arguments);
        let self = this;
        let array;
        let rt;

        array = events.reduce((arr, name) => {
            var items = self._queue(name);
            delete this.listeners[name];
            return arr.concat(items);
        },self._queue('*'));

        delete this.listeners['*'];

        rt = array.reduce(function (prev, listener) {
            return prev.then(listener);
        }, Promise.resolve());
        if(array.length > 0) {
            rt = rt.then(function () {
                return new Promise((resolve) => {
                    setTimeout(() => self.trigger.apply(self, events).then(resolve));
                });
            });
        }
        return rt;
    }
}

module.exports = new Observable();
