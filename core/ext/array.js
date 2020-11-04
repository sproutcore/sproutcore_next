import { Copyable } from '../mixins/copyable.js';
import { mixin, copy, none, isEqual, supplement } from '../system/base.js';
import { Freezable } from '../mixins/freezable.js';
import { Observable } from '../mixins/observable.js';
import { Enumerable, Reducers } from '../mixins/enumerable.js';
import { CoreArray } from '../mixins/array.js';

/**
  @namespace

  This module implements Observer-friendly Array-like behavior.  This mixin is
  picked up by the Array class as well as other controllers, etc. that want to
  appear to be arrays.

  Unlike Enumerable, this mixin defines methods specifically for
  collections that provide index-ordered access to their contents.  When you
  are designing code that needs to accept any kind of Array-like object, you
  should use these methods instead of Array primitives because these will
  properly notify observers of changes to the array.

  Although these methods are efficient, they do add a layer of indirection to
  your application so it is a good idea to use them only when you need the
  flexibility of using both true JavaScript arrays and "virtual" arrays such
  as controllers and collections.

  You can use the methods defined in this module to access and modify array
  contents in a KVO-friendly way.  You can also be notified whenever the
  membership if an array changes by changing the syntax of the property to
  .observes('*myProperty.[]') .

  To support Array in your own class, you must override two
  primitives to use it: replace() and objectAt().

  Note that the Array mixin also incorporates the Enumerable mixin.  All
  Array-like objects are also enumerable.

  @mixes Enumerable
  @since SproutCore 0.9.0
*/
// const SCArray = mixin({}, Enumerable, CoreArray);
supplement(Array.prototype, CoreArray);

mixin(Array.prototype, Copyable);
mixin(Array.prototype, Freezable);
// this possibly needs to be done async through import()
mixin(Array.prototype, Observable);
mixin(Array.prototype, Reducers);

Array.prototype.isEnumerable = true;
Array.prototype.nextObject = Enumerable.nextObject;
Array.prototype.enumerator = Enumerable.enumerator;
Array.prototype.firstObject = Enumerable.firstObject;
Array.prototype.lastObject = Enumerable.lastObject;

Array.prototype.sortProperty = Enumerable.sortProperty,

// see above...
Array.prototype.mapProperty = function (key) {
  var len = this.length;
  var ret = [];
  for (var idx = 0; idx < len; idx++) {
    var next = this[idx];
    ret[idx] = next ? (next.get ? next.get(key) : next[key]) : null;
  }
  return ret;
};

Array.prototype.filterProperty = function (key, value) {
  var len = this.length,
    ret = [],
    idx, item, cur;
  // Although the code for value and no value are almost identical, we want to make as many decisions outside
  // the loop as possible.
  if (value === undefined) {
    for (idx = 0; idx < len; idx++) {
      item = this[idx];
      cur = item ? (item.get ? item.get(key) : item[key]) : null;
      if (!!cur) ret.push(item);
    }
  } else {
    for (idx = 0; idx < len; idx++) {
      item = this[idx];
      cur = item ? (item.get ? item.get(key) : item[key]) : null;
      if (isEqual(cur, value)) ret.push(item);
    }
  }
  return ret;
};

Array.prototype.groupBy = function (key) {
  var len = this.length,
    ret = [],
    grouped = [],
    keyValues = [],
    idx, next, cur;

  for (idx = 0; idx < len; idx++) {
    next = this[idx];
    cur = next ? (next.get ? next.get(key) : next[key]) : null;
    if (none(grouped[cur])) {
      grouped[cur] = [];
      keyValues.push(cur);
    }
    grouped[cur].push(next);
  }

  for (idx = 0, len = keyValues.length; idx < len; idx++) {
    ret.push(grouped[keyValues[idx]]);
  }
  return ret;
};


Array.prototype.findProperty = function (key, value) {
  var len = this.length;
  var next, cur, found = false,
    ret = null;
  for (var idx = 0; idx < len && !found; idx++) {
    cur = (next = this[idx]) ? (next.get ? next.get(key) : next[key]) : null;
    found = (value === undefined) ? !!cur : isEqual(cur, value);
    if (found) ret = next;
  }
  next = null;
  return ret;
};

Array.prototype.everyProperty = function (key, value) {
  var len = this.length;
  var ret = true;
  for (var idx = 0; ret && (idx < len); idx++) {
    var next = this[idx];
    var cur = next ? (next.get ? next.get(key) : next[key]) : null;
    ret = (value === undefined) ? !!cur : isEqual(cur, value);
  }
  return ret;
};

Array.prototype.someProperty = function (key, value) {
  var len = this.length;
  var ret = false;
  for (var idx = 0; !ret && (idx < len); idx++) {
    var next = this[idx];
    var cur = next ? (next.get ? next.get(key) : next[key]) : null;
    ret = (value === undefined) ? !!cur : isEqual(cur, value);
  }
  return ret; // return the invert
};

Array.prototype.invoke = function (methodName) {
  var len = this.length;
  if (len <= 0) return []; // nothing to invoke....

  var idx;

  // collect the arguments
  var args = [];
  var alen = arguments.length;
  if (alen > 1) {
    for (idx = 1; idx < alen; idx++) args.push(arguments[idx]);
  }

  // call invoke
  var ret = [];
  for (idx = 0; idx < len; idx++) {
    var next = this[idx];
    var method = next ? next[methodName] : null;
    if (method) ret[idx] = method.apply(next, args);
  }
  return ret;
};

Array.prototype.invokeWhile = function (targetValue, methodName) {
  var len = this.length;
  if (len <= 0) return null; // nothing to invoke....

  var idx;

  // collect the arguments
  var args = [];
  var alen = arguments.length;
  if (alen > 2) {
    for (idx = 2; idx < alen; idx++) args.push(arguments[idx]);
  }

  // call invoke
  var ret = targetValue;
  for (idx = 0;
    (ret === targetValue) && (idx < len); idx++) {
    var next = this[idx];
    var method = next ? next[methodName] : null;
    if (method) ret = method.apply(next, args);
  }
  return ret;
};

// is this necessary?
Array.prototype.toArray = function () {
  var len = this.length;
  if (len <= 0) return []; // nothing to invoke....

  // call invoke
  var ret = [];
  for (var idx = 0; idx < len; idx++) {
    var next = this[idx];
    ret.push(next);
  }
  return ret;
};


Array.prototype.getEach = function (key) {
  var ret = [];
  var len = this.length;
  for (var idx = 0; idx < len; idx++) {
    var obj = this[idx];
    ret[idx] = obj ? (obj.get ? obj.get(key) : obj[key]) : null;
  }
  return ret;
};

Array.prototype.setEach = function (key, value) {
  var len = this.length;
  for (var idx = 0; idx < len; idx++) {
    var obj = this[idx];
    if (obj) {
      if (obj.set) {
        obj.set(key, value);
      } else obj[key] = value;
    }
  }
  return this;
};

/*
This is the only one from the polyfills that might be required..
Point being that reducerProperty is something specific to SC.
reduce: function (callback, initialValue, reducerProperty) {
    if (typeof callback !== "function") throw new TypeError();
    var len = this.length;

    // no value to return if no initial value & empty
    if (len === 0 && initialValue === undefined) throw new TypeError();

    var ret = initialValue;
    for (var idx = 0; idx < len; idx++) {
      var next = this[idx];

      // while ret is still undefined, just set the first value we get as
      // ret. this is not the ideal behavior actually but it matches the
      // FireFox implementation... :(
      if (next !== null) {
        if (ret === undefined) {
          ret = next;
        } else {
          ret = callback.call(null, ret, next, idx, this, reducerProperty);
        }
      }
    }

*/


/**
  Override to return a copy of the receiver.  Default implementation raises
  an exception.

  @param deep {Boolean} if true, a deep copy of the object should be made
  @returns {Object} copy of receiver
*/
Array.prototype.copy = function (deep) {
  var ret = this.slice(),
    idx;
  if (deep) {
    idx = ret.length;
    while (idx--) ret[idx] = copy(ret[idx], true);
  }
  return ret;
};