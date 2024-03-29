// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';
/*global module test equals context ok assert.deepEqual */
var set ;
module("SC.IndexSet#addEach", {
  beforeEach: function() {
    set = SC.IndexSet.create().add(1000,2).add(1010).add(1020).add(1030);
  }
});

function iter(s) {
  var ret = [];
  set.forEach(function(k) { ret.push(k); });
  return ret ;
}

// ..........................................................
// BASIC ADDS
// 

test("should iterate over an array", function (assert) {
  set.removeEach([1000, 1010, 1020, 1030]);
  assert.equal(set.get('length'), 1, 'should have correct index count');  
  assert.equal(set.get('max'), 1002, 'max should return 1 past last index');
  assert.deepEqual(iter(set), [1001]);
});

test("adding should iterate over a set", function (assert) {
  // add out of order...
  var input = SC.Set.create().add(1030).add(1010).add(1020).add(1000);
  set.removeEach(input);
  assert.equal(set.get('length'), 1, 'should have correct index count');  
  assert.equal(set.get('max'), 1002, 'max should return 1 past last index');
  assert.deepEqual(iter(set), [1001]);
});


test("adding should iterate over a indexset", function (assert) {
  // add out of order...
  var input = SC.IndexSet.create().add(1000).add(1010).add(1020).add(1030);
  set.removeEach(input);
  assert.equal(set.get('length'), 1, 'should have correct index count');  
  assert.equal(set.get('max'), 1002, 'max should return 1 past last index');
  assert.deepEqual(iter(set), [1001]);
});
