// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read" event in the Store portion of the diagram.
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, storeKey, json;
module("Store#readDataHash", {
  beforeEach: function() {
    store = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = Store.generateStoreKey();

    store.writeDataHash(storeKey, json, Record.READY_CLEAN);
    store.editables = null; // manually patch to setup test state
  }
});

test("data state=LOCKED", function (assert) {
  
  // preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - data state should be LOCKED');
  var oldrev = store.revisions[storeKey];
  
  // perform read
  var ret = store.readDataHash(storeKey);
  
  // verify
  assert.equal(ret, json, 'should read same data hash once locked');
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'should remain in locked state');

  // test revisions
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("data state=EDITABLE", function (assert) {
  
  // preconditions
  var ret1 = store.readEditableDataHash(storeKey);
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - data state should be EDITABLE');
  var oldrev = store.revisions[storeKey];
  
  // perform read
  var ret2 = store.readDataHash(storeKey);
  
  // verify
  assert.equal(ret1, ret2, 'should read same data hash once editable');
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'should remain in editable state');

  // test revisions
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("should return null when accessing an unknown storeKey", function (assert) {
  assert.equal(store.readDataHash(20000000), null, 'should return null for non-existent store key');
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'should put into locked edit state');
});

