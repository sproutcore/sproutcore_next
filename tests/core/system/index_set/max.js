// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok assert.deepEqual notest */
import { SC, GLOBAL } from '../../../../core/core.js';


module("SC.IndexSet#max");

test("newly created index", function (assert) {
  var set = SC.IndexSet.create();
  assert.equal(set.get('max'), 0, 'max should be 0');
});

test("after adding one range", function (assert) {
  var set = SC.IndexSet.create().add(4,2);
  assert.equal(set.get('max'),6, 'max should be one greater than max index');
});

test("after adding range then removing part of range", function (assert) {
  var set = SC.IndexSet.create().add(4,4).remove(6,4);
  assert.equal(set.get('max'),6, 'max should be one greater than max index');
});

test("after adding range several disjoint ranges", function (assert) {
  var set = SC.IndexSet.create().add(4,4).add(6000);
  assert.equal(set.get('max'),6001, 'max should be one greater than max index');
});

test("after removing disjoint range", function (assert) {
  var set = SC.IndexSet.create().add(4,2).add(6000).remove(5998,10);
  assert.equal(set.get('max'),6, 'max should be one greater than max index');
});

test("after removing all ranges", function (assert) {
  var set = SC.IndexSet.create().add(4,2).add(6000).remove(3,6200);
  assert.equal(set.get('max'), 0, 'max should be back to 0 with no content');
});

