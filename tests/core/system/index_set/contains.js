// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

/*global module test equals context ok assert.deepEqual notest */

var set ;
module("SC.IndexSet#contains", {
  beforeEach: function() {
    set = SC.IndexSet.create().add(1000, 10).add(2000,1);
  }
});

// ..........................................................
// SINGLE INDEX
// 

test("handle index in set", function() {
  assert.equal(set.contains(1001), true, 'index 1001 should be in set %@'.fmt(set));
  assert.equal(set.contains(1009), true, 'index 1009 should be in set %@'.fmt(set));
  assert.equal(set.contains(2000), true, 'index 2000 should be in set %@'.fmt(set));
});

test("handle index not in set", function() {
  assert.equal(set.contains(0), false, 'index 0 should not be in set');
  assert.equal(set.contains(10), false, 'index 10 should not be in set');
  assert.equal(set.contains(1100), false, 'index 1100 should not be in set');
});

test("handle index past end of set", function() {
  assert.equal(set.contains(3000), false, 'index 3000 should not be in set');
});

// ..........................................................
// RANGE
// 

test("handle range inside set", function() {
  assert.equal(set.contains(1001,4), true, '1001..1003 should be in set');
});

test("handle range outside of set", function() {
  assert.equal(set.contains(100,4), false, '100..1003 should NOT be in set');
});

test("handle range partially inside set", function() {
  assert.equal(set.contains(998,4), false,'998..1001 should be in set');
});

// ..........................................................
// INDEX SET
// 

test("handle set inside IndexSet", function() {
  var test = SC.IndexSet.create().add(1001,4).add(1005,2);
  assert.equal(set.contains(test), true, '%@ should be in %@'.fmt(test, set));
});

test("handle range outside of IndexSet", function() {
  var test = SC.IndexSet.create().add(100,4).add(105,2);
  assert.equal(set.contains(test), false, '%@ should be in %@'.fmt(test, set));
});

test("handle range partially inside IndexSet", function() {
  var test = SC.IndexSet.create().add(1001,4).add(100,2);
  assert.equal(set.contains(test), false, '%@ should be in %@'.fmt(test, set));
});

test("handle self", function() {
  assert.equal(set.contains(set), true, 'should return true when passed itself');  
});

