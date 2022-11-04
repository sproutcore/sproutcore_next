// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "read" event in the NestedStore portion of the diagram.

var parent, store, child, storeKey, json;
module("NestedStore#readDataHash", {
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
    child = store.chain();  // for deep nested
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
// 

test("data state=INHERITED, lockOnRead=true, parent editable=false", function (assert) {
  // preconditions
  assert.equal(store.get('lockOnRead'), true, 'precond - lockOnRead should be true');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  assert.equal(store.readDataHash(storeKey), json, 'should return json');

  // verify
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'storeKey should be read-locked now');
  assert.ok(store.dataHashes.hasOwnProperty(storeKey), 'should copy reference to json');

  // test revisions...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});


test("data state=INHERITED, lockOnRead=false, parent editable=false", function (assert) {
  // preconditions
  store.set('lockOnRead', false);
  
  assert.equal(store.get('lockOnRead'), false, 'precond - lockOnRead should be false');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  assert.equal(store.readDataHash(storeKey), json, 'should return json');

  // verify
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'storeKey should still be inherited');
  assert.ok(!store.dataHashes.hasOwnProperty(storeKey), 'should NOT copy reference to json');

  // test revisions...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});


test("data state=INHERITED, lockOnRead=true, parent editable=true", function (assert) {

  // preconditions
  
  // first, make parentStore record editable.  an editable record needs to be
  // cloned into nested stores on lock to avoid un-monitored edits
  parent.readEditableDataHash(storeKey);
  assert.equal(parent.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - parent storeKey should be editable');
  assert.equal(store.get('lockOnRead'), true, 'precond - lockOnRead should be true');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - storeKey should be inherited from parent');
  var oldrev = store.revisions[storeKey]; // save old rev for testing later

  // perform read
  var ret = store.readDataHash(storeKey);
  assert.deepEqual(ret, json, 'should return equivalent json object');
  assert.ok(!(ret === json), 'should return clone of json instance not exact same instance');

  // verify new state
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'storeKey should be locked');
  assert.ok(store.dataHashes.hasOwnProperty(storeKey), 'should have reference to json');

  // test revisions...
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("data state=LOCKED", function (assert) {
  
  // preconditions
  store.set('lockOnRead', true); // make sure reading will lock
  var ret1 = store.readDataHash(storeKey);
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - data state should be LOCKED');
  var oldrev = store.revisions[storeKey];
  
  // perform read
  var ret2 = store.readDataHash(storeKey);
  
  // verify
  assert.equal(ret1, ret2, 'should read same data hash once locked');
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'should remain in locked state');

  // test revisions
  assert.equal(store.revisions[storeKey], oldrev, 'should not change revision');
  if (!SC.none(oldrev)) {
    assert.ok(store.revisions.hasOwnProperty(storeKey), 'should copy reference to revision');
  }
});

test("data state=EDITABLE", function (assert) {
  
  // preconditions
  store.set('lockOnRead', true); // make sure reading will lock
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
  assert.equal(store.storeKeyEditState(20000000), Store.LOCKED, 'should put into locked edit state');
});

// ..........................................................
// SPECIAL CASES
//

test("locking deep nested store when top-level parent is editable and middle store is inherited", function (assert) {

  // first, make the parent store data hash editable
  json = parent.readEditableDataHash(storeKey);
  assert.equal(parent.storeKeyEditState(storeKey), Store.EDITABLE, 'parent edit state should be EDITABLE');
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'middle store edit state should be INHERITED');
  assert.equal(child.storeKeyEditState(storeKey), Store.INHERITED, 'child store edit state should be INHERITED');
  
  // now read data hash from child, locking child
  var json2 = child.readDataHash(storeKey);
  assert.equal(child.storeKeyEditState(storeKey), Store.EDITABLE, 'child store edit state should be locked after reading data');
  
  // now edit the root json and make sure it does NOT propogate.
  json.newItem = "bar";
  assert.ok(child.readDataHash(storeKey).newItem !== 'bar', 'child json should not pick up edit from parent store since it is now locked');
});




