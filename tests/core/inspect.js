// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.inspect Tests
// ========================================================================
/*globals module test ok isObj assert.equal expects */


import { SC } from "../../core/core.js";

var obj1,obj2,obj3; //global variables

module("Inspect module",{
  
      beforeEach: function(){	
        obj1 = [1,3,4,9];
        obj2 = 24;     
        obj3 = {};
     }
});


test("SC.inspect module should give a string type",function (assert){
    var object1 = SC.inspect(obj1); 	
	assert.equal(true,SC.T_STRING === SC.typeOf(object1) ,'description of the array');
	
	var object2 = SC.inspect(obj2);
	assert.equal(true,SC.T_STRING === SC.typeOf(object2),'description of the numbers');
	
	var object3 = SC.inspect(obj3);
	assert.equal(true,SC.T_STRING === SC.typeOf(object3),'description of the object');
});