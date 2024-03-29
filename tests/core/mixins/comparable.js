// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok isObj equals expects */
import { SC } from '../../../core/core.js';

var Rectangle = SC.Object.extend({
  length: 0,
  width: 0,
  
  area: function() {
    return this.get('length') * this.get('width');
  }
});

Rectangle.mixin(SC.Comparable, {
  compare: function(a, b) {
    return SC.compare(a.area(), b.area());
  }
});

var r1, r2;

module("Comparable", {
  
  beforeEach: function() {
    r1 = Rectangle.create({length: 6, width: 12});
    r2 = Rectangle.create({length: 6, width: 13});
  },
  
  afterEach: function() {
  }
  
});

test("should be comparable and return the correct result", function (assert) {
  assert.equal(r1.constructor.isComparable, true);
  assert.equal(SC.compare(r1, r1), 0);
  assert.equal(SC.compare(r1, r2), -1);
  assert.equal(SC.compare(r2, r1), 1);
});
