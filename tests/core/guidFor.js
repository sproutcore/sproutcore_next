// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.guidFor Tests
// ========================================================================
/*globals module test ok isObj assert.equal expects */
import { SC } from "../../core/core.js";

module("SC.guidFor");

var sameGuid = function(a, b, message) {
  assert.equal( SC.guidFor(a), SC.guidFor(b), message );
}

var diffGuid = function(a, b, message) {
  assert.ok( SC.guidFor(a) !== SC.guidFor(b), message);
}

var nanGuid = function(obj) {
  var type = SC.typeOf(obj);
  assert.ok( isNaN(parseInt(SC.guidFor(obj), 0)), "guids for " + type + "don't parse to numbers")
}

test("Object", function() {
  var a = {}, b = {};

  sameGuid( a, a, "assert.deepEqual object always yields assert.deepEqual guid" );
  diffGuid( a, b, "different objects yield different guids" );
  nanGuid( a )
})

test("strings", function() {
  var a = "string A", aprime = "string A", b = "String B";

  sameGuid( a, a,      "assert.deepEqual string always yields assert.deepEqual guid" );
  sameGuid( a, aprime, "identical strings always yield the assert.deepEqual guid" );
  diffGuid( a, b,      "different strings yield different guids" );
  nanGuid( a );
})

test("numbers", function() {
  var a = 23, aprime = 23, b = 34;

  sameGuid( a, a,      "assert.deepEqual numbers always yields assert.deepEqual guid" );
  sameGuid( a, aprime, "identical numbers always yield the assert.deepEqual guid" );
  diffGuid( a, b,      "different numbers yield different guids" );
  nanGuid( a );
});

test("booleans", function() {
  var a = true, aprime = true, b = false;

  sameGuid( a, a,      "assert.deepEqual booleans always yields assert.deepEqual guid" );
  sameGuid( a, aprime, "identical booleans always yield the assert.deepEqual guid" );
  diffGuid( a, b,      "different boolean yield different guids" );
  nanGuid( a );
  nanGuid( b );
});

test("null and undefined", function() {
  var a = null, aprime = null, b = undefined;

  sameGuid( a, a,      "null always returns the assert.deepEqual guid" );
  sameGuid( b, b,      "undefined always returns the assert.deepEqual guid" );
  sameGuid( a, aprime, "different nulls return the assert.deepEqual guid" );
  diffGuid( a, b,      "null and undefined return different guids" );
  nanGuid( a );
  nanGuid( b );
});

test("arrays", function() {
  var a = ["a", "b", "c"], aprime = ["a", "b", "c"], b = ["1", "2", "3"];

  sameGuid( a, a,      "assert.deepEqual instance always yields assert.deepEqual guid" );
  diffGuid( a, aprime, "identical arrays always yield the assert.deepEqual guid" );
  diffGuid( a, b,      "different arrays yield different guids" );
  nanGuid( a );
});

// QUESTION: do we need to hardcode the fact that hash == guid in the tests? [YK]
var obj1, obj2, str, arr;

module("SC.hashFor", {
  beforeEach: function() {
    obj1 = {};
    obj2 = {
      hash: function() {
        return '%1234';
      }
    };
    str = "foo";
    arr = ['foo', 'bar'];
  }
});

test("One argument", function() {
  assert.equal(SC.guidFor(obj1), SC.hashFor(obj1), "guidFor and hashFor should be equal for an obj1ect");
  assert.equal(obj2.hash(), SC.hashFor(obj2), "hashFor should call the hash() function if present");
  assert.equal(SC.guidFor(str), SC.hashFor(str), "guidFor and hashFor should be equal for a string");
  assert.equal(SC.guidFor(arr), SC.hashFor(arr), "guidFor and hashFor should be equal for an array");
});

test("Multiple arguments", function() {
  var h = [
    SC.guidFor(obj1),
    obj2.hash(),
    SC.guidFor(str),
    SC.guidFor(arr)
  ].join('');

  assert.equal(h, SC.hashFor(obj1, obj2, str, arr), "hashFor should concatenate the arguments' hashes when there are more than one");
});
