// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// Range Tests
// ========================================================================

import { SC }  from '../../../../core/core.js';


module("Range");

test("to find the maxRange() and SC.minRange() values of a given range", function (assert) {
	var obj = {start:15,length:75};
	assert.equal(true,SC.minRange(obj) == 15,'Minimum range');
    assert.equal(true,SC.maxRange(obj) == 90,'Maximum range');
});

test("unionRanges() to find the union of two ranges", function (assert) {
	var obj = {start:15,length:75};
	var obj1 = {start:5,length:50};
	var c = SC.unionRanges(obj,obj1);
	assert.equal(obj1.start,SC.minRange(c),'Minimum range');
	assert.equal(85,c.length,'Maximum range');
});

test("rangesEqual() to find if the given ranges are equal", function (assert) {
    var obj = {start:15,length:75};
	var obj1 = {start:15,length:75};
	var obj2 = {start:5,length:50};
	var c = SC.rangesEqual(obj,obj1);
	var d = SC.rangesEqual(obj1,obj2);
	assert.equal(true,c,'Equal ranges');
	assert.equal(false,d,'Unequal ranges');	
});

test("cloneRange() to clone the given range", function (assert) {
	var obj = {start:15,length:75};
	var c = SC.cloneRange(obj);
	assert.equal(obj.start,SC.minRange(c),'Minimum range');
	assert.equal(75,c.length,'Maximum range');
});

test("valueInRange() to find if a given value is in range", function (assert) {
	var obj = {start:15,length:75};
	var c = SC.valueInRange(25,obj);
	var d = SC.valueInRange(10,obj);
	assert.equal(true,c,'In range');
	assert.equal(false,d,'Not in range');
});

// test("valueInRange() to find if a given value is in range",function(){
// 	var obj = {start:15,length:75};
// 	var c = valueInRange(25,obj);
// 	var d = valueInRange(10,obj);
// 	assert.equal(true,c,'In range');
// 	assert.equal(false,d,'Not in range');
// });

test("intersectRanges() to get the intersection of 2 ranges", function (assert) {
	var obj1 = {start:15,length:75};
	var obj2 = {start:5,length:50};
	
	var c = SC.intersectRanges(obj1,obj2);
	assert.equal(SC.minRange(obj1),SC.minRange(c),'Minimum Intersection Range');
	assert.equal(40,c.length,'Maximum Intersection Range');
});