// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var MyFoo = null, MyApp ;
module("Record#unknownProperty", {
  beforeEach: function() {
    SC.RunLoop.begin();
    MyApp = SC.Object.create({
      store: Store.create()
    })  ;
  
    MyApp.Foo = Record.extend();
    MyApp.json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    MyApp.foo = MyApp.store.createRecord(MyApp.Foo, MyApp.json);
    
    MyApp.FooStrict = Record.extend();
    
    SC.mixin(MyApp.FooStrict, {
      ignoreUnknownProperties: true
    });
    
    MyApp.fooStrict = MyApp.store.createRecord(MyApp.FooStrict, MyApp.json);
    
  },
  
  afterEach: function() {
    SC.RunLoop.end();
  }
});

test("get() returns attributes with no type changes if they exist", function (assert) {
  'foo number bool array'.w().forEach(function(key) {
    assert.equal(MyApp.foo.get(key), MyApp.json[key], "MyApp.foo.get(%@) should === attribute".fmt(key));
  });
});

test("get() unknown attribute returns undefined", function (assert) {
  assert.equal(MyApp.foo.get('imaginary'), undefined, 'imaginary property should be undefined');
});

test("set() unknown property should add to dataHash", function (assert) {
  MyApp.foo.set('blue', '0x00f');
  assert.equal(MyApp.store.dataHashes[MyApp.foo.storeKey].blue, '0x00f', 'should add blue attribute');
});

test("set() should replace existing property", function (assert) {
  MyApp.foo.set('foo', 'baz');
  assert.equal(MyApp.store.dataHashes[MyApp.foo.storeKey].foo, 'baz', 'should update foo attribute');
});

test("set() on unknown property if model ignoreUnknownProperties=true should not write it to data hash", function (assert) {
  MyApp.fooStrict.set('foo', 'baz');
  assert.equal(MyApp.store.dataHashes[MyApp.fooStrict.storeKey].foo, 'bar', 'should not have written new value to dataHash');
});


