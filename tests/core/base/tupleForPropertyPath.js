// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.tupleForPropertyPath Tests
// ========================================================================
/*globals module test */
import { SC, GLOBAL } from "../../../core/core.js";

var object, object1,object3; //global variables

module("Checking the tuple for property path",{
	
	beforeEach: function(){
		 object = SC.Object.create({
			name:'SproutCore',
			value:'',						//no value defined for the property
			objectA:SC.Object.create({
					propertyVal:"chainedProperty"
			})		
		 });
   }

});
   

test("should check for the tuple property", function (assert) {
     var object2 = [];
     object2 = SC.tupleForPropertyPath(object.name, '');
     assert.equal(object2[0], GLOBAL, "the global object");
     assert.equal(object2[1],'SproutCore',"the property name");	
     object2 = SC.tupleForPropertyPath(object.objectA.propertyVal,'object');
	assert.equal(object2[0],'object',"the root");
     assert.equal(object2[1],'chainedProperty',"a chained property");
});

test("should check for the tuple property when path is undefined", function (assert) {     //test case where no property defined
     var object2;
     object2 = SC.tupleForPropertyPath(object.value, '');
     assert.equal(true,object2 === null,'returns null for undefined path');	
});

test("should check for path argument", function (assert) {
	assert.equal(SC.tupleForPropertyPath(null), null, "returns null for null path");
})