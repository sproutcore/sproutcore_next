// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "discard" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json, args;
module("NestedStore#discardChanges", {
  beforeEach: function() {
    SC.RunLoop.begin();

    parent = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    args = null;
    
    storeKey = Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, Record.READY_CLEAN);
    parent.editables = null;
    
    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep

    // commitChangesFromNestedStore() should never be called.  Capture info
    // about call.
    parent.commitChangesFromNestedStore =
    child.commitChangesFromNestedStore =
    store.commitChangesFromNestedStore = function(store, changes, force) {
      if (!args) args = [];
      args.push({ 
        target: this, 
        store: store, 
        changes: changes, 
        force: force 
      });
    };

    SC.RunLoop.end();
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
//

function testStateTransition() {

  // attempt to commit
  assert.equal(store.discardChanges(), store, 'should return receiver');
  
  // verify result
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'data edit state');
  assert.equal(store.get('hasChanges'), false, 'hasChanges should be false');
  assert.equal(store.readDataHash(storeKey), json, 'data hash should return parent hash again');
  assert.equal(store.readStatus(storeKey), parent.readStatus(storeKey), 'should return record status from parent');
  assert.ok(!store.chainedChanges || !store.chainedChanges.length, 'should have no chainedChanges queued');
  
  // should NOT invoke commitChangesFromNestedStore
  assert.equal(args, null, 'should not call commitChangesFromNestedStore');
}

test("state = INHERITED", function (assert) {
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - data edit state');
  testStateTransition();
});


test("state = LOCKED", function (assert) {
  
  store.readDataHash(storeKey); // force to locked mode
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - data edit state');
  testStateTransition();
});

test("state = EDITABLE", function (assert) {
  
  // write in some data to store
  store.writeDataHash(storeKey, json);
  store.dataHashDidChange(storeKey);
  
  // check preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - data edit state');
  assert.ok(store.chainedChanges  && store.chainedChanges.contains(storeKey), 'editable record should be in chainedChanges set');

  testStateTransition();
});


// ..........................................................
// SPECIAL CASES
// 

// TODO: Add more special cases for NestedStore#discardChanges
