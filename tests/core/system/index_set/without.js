// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';
/*global module test equals context ok assert.deepEqual notest */
var set, ret ;
module("SC.IndexSet#without", {
  beforeEach: function() {
    set = SC.IndexSet.create(1,9);
  }
});

function iter(s) {
  var ret = [];
  s.forEach(function(k) { ret.push(k); });
  return ret ;
}

test("should return empty set when removing self", function (assert) {
  ret = set.without(set);
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.deepEqual(iter(ret), []);
});

test("should return set with range removed from middle", function (assert) {
  ret = SC.IndexSet.create(2,6);
  ret = set.without(ret);
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.deepEqual(iter(ret), [1,8,9]);
});

test("should return set with range removed overlapping end", function (assert) {
  ret = set.without(SC.IndexSet.create(6,6));
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.deepEqual(iter(ret), [1,2,3,4,5]);
});

test("should return set with range removed overlapping beginning", function (assert) {
  ret = set.without(SC.IndexSet.create(0,6));
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.deepEqual(iter(ret), [6,7,8,9]);
});


test("should return set with multiple ranges removed", function (assert) {
  ret = set.without(SC.IndexSet.create(2,2).add(6,2));
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.deepEqual(iter(ret), [1,4,5,8,9]);
});

test("using without should properly hint returned index set", function (assert) {
  var set = SC.IndexSet.create(10000,5),
      set2 = SC.IndexSet.create(10000),
      actual = set.without(set2),
      loc = SC.IndexSet.HINT_SIZE;
      
  while(loc<2000) { // spot check
    assert.equal(actual._content[loc], 0, 'index set should have hint at loc %@ - set: %@'.fmt(loc, actual.inspect()));
    loc += SC.IndexSet.HINT_SIZE;
  }
});

// ..........................................................
// NORMALIZED PARAMETER CASES
// 

test("passing no params should return clone", function (assert) {
  ret = set.without();
  assert.ok(ret !== set, 'is not assert.deepEqual instance');
  assert.ok(ret.isEqual(set), 'has assert.deepEqual content');
});

test("passing single number should remove just that index", function (assert) {
  ret = set.without(5);
  assert.deepEqual(iter(ret), [1,2,3,4,6,7,8,9]);
});

test("passing two numbers should remove range", function (assert) {
  ret = set.without(2,6);
  assert.deepEqual(iter(ret), [1,8,9]);
});

test("passing range object should remove range", function (assert) {
  ret = set.without({ start: 2, length: 6 });
  assert.deepEqual(iter(ret), [1,8,9]);
});

