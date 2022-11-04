// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read_editable" event in the NestedStore portion of the diagram.

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var parent, store, storeKey, json;
module("NestedStore#readEditableDataHash", {
  beforeEach: function() {
    parent = Store.create();
    
    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    
    storeKey = Store.generateStoreKey();

    parent.writeDataHash(storeKey, json, Record.READY_CLEAN);
    parent.editables = null ; // manually reset for testing state
    
    store = parent.chain();
  }
});

test("data state=INHERITED, parent editable = false", function (assert) {
  
  // test preconditions
  assert.equal(parent.storeKeyEditState(storeKey), Store.LOCKED, 'precond - parent edit state should be LOCKED');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - edit state should be INHERITED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  assert.deepEqual(ret, json, 'should return equivalent json object');
  assert.ok(!(ret===json), 'should not return same json instance');
  
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
});

test("data state=INHERITED, parent editable = true", function (assert) {
  
  // test preconditions
  parent.readEditableDataHash(storeKey);
  assert.equal(parent.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - parent edit state should be EDITABLE');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - edit state should be INHERITED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  assert.deepEqual(ret, json, 'should return equivalent json object');
  assert.ok(!(ret===json), 'should not return same json instance');
  
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});

test("data state=LOCKED", function (assert) {
  
  // test preconditions
  store.readDataHash(storeKey);
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - edit state should be LOCKED');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  assert.deepEqual(ret, json, 'should return equivalent json object');
  assert.ok(!(ret===json), 'should not return same json instance');
  
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});

test("data state=EDITABLE", function (assert) {
  
  // test preconditions
  json = store.readEditableDataHash(storeKey); // get editable json
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - edit state should be EDITABLE');
  var oldrev = store.revisions[storeKey] ;

  // perform read
  var ret = store.readEditableDataHash(storeKey);
  
  // validate
  assert.equal(ret, json, 'should return same editable json instance');
  
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'edit state should be editable');
  
  // should not change revisions, but should copy it...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should clone revision reference');
  }
  
});


