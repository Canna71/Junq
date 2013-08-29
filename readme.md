JUNQ - A library for doing lazy operations on collections in JavaScript
-----------------------------------------------------------------------

Junq is a library for doing operations like enumerating, mapping, filtering on collections.
The peculiarity is that it does it without creating new collections (arrays) every time an operations is performed.
For example you can safely run the following:

    junq.range(Number.POSITIVE_INFINITY)
        .where(function(n){
            return n % 2 === 1;
        })
        .map(function(n){
            return n*n;
        })
        .contains(81);

The range() method will generate an enumerator (also called iterator in some languages) from 0 to infinity.
The enumerator will provide a new element every time it is requested. Since the enumerations is stopped as soon
as the value 81 is found, the first enumerator will only have to iterate 10 times (from 0 to 9).

You could even store the query in a variable and use it later on even different times:

    var q = junq.range(Number.POSITIVE_INFINITY)
        .where(function(n){
            return n % 2 === 1;
        })
        .map(function(n){
            return n*n;
        });

        q.contains(81)
        true
        q.contains(121)
        true

Junq will enumerate on Arrays, other enumerables (see later), or anything object with a length property.
The simplest way tu use junq is to create en enumerable object (a junqy) by calling the junq() function, like this:

    junq([1,2,3,4,5])

Subsequent operations are performed on the object returned by the previous one, in a fluent way:

    junq([1,2,3,4,5]).max();

This is a functional oriented library, so the majority of methods takes a function as argument:

    junq([1,2,3,4,5]).forEach(function(n){
        console.log(n.toString());
    });

Creating custom enumerables
---------------------------
An enumerator is any object that implements a method

    getEnumerator()

This method should return an enumerator object, which is any object that implements the following methods:

    moveNext()
    getCurrent()

