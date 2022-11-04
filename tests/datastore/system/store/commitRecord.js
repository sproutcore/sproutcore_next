// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, json, json1, json2, json3, json4, json5, json6, json7;
var ds ;

module("Store#commitRecord", {
  beforeEach: function() {

    ds = DataSource.create({

      callCount: 0,

      commitRecords: function(store, toCreate, toUpdate, toDestroy, params) {
        this.toCreate = toCreate;
        this.toUpdate = toUpdate;
        this.toDestroy = toDestroy;
        this.params = params;
        this.callCount++;
      },

      reset: function() {
        this.toCreate = this.toUpdate = this.toDestroy = this.params = null;
        this.callCount = 0 ;
      },

      expect: function(callCount, toCreate, toUpdate, toDestroy, params) {
        if (callCount !== undefined) {
          assert.equal(this.callCount, callCount, 'expect datasource.commitRecords to be called X times');
        }

        if (toCreate !== undefined) {
          assert.deepEqual(this.toCreate, toCreate, 'expect toCreate to have items');
        }

        if (toUpdate !== undefined) {
          assert.deepEqual(this.toUpdate, toUpdate, 'expect toUpdate to have items');
        }

        if (toDestroy !== undefined) {
          assert.deepEqual(this.toDestroy, toDestroy, 'expect toDestroy to have items');
        }

        if (params !== undefined) {
          assert.deepEqual(this.params, params, 'expect params to have items');
        }
      }

    });

    store = Store.create().from(ds);

    json1 = {
      guid: "commitGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "commitGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      guid: "commitGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      guid: "commitGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      guid: "commitGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "commitGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    json7 = {
      guid: "commitGUID7",
      string: "string",
      number: 23,
      bool:   true
    };

    SC.RunLoop.begin();
    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.READY_CLEAN);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.READY_NEW);
    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, Record.READY_DIRTY);
    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, Record.DESTROYED_DIRTY);
    storeKey5 = Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, Record.EMPTY);
    storeKey6 = Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, Record.ERROR);
    storeKey7 = Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, Record.DESTROYED_CLEAN);
    SC.RunLoop.end();
  }
});

test("Confirm that all the states are switched as expected after running commitRecord", function (assert) {
  var throwError=false, msg, status;

  store.commitRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  assert.equal(status, Record.READY_CLEAN, "the status shouldn't have changed. It should be READY_CLEAN ");

  store.commitRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  assert.equal(status, Record.BUSY_CREATING, "the status should be Record.BUSY_CREATING");

  store.commitRecord(undefined, undefined, storeKey3);
  status = store.readStatus( storeKey3);
  assert.equal(status, Record.BUSY_COMMITTING, "the status should be Record.BUSY_COMMITTING");

  store.dataSourceDidComplete(storeKey3);
  status = store.readStatus( storeKey3);
  assert.equal(status, Record.READY_CLEAN, "the status should be Record.READY_CLEAN");

  store.commitRecord(undefined, undefined, storeKey4);
  status = store.readStatus( storeKey4);
  assert.equal(status, Record.BUSY_DESTROYING, "the status should be Record.BUSY_DESTROYING");

  store.dataSourceDidDestroy(storeKey4);
  status = store.readStatus(storeKey4);
  assert.equal(status, Record.DESTROYED_CLEAN, "the status should be Record.DESTROYED_CLEAN");

  store.commitRecord(undefined, undefined, storeKey5);
  status = store.readStatus( storeKey5);
  assert.equal(status, Record.EMPTY, "the status should be Record.EMPTY");

  try{
    store.commitRecord(undefined, undefined, storeKey6);
    throwError=false;
    msg='';
  }catch(error){
    throwError=true;
    msg=error.message;
  }
  assert.equal(msg, Record.NOT_FOUND_ERROR.toString(), "commitRecord should throw the following error");

  store.commitRecord(undefined, undefined, storeKey7);
  status = store.readStatus( storeKey7);
  assert.equal(status, Record.DESTROYED_CLEAN, "the status should be Record.DESTROYED_CLEAN");

});

test("calling commitRecords() without explicit storeKeys", function (assert) {
  var st;
  store.changelog = [storeKey1, storeKey2, storeKey3, storeKey4];
  store.commitRecords();

  st = store.readStatus( storeKey1);
  assert.equal(st, Record.READY_CLEAN, "storeKey1 - the status shouldn't have changed. It should be READY_CLEAN ");

  st = store.readStatus( storeKey2);
  assert.equal(st, Record.BUSY_CREATING, "storeKey2 - the status should be Record.BUSY_CREATING");

  st = store.readStatus( storeKey3);
  assert.equal(st, Record.BUSY_COMMITTING, "storeKey3 - the status should be Record.BUSY_COMMITTING");

  st = store.readStatus( storeKey4);
  assert.equal(st, Record.BUSY_DESTROYING, "storeKey4 - the status should be Record.BUSY_DESTROYING");

  ds.expect(1, [storeKey2], [storeKey3], [storeKey4]);
});

test("calling commitRecords() with params", function (assert) {
  var p = { foo: "bar" };
  store.commitRecord(null, null, storeKey2, p);
  ds.expect(1, [storeKey2], [], [], p);
  ds.reset();

  // calling commit records with no storeKeys should still invoke if params
  store.commitRecords(null,null,null,p);
  ds.expect(1, [], [], [], p);
  ds.reset();

  // call commit records with no storeKeys and no params should not invoke ds
  store.commitRecords(null,null,null,null);
  ds.expect(0);
});

test("calling commitRecords() with callbacks", function (assert) {
  var wasCalled = false;
  var cb = function(){wasCalled = true;};

  store.commitRecord(null, null, storeKey2, {}, cb);
  assert.ok(store._callback_queue[storeKey2], "should have a callback in the queue");
  assert.ok(!wasCalled, "wasn't called yet");
  store.dataSourceDidComplete(storeKey2);
  assert.ok(wasCalled, "callback fired!");
});

