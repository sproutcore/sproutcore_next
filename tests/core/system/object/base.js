// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Object Base Tests
// ========================================================================
/*globals module test ok isObj assert.equal expects same plan TestNamespace*/

import { SC, GLOBAL } from '../../../../core/core.js';


var obj, obj1, don, don1, ExtObj, extObj, Ext2Obj ; // global variables

module("A new SC.Object instance", {
  
  beforeEach: function() {
    obj = SC.Object.create({
      foo: "bar",
      total: 12345,
      aMethodThatExists: function() {},
      aMethodThatReturnsTrue: function() { return true; },
      aMethodThatReturnsFoobar: function() { return "Foobar"; },
      aMethodThatReturnsFalse: function() { return false; },
      _es6StyleComputedPropertyValue: 'ES6',
      get es6styleComputedProperty () {
        return this._es6StyleComputedPropertyValue;
      },
      set es6styleComputedProperty (val) {
        this._es6StyleComputedPropertyValue = val; 
      }

    });
  },
  
  afterEach: function() {
    obj = undefined ;
  }
  
});

test("Should identify it's methods using the 'respondsTo' method", function (assert) {
  assert.equal(obj.respondsTo('aMethodThatExists'), true) ;
  assert.equal(obj.respondsTo('aMethodThatDoesNotExist'), false) ;
  assert.equal(obj.respondsTo('es6styleComputedProperty'), false); // it is not a method, so false
});

test("Should return false when asked to perform a method it does not have", function (assert) {
  assert.equal(obj.tryToPerform('aMethodThatDoesNotExist'), false) ;
});

test("Should pass back the return true if method returned true, false if method not implemented or returned false", function (assert) {
  assert.equal(obj.tryToPerform('aMethodThatReturnsTrue'), true, 'method that returns true') ;
  assert.equal(obj.tryToPerform('aMethodThatReturnsFoobar'), true, 'method that returns non-false') ;
  assert.equal(obj.tryToPerform('aMethodThatReturnsFalse'), false, 'method that returns false') ;
  assert.equal(obj.tryToPerform('imaginaryMethod'), false, 'method that is not implemented') ;
});

test("Should return it's properties when requested using SC.Object#get", function (assert) {
  assert.equal(obj.get('foo'), 'bar') ;
  assert.equal(obj.get('total'), 12345) ;
  const prop = Object.getOwnPropertyDescriptor(obj, 'es6styleComputedProperty');
  assert.ok(prop.get, 'the getter should be defined as a getter');
  assert.equal(obj.get('es6styleComputedProperty'), 'ES6');
});

test("Should allow changing of those properties by calling SC.Object#set", function (assert) {
  assert.equal(obj.get('foo'), 'bar') ;
  assert.equal(obj.get('total'), 12345) ;
  
  obj.set( 'foo', 'Chunky Bacon' ) ;
  obj.set( 'total', 12 ) ;
  
  assert.equal(obj.get('foo'), 'Chunky Bacon') ;
  assert.equal(obj.get('total'), 12) ;
  // at this moment set does not support native computed properties yet
});

test("Should only advertise changes once per request to SC.Object#didChangeFor", function (assert) {
  obj.set( 'foo', 'Chunky Bacon' );
  assert.equal(obj.didChangeFor( this, 'foo' ), true) ;
  assert.equal(obj.didChangeFor( this, 'foo' ), false) ;
});

test("Should advertise changes once per request to SC.Object#didChangeFor when setting property to NULL", function (assert) {
  obj.set( 'foo', null );
  assert.equal(obj.didChangeFor( this, 'foo' ), true) ;
  assert.equal(obj.didChangeFor( this, 'foo' ), false) ;
});

test("When the object is destroyed the 'isDestroyed' status should change accordingly", function (assert) {
	assert.equal(obj.get('isDestroyed'), false);
	obj.destroy();
	assert.equal(obj.get('isDestroyed'), true);
});

module("SC.Object observers", {
  beforeEach: function() {
    // create a namespace
    GLOBAL.TestNamespace = {
      obj: SC.Object.create({
        value: "test"
      })
    };
    
    // create an object
    obj = SC.Object.create({
      prop1: null,
      
      // normal observer
      observer: function(){
        this._normal = true;
      }.observes("prop1"),
      
      globalObserver: function() {
        this._global = true;
      }.observes("TestNamespace.obj.value"),
      
      bothObserver: function() {
        this._both = true;
      }.observes("prop1", "TestNamespace.obj.value")
    });
    
  }
});

test("Local observers work", function (assert) {
  obj._normal = false;
  obj.set("prop1", false);
  assert.equal(obj._normal, true, "Normal observer did change.");
});

test("Global observers work", function (assert) {
  obj._global = false;
  TestNamespace.obj.set("value", "test2");
  assert.equal(obj._global, true, "Global observer did change.");
});

test("Global+Local observer works", function (assert) {
  obj._both = false;
  obj.set("prop1", false);
  assert.equal(obj._both, true, "Both observer did change.");
});

module("SC.Object instance extended", {  
  beforeEach: function() {
    obj = SC.Object.extend();
  	obj1 = obj.create();
	  don = SC.Object.extend();
    don1 = don.create();
    ExtObj = SC.Object.extend({
      get nativeES6Getter () {
        return 'ES6';
      }
    });
    SC.mixin(ExtObj, {
      get nativeGetter () {
        return 'ES5 is old';
      } 
    });
    Ext2Obj = ExtObj.extend();
    extObj = ExtObj.create();
  },
  
  afterEach: function() {
    obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
    don1 = undefined ;
    ExtObj = undefined;
    extObj = undefined;
    Ext2Obj = undefined;
  }
  
});

test("Checking the instance of method for an object", function (assert) {
	assert.equal(obj1.instanceOf(obj), true);
	assert.equal(obj1.instanceOf(don), false);
});

test("Checking the kind of method for an object", function (assert) {
	assert.equal(obj1.kindOf(obj), true);
	assert.equal(obj1.kindOf(don), false);
	
	assert.equal(SC.kindOf(obj1, obj), true);
	assert.equal(SC.kindOf(obj1, don), false);
	assert.equal(SC.kindOf(null, obj1), false);
});

test("Defining es6 getters", function (assert) {
  // installing through extend means it is on the prototype
  const extObjPropDesc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(extObj), 'nativeES6Getter');
  assert.ok(extObjPropDesc.get, 'getter on the extend hash should be installed on the prototype');
  const ext2ObjPropDesc = Object.getOwnPropertyDescriptor(Ext2Obj, 'nativeGetter');
  assert.ok(ext2ObjPropDesc.get, 'getter defined on the class should be available on subclasses');
})


module("SC.Object superclass and subclasses", {  
  beforeEach: function() {
    obj = SC.Object.extend ({
	  method1: function() {
		return "hello";
	  }
	});
	obj1 = obj.extend();
	don = obj1.create ({
	  // method2: function() {
		//   return this.superclass();
		// }
	});
  },

  afterEach: function() {
	obj = undefined ;
    obj1 = undefined ;
    don = undefined ;
  }
});

// deprecated, so removed
// test("Checking the superclass method for an existing function", function() {
// 	assert.equal(don.method2().method1(), "hello");
// });

test("Checking the subclassOf function on an object and its subclass", function (assert) {
	assert.equal(obj1.subclassOf(obj), true);
	assert.equal(obj.subclassOf(obj1), false);
});

test("subclasses should contain defined subclasses", function (assert) {
  assert.ok(obj.subclasses.contains(obj1), 'obj.subclasses should contain obj1');
  
  assert.equal(obj1.subclasses.get('length'),0,'obj1.subclasses should be empty');
  
  var kls2 = obj1.extend();
  assert.ok(obj1.subclasses.contains(kls2), 'obj1.subclasses should contain kls2');
});
