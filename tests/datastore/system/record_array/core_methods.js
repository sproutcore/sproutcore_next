// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query, RecordArray } from "../../../../datastore/datastore.js";

// test core array-mapping methods for RecordArray
var store, storeKey, json, rec, storeKey2, json2, rec2, storeKeys, recs;
module("RecordArray core methods", {
  beforeEach: function() {
    // setup dummy store
    store = Store.create();

    storeKey = Record.storeKeyFor('foo');
    json = { guid: "foo", foo: "bar" };
    store.writeDataHash(storeKey, json, Record.READY_CLEAN);

    storeKey2 = Record.storeKeyFor('baz');
    json2 = { guid: "baz", baz: "bash" };
    store.writeDataHash(storeKey2, json2, Record.READY_CLEAN);

    // get records
    rec = store.materializeRecord(storeKey);
    assert.equal(rec.get('foo'), 'bar', 'precond - record should have json');
    rec2 = store.materializeRecord(storeKey2);
    assert.equal(rec2.get('baz'), 'bash', 'precond - record 2 should have json');

    // get record array.
    storeKeys = [storeKey, storeKey2];
    recs = RecordArray.create({ store: store, storeKeys: storeKeys });
  }
});

test("initial status", function (assert) {
  assert.equal(recs.get('status'), Record.EMPTY, 'status should be Record.EMPTY');
});

// ..........................................................
// LENGTH
//

test("should pass through length", function (assert) {
  assert.equal(recs.get('length'), storeKeys.length, 'rec should pass through length');
});

test("changing storeKeys length should change length of rec array also", function (assert) {

  var oldlen = recs.get('length');

  storeKeys.pushObject(Store.generateStoreKey()); // change length

  assert.ok(storeKeys.length > oldlen, 'precond - storeKeys.length should have changed');
  assert.equal(recs.get('length'), storeKeys.length, 'rec should pass through length');
});

// ..........................................................
// objectAt
//

test("should materialize record for object", function (assert) {
  assert.equal(storeKeys[0], storeKey, 'precond - storeKeys[0] should be storeKey');
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');
});

test("reading past end of array length should return undefined", function (assert) {
  assert.equal(recs.objectAt(2000), undefined, 'recs.objectAt(2000) should be undefined');
});

test("modifying the underlying storeKey should change the returned materialized record", function (assert) {
  // read record once to make it materialized
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // create a new record.
  SC.RunLoop.begin();
  var rec3 = store.createRecord(Record, { foo: "rec3" });
  SC.RunLoop.end();

  var storeKey3 = rec3.get('storeKey');

  // add to beginning of storeKey array
  storeKeys.unshiftObject(storeKey3);
  assert.equal(recs.get('length'), 3, 'should now have length of 3');
  assert.equal(recs.objectAt(0), rec3, 'objectAt(0) should return new record');
  assert.equal(recs.objectAt(1), rec, 'objectAt(1) should return old record 1');
  assert.equal(recs.objectAt(2), rec2, 'objectAt(2) should return old record 2');
});

test("reading a record not loaded in store should trigger retrieveRecord", function (assert) {
  var callCount = 0;

  // patch up store to record a call and to make it look like data is not
  // loaded.
  store.removeDataHash(storeKey, Record.EMPTY);
  store.retrieveRecord = function() { callCount++; };

  assert.equal(store.peekStatus(storeKeys.objectAt(0)), Record.EMPTY, 'precond - storeKey must not be loaded');

  var rec = recs.objectAt(0);
  assert.equal(callCount, 1, 'store.retrieveRecord() should have been called');
});

// ..........................................................
// replace()
//

test("adding a record to the record array should pass through storeKeys", function (assert) {
  // read record once to make it materialized
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // create a new record.
  SC.RunLoop.begin();
  var rec3 = store.createRecord(Record, { foo: "rec3" });
  SC.RunLoop.end();

  var storeKey3 = rec3.get('storeKey');

  // add record to beginning of record array
  recs.unshiftObject(rec3);

  // verify record array
  assert.equal(recs.get('length'), 3, 'should now have length of 3');
  assert.equal(recs.objectAt(0), rec3, 'recs.objectAt(0) should return new record');
  assert.equal(recs.objectAt(1), rec, 'recs.objectAt(1) should return old record 1');
  assert.equal(recs.objectAt(2), rec2, 'recs.objectAt(2) should return old record 2');

  // verify storeKeys
  assert.equal(storeKeys.objectAt(0), storeKey3, 'storeKeys[0] should return new storeKey');
  assert.equal(storeKeys.objectAt(1), storeKey, 'storeKeys[1] should return old storeKey 1');
  assert.equal(storeKeys.objectAt(2), storeKey2, 'storeKeys[2] should return old storeKey 2');
});

// ..........................................................
// Property Observing
//

test("changing the underlying storeKeys should notify observers of records", function (assert) {

  // setup observer
  var obj = SC.Object.create({
    cnt: 0,
    observer: function() { this.cnt++; }
  });
  recs.addObserver('[]', obj, obj.observer);

  // now modify storeKeys
  storeKeys.pushObject(Store.generateStoreKey());
  assert.equal(obj.cnt, 1, 'observer should have fired after changing storeKeys');
});

test("swapping storeKey array should change recordArray and observers", function (assert) {

  // setup alternate storeKeys
  SC.RunLoop.begin();
  var rec2 = store.createRecord(Record, { foo: "rec2" });
  SC.RunLoop.end();

  var storeKey2 = rec2.get('storeKey');
  var storeKeys2 = [storeKey2];

  // setup observer
  var obj = SC.Object.create({
    cnt: 0,
    observer: function() { this.cnt++; }
  });
  recs.addObserver('[]', obj, obj.observer);

  // read record once to make it materialized
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // now swap storeKeys
  obj.cnt = 0 ;
  recs.set('storeKeys', storeKeys2);

  // verify observer fired and record changed
  assert.equal(obj.cnt, 1, 'observer should have fired after swap');
  assert.equal(recs.objectAt(0), rec2, 'recs.objectAt(0) should return new rec');

  // modify storeKey2, make sure observer fires and content changes
  obj.cnt = 0;
  storeKeys2.unshiftObject(storeKey);
  assert.equal(obj.cnt, 1, 'observer should have fired after edit');
  assert.equal(recs.get('length'), 2, 'should reflect new length');
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should return pushed rec');

});

test("find works with query", function (assert) {
  var filtered = recs.find(Query.create({ conditions: "foo = 'bar'" }));

  assert.equal(filtered.get('length'), 1);
  assert.equal(filtered.objectAt(0), rec);
});

test("find works as enumerable", function (assert) {
  var filtered = recs.find(function(r){ return r.get('foo') === 'bar'; });
  assert.equal(filtered, rec);
});
