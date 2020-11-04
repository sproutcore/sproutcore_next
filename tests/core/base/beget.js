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
import { beget, hashFor } from "../../../core/system/base.js";

var objectA, objectB , arrayA, stringA; // global variables

module("Beget function Module", {
beforeEach: function() {
    objectA = {} ;
    objectB = {} ;
	arrayA  = [1,3];
	stringA ="stringA";
}
});

test("should return a new object with assert.deepEqual prototype as that of passed object", function(assert) {
  assert.equal(true, beget(objectA) !== objectA, "Beget for an object") ;
	assert.equal(true, beget(stringA) !== stringA, "Beget for a string") ;
	assert.equal(true, beget(hashFor(objectB)) !== hashFor(objectB), "Beget for a hash") ;
	assert.equal(true, beget(arrayA) !== arrayA, "Beget for an array") ;
});

