/* Junq library v 1.0.0.0
 Copyright Gabriele Cannata 2013-2014
 */

var junq = (function (undefined) {

    var identity = function (o) { return o; };
    var trueConstant = function () { return true; };
    var falseConstant = function () { return false; };
    var stdcomparison = function (a, b) { return a < b; };
    var equality = function (a, b) { return a === b; };
    var doNothing = function(){};
    var emptyenum = { moveNext: falseConstant, getCurrent: doNothing };

    //junq.prototype.constructor = junq;
    var wrapper = function Junqy(o) {
        this._o = o;
        //not really needed
        return this;
    };



    var junq = function (o) {
        return new wrapper(o);
    };

    junq.identity = identity;

    wrapper.prototype.getEnumerator = function () {
        return junq.enumerate(this._o);
    };

    wrapper.prototype.forEach = function (func) {
        junq.forEach(this, func);
    };
    wrapper.prototype.filter = wrapper.prototype.where = function (func) {
        return junq(junq.filter(this, func));
    };

    wrapper.prototype.toArray = function () {
        return junq.toArray(this);
    };
    wrapper.prototype.select = wrapper.prototype.map = function (func) {
        return junq(junq.select(this, func));
    };

    wrapper.prototype.flatmap = function (func) {
        return junq(junq.flatmap(this,func));
    };

    wrapper.prototype.flatten = function () {
        return junq(junq.flatten(this));
    };

    wrapper.prototype.append = function (o) {
        return junq(junq.append(junq(o)).to(this));
    };

    wrapper.prototype.first = function (f) {
        return junq.first(this, f);
    };

    wrapper.prototype.any = function (f) {
        return junq.any(this, f);
    };

    wrapper.prototype.all = function (f) {
        return junq.all(this, f);
    };

    wrapper.prototype.sum = function () {
        return junq.sum(this);
    };

    wrapper.prototype.min = function (comparison) {
        return junq.min(this, comparison);
    };

    wrapper.prototype.max = function (comparison) {
        return junq.max(this, comparison);
    };
    wrapper.prototype.aggregate = function (aggregator, initial) {
        return junq.aggregate(this, aggregator, initial);
    };

    wrapper.prototype.contains = function (val, eq) {
        return junq.contains(this, val, eq);
    };

    wrapper.prototype.take = wrapper.prototype.top = function (num) {
        return junq.take(this,num);
    };

    wrapper.prototype.last  = function () {
        return junq.last(this);
    };

    wrapper.prototype.nth  = function (num) {
        return junq.nth(this,num);
    };

    wrapper.prototype.odd  = function () {
        return junq(junq.odd(this));
    };
    wrapper.prototype.even  = function () {
        return junq(junq.even(this));
    };

    //junq.prototype.init.prototype = junq.prototype;

    //static methods 

    junq.enumerate = function (o) {

        if (o === undefined) {
            throw new Error('Cannot enumerate undefined!');
        }

        if (o.getEnumerator) {//consider this an enumerable
            return o.getEnumerator();
        }
        /** TODO other special cases **/
        if (o.moveNext && o.getCurrent) {//consider this an enumerator
            return o;
        }

        if(typeof (o) === 'string'){
            return junq.enumerate(arguments);
        }

        if (Array.isArray(o) || o.hasOwnProperty('length')) {
            return new junq.ArrayEnumerator(o);
        }


        if (arguments.length) {
            return junq.enumerate(arguments);
        }

        throw new Error('Cannot enumerate ' + o);
    };
    junq.forEach = function forEach(enumerable, func) {
        var enumerator = junq.enumerate(enumerable);
        while (enumerator.moveNext()) {
            func(enumerator.getCurrent());
        }
    };


    junq.filter = junq.where = function filter(enumerable, predicate) {
        var e = junq.enumerate(enumerable);

        return ({
            moveNext: function () {
                while (e.moveNext()) {
                    if (predicate(e.getCurrent())) {
                        return true;
                    }
                }
                return false;
            },
            getCurrent: function () {
                return e.getCurrent();
            }
        });
    };

    junq.even = function(enumerable){
        return junq.odd(enumerable, true);
    }

    junq.odd = function odd(enumerable, even){
        var odd=even | false;
        var enumerator = junq.enumerate(enumerable);
        return ({
            moveNext: function () {
                while (enumerator.moveNext()) {

                    if(odd=!odd){
                        return true;
                    }


                }
                return false;
            },
            getCurrent: function () {
                return enumerator.getCurrent();
            }
        });
    };

    junq.select = junq.map = function select(enumerable, func) {
        var enumerator = junq.enumerate(enumerable);
        return ({
            moveNext: function () {
                return enumerator.moveNext();
            },
            getCurrent: function () {
                return func(enumerator.getCurrent());
            }
        });

    };

    junq.flatmap = function (enumerable, func) {
        var outer = junq.enumerate(enumerable);
        var f = func || identity;
        var lastres;
        var currentouter;
        return ({
            moveNext: function () {
                do {
                    if (!lastres) {
                        if (!(lastres = outer.moveNext())) return false;
                        currentouter = junq.enumerate(f(outer.getCurrent()));
                    }
                    if (lastres = currentouter.moveNext())
                        return true;
                }
                while (!lastres);
                return false;
            },
            getCurrent: function () {
                return currentouter.getCurrent();
            }
        });

    };

    junq.flatten = function (enumerable, func) {
        var outer = junq.enumerate(enumerable);
        var f = func || identity;
        var lastres;
        var currentouter;
        return ({
            moveNext: function () {
                do {
                    if (!lastres) {
                        if (!(lastres = outer.moveNext())) return false;
                        currentouter = junq.enumerate(outer.getCurrent());
                    }
                    if (lastres = currentouter.moveNext())
                        return true;
                }
                while (!lastres);
                return false;
            },
            getCurrent: function () {
                return f(currentouter.getCurrent());
            }
        });

    };

    junq.toArray = function (enumerable) {
        var a = [];
        junq.forEach(enumerable, function (o) {
            a.push(o);
        });
        return a;
    };

    junq.range = function (length, start, step) {
        return junq({
            getEnumerator: function () {
                return new junq.RangeEnumerator(length, start, step);
            }
        });
    };

    junq.append = function (enumerable) {
        return {
            to: function (other) {
                return junq.concat(other, enumerable);
            }
        };

    };


    junq.concat = function (first, then) {
        return junq.flatten(junq.enumerate([first, then]));
    };

    junq.first = function (enumerable, predicate) {
        var f = predicate || trueConstant;
        var e = junq.enumerate(enumerable);
        while (e.moveNext()) {
            if (f(e.getCurrent())) {
                return e.getCurrent();
            }
        }
        return undefined;
    };

    junq.last = function (enumerable, predicate) {
        var f = predicate || trueConstant;
        var e = junq.enumerate(enumerable);
        var val = undefined;
        while (e.moveNext()) {
            val = e.getCurrent();
        }
        return val;
    };

    junq.any = function (enumerable, predicate) {
        return junq.first(enumerable, predicate) !== undefined;
    };

    junq.all = function (enumerable, predicate) {
        var e = junq.enumerate(enumerable);
        while (e.moveNext()) {
            if (!predicate(e.getCurrent())) {
                return false;
            }
        }
        return true;
    };

    junq.sum = function (enumerable) {
        return junq.aggregate(enumerable, function (acc, x) {
            return acc + x;
        },0);
    };

    junq.min = function (enumerable, comparison) {
        var c = comparison || stdcomparison;

        return junq.aggregate(enumerable, function (acc, x) {
            return acc && c(acc, x) ? acc : x;
        });
    };

    junq.max = function (enumerable, comparison) {
        var c = comparison || stdcomparison;

        return junq.aggregate(enumerable, function (acc, x) {
            return !acc || c(acc, x) ? x : acc;
        });
    };

    junq.aggregate = function (enumerable, agg, initial) {
        var acc = initial;
        junq.forEach(enumerable, function (x) {
            acc = agg(acc, x);
        });
        return acc;
    };

    junq.contains = function (enumerable, o, eq) {
        eq = eq || equality;
        return junq.any(enumerable, function (x) {
            return eq(o, x);
        });
    };

    junq.repeat = function (element, count) {
        return junq({
            getCurrent: function () {
                return element;
            },
            moveNext: function () {
                return (count--) > 0;
            }
        });
    };

    junq.take = junq.top =  function (enumerable, top) {
        var e = junq.enumerate(enumerable);
        return junq({
            getCurrent: function () {
                return e.getCurrent();
            },
            moveNext: function () {
                return (top--) > 0 && e.moveNext();
            }
        });
    };

    junq.nth = function(enumerable,num){
        return junq.take(enumerable,num).last();
    };

    //nested "classes"
    junq.ArrayEnumerator = (function () {
        function ArrayEnumerator(array) {
            this._array = array;
            this._current = -1;
        }
        ArrayEnumerator.prototype.moveNext = function () {
            this._current++;
            return this._current < this._array.length;

        };

        ArrayEnumerator.prototype.getCurrent = function () {
            return this._array[this._current];
        };
        return ArrayEnumerator;
    })();

    junq.RangeEnumerator = (function () {
        function RangeEnumerator(length, start, step) {
            if (start === undefined) {
                start = 0;
            }

            if (step === undefined) {
                step = 1;
            }
            if (length === undefined) {
                throw new Error('length must be speccified');
            }
            this._current = start-step; //is incremented in the first moveNext
            this._length = length;
            this._step = step;
        }
        RangeEnumerator.prototype.moveNext = function () {

            if (this._length > 0) {
                this._length--;
                this._current += this._step;
                return true;
            }
            return false;
        };

        RangeEnumerator.prototype.getCurrent = function () {
            return this._current;
        };
        return RangeEnumerator;
    })();

    return junq;
})();

if (typeof(module) !== 'undefined') { module.exports = junq; }



