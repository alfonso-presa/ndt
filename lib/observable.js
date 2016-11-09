'use strict';

class Observable {

    constructor() {
        this.listeners = {};
    }

    _queue(event) {
        return this.listeners[event] = this.listeners[event] || [];
    }

    listen(event, callback) {
        var self = this;
        return new Promise((resolve, reject) => {
            self._queue(event).push(() => {
                return ((callback && callback()) || Promise.resolve())
                    .then(resolve).catch(reject);
            });
        });
    }

    trigger() {
        //Argumets contain a list of event strings
        let events = Array.prototype.slice.call(arguments);
        let self = this;
        let array;
        let rt;

        array = events.reduce((arr, name) => {
            let items = self._queue(name);
            delete this.listeners[name];
            return arr.concat(items);
        },self._queue('*'));

        delete this.listeners['*'];

        rt = Promise.all(array.reduce((prev, listener) => {
            prev.push(listener());
            return prev;
        }, []));

        if(array.length > 0) {
            rt = rt.then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => self.trigger.apply(self, events).then(resolve).catch(reject));
                });
            });
        }

        return rt;
    }
}

module.exports = new Observable();
