// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from "../../core/core.js";

module("SproutCore Type Checking");

test("SC.typeOf", function() {
	var a = null,
	    arr = [1,2,3],
	    obj = {},
      object = SC.Object.create({ method: function() {} }),
      E = SC.Error.extend();

  assert.equal(SC.T_UNDEFINED,  SC.typeOf(undefined),         "item of type undefined");
  assert.equal(SC.T_NULL,       SC.typeOf(a),                 "item of type null");
	assert.equal(SC.T_ARRAY,      SC.typeOf(arr),               "item of type array");
	assert.equal(SC.T_HASH,       SC.typeOf(obj),               "item of type hash");
	assert.equal(SC.T_OBJECT,     SC.typeOf(object),            "item of type object");
	assert.equal(SC.T_FUNCTION,   SC.typeOf(object.method),     "item of type function") ;
  assert.equal(SC.T_CLASS,      SC.typeOf(SC.Object),         "item of type class");
  assert.equal(SC.T_ERROR,      SC.typeOf(SC.Error.create()), "item of type error");
  assert.equal(SC.T_OBJECT,     SC.typeOf(SC.Object.create({ isError: true })), "sc object with isError property should be of type object");
  assert.equal(SC.T_ERROR,      SC.typeOf(E.create()),         "item of type error");
  assert.equal(SC.T_HASH,       SC.typeOf({ isObject: true }),  "hash object with isObject property should be of type hash");
});

test("SC.none", function() {
  var string = "string", fn = function() {};

	assert.equal(true,  SC.none(null),      "for null");
	assert.equal(true,  SC.none(undefined), "for undefined");
  assert.equal(false, SC.none(""),        "for an empty String");
  assert.equal(false, SC.none(true),      "for true");
  assert.equal(false, SC.none(false),     "for false");
  assert.equal(false, SC.none(string),    "for a String");
  assert.equal(false, SC.none(fn),        "for a Function");
  assert.equal(false, SC.none(0),         "for 0");
  assert.equal(false, SC.none([]),        "for an empty Array");
  assert.equal(false, SC.none({}),        "for an empty Object");
});

test("SC.empty", function() {
  var string = "string", fn = function() {};

	assert.equal(true,  SC.empty(null),      "for null");
	assert.equal(true,  SC.empty(undefined), "for undefined");
  assert.equal(true,  SC.empty(""),        "for an empty String");
  assert.equal(false, SC.empty(true),      "for true");
  assert.equal(false, SC.empty(false),     "for false");
  assert.equal(false, SC.empty(string),    "for a String");
  assert.equal(false, SC.empty(fn),        "for a Function");
  assert.equal(false, SC.empty(0),         "for 0");
  assert.equal(false, SC.empty([]),        "for an empty Array");
  assert.equal(false, SC.empty({}),        "for an empty Object");
});

test("SC.isArray" ,function(){
	var numarray      = [1,2,3],
	    number        = 23,
	    strarray      = ["Hello", "Hi"],
    	string        = "Hello",
	    object   	    = {},
      length        = {length: 12},
      fn            = function() {};

	assert.equal( SC.isArray(numarray), true,  "[1,2,3]" );
	assert.equal( SC.isArray(number),   false, "23" );
	assert.equal( SC.isArray(strarray), true,  '["Hello", "Hi"]' );
	assert.equal( SC.isArray(string),   false, '"Hello"' );
	assert.equal( SC.isArray(object),   false, "{}" );
  assert.equal( SC.isArray(length),   true,  "{length: 12}" );
  assert.equal( SC.isArray(window),   false, "window" );
  assert.equal( SC.isArray(fn),       false, "function() {}" );

  if (window.document) {
    var nodelist      = document.getElementsByTagName("body");
    assert.equal( SC.isArray(nodelist), true, "NodeList" );
  }
});
