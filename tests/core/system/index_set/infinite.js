// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals ok */

import { SC, GLOBAL } from '../../../../core/core.js';


var set;

module("SC.IndexSet Infinite Ranges", {
  beforeEach: function () {
    set = SC.IndexSet.create();
  }
});


test("Able to add an infinite range.", function (assert) {
  set.add(100, Infinity);

  assert.equal(set.get('length'), Infinity, 'The length should be');
  assert.equal(set.get('max'), Infinity, 'The max index should be');
});

test("The infinite range contains all indexes.", function (assert) {
  set.add(100, 2000);
  set.add(5000, Infinity);

  assert.ok(!set.contains(99), "The set does not contain 99.");
  assert.ok(set.contains(100), "The set does contain 100.");
  assert.ok(set.contains(2099), "The set does contain 2099.");
  assert.ok(!set.contains(4999), "The set does not contain 4999.");
  assert.ok(set.contains(5000), "The set does contain 5000.");
  assert.ok(set.contains(99999999999), "The set does contain 99999999999.");
  assert.ok(set.contains(Number.MAX_VALUE), "The set does contain Number.MAX_VALUE.");
  assert.ok(set.contains(Infinity), "The set does contain Infinity.");
});

test("Able to remove an infinite range.", function (assert) {
  set.add(100, Infinity);
  set.remove(1000, Infinity);

  assert.ok(set.contains(900), "The set does contain 900.");
  assert.ok(!set.contains(1000), "The set does not contain 1000.");
  assert.ok(!set.contains(Infinity), "The set does not contain Infinity.");
});

test("Attempting to iterate over an infinite range throws an exception.", function (assert) {
  set.add(0, Infinity);

  try {
    set.forEach(function () { });
  } catch (ex) {
    assert.ok(true, 'forEach threw an exception.');
  }
});

test("Able to add an infinite range over an existing range.", function (assert) {
  set.add(100, 2); // add initial set.
  assert.equal(set.firstObject(), 100, 'The first index is');
  assert.equal(set.get('length'), 2, 'The length should be');
  assert.equal(set.get('max'), 102, 'The max index should be');

  set.add(50, Infinity);
  assert.equal(set.firstObject(), 50, 'The first index is now');
  assert.equal(set.get('length'), Infinity, 'The length should now be');
  assert.equal(set.get('max'), Infinity, 'The max index should now be');
});

test("Infinite ranges may be equal.", function (assert) {
  var secondSet = SC.IndexSet.create();

  set.add(50, Infinity);
  secondSet.add(50, Infinity);
  assert.ok(set.isEqual(secondSet), 'The two infinite sets are equal.');

  secondSet.add(10, 10);
  assert.ok(!set.isEqual(secondSet), 'The two infinite sets are no longer equal.');
});

test("The range start for the infinite range is correct.", function (assert) {
  set.add(100, 2000);

  assert.equal(set.rangeStartForIndex(1234), 100, "The range for 1234 starts at");
  assert.equal(set.rangeStartForIndex(2234), 2100, "The range for 2234 starts at");
  assert.equal(set.rangeStartForIndex(99999999999), 2100, "The range for 99999999999 starts at");
  assert.equal(set.rangeStartForIndex(Number.MAX_VALUE), 2100, "The range for Number.MAX_VALUE starts at");
  assert.equal(set.rangeStartForIndex(Infinity), 2100, "The range for Infinity starts at");

  set.add(5000, Infinity);

  assert.equal(set.rangeStartForIndex(1234), 100, "The range for 1234 starts at");
  assert.equal(set.rangeStartForIndex(2234), 2100, "The range for 2234 starts at");
  assert.equal(set.rangeStartForIndex(99999999999), 5000, "The range for 99999999999 starts at");
  assert.equal(set.rangeStartForIndex(Number.MAX_VALUE), 5000, "The range for Number.MAX_VALUE starts at");
  assert.equal(set.rangeStartForIndex(Infinity), Infinity, "The range for Infinity starts at");
});

test("The indexBefore for the infinite range is correct.", function (assert) {
  set.add(10, 10);

  assert.equal(set.indexBefore(100), 19, "The indexBefore 100 is");
  assert.equal(set.indexBefore(Infinity), 19, "The indexBefore Infinity is");

  set.add(50, Infinity);

  assert.equal(set.indexBefore(100), 99, "The indexBefore 100 is");
  assert.equal(set.indexBefore(Infinity), Infinity, "The indexBefore Infinity is");
});

test("The indexAfter for the infinite range is correct.", function (assert) {
  set.add(10, 1000);

  assert.equal(set.indexAfter(100), 101, "The indexAfter 100 is");
  assert.equal(set.indexAfter(2000), -1, "The indexAfter 2000 is");
  assert.equal(set.indexAfter(Infinity), -1, "The indexAfter Infinity is");

  set.add(5000, Infinity);

  assert.equal(set.indexAfter(100), 101, "The indexAfter 100 is");
  assert.equal(set.indexAfter(2000), 5000, "The indexAfter 2000 is");
  assert.equal(set.indexAfter(Infinity), -1, "The indexAfter Infinity is");
});

test("The infinite range intersects all indexes.", function (assert) {
  set.add(100, 2000);
  set.add(5000, Infinity);

  assert.ok(!set.intersects(0, 99), "The set does not intersect 0 - 99.");
  assert.ok(set.intersects(99, 2), "The set does intersect 99 - 101.");
  assert.ok(!set.intersects(2100, 99), "The set does not intersect 2100 - 2199.");
  assert.ok(set.intersects(4999, 2), "The set does intersect 4999 - 5001.");
  assert.ok(set.intersects(99999999999, 900000000000), "The set does intersect 99999999999 - 999999999999.");
  assert.ok(set.intersects(0, Number.MAX_VALUE), "The set does intersect 0 - Number.MAX_VALUE.");
  assert.ok(set.intersects(0, Infinity), "The set does intersect 0 - Infinity.");
});

test("The infinite range works with without().", function (assert) {
  set.add(100, 2000);
  set.add(5000, Infinity);

  set = set.without(10000, 1000);

  assert.ok(set.contains(9999), "The set does contain 9999.");
  assert.ok(!set.contains(10000), "The set does not contain 10000.");
  assert.ok(set.contains(11000), "The set does contain 11000.");

  set = set.without(99999, 900000);

  assert.ok(set.contains(99998), "The set does contain 99998.");
  assert.ok(!set.contains(99999), "The set does not contain 99999.");
  assert.ok(set.contains(10000000), "The set does contain 10000000.");

  // Hinting makes this too slow to use.
  // set = set.without(0, Number.MAX_VALUE);
  //
  // assert.ok(!set.contains(Number.MAX_VALUE), "The set does not contain Number.MAX_VALUE.");
  // assert.ok(set.contains(Infinity), "The set does contain Infinity.");

  set = set.without(0, Infinity);

  assert.ok(!set.contains(Number.MAX_VALUE), "The set does not contain Number.MAX_VALUE.");
  assert.ok(!set.contains(Infinity), "The set does not contain Infinity.");
});

test("The infinite range works with replace().", function (assert) {
  set.add(100, 2000);
  set.add(5000, Infinity);

  set = set.replace(10000, 1000);

  assert.ok(!set.contains(9999), "The set does not contain 9999.");
  assert.ok(set.contains(10000), "The set does contain 10000.");
  assert.ok(!set.contains(11000), "The set does not contain 11000.");
  assert.ok(!set.contains(Infinity), "The set does not contain Infinity.");

  set = set.replace(10000, Infinity);

  assert.ok(!set.contains(9999), "The set does not contain 9999.");
  assert.ok(set.contains(10000), "The set does contain 10000.");
  assert.ok(set.contains(Number.MAX_VALUE), "The set does contain Number.MAX_VALUE.");
  assert.ok(set.contains(Infinity), "The set does contain Infinity.");
});

