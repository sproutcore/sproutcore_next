// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.makeArray Tests
// ========================================================================
/*globals module test */
import { SC } from "../../../core/core.js";

var objectA,objectB,objectC; //global variables

module("Make Array ", {
  beforeEach: function() {
    var objectA = [1,2,3,4,5] ;  
	var objectC = SC.hashFor(objectA);
	var objectD = null;
	var stringA = "string A" ;		
  }
});

test("should return an array for the object passed ", function (assert) {
	var arrayA  = ['value1','value2'] ;
	var numberA = 100;
	var stringA = "SproutCore" ;
	var obj = {} ;
	var ret = SC.makeArray(obj);
	assert.equal(SC.isArray(ret),true);	
	ret = SC.makeArray(stringA);
	assert.equal(SC.isArray(ret), true) ;  	
	ret = SC.makeArray(numberA);
	assert.equal(SC.isArray(ret),true) ;  	
	ret = SC.makeArray(arrayA);
	assert.equal(SC.isArray(ret),true) ;
});

test("isArray should return true for empty arguments", function (assert) {
  var func = function(foo, bar) {
    assert.ok(SC.isArray(arguments), "arguments is an array");
  };
  func();
});

test("SC.$A should return an empty array if passed an empty arguments object", function (assert) {
  var func = function(foo, bar) {
    assert.equal(SC.$A(arguments).length, 0, "returns an empty array");
  };
  func();
});
