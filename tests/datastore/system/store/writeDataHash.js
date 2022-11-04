// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";
// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "write" event in the NestedStore portion of the diagram.

var store, child, storeKey, json;
module("Store#writeDataHash", {
  beforeEach: function() {
    store = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = Store.generateStoreKey();
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 

// The transition from each base state performs the same operation, so just
// run the same test on each state.
function testWriteDataHash() {
  var oldrev = store.revisions[storeKey];
  
  // perform test
  var json2 = { foo: "bar" };
  assert.equal(store.writeDataHash(storeKey, json2, Record.READY_NEW), store, 'should return receiver');
  
  // verify
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'new edit state should be editable');
  
  assert.equal(store.readDataHash(storeKey), json2, 'should have new json data hash');
  assert.equal(store.readStatus(storeKey), Record.READY_NEW, 'should have new status');

  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone reference to revision');
  }
}


test("edit state=LOCKED - also writes a NEW hash", function (assert) {
  
  // test preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - edit state should be locked');
  
  testWriteDataHash();
});

test("edit state=EDITABLE - also overwrites an EXISTING hash", function (assert) {
  
  // test preconditions
  store.writeDataHash(storeKey, { foo: "bar" });
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - edit state should be editable');
  
  testWriteDataHash();

});

// ..........................................................
// PROPOGATING TO NESTED STORES
// 

test("change should propogate to child if child edit state = INHERITED", function (assert) {

  // verify preconditions
  assert.equal(child.storeKeyEditState(storeKey), Store.INHERITED, 'precond - child edit state should be INHERITED');

  // perform change
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, Record.READY_NEW);
  
  // verify
  assert.deepEqual(child.readDataHash(storeKey), json2, 'child should pick up change');
  assert.equal(child.readStatus(storeKey), Record.READY_NEW, 'child should pick up new status');
});


function testLockedOrEditableChild() {
  // perform change
  var json2 = { version: 2 };
  store.writeDataHash(storeKey, json2, Record.READY_NEW);
  
  // verify
  assert.deepEqual(child.readDataHash(storeKey), json, 'child should NOT pick up change');
  assert.equal(child.readStatus(storeKey), Record.READY_CLEAN, 'child should pick up new status');
}


test("change should not propogate to child if child edit state = LOCKED", function (assert) {
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);
  store.editables = null ; // clear to simulate locked mode.
  
  // verify preconditions
  child.readDataHash(storeKey);
  assert.equal(child.storeKeyEditState(storeKey), Store.LOCKED, 'precond - child edit state should be LOCKED');

  testLockedOrEditableChild();
});

test("change should not propogate to child if child edit state = EDITABLE", function (assert) {
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);
  store.editables = null ; // clear to simulate locked mode.

  // verify preconditions
  child.readEditableDataHash(storeKey);
  assert.equal(child.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - child edit state should be EDITABLE');

  testLockedOrEditableChild();
});




