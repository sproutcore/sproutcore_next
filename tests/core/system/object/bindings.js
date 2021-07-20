// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Object bindings Tests
// ========================================================================
/*globals module test ok isObj equals expects TestNamespace */
import { SC, GLOBAL } from '../../../../core/core.js';
var testObject, fromObject, extraObject, TestObject;

module("bind() method", {
  
  beforeEach: function() {
    testObject = SC.Object.create({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = SC.Object.create({
      foo: "extraObjectValue"
    }) ;
    
    GLOBAL.TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  afterEach: function() { 
    testObject = fromObject = extraObject = null ; 
  }
  
});
  
test("bind(TestNamespace.fromObject.bar) should follow absolute path", function (assert) {
  // create binding
  testObject.bind("foo", "TestNamespace.fromObject.bar") ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  // support new-style bindings if available
  SC.Binding.flushPendingChanges();
  assert.equal("changedValue", testObject.get("foo"), "testObject.foo");
});
  
test("bind(.bar) should bind to relative path", function (assert) {
  // create binding
  testObject.bind("foo", ".bar") ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("changedValue", testObject.get("foo"), "testObject.foo");
});

test("SC.Binding.bool(TestNamespace.fromObject.bar)) should create binding with bool transform", function (assert) {
  // create binding
  testObject.bind("foo", SC.Binding.bool("TestNamespace.fromObject.bar")) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
});

test("bind(TestNamespace.fromObject*extraObject.foo) should create chained binding", function (assert) {
  testObject.bind("foo", "TestNamespace.fromObject*extraObject.foo");
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  fromObject.set("extraObject", extraObject) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

test("bind(*extraObject.foo) should create locally chained binding", function (assert) {
  testObject.bind("foo", "*extraObject.foo");
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  testObject.set("extraObject", extraObject) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});


// test("bind(*extraObject.foo) should be disconnectable");
// The following contains no test
/*
test("bind(*extraObject.foo) should be disconnectable", function (assert) {
  var binding = testObject.bind("foo", "*extraObject.foo");
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  binding.disconnect();
  SC.Binding.flushPendingChanges() ;
});
*/

module("fooBinding method", {
  
  beforeEach: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    extraObject = SC.Object.create({
      foo: "extraObjectValue"
    }) ;
        
    GLOBAL.TestNamespace = {
      fromObject: fromObject,
      testObject: TestObject
    } ;
  },
  
  afterEach: function() { 
    TestObject = fromObject = extraObject = null ;
  //  delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should follow absolute path", function (assert) {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", "changedValue") ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("changedValue", testObject.get("foo"), "testObject.foo");
});

test("fooBinding: .bar should bind to relative path", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: ".bar"
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  testObject.set("bar", "changedValue") ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("changedValue", testObject.get("foo"), "testObject.foo");
});

test("fooBinding: SC.Binding.bool(TestNamespace.fromObject.bar should create binding with bool transform", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.bool("TestNamespace.fromObject.bar") 
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
});

test("fooBinding: TestNamespace.fromObject*extraObject.foo should create chained binding", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject*extraObject.foo" 
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  fromObject.set("extraObject", extraObject) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

test("fooBinding: *extraObject.foo should create locally chained binding", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: "*extraObject.foo" 
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  testObject.set("extraObject", extraObject) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal("extraObjectValue", testObject.get("foo"), "testObject.foo") ;
});

test('fooBinding: should disconnect bindings when destroyed', function (assert) {

  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding

  var binding = testObject.get('fooBinding');
  
  assert.ok(binding.isConnected);
  SC.run(testObject.destroy, testObject);
  assert.ok(!binding.isConnected);
});

module("fooBindingDefault: SC.Binding.Bool (old style)", {
  
  beforeEach: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      fooBindingDefault: SC.Binding.bool(),
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    GLOBAL.TestNamespace = {
      fromObject: fromObject,
      testObject: TestObject
    } ;
  },
  
  afterEach: function() { 
    TestObject = fromObject = null ;
 //   delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function (assert) {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
});

test("fooBinding: SC.Binding.not(TestNamespace.fromObject.bar should override default", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.not("TestNamespace.fromObject.bar") 
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
});

module("fooBindingDefault: SC.Binding.bool() (new style)", {
  
  beforeEach: function() {
    TestObject = SC.Object.extend({
      foo: "bar",
      fooBindingDefault: SC.Binding.bool(),
      bar: "foo",
      extraObject: null 
    });
    
    fromObject = SC.Object.create({
      bar: "foo",
      extraObject: null 
    }) ;
    
    GLOBAL.TestNamespace = {
      fromObject: fromObject,
      testObject: testObject
    } ;
  },
  
  afterEach: function() { 
    TestObject = fromObject = null ;
   // delete TestNamespace ;
  }
  
});

test("fooBinding: TestNamespace.fromObject.bar should have bool binding", function (assert) {
  // create binding
  testObject = TestObject.create({
    fooBinding: "TestNamespace.fromObject.bar"
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
});

test("fooBinding: SC.Binding.not(TestNamespace.fromObject.bar should override default", function (assert) {
  
  testObject = TestObject.create({
    fooBinding: SC.Binding.not("TestNamespace.fromObject.bar") 
  }) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding
  
  // now make a change to see if the binding triggers.
  fromObject.set("bar", 1) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(false, testObject.get("foo"), "testObject.foo == false");
  
  fromObject.set("bar", 0) ;
  
  SC.Binding.flushPendingChanges();
  assert.equal(true, testObject.get("foo"), "testObject.foo == true");
});

test("Chained binding should be null if intermediate object in chain is null", function (assert) {
  var a, z;
  
  a = SC.Object.create({
    b: SC.Object.create({
      c: 'c'
    }),
    zBinding: '*b.c'
  });
  
  SC.Binding.flushPendingChanges();
  assert.equal(a.get('z'), 'c', "a.z == 'c'");
    
  a.set('b', null);
  SC.Binding.flushPendingChanges();
  assert.equal(a.get('z'), null, "a.z == null");
});
