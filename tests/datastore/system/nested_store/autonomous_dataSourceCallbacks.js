// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var parent, store, storeKey, json1, json2, json3, json4, json5, json6, json7, json8, json9, json10,
json11, json12, json13, json14, json15, json16, storeKey1, storeKey2, storeKey3, storeKey4,
storeKey5, storeKey6, storeKey7, storeKey8, storeKey9, storeKey10, storeKey11, storeKey12, storeKey13,
storeKey14, storeKey15, storeKey16;

module("Store#autonomous_dataSourceCallbacks", {
  beforeEach: function() {

    parent = Store.create().from(Record.fixtures);
    store = parent.chainAutonomousStore();

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
    json8 = {
      guid: "commitGUID8",
      string: "string",
      number: 23,
      bool:   true
    };
    json9 = {
      guid: "commitGUID9",
      string: "string",
      number: 23,
      bool:   true
    };
    json10 = {
      guid: "commitGUID10",
      string: "string",
      number: 23,
      bool:   true
    };
    json11 = {
      guid: "commitGUID11",
      string: "string",
      number: 23,
      bool:   true
    };
    json12 = {
      guid: "commitGUID12",
      string: "string",
      number: 23,
      bool:   true
    };
    json13 = {
      guid: "commitGUID13",
      string: "string",
      number: 23,
      bool:   true
    };
    json14 = {
      guid: "commitGUID14",
      string: "string",
      number: 23,
      bool:   true
    };
    json15 = {
      guid: "commitGUID15",
      string: "string",
      number: 23,
      bool:   true
    };
    json16 = {
      guid: "commitGUID16",
      string: "string",
      number: 23,
      bool:   true
    };
    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.READY_CLEAN);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.BUSY_LOADING);
    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, Record.BUSY_CREATING);
    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, Record.BUSY_COMMITTING);
    storeKey5 = Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, Record.BUSY_REFRESH_CLEAN);
    storeKey6 = Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, Record.BUSY_REFRESH_DIRTY);
    storeKey7 = Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, Record.BUSY_DESTROYING);
    storeKey8 = Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, Record.BUSY);

    storeKey9 = Store.generateStoreKey();
    store.writeDataHash(storeKey9, json9, Record.READY_CLEAN);
    storeKey10 = Store.generateStoreKey();
    store.writeDataHash(storeKey10, json10, Record.BUSY_DESTROYING);
    storeKey11 = Store.generateStoreKey();
    store.writeDataHash(storeKey11, json11, Record.BUSY_CREATING);

    storeKey12 = Store.generateStoreKey();
    store.writeDataHash(storeKey12, json12, Record.READY_CLEAN);
    storeKey13 = Store.generateStoreKey();
    store.writeDataHash(storeKey13, json13, Record.BUSY_CREATING);

    storeKey14 = Store.generateStoreKey();
    store.writeDataHash(storeKey14, json14, Record.READY_CLEAN);
    storeKey15 = Store.generateStoreKey();
    store.writeDataHash(storeKey15, json15, Record.BUSY_CREATING);

    storeKey16 = Store.generateStoreKey();
    store.writeDataHash(storeKey16, json16, Record.BUSY_LOADING);

    SC.RunLoop.begin();

  },

  afterEach: function() {
    SC.RunLoop.end();
  }
});

test("Confirm that dataSourceDidCancel switched the records to the right states", function (assert) {
  var msg='', status;
  try{
    store.dataSourceDidCancel(storeKey1);
    msg='';
  }catch(error){
    msg=error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

  store.dataSourceDidCancel(storeKey2);
  status = store.readStatus( storeKey2);
  assert.equal(status, Record.EMPTY, "the status should have changed to EMPTY");

  store.dataSourceDidCancel(storeKey3);
  status = store.readStatus( storeKey3);
  assert.equal(status, Record.READY_NEW, "the status should have changed to READY_NEW");

  store.dataSourceDidCancel(storeKey4);
  status = store.readStatus( storeKey4);
  assert.equal(status, Record.READY_DIRTY, "the status should have changed to READY_DIRTY");

  store.dataSourceDidCancel(storeKey5);
  status = store.readStatus( storeKey5);
  assert.equal(status, Record.READY_CLEAN, "the status should have changed to READY_CLEAN");

  store.dataSourceDidCancel(storeKey6);
  status = store.readStatus( storeKey6);
  assert.equal(status, Record.READY_DIRTY, "the status should have changed to READY_DIRTY");

  store.dataSourceDidCancel(storeKey7);
  status = store.readStatus( storeKey7);
  assert.equal(status, Record.DESTROYED_DIRTY, "the status should have changed to DESTROYED_DIRTY");

  try{
    store.dataSourceDidCancel(storeKey8);
    msg='';
  }catch(error){
    msg=error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

});


test("Confirm that dataSourceDidComplete switched the records to the right states", function (assert) {
  var msg='', status;
  try{
    store.dataSourceDidComplete(storeKey9);
    msg='';
  }catch(error){
    msg=error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

  try{
    store.dataSourceDidComplete(storeKey10);
    msg='';
  }catch(error){
    msg=error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

  store.dataSourceDidComplete(storeKey11);
  status = store.readStatus( storeKey11);
  assert.equal(status, Record.READY_CLEAN, "the status should have changed to READY_CLEAN.");

});


test("Confirm that dataSourceDidDestroy switched the records to the right states", function (assert) {
  var msg='', status;
  try{
    store.dataSourceDidDestroy(storeKey12);
    msg='';
  }catch(error){
    msg=error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

  store.dataSourceDidDestroy(storeKey13);
  status = store.readStatus( storeKey13);
  assert.equal(status, Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN.");

});


test("Confirm that dataSourceDidError switched the records to the right states", function (assert) {
  var msg='', status;
  try{
    store.dataSourceDidError(storeKey14, Record.BAD_STATE_ERROR);
    msg='';
  }catch(error){
    msg = error.message;
  }
  assert.equal(Record.BAD_STATE_ERROR.toString(), msg,
    "should throw the following error ");

  store.dataSourceDidError(storeKey15, Record.BAD_STATE_ERROR);
  status = store.readStatus( storeKey15);
  assert.equal(status, Record.ERROR,
    "the status shouldn't have changed.");
});

test("Confirm that errors passed to dataSourceDidError make it into the recordErrors array", function (assert) {
  var msg = '';

  assert.ok(!store.recordErrors, "recordErrors should be null at this point");

  try {
    store.dataSourceDidError(storeKey16, Record.GENERIC_ERROR);
  } catch (error) {
    msg = error.message;
  }

  assert.equal(store.recordErrors[storeKey16], Record.GENERIC_ERROR,
    "recordErrors[storeKey] should be the right error object");
});
