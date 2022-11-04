// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "remove" event in the NestedStore portion of the diagram.

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var parent, store, child, storeKey, json;
module("NestedStore#removeDataHash", {
  beforeEach: function() {
    parent = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, Record.READY_CLEAN);
    parent.editables = null; // manually patch to setup test state
    
    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 

// The transition from each base state performs the same operation, so just
// run the same test on each state.
function testRemoveDataHash() {
  var oldrev = store.revisions[storeKey];
  
  // perform test
  assert.equal(store.removeDataHash(storeKey, Record.DESTROYED_CLEAN), store, 'should return receiver');
  
  // verify
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'new edit state should be locked');
  
  assert.equal(store.readDataHash(storeKey), null, 'should have false json data');
  assert.equal(store.readStatus(storeKey), Record.DESTROYED_CLEAN, 'should have new status');

  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone reference to revision');
  }
}


test("edit state=INHERITED", function (assert) {
  
  // test preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - edit state should be inherited');
  
  testRemoveDataHash();
});

test("edit state=LOCKED", function (assert) {
  
  // test preconditions
  store.readDataHash(storeKey);
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - edit state should be locked');
  
  testRemoveDataHash();

});

test("edit state=EDITABLE", function (assert) {
  
  // test preconditions
  store.readEditableDataHash(storeKey);
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - edit state should be editable');
  
  testRemoveDataHash();

});

// ..........................................................
// REMOVE NON-EXISTING 
// 

test("remove a non-existing hash", function (assert) {
  storeKey = Store.generateStoreKey(); // new store key!
  assert.equal(parent.readDataHash(storeKey), null, 'precond - parent should not have a data hash for store key yet');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - edit status should be inherited');
  
  // perform write
  assert.equal(store.removeDataHash(storeKey, Record.DESTROYED_CLEAN), store, 'should return receiver');
  
  // verify change
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'new status should be locked');
  assert.equal(store.readDataHash(storeKey), null, 'should still be null');
  assert.equal(store.readStatus(storeKey), Record.DESTROYED_CLEAN, 'should have new record status');
});

// ..........................................................
// PROPOGATING TO NESTED STORES
// 

test("change should propogate to child if child edit state = INHERITED", function (assert) {

  // verify preconditions
  assert.equal(child.storeKeyEditState(storeKey), Store.INHERITED, 'precond - child edit state should be INHERITED');

  // perform change
  store.removeDataHash(storeKey, Record.DESTROYED_CLEAN);
  
  // verify
  assert.deepEqual(child.readDataHash(storeKey), null, 'child should pick up change');
  assert.equal(parent.readDataHash(storeKey), json, 'parent should still have old json');
  
  assert.equal(child.readStatus(storeKey), Record.DESTROYED_CLEAN, 'child should pick up new status');
  assert.equal(parent.readStatus(storeKey), Record.READY_CLEAN, 'parent should still have old status');

});


function testLockedOrEditableChild() {
  // perform change
  store.removeDataHash(storeKey, Record.DESTROYED_CLEAN);
  
  // verify
  assert.deepEqual(child.readDataHash(storeKey), json, 'child should NOT pick up change');
  assert.equal(parent.readDataHash(storeKey), json, 'parent should still have old json');
  
  assert.equal(child.readStatus(storeKey), Record.READY_CLEAN, 'child should pick up new status');
  assert.equal(parent.readStatus(storeKey), Record.READY_CLEAN, 'parent should still have old status');
}


test("change should not propogate to child if child edit state = LOCKED", function (assert) {

  // verify preconditions
  child.readDataHash(storeKey);
  assert.equal(child.storeKeyEditState(storeKey), Store.LOCKED, 'precond - child edit state should be LOCKED');

  testLockedOrEditableChild();
});

test("change should not propogate to child if child edit state = EDITABLE", function (assert) {

  // verify preconditions
  child.readEditableDataHash(storeKey);
  assert.equal(child.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - child edit state should be EDITABLE');

  testLockedOrEditableChild();
});









