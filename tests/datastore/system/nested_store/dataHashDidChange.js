// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "did_change" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json;
module("NestedStore#dataHashDidChange", {
  beforeEach: function() {
    parent = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = Store.generateStoreKey();
    
    SC.RunLoop.begin();
    parent.writeDataHash(storeKey, json, Record.READY_CLEAN);
    SC.RunLoop.end();
    
    parent.editables = null; // manually patch to setup test state
    
    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 


function testStateTransition(fromState, toState) {

  // verify preconditions
  assert.equal(store.get('hasChanges'), false, 'should not have changes');
  assert.equal(store.storeKeyEditState(storeKey), fromState, 'precond - storeKey edit state');
  if (store.chainedChanges) {
    assert.ok(!store.chainedChanges.contains(storeKey), 'changedChanges should NOT include storeKey');
  }

  var oldrev = store.revisions[storeKey];
  
  // perform action
  assert.equal(store.dataHashDidChange(storeKey), store, 'should return receiver');

  // verify results
  assert.equal(store.storeKeyEditState(storeKey), toState, 'store key edit state is in same state');

  // verify revision
  assert.ok(oldrev !== store.revisions[storeKey], 'revisions should change. was: %@ - now: %@'.fmt(oldrev, store.revisions[storeKey]));
  assert.ok(store.chainedChanges.contains(storeKey), 'changedChanges should now include storeKey');
  
  assert.equal(store.get('hasChanges'), true, 'should have changes');
} 

test("edit state = INHERITED, parent editable = false", function (assert) {

  // verify preconditions
  assert.equal(parent.storeKeyEditState(storeKey), Store.LOCKED, 'precond - parent store edit state is not EDITABLE');
  
  testStateTransition(Store.INHERITED, Store.LOCKED);
}) ;

test("edit state = INHERITED, parent editable = true", function (assert) {

  // verify preconditions
  parent.readEditableDataHash(storeKey);
  assert.equal(parent.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - parent store edit state is EDITABLE');

  testStateTransition(Store.INHERITED, Store.EDITABLE);
}) ;

test("edit state = LOCKED", function (assert) {
  store.readDataHash(storeKey); // lock
  testStateTransition(Store.LOCKED, Store.LOCKED);
}) ;

test("edit state = EDITABLE", function (assert) {
  store.readEditableDataHash(storeKey); // make editable
  testStateTransition(Store.EDITABLE, Store.EDITABLE);
}) ;

// ..........................................................
// SPECIAL CASES
// 

test("calling with array of storeKeys will edit all store keys", function (assert) {
  
  var storeKeys = [storeKey, Store.generateStoreKey()], idx ;
  store.dataHashDidChange(storeKeys, 2000) ;
  for(idx=0;idx<storeKeys.length;idx++) {
    assert.equal(store.revisions[storeKeys[idx]], 2000, 'storeKey at index %@ should have new revision'.fmt(idx));
    assert.ok(store.chainedChanges.contains(storeKeys[idx]), 'chainedChanges should include storeKey at index %@'.fmt(idx));
  }
});

test("marking change should update revision but leave lock alone", function (assert) {
  parent.dataHashDidChange(storeKey); // make sure parent has a revision
  store.readDataHash(storeKey); // cause a lock
  store.dataHashDidChange(storeKey); // update revision
  
  assert.equal(store.locks[storeKey], parent.revisions[storeKey], 'lock should have parent revision');
  assert.ok(store.revisions[storeKey] !== parent.revisions[storeKey], 'revision should not match parent rev');  
});

