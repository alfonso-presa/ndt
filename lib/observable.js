'use strict';

class Observable {

    constructor() {
        this.listeners = {};
        this.status = {};
    }

    _queue(event) {
        return this.listeners[event] = this.listeners[event] || [];
    }

    getStatus(status) {
        return this.status[status];
    }

    setStatus(status, value) {
        if(this.status[status] !== value) {
            this.status[status] = value;
            return this.trigger('[Context change] ' + status);
        }
    }

    while(status, value, canceler) {
        let self = this;

        function stateChangePromiseBuilder(valueBuilder) {
            let wasEqual = (self.getStatus(status) === value);
            return new Promise((resolve) => {
                (function wait() {
                    self.listen('[Context change] ' + status, undefined, canceler)
                        .then(() => {
                            if((self.getStatus(status) === value) === wasEqual) {
                                wait();
                            } else {
                                resolve(valueBuilder && valueBuilder());
                            }
                        });
                })();
            });
        }

        function cancelerBuilder() {
            return {canceled: stateChangePromiseBuilder()};
        }

        if(self.getStatus(status) === value) {
            return Promise.resolve(cancelerBuilder());
        } else {
            return stateChangePromiseBuilder(cancelerBuilder);
        }
    }

    listen(event, callback, canceler) {
        var self = this;
        return new Promise((resolve, reject) => {
            var resolved = false;

            if(canceler) {
                canceler.canceled.then(() => {
                    if(!resolved) {
                        resolved = true;
                        reject('canceled');
                    }
                });
            }

            self._queue(event).push((context) => {
                if(!resolved) {
                    resolved = true;
                    return ((callback && callback(context)) || Promise.resolve())
                        .then(resolve).catch(reject);
                }
            });

        });
    }

    trigger() {
        //Argumets contain a list of event strings
        //Last one can be a context object
        let events = Array.prototype.slice.call(arguments);
        let self = this;
        let array;
        let rt;
        let special = events[0] && events[0][0] === '[';
        let context;

        if(typeof events[events.length-1] === 'object') {
            context = events.pop();
        }

        array = events.reduce((arr, name) => {
            let items = self._queue(name);
            delete this.listeners[name];
            return arr.concat(items);
        },special ? [] : self._queue('*'));

        if(!special) {
            delete this.listeners['*'];
        }

        rt = Promise.all(array.reduce((prev, listener) => {
            prev.push(listener(context));
            return prev;
        }, []));

        if(!special) {
            if(array.length > 0) {
                rt = rt.then(() => {
                    return new Promise((resolve, reject) => {
                        context && events.push(context);
                        setTimeout(() => self.trigger.apply(self, events).then(resolve).catch(reject));
                    });
                });
            } else {
                rt = rt.then(() => {
                    return new Promise((resolve, reject) => {
                        setTimeout(() => self.trigger.apply(self, ['[postevent]']).then(resolve).catch(reject));
                    });
                });
            }
        }

        return rt;
    }
}

module.exports = Observable;
