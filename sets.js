/* Junq library v 1.0.0.0
 Copyright Gabriele Cannata 2013
 Sets extensions
 */

var junq = junq || require('./junq.js');

var sets;
(function (sets, undefined) {


    var Set = (function () {

        var internalRep = function (objects) {
            var self = this;
            self.set = [];
            junq(objects).forEach(function (o) {
                self.add(o);

            });

        };

        function Set(objects) {
            if (objects !== undefined) {
                if (arguments.length == 1)
                    internalRep.call(this, objects);
                else
                    internalRep.call(this, arguments);
            } else {
                internalRep.call(this, []);
            }

        }

        var isSet = function isSet(o) {
            if (o !== undefined) {
                return o.constructor === Set;
            } else {
                return false;
            }

        };
        sets.isSet = isSet;


        Set.prototype.toString = function () {

            return '{' + this.toArray().join(', ') + '}';
        };

        Set.prototype.forEach = function (func) {
            this.set.forEach(func);
            return this;
        };
        //TODO: try indexOf
        Set.prototype.contains = function (element) {
            return (this.set.indexOf(element) >= 0);
        };

        Set.prototype.add = function (element) {
            if (!this.contains(element))
                this.set.push(element);
            return this;
        };

        Set.prototype.remove = function (element) {
            var l = this.set.length;
            for (var i = 0; i < l; i++) {
                if (this.set[i] === element) {
                    this.set.splice(i, 1);
                    break;
                }
            }
            return this;
        };

        Set.prototype.union = function (other) {

            var res = this.clone();
            if (isSet(other)) {
                other.forEach(function (e) {
                    res.add(e);
                });
            } else {
                res.add(other);
            }

            return res;
        };

        Set.prototype.clone = function () {
            var res = new Set();
            res.set = this.set.slice(0, this.set.length);
            return res;
        };

        Set.prototype.intersect = function (other) {
            var res = new Set();
            this.forEach(function (e) {
                if (other.contains(e))
                    res.add(e);
            });

            return res;
        };

        Set.prototype.cardinality = function () {
            return this.set.length;
        };

        Set.prototype.subtract = function (other) {

            var res = this.clone();

            other.forEach(function (e) {
                res.remove(e);
            });
            return res;
        };

        Set.prototype.equalTo = function (other) {
            if (this.cardinality() !== other.cardinality()) return false;
            return this.subtract(other).isEmpty();// && other.subtract(this).isEmpty();

        };

        Set.prototype.isEmpty = function () {
            return this.set.length === 0;

        };

        Set.prototype.getEnumerator = function () {
            return junq.enumerate(this.toArray());
        };

        Set.prototype.toArray = function () {

            return this.set;
        };

        Set.prototype.isSingleton = function () {
            return this.set.length === 1;
        };

        Set.prototype.getElement = function (n) {
            n = n | 0;
            if (this.set.length <= n)
                throw new Error('Not enough elements!');
            return this.set[n];
        };

        Set.prototype.getEnumerator = function () {
            return new junq.ArrayEnumerator(this.set);
        };

        return Set;
    })();
    sets.Set = Set;

})(sets || (sets = {}));