// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query, RecordArray } from "../../../../datastore/datastore.js";

// test core array-mapping methods for RecordArray
var store, storeKey, json, rec, storeKeys, recs, query, recsController, fooQuery, fooRecs, fooRecsController, stopIt;
module("RecordArray core methods", {
  beforeEach: function() {
    // setup dummy store
    store = Store.create();

    storeKey = Record.storeKeyFor('foo');
    json = {  guid: "foo", foo: "foo" };

    store.writeDataHash(storeKey, json, Record.READY_CLEAN);


    // get record
    rec = store.materializeRecord(storeKey);
    assert.equal(rec.get('foo'), 'foo', 'record should have json');

    // get record array.
    query = Query.create({ recordType: Record });
    recs = RecordArray.create({ store: store, query: query });

    recsController = SC.Object.create({
      content: recs,
      bigCost: false,
      veryExpensiveObserver: function() {
        this.set('bigCost', true);
      }.observes('.content.[]')
    });

    fooQuery = Query.create({ recordType: Record, conditions: "foo='foo'" });
    fooRecs = RecordArray.create({ store: store, query: fooQuery });

    fooRecsController = SC.Object.create({
      content: fooRecs,
      bigCost: false,
      veryExpensiveObserver: function() {
        this.set('bigCost', true);
      }.observes('.content.[]')
    });
  }
});

// ..........................................................
// BASIC TESTS
//

test("should not initially populate storeKeys array until we flush()", function (assert) {

  assert.equal(recs.get('storeKeys'), null, 'should not have storeKeys yet');

  recs.flush();

  var storeKeys = recs.get('storeKeys');
  assert.deepEqual(storeKeys, [storeKey], 'after flush should have initial set of storeKeys');

});

test("length property should flush", function (assert) {
  assert.equal(recs.get('storeKeys'), null,' should not have storeKeys yet');
  assert.equal(recs.get('length'), 1, 'should have length 1 when called');
  assert.deepEqual(recs.get('storeKeys'), [storeKey], 'after flush should have initial set of storeKeys');
});

test("objectAt() should flush", function (assert) {
  assert.equal(recs.get('storeKeys'), null,' should not have storeKeys yet');
  assert.equal(recs.objectAt(0), rec, 'objectAt(0) should return record');
  assert.deepEqual(recs.get('storeKeys'), [storeKey], 'after flush should have initial set of storeKeys');
});


// ..........................................................
// storeDidChangeStoreKeys()
//

test("calling storeDidChangeStoreKeys() with a matching recordType", function (assert) {
  recs.flush(); // do initial setup
  var orig = recs.get('storeKeys').copy();

  // do it this way instead of using store.createRecord() to isolate the
  // method call.
  storeKey = Record.storeKeyFor("bar");
  json     = {  guid: "bar", foo: "bar" };
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);

  assert.equal(recs.get('needsFlush'), false, 'PRECOND - should not need flush');
  assert.deepEqual(recs.get('storeKeys'), orig, 'PRECOND - storeKeys should not have changed yet');

  recs.storeDidChangeStoreKeys([storeKey], SC.Set.create().add(Record));

  orig.push(storeKey); // update - must be last b/c id.bar.storeKey < id.foo.storeKey
  assert.equal(recs.get('needsFlush'), false, 'should not need flush anymore');
  assert.deepEqual(recs.get('storeKeys'), orig, 'storeKeys should now be updated - rec1[%@]{%@} = %@, rec2[%@]{%@} = %@'.fmt(
    rec.get('id'), rec.get('storeKey'), rec,

    store.materializeRecord(storeKey).get('id'),
    storeKey,
    store.materializeRecord(storeKey)));

});

test("calling storeDidChangeStoreKeys() with a non-matching recordType", function (assert) {

  var Foo = Record.extend(),
      Bar = Record.extend();

  storeKey = Foo.storeKeyFor('foo2');
  json = { guid: "foo2" };

  store.writeDataHash(storeKey, json, Record.READY_CLEAN);

  query = Query.create({ recordType: Foo });
  recs = RecordArray.create({ store: store, query: query });

  assert.equal(recs.get('length'), 1, 'should have a Foo record');

  // now simulate adding a Bar record
  storeKey = Bar.storeKeyFor('bar');
  json = { guid: "bar" };
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);

  recs.storeDidChangeStoreKeys([storeKey], SC.Set.create().add(Bar));
  assert.equal(recs.get('needsFlush'), false, 'should not have indicated it needed a flush');

});

test("calling storeDidChangeStoreKeys() to remove a record", function (assert) {

  assert.equal(recs.get('length'), 1, 'PRECOND - should have storeKey');

  store.writeStatus(storeKey, Record.DESTROYED_CLEAN);
  assert.equal(recs.get('storeKeys').length, 1, 'should still have storeKey');
  recs.storeDidChangeStoreKeys([storeKey], SC.Set.create().add(Record));

  assert.equal(recs.get('length'), 0, 'should remove storeKey on flush()');
});

test("calling storeDidChangeStoreKeys() with a matching recordType should not unnecessarily call enumerableContentDidChange", function (assert) {
  // do initial setup
  recs.flush();
  fooRecs.flush();

  recsController.set('bigCost', false);
  fooRecsController.set('bigCost', false);

  // do it this way instead of using store.createRecord() to isolate the
  // method call.
  storeKey = Record.storeKeyFor("bar");
  json     = {  guid: "bar", foo: "bar" };
  store.writeDataHash(storeKey, json, Record.READY_CLEAN);

  assert.equal(recsController.get('bigCost'), false, 'PRECOND - recsController should not have spent big cost');
  assert.equal(fooRecsController.get('bigCost'), false, 'PRECOND - fooRecsController should not have spent big cost');

  recs.storeDidChangeStoreKeys([storeKey], SC.Set.create().add(Record));
  fooRecs.storeDidChangeStoreKeys([storeKey], SC.Set.create().add(Record));

  assert.equal(recsController.get('bigCost'), true, 'recsController should have spent big cost');
  assert.equal(fooRecsController.get('bigCost'), false, 'fooRecsController should not have spent big cost');
});

test("adding an array observer to a RecordArray should cause the array to flush", function (assert) {
  var callCount = 0;

  recs.addArrayObservers({
    didChange: function() {
      callCount++;
    },

    willChange: function() { }
  });

  recs.get('length');

  assert.equal(callCount, 0, "does not cause array observers to be fired when getting length");
});


// ..........................................................
// SPECIAL CASES
//

var json2, foo, bar ;

module("RecordArray core methods", {
  beforeEach: function() {
    // setup dummy store
    store = Store.create();

    storeKey = Record.storeKeyFor('foo');
    json = {  guid: "foo", name: "foo" };
    store.writeDataHash(storeKey, json, Record.READY_CLEAN);
    foo = store.materializeRecord(storeKey);
    assert.equal(foo.get('name'), 'foo', 'record should have json');

    storeKey = Record.storeKeyFor('bar');
    json2 = { guid: "bar", name: "bar" };
    store.writeDataHash(storeKey, json2, Record.READY_CLEAN);
    bar = store.materializeRecord(storeKey);
    assert.equal(bar.get('name'), 'bar', 'record should have json');

    // get record array.
    query = Query.create({ recordType: Record, orderBy: 'name' });
    recs = store.find(query);
  }
});

test("local query should notify changes", function (assert) {
  // note: important to retrieve records from RecordArray first to prime
  // any cache
  assert.deepEqual(recs.mapProperty('id'), ['bar', 'foo'], 'PRECOND - bar should appear before foo');

  stopIt = true;

  SC.RunLoop.begin();
  bar.set('name', 'zzbar');
  SC.RunLoop.end(); // should resort record array

  assert.deepEqual(recs.mapProperty('id'), ['foo', 'bar'], 'order of records should change');
});



