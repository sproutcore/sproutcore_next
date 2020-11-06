// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Set Tests
// ========================================================================
/*globals module test ok isObj equals expects */


import { SC, GLOBAL } from '../../../core/core.js';

SC.onload = function () {
  console.log('SC onload');
  QUnit.start();
}


var a, b, c ; // global variables

module("creating SC.Set instances", {

  beforeEach: function() {
    // create objects...
    a = { name: "a" } ;
    b = { name: "b" } ;
    c = { name: "c" } ;
  },

  afterEach: function() {
    a = undefined ;
    b = undefined ;
    c = undefined ;
  }

});

test("SC.Set.create() should create empty set", function() {
  var set = SC.Set.create() ;
  assert.equal(set.length, 0) ;
});


test("SC.Set.getEach() should work", function () {
  var set = SC.Set.create([a,b,c]),
    names = set.getEach('name');

  assert.ok(names.contains("a"), "Set.getEach array should contain 'a'");
  assert.ok(names.contains("b"), "Set.getEach array should contain 'b'");
  assert.ok(names.contains("c"), "Set.getEach array should contain 'c'");
});

test("SC.Set.create([1,2,3]) should create set with three items in them", function() {
  var set = SC.Set.create([a,b,c]) ;
  assert.equal(set.length, 3) ;
  assert.equal(set.contains(a), true) ;
  assert.equal(set.contains(b), true) ;
  assert.equal(set.contains(c), true) ;
});

test("SC.Set.create() should accept anything that implements SC.Array", function() {
  var arrayLikeObject = SC.Object.create(SC.Array, {
    _content: [a,b,c],
    length: 3,
    objectAt: function(idx) { return this._content[idx]; }
  }) ;
  var set = SC.Set.create(arrayLikeObject) ;
  assert.equal(set.length, 3) ;
  assert.equal(set.contains(a), true) ;
  assert.equal(set.contains(b), true) ;
  assert.equal(set.contains(c), true) ;
});

var set ; // global variables

// The tests below also end up testing the contains() method pretty
// exhaustively.
module("SC.Set.add + SC.Set.contains", {

  beforeEach: function() {
    set = SC.Set.create() ;
  },

  afterEach: function() {
    set = undefined ;
  }

});

test("should add an SC.Object", function() {
  var obj = SC.Object.create() ;

  var oldLength = set.length ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true, "contains()") ;
  assert.equal(set.length, oldLength+1, "new set length") ;
});

test("should add a regular hash", function() {
  var obj = {} ;

  var oldLength = set.length ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true, "contains()") ;
  assert.equal(set.length, oldLength+1, "new set length") ;
});

test("should add a string", function() {
  var obj = "String!" ;

  var oldLength = set.length ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true, "contains()") ;
  assert.equal(set.length, oldLength+1, "new set length") ;
});

test("should add a number", function() {
  var obj = 23 ;

  var oldLength = set.length ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true, "contains()") ;
  assert.equal(set.length, oldLength+1, "new set length") ;
});

test("should add bools", function() {
  var oldLength = set.length ;

  set.add(true) ;
  assert.equal(set.contains(true), true, "contains(true)");
  assert.equal(set.length, oldLength+1, "new set length");

  set.add(false);
  assert.equal(set.contains(false), true, "contains(false)");
  assert.equal(set.length, oldLength+2, "new set length");
});

test("should add 0", function() {
  var oldLength = set.length ;

  set.add(0) ;
  assert.equal(set.contains(0), true, "contains(0)");
  assert.equal(set.length, oldLength+1, "new set length");
});

test("should add a function", function() {
  var obj = function() { return "Test function"; } ;

  var oldLength = set.length ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true, "contains()") ;
  assert.equal(set.length, oldLength+1, "new set length") ;
});

test("should NOT add a null", function() {
  set.add(null) ;
  assert.equal(set.length, 0) ;
  assert.equal(set.contains(null), false) ;
});

test("should NOT add an undefined", function() {
  set.add(undefined) ;
  assert.equal(set.length, 0) ;
  assert.equal(set.contains(undefined), false) ;
});

test("adding an item, removing it, adding another item", function() {
  var item1 = "item1" ;
  var item2 = "item2" ;

  set.add(item1) ; // add to set
  set.remove(item1) ; //remove from set
  set.add(item2) ;

  assert.equal(set.contains(item1), false, "set.contains(item1)") ;

  set.add(item1) ; // re-add to set
  assert.equal(set.length, 2, "set.length") ;
});

/**
  This test illustrates a problem with SC.Set.  It stored references to objects
  at increasing indexes and removed references to the objects by ignoring the
  index and overwriting it with a new object if it comes along.  However, if
  a lot of objects are added very quickly, they will be retained indefinitely
  even after remove is called, until the same number of new objects are added
  later.
*/
test("adding and removing items should not retain references to removed objects", function() {
  var guid1, guid2,
    idx1, idx2,
    item1 = "item1",
    item2 = "item2";

  guid1 = SC.guidFor(item1);
  guid2 = SC.guidFor(item2);

  // add to set
  set.add(item1);
  set.add(item2);

  idx1 = set[guid1];
  idx2 = set[guid2];

  assert.equal(set.length, 2, "set.length");
  assert.equal(set[idx1], item1, "item1 is at index %@ on the set".fmt(idx1));
  assert.equal(set[idx2], item2, "item2 is at index %@ on the set".fmt(idx2));
  assert.equal(set[guid1], 0, "guid for item1, %@, references index %@ on the set".fmt(guid1, idx1));
  assert.equal(set[guid2], 1, "guid for item2, %@, references index %@ on the set".fmt(guid2, idx2));

  // remove from set
  set.remove(item1);
  set.remove(item2);

  assert.equal(set.length, 0, "set.length");
  assert.equal(set[idx1], undefined, "item1 is no longer at index %@ on the set".fmt(idx1));
  assert.equal(set[idx2], undefined, "item2 is no longer at index %@ on the set".fmt(idx2));
  assert.equal(set[guid1], undefined, "guid for item1, %@, is no longer on the set".fmt(guid1));
  assert.equal(set[guid2], undefined, "guid for item2, %@, is no longer on the set".fmt(guid2));

  // add to set
  set.add(item1);
  set.add(item2);

  idx1 = set[guid1];
  idx2 = set[guid2];

  assert.equal(set.length, 2, "set.length");
  assert.equal(set[idx1], item1, "item1 is at index %@ on the set".fmt(idx1));
  assert.equal(set[idx2], item2, "item2 is at index %@ on the set".fmt(idx2));
  assert.equal(set[guid1], 0, "guid for item1, %@, references index %@ on the set".fmt(guid1, idx1));
  assert.equal(set[guid2], 1, "guid for item2, %@, references index %@ on the set".fmt(guid2, idx2));

  // remove from set in reverse order
  set.remove(item2);
  set.remove(item1);

  assert.equal(set.length, 0, "set.length");
  assert.equal(set[idx1], undefined, "item1 is no longer at index %@ on the set".fmt(idx1));
  assert.equal(set[idx2], undefined, "item2 is no longer at index %@ on the set".fmt(idx2));
  assert.equal(set[guid1], undefined, "guid for item1, %@, is no longer on the set".fmt(guid1));
  assert.equal(set[guid2], undefined, "guid for item2, %@, is no longer on the set".fmt(guid2));
});


module("SC.Set.remove + SC.Set.contains", {

  // generate a set with every type of object, but none of the specific
  // ones we add in the tests below...
  beforeEach: function() {
    set = SC.Set.create([
      SC.Object.create({ dummy: true }),
      { isHash: true },
      "Not the String",
      16, true, false, 0]) ;
  },

  afterEach: function() {
    set = undefined ;
  }

});

test("should remove an SC.Object and reduce length", function() {
  var obj = SC.Object.create() ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true) ;
  var oldLength = set.length ;

  set.remove(obj) ;
  assert.equal(set.contains(obj), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should remove a regular hash and reduce length", function() {
  var obj = {} ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true) ;
  var oldLength = set.length ;

  set.remove(obj) ;
  assert.equal(set.contains(obj), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should remove a string and reduce length", function() {
  var obj = "String!" ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true) ;
  var oldLength = set.length ;

  set.remove(obj) ;
  assert.equal(set.contains(obj), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should remove a number and reduce length", function() {
  var obj = 23 ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true) ;
  var oldLength = set.length ;

  set.remove(obj) ;
  assert.equal(set.contains(obj), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should remove a bools and reduce length", function() {
  var oldLength = set.length ;
  set.remove(true) ;
  assert.equal(set.contains(true), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;

  set.remove(false);
  assert.equal(set.contains(false), false, "should be removed") ;
  assert.equal(set.length, oldLength-2, "should be 2 shorter") ;
});

test("should remove 0 and reduce length", function(){
  var oldLength = set.length;
  set.remove(0) ;
  assert.equal(set.contains(0), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should remove a function and reduce length", function() {
  var obj = function() { return "Test function"; } ;
  set.add(obj) ;
  assert.equal(set.contains(obj), true) ;
  var oldLength = set.length ;

  set.remove(obj) ;
  assert.equal(set.contains(obj), false, "should be removed") ;
  assert.equal(set.length, oldLength-1, "should be 1 shorter") ;
});

test("should NOT remove a null", function() {
  var oldLength = set.length ;
  set.remove(null) ;
  assert.equal(set.length, oldLength) ;
});

test("should NOT remove an undefined", function() {
  var oldLength = set.length ;
  set.remove(undefined) ;
  assert.equal(set.length, oldLength) ;
});

test("should ignore removing an object not in the set", function() {
  var obj = SC.Object.create() ;
  var oldLength = set.length ;
  set.remove(obj) ;
  assert.equal(set.length, oldLength) ;
});

// test("should remove all the elements in the set", function() {
// 	var obj = [2,3,4];
// 	set.add(obj) ;
// 	var oldLength = set.length ;
// 	equals(oldLength, 6);
// 	a = set.removeEach(obj);
// 	equals(a.length, 0);
// });

module("SC.Set.pop + SC.Set.clone", {
// generate a set with every type of object, but none of the specific
// ones we add in the tests below...
	beforeEach: function() {
		set = SC.Set.create([
			SC.Object.create({ dummy: true }),
			{ isHash: true },
			"Not the String",
			16, false]) ;
		},

		afterEach: function() {
			set = undefined ;
		}
});

test("the pop() should remove an arbitrary object from the set", function() {
	var oldLength = set.length ;
	var obj = set.pop();
	assert.ok(!SC.none(obj), 'pops up an item');
	assert.equal(set.length, oldLength-1, 'length shorter by 1');
});

test("should pop false and 0", function(){
  set = SC.Set.create([false]);
  assert.ok(set.pop() === false, "should pop false");

  set = SC.Set.create([0]);
  assert.ok(set.pop() === 0, "should pop 0");
});

test("the clone() should return an indentical set", function() {
	var oldLength = set.length ;
	var obj = set.clone();
	assert.equal(oldLength,obj.length,'length of the clone should be same');
	assert.equal(obj.contains(set[0]), true);
	assert.equal(obj.contains(set[1]), true);
	assert.equal(obj.contains(set[2]), true);
	assert.equal(obj.contains(set[3]), true);
	assert.equal(obj.contains(set[4]), true);
});
