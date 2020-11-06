// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';


/*global module test equals context ok assert.deepEqual notest */

module("SC.IndexSet#create");

test("create with no params", function() {
  var set = SC.IndexSet.create();
  assert.equal(set.get('length'), 0, 'should have no indexes');
});

test("create with just index", function() {
  var set = SC.IndexSet.create(4);
  assert.equal(set.get('length'),1, 'should have 1 index');
  assert.equal(set.contains(4), true, 'should contain index');
  assert.equal(set.contains(5), false, 'should not contain 5');
});

test("create with index and length", function() {
  var set = SC.IndexSet.create(4, 2);
  assert.equal(set.get('length'),2, 'should have 2 indexes');
  assert.equal(set.contains(4), true, 'should contain 4');
  assert.equal(set.contains(5), true, 'should contain 5');
});

test("create with other set", function() {
  var first = SC.IndexSet.create(4,2);

  var set = SC.IndexSet.create(first);
  assert.equal(set.get('length'),2, 'should have assert.deepEqual number of indexes (2)');
  assert.equal(set.contains(4), true, 'should contain 4, just like first');
  assert.equal(set.contains(5), true, 'should contain 5, just like first');
});





