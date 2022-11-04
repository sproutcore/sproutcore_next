// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record } from "../../../../datastore/datastore.js";

var store, storeKey1,storeKey2,storeKey3,storeKey4,storeKey5, storeKey6, json;
var json1, json2, json3, json4, json5, json6;

module("Store#destroyRecord", {
  beforeEach: function() {

    SC.RunLoop.begin();

    store = Store.create();

    json1 = {
      guid: "destroyGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "destroyGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    json3 = {
      guid: "destroyGUID3",
      string: "string",
      number: 23,
      bool:   true
    };
    json4 = {
      guid: "destroyGUID4",
      string: "string",
      number: 23,
      bool:   true
    };
    json5 = {
      guid: "destroyGUID5",
      string: "string",
      number: 23,
      bool:   true
    };
    json6 = {
      guid: "destroyGUID6",
      string: "string",
      number: 23,
      bool:   true
    };

    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.BUSY_DESTROYING);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.DESTROYED);
    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, Record.EMPTY);
    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, Record.BUSY);
    storeKey5 = Store.generateStoreKey();
    store.writeDataHash(storeKey5, json5, Record.READY_NEW);
    storeKey6 = Store.generateStoreKey();
    store.writeDataHash(storeKey6, json6, Record.READY_CLEAN);

    SC.RunLoop.end();
  }
});

test("Check for different states after/before executing destroyRecord", function (assert) {
  var throwError=false, msg, status;

  store.destroyRecord(undefined, undefined, storeKey1);
  status = store.readStatus( storeKey1);
  assert.equal(status, Record.BUSY_DESTROYING, "the status shouldn't have changed. It should be BUSY_DESTROYING ");

  store.destroyRecord(undefined, undefined, storeKey2);
  status = store.readStatus( storeKey2);
  assert.equal(status, Record.DESTROYED, "the status shouldn't have changed. It should be DESTROYED ");

  try{
    store.destroyRecord(undefined, undefined, storeKey3);
    msg='';
  }catch(error1){
    msg=error1.message;
  }
  assert.equal(msg, Record.NOT_FOUND_ERROR.toString(), "destroyRecord should throw the following error");

  try{
    store.destroyRecord(undefined, undefined, storeKey4);
    msg='';
  }catch(error2){
    msg=error2.message;
  }
  assert.equal(msg, Record.BUSY_ERROR.toString(), "destroyRecord should throw the following error");

  store.destroyRecord(undefined, undefined, storeKey5);
  status = store.readStatus(storeKey5);
  assert.equal(store.dataHashes[storeKey5], null, "the data hash should be removed");
  assert.equal(status, Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN ");

  store.destroyRecord(undefined, undefined, storeKey6);
  status = store.readStatus( storeKey6);
  assert.equal(status, Record.DESTROYED_DIRTY, "the status should have changed to DESTROYED_DIRTY ");

  assert.equal(store.changelog.length, 1, "The changelog has the following number of entries:");


});
