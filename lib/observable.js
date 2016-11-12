'use strict';

class Observable {

    constructor() {
        this.listeners = {};
        this.status = {};
    }

    _queue(event) {
        return this.listeners[event] = this.listeners[event] || [];
    }

    addStatus(status) {
        if(!this.status[status]) {
            this.status[status] = true;
            return this.trigger('[New Status] ' + status);
        }
    }

    removeStatus(status) {
        if(this.status[status]) {
            delete this.status[status];
            return this.trigger('[Removed Status] ' + status);
        }
    }

    while(status, canceler) {
        let self = this;
        return new Promise((resolve, reject) => {
            let ownCanceler = {
                canceled: self.listen('[Removed Status] ' + status, undefined, canceler)
            };

            if(this.status[status]) {
                resolve(ownCanceler);
            }
            else {
                self.listen('[New Status] ' + status, undefined, canceler).then(() => resolve(ownCanceler));
            }
        });
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

            self._queue(event).push(() => {
                if(!resolved) {
                    resolved = true;
                    return ((callback && callback()) || Promise.resolve())
                        .then(resolve).catch(reject);
                }
            });

        });
    }

    trigger() {
        //Argumets contain a list of event strings
        let events = Array.prototype.slice.call(arguments);
        let self = this;
        let array;
        let rt;
        let special = events[0] && events[0][0] === '[';

        array = events.reduce((arr, name) => {
            let items = self._queue(name);
            delete this.listeners[name];
            return arr.concat(items);
        },special ? [] : self._queue('*'));

        if(!special) {
            delete this.listeners['*'];
        }

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
        } else if(!special) {
            rt = rt.then(() => {
                return new Promise((resolve, reject) => {
                    setTimeout(() => self.trigger.apply(self, ['[postevent]']).then(resolve).catch(reject));
                });
            });
        }

        return rt;
    }
}

module.exports = Observable;
