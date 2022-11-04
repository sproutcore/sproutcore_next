// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record } from "../../../../datastore/datastore.js";

var store, child, storeKey, json;
module("Store#commitChangesFromNestedStore", {
  beforeEach: function() {
    SC.RunLoop.begin();

    store = Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   true
    };

    storeKey = Store.generateStoreKey();

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

  // verify new status
  assert.equal(store.readDataHash(storeKey), json, 'now should have json');
  assert.equal(store.readStatus(storeKey), Record.READY_DIRTY, 'now should have status');
  assert.equal(store.revisions[storeKey], child.revisions[storeKey], 'now shoulave have revision from child');

  SC.RunLoop.end();
});

test("adds items in changelog to receiver changelog", function (assert) {

  var key1 = Store.generateStoreKey();

  SC.RunLoop.begin();

  store.changelog = SC.Set.create();
  store.changelog.add(key1);

  assert.ok(child.changelog.contains(storeKey), 'precond - child.changelog should contain store key');

  assert.equal(store.commitChangesFromNestedStore(child, child.chainedChanges, false), store, 'should return receiver');

  // changelog should merge nested store & existing
  assert.ok(store.changelog.contains(key1), 'changelog should still contain key1');
  assert.ok(store.changelog.contains(storeKey), 'changelog should also contain storeKey');

  SC.RunLoop.end();
});

test("ignores changed data hashes not passed in changes set", function (assert) {

  // preconditions
  assert.equal(store.readDataHash(storeKey), null, 'precond - should not have data yet');

  // perform action
  assert.equal(store.commitChangesFromNestedStore(child, SC.Set.create(), false), store, 'should return receiver');

  // verify results
  assert.equal(store.readDataHash(storeKey), null, 'should not copy data hash for storeKey');

});

function createConflict(force) {
  var json2 = { kind: "json2" };
  var json3 = { kind: "json3" };

  // create a lock conflict.  use a new storeKey since the old one has been
  // setup in a way that won't work for this.
  storeKey = Store.generateStoreKey();

  // step 1: add data to root store
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);
  store.dataHashDidChange(storeKey);

  // step 2: read data in chained store.  this will create lock
  child.readDataHash(storeKey);
  assert.ok(child.locks[storeKey], 'child store should now have lock');

  // step 3: modify root store again
  store.writeDataHash(storeKey, json2, Record.READY_CLEAN);
  store.dataHashDidChange(storeKey);

  // step 4: modify data in chained store so we have something to commit.
  child.writeDataHash(storeKey, json3, Record.READY_DIRTY);
  child.dataHashDidChange(storeKey);

  // just to make sure verify that the lock and revision in parent do not
  // match
  assert.ok(child.locks[storeKey] !== store.revisions[storeKey], 'child.lock (%@) should !== store.revision (%@)'.fmt(child.locks[storeKey], store.revisions[storeKey]));

  // step 5: now try to commit changes from child store.  This should throw
  // an exception.
  var errorCount = 0;
  try {
    child.commitChanges(force);
  } catch(e) {
    assert.equal(e.message, Store.CHAIN_CONFLICT_ERROR.toString(), 'should throw CHAIN_CONFLICT_ERROR');
    errorCount++;
  }

  return errorCount ;
}

test("throws exception if any record fails optimistic locking test", function (assert) {
  var errorCount = createConflict(false);
  assert.equal(errorCount, 1, 'should have raised error');
});

test("does not throw exception if optimistic locking fails but force option is passed", function (assert) {
  var errorCount = createConflict(true);
  assert.equal(errorCount, 0, 'should not raise error');
});

