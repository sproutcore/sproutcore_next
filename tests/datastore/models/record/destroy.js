// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var MyFoo = null, callInfo, MyApp ;
module("Record#destroy", {
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
    
    // modify store so that every time refreshRecords() is called it updates 
    // callInfo
    callInfo = null ;
    MyApp.store.__orig = MyApp.store.destroyRecord;
    MyApp.store.destroyRecord = function(records) {
      callInfo = SC.A(arguments) ; // save method call
      MyApp.store.__orig.apply(MyApp.store, arguments); 
    };
    SC.RunLoop.end();
  }
});

test("calling destroy on a newRecord will mark the record as destroyed and calls destroyRecords on the store", function (assert) {
  assert.equal(MyApp.foo.get('status'), Record.READY_NEW, 'precond - status is READY_NEW');
  SC.RunLoop.begin();
  MyApp.foo.destroy();
  SC.RunLoop.end();
  assert.deepEqual(callInfo, [null, null, MyApp.foo.storeKey], 'destroyRecords() should not be called');
  
  assert.equal(MyApp.foo.get('status'), Record.DESTROYED_CLEAN, 'status should be Record.DESTROYED_CLEAN');
});

test("calling destroy on existing record should call destroyRecord() on store", function (assert) {

  // Fake it till you make it...
  MyApp.store.writeStatus(MyApp.foo.storeKey, Record.READY_CLEAN)
    .dataHashDidChange(MyApp.foo.storeKey, null, true);
    
  assert.equal(MyApp.foo.get('status'), Record.READY_CLEAN, 'precond - status is READY CLEAN');
  
  SC.RunLoop.begin();
  MyApp.foo.destroy();
  SC.RunLoop.end();
  
  assert.deepEqual(callInfo, [null, null, MyApp.foo.storeKey], 'destroyRecord() should not be called');
  assert.equal(MyApp.foo.get('status'), Record.DESTROYED_DIRTY, 'status should be Record.DESTROYED_DIRTY');
});

test("calling destroy on a record that is already destroyed should do nothing", function (assert) {

  // destroy once
  SC.RunLoop.begin();
  MyApp.foo.destroy();
  SC.RunLoop.end();
  assert.equal(MyApp.foo.get('status'), Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN');
  
  SC.RunLoop.begin();
  MyApp.foo.destroy();
  SC.RunLoop.end();
  assert.equal(MyApp.foo.get('status'), Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN');
});

test("should return receiver", function (assert) {
  assert.equal(MyApp.foo.destroy(), MyApp.foo, 'should return receiver');
});

test("destroy should update status cache", function (assert) {
  var st = MyApp.foo.get('status');
  assert.ok(st !== Record.DESTROYED_CLEAN, 'precond - foo should not be destroyed');

  SC.RunLoop.begin();
  MyApp.foo.destroy();
  assert.equal(MyApp.foo.get('status'), Record.DESTROYED_CLEAN, 'status should be DESTROYED_CLEAN immediately when destroyed directly by record');
  SC.RunLoop.end();
});


