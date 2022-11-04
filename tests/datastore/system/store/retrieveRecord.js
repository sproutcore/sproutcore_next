// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6;
var storeKey7, storeKey8, json, json1, json2, json3, json4, json5, json6 ;
var json7, json8;

module("Store#retrieveRecord", {
  beforeEach: function() {
    
    store = Store.create();
    
    json1 = {
      guid: "retrieveGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "retrieveGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      guid: "retrieveGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      guid: "retrieveGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      guid: "retrieveGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "retrieveGUID6",
      string: "string",
      number: 23,
      bool:   true
    };
    json7 = {
      guid: "retrieveGUID7",
      string: "string",
      number: 23,
      bool:   true
    };
    json8 = {
      guid: "retrieveGUID8",
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.EMPTY);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.ERROR);
    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, Record.DESTROYED_CLEAN);
    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, Record.BUSY_DESTROYING);
    storeKey5 = Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, Record.BUSY_CREATING);
    storeKey6 = Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, Record.BUSY_COMMITTING);
    storeKey7 = Store.generateStoreKey();
    store.writeDataHash(storeKey7, json7, Record.DESTROYED_DIRTY);
    storeKey8 = Store.generateStoreKey();
    store.writeDataHash(storeKey8, json8, Record.READY_CLEAN);
    }
});
  
function testStates(canLoad) {
  var msg, status;
  
  SC.RunLoop.begin();
  
  store.retrieveRecord(undefined, undefined, storeKey1, true);
  status = store.readStatus( storeKey1);
  if (canLoad) {
    assert.equal(status, Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    assert.equal(status, Record.ERROR, "the status should remain empty");
  }
  
  
  store.retrieveRecord(undefined, undefined, storeKey2, true);
  status = store.readStatus( storeKey2);
  if (canLoad) {
    assert.equal(status, Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    assert.equal(status, Record.ERROR, "the status should become empty");
  }
  
  store.retrieveRecord(undefined, undefined, storeKey3, true);
  status = store.readStatus( storeKey3);
  if (canLoad) {
    assert.equal(status, Record.BUSY_LOADING, "the status should have changed to BUSY_LOADING");
  } else {
    assert.equal(status, Record.ERROR, "the status should become empty");
  }
  
  try{
    store.retrieveRecord(undefined, undefined, storeKey4, true);
    msg='';
  }catch(error1){
    msg=error1.message;
  }
  assert.equal(msg, Record.BUSY_ERROR.toString(), "should throw error");

  try{
    store.retrieveRecord(undefined, undefined, storeKey5, true);
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  assert.equal(msg, Record.BUSY_ERROR.toString(), "should throw error");
  
  try{
    store.retrieveRecord(undefined, undefined, storeKey6, true);
    msg='';
  }catch(error3){
    msg=error3.message;
  }
  assert.equal(msg, Record.BUSY_ERROR.toString(), "should throw error");

  try{
    store.retrieveRecord(undefined, undefined, storeKey7, true);
    msg='';
  }catch(error4){
    msg=error4.message;
  }
  assert.equal(msg, Record.BAD_STATE_ERROR.toString(), "should throw error");


  store.retrieveRecord(undefined, undefined, storeKey8, true);
  status = store.readStatus( storeKey8);
  if (canLoad) {
    assert.ok(Record.BUSY_REFRESH | (status & 0x03), "the status changed to BUSY_REFRESH.");
  } else {
    assert.equal(status, Record.READY_CLEAN, "the status should remain ready clean");
  }
  
  SC.RunLoop.end();
}  

test("Retrieve a record without a data source", function (assert) {
  testStates(false);
});

test("Retrieve a record without a working data source and check for different errors and states", function (assert) {
  // build a fake data source that claims to NOT handle retrieval
  var source = DataSource.create({
    retrieveRecords: function() { return false ; }
  });
  store.set('dataSource', source);

  testStates(false);

});

test("Retrieve a record with working data source and check for different errors and states", function (assert) {
  // build a fake data source that claims to handle retrieval
  var source = DataSource.create({
    retrieveRecords: function() { return true ; }
  });
  store.set('dataSource', source);

  testStates(true);

});

test("Retrieve a record with callback", function (assert) {
  // build a fake data source that claims to handle retrieval
  var source = DataSource.create({
    retrieveRecords: function() { return true ; }
  });
  store.set('dataSource', source);
  var callback = false;
  store.retrieveRecord(undefined, undefined, storeKey1, true, function(){callback = true;});
  
  assert.ok(store._callback_queue[storeKey1], "The callback exists in the queue");
  
  store.dataSourceDidComplete(storeKey1);
  
  assert.ok(callback, "Callback did fire");
});