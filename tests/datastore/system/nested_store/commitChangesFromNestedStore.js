// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var parent, store, child, storeKey, json;
module("NestedStore#commitChangesFromNestedStore", {
  beforeEach: function() {
    SC.RunLoop.begin();

    parent = Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   true
    };

    storeKey = Store.generateStoreKey();

    store = parent.chain();
    child = store.chain();  // test multiple levels deep

    // write basic status
    child.writeDataHash(storeKey, json, Record.READY_DIRTY);
    child.dataHashDidChange(storeKey);
    child.changelog = SC.Set.create();
    child.changelog.add(storeKey);

    SC.RunLoop.end();
  }
});

test("copies changed data hashes, statuses, and revisions", function (assert) {

  SC.RunLoop.begin();

  // verify preconditions
  assert.equal(store.readDataHash(storeKey), null, 'precond - should not have data yet');
  assert.ok(child.chainedChanges.contains(storeKey), 'precond - child changes should include storeKey');

  // perform action
  assert.equal(store.commitChangesFromNestedStore(child, child.chainedChanges, false), store, 'should return receiver');
  SC.RunLoop.end();

  // verify new status
  assert.equal(store.readDataHash(storeKey), json, 'now should have json');
  assert.equal(store.readStatus(storeKey), Record.READY_DIRTY, 'now should have status');
  assert.equal(store.revisions[storeKey], child.revisions[storeKey], 'now shoulave have revision from child');

});

test("adds lock on any items not already locked", function (assert) {

  SC.RunLoop.begin();

  var storeKey2 = Store.generateStoreKey();
  var json2 = { kind: "json2" };

  // verify preconditions
  store.readDataHash(storeKey);
  assert.ok(store.locks[storeKey], 'precond - storeKey should have lock');
  assert.ok(!store.locks[storeKey2], 'precond - storeKey2 should not have lock');

  // write another record into child store to commit changes.
  child.writeDataHash(storeKey2, json2, Record.READY_DIRTY);
  child.dataHashDidChange(storeKey2);

  var changes = child.chainedChanges ;
  assert.ok(changes.contains(storeKey), 'precond - child.chainedChanges should contain storeKey');
  assert.ok(changes.contains(storeKey2), 'precond - child.chainedChanges should contain storeKey2');

  // now commit back to parent
  assert.equal(store.commitChangesFromNestedStore(child, changes, false), store, 'should return receiver');
  SC.RunLoop.end();

  // and verify that both have locks
  assert.ok(store.locks[storeKey], 'storeKey should have lock after commit (actual: %@)'.fmt(store.locks[storeKey]));
  assert.ok(store.locks[storeKey2], 'storeKey2 should have lock after commit (actual: %@)'.fmt(store.locks[storeKey2]));

});

test("adds items in chainedChanges to receiver chainedChanges", function (assert) {

  SC.RunLoop.begin();

  var key1 = Store.generateStoreKey();

  store.dataHashDidChange(key1);

  assert.ok(child.chainedChanges.contains(storeKey), 'precond - child.chainedChanges should contain store key');

  assert.equal(store.commitChangesFromNestedStore(child, child.chainedChanges, false), store, 'should return receiver');
  SC.RunLoop.end();

  // changelog should merge nested store & existing
  assert.ok(store.chainedChanges.contains(key1), 'chainedChanges should still contain key1');
  assert.ok(store.chainedChanges.contains(storeKey), 'chainedChanges should also contain storeKey');
});

test("should set hasChanges to true if has changes", function (assert) {

  SC.RunLoop.begin();

  var changes = child.chainedChanges;
  assert.ok(changes.length>0, 'precond - should have some changes in child');
  assert.equal(store.get('hasChanges'), false, 'precond - store should not have changes');

  store.commitChangesFromNestedStore(child, changes, false);
  assert.equal(store.get('hasChanges'), true, 'store should now have changes');
});

test("should set hasChanges to false if no changes", function (assert) {

  SC.RunLoop.begin();

  child = store.chain() ; // get a new child store

  var changes = child.chainedChanges || SC.Set.create();
  assert.ok(!changes || !changes.length, 'precond - should have not have changes in child');
  assert.equal(store.get('hasChanges'), false, 'precond - store should not have changes');

  store.commitChangesFromNestedStore(child, changes, false);
  SC.RunLoop.end();

  assert.equal(store.get('hasChanges'), false, 'store should NOT now have changes');
});

// ..........................................................
// SPECIAL CASES
//

test("committing changes should chain back each step", function (assert) {

  SC.RunLoop.begin();

  // preconditions
  assert.equal(child.readDataHash(storeKey), json, 'precond - child should have data');
  assert.equal(store.readDataHash(storeKey), null, 'precond - store should not have data');
  assert.equal(parent.readDataHash(storeKey), null, 'precond - parent should not have data');

  // do commits
  child.commitChanges();

  assert.equal(store.get('hasChanges'), true, 'store should now have changes');
  assert.equal(store.readDataHash(storeKey), json, 'store should now have json');

  store.commitChanges();
  assert.equal(store.get('hasChanges'), false, 'store should no longer have changes');
  assert.equal(parent.readDataHash(storeKey), json, 'parent should now have json');
  SC.RunLoop.end();

});



