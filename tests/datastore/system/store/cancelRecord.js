// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { Store, Record } from "../../../../datastore/datastore.js";


var store, storeKey1,storeKey2;
var json1, json2;
var storeKey6, storeKey7;

module("Store#cancelRecord", {
  beforeEach: function() {
    
    store = Store.create();
    
    json1 = {
      guid: "cancelGUID1",
      string: "string",
      number: 23,
      bool:   true
    };
    json2 = {
      guid: "cancelGUID2",
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json1, Record.EMPTY);
    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json2, Record.READY_NEW);
    }
});

test("Check for error state handling and make sure that the method executes.", function (assert) {
  var throwError=false;
  try{
    store.cancelRecord(undefined, undefined, storeKey1);
    throwError=false;
  }catch (error){
    throwError=true;
  }
  assert.ok(throwError, "cancelRecord should throw and error if the record status is EMPTY or ERROR");
  try{
    store.cancelRecord(undefined, undefined, storeKey2);
    throwError=true;    
  }catch (error){
    throwError=false;
  }
  assert.ok(throwError, " cancelRecord was successfully executed.");
  
});
