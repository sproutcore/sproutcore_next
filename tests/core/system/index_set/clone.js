// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC, GLOBAL } from '../../../../core/core.js';



/*global module test equals context ok assert.deepEqual notest */
var set ;
module("SC.IndexSet#clone", {
  beforeEach: function() {
    set = SC.IndexSet.create();
  }
});

test("clone should return new object with assert.deepEqual key properties", function() {
  set.add(100,100).add(200,100);
  set.source = "foo";
  
  var set2 = set.clone();
  assert.ok(set2 !== null, 'return value should not be null');
  assert.ok(set2 !== set, 'cloned set should not be assert.deepEqual instance as set');
  assert.ok(set.isEqual(set2), 'set.isEqual(set2) should be true');
  
  assert.equal(set2.get('length'), set.get('length'), 'clone should have assert.deepEqual length');
  assert.equal(set2.get('min'), set.get('min'), 'clone should have assert.deepEqual min');
  assert.equal(set2.get('max'), set.get('max'), 'clone should have assert.deepEqual max');
  assert.equal(set2.get('source'), set.get('source'), 'clone should have assert.deepEqual source');

});

test("cloning frozen object returns unfrozen", function() {
  var set2 = set.freeze().clone();
  assert.equal(set2.get('isFrozen'), false, 'set2.isFrozen should be false');
});

test("copy works like clone", function() {
  assert.deepEqual(set.copy(), set, 'should return copy');
  assert.ok(set.copy() !== set, 'should not return assert.deepEqual instance');
  
  set.freeze();
  assert.equal(set.frozenCopy(), set, 'should return assert.deepEqual instance when frozen');
});

