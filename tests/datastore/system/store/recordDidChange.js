// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, storeKey1, storeKey2, storeKey3, storeKey4, json1, json2, json3, json4;

module("Store#recordDidChange", {
  beforeEach: function() {
    SC.RunLoop.begin();

    store = Store.create();

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
    

    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.BUSY_LOADING);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.EMPTY);
    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json3, Record.READY_NEW);
    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json4, Record.READY_CLEAN);

    SC.RunLoop.end();
  }
});

test("recordDidChange", function (assert) {
  var status;
  try{
    store.recordDidChange(undefined, undefined, storeKey1);
  }catch(error1){
    assert.equal(Record.BUSY_ERROR.toString(), error1.message, "the status shouldn't have changed.");
  }
  
  try{
    store.recordDidChange(undefined, undefined, storeKey2);
  }catch(error2){
    assert.equal(Record.NOT_FOUND_ERROR.toString(), error2.message, "the status shouldn't have changed.");
  }
  
  store.recordDidChange(undefined, undefined, storeKey3);
   status = store.readStatus( storeKey3);
   assert.equal(status, Record.READY_NEW, "the status shouldn't have changed.");

   store.recordDidChange(undefined, undefined, storeKey4);
   status = store.readStatus( storeKey4);
   assert.equal(status, Record.READY_DIRTY, "the status shouldn't have changed.");
  
});
