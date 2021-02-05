// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import '../../node_modules/jquery/dist/jquery.slim.js';
import { SC } from '../../core/core.js';

export const CoreQuery = jQuery;
// Alias jQuery as SC.$ and SC.CoreQuery for compatibility
// SC.$ = SC.CoreQuery = jQuery;

// Add some plugins to SC.$. jQuery will get these also. -- test in system/core_query/additions
SC.mixin(CoreQuery.fn,
  /** @scope CoreQuery.prototype */ {

  isCoreQuery: true, // walk like a duck

  /** @private - better loggin */
  toString: function () {
    var values = [],
      len = this.length,
      idx = 0;

    for (idx = 0; idx < len; idx++) {
      values[idx] = '%@: %@'.fmt(idx, this[idx] ? this[idx].toString() : '(null)');
    }
    return "<$:%@>(%@)".fmt(SC.guidFor(this), values.join(' , '));
  },

  /**
    Returns true if all member elements are visible.  This is provided as a
    common test since CoreQuery does not support filtering by
    psuedo-selector.

    @deprecated Version 1.10
  */
  isVisible: function () {
    return Array.prototype.every.call(this, function (elem) {
      return CoreQuery.isVisible(elem);
    });
  },


  /**
    Returns true if any of the matched elements have the passed element or CQ object as a child element.
  */
  within: function (el) {
    if (this.filter(el).length) { return true; }
    return !!this.has(el).length;
  }

});

/**
  Make CoreQuery enumerable.  Since some methods need to be disambiguated,
  we will implement some wrapper functions here.

  Note that SC.Enumerable is implemented on SC.Builder, which means the
  CoreQuery object inherits this automatically.  jQuery does not extend from
  SC.Builder though, so we reapply SC.Enumerable just to be safe.
*/
(function () {
  var original = {},
      wrappers = {

    // if you call find with a selector, then use the jQuery way.  If you
    // call with a function/target, use Enumerable way
    find: function (callback, target) {
      return (target !== undefined) ? SC.Enumerable.find.call(this, callback, target) : original.find.call(this, callback);
    },

    // ditto for filter - execute SC.Enumerable style if a target is passed.
    filter: function (callback, target) {
      return (target !== undefined) ?
        this.pushStack(SC.Enumerable.filter.call(this, callback, target)) :
        original.filter.call(this, callback);
    },

    // filterProperty is an SC.Enumerable thing, but it needs to be wrapped
    // in a CoreQuery object.
    filterProperty: function (key, value) {
      return this.pushStack(
        SC.Enumerable.filterProperty.call(this, key, value));
    },

    // indexOf() is best implemented using the jQuery index()
    indexOf: CoreQuery.index,

    // map() is a little tricky because jQuery is non-standard.  If you pass
    // a context object, we will treat it like SC.Enumerable.  Otherwise use
    // jQuery.
    map: function (callback, target) {
      return (target !== undefined) ?
        SC.Enumerable.map.call(this, callback, target) :
        original.map.call(this, callback);
    }
  };

  // loop through an update some enumerable methods.
  var fn = CoreQuery.fn,
    enumerable = SC.Enumerable,
    value;

  for (var key in enumerable) {
    if (enumerable.hasOwnProperty(key)) {
      value = enumerable[key];

      if (key in wrappers) {
        original[key] = fn[key];
        value = wrappers[key];
      }

      fn[key] = value;
    }
  }
})();




