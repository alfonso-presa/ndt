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

    trigger(event) {
        let self = this;
        var array = this._queue(event);
        var size = array.length;
        var rt = array.reduce(function (prev, listener) {
            return prev.then(function () {
                array.splice(array.indexOf(listener),1);
            }).then(listener);
        }, Promise.resolve());
        if(size > 0) {
            rt = rt.then(function () {
                return new Promise((resolve) => {
                    setTimeout(() => self.trigger(event).then(resolve));
                });
            });
        }
        return rt;
    }
}

module.exports = new Observable();
