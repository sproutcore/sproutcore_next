// ==========================================================================
// Project:   DataSource Unit Test
// Copyright: ©2011 Junction Networks and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals JN module test ok equals same stop start */

import { Record, Store, DataSource, Query, MIXED_STATE } from '../../../datastore/datastore.js';
import { SC } from '../../../core/core.js';

var MyApp, wasCalled, resetWasCalled;
module("DataSource", {
  beforeEach: function () {
    MyApp = window.MyApp = {};
    MyApp.store = Store.create();
    MyApp.Foo = Record.extend();

    MyApp.DataSource = DataSource.extend({
      fetch: function (store, query) {
        wasCalled = true;
        assert.equal(arguments.length, 2);
        return true;
      },

      createRecord: function (store, storeKey, params) {
        wasCalled = true;
        assert.equal(arguments.length, 3);
        return true;
      },

      updateRecord: function (store, storeKey, params) {
        wasCalled = true;
        assert.equal(arguments.length, 3);
        return true;
      },

      retrieveRecord: function (store, storeKey, params) {
        wasCalled = true;
        assert.equal(arguments.length, 3);
        return true;
      },

      destroyRecord: function (store, storeKey, params) {
        wasCalled = true;
        assert.equal(arguments.length, 3);
        return true;
      },

      reset: function() {
        resetWasCalled = true;
        return this;
      }
    });
    SC.RunLoop.begin();
  },

  afterEach: function () {
    SC.RunLoop.end();
  }
});

test("The dataSource will forward calls to the appropriate methods", function (assert) {
  var ds = MyApp.DataSource.create();
  MyApp.store.set('dataSource', ds);
  assert.ok(MyApp.store.find(Query.remote(MyApp.Foo)),
     "the fetch should return a record array");
  assert.ok(wasCalled, "`fetch` should have been called");
  wasCalled = false;

  assert.ok(MyApp.store.find(MyApp.Foo, "testing retrieve"),
     "retrieve should return a new record (because the dataSource handled the request true)");
  assert.ok(wasCalled, "`retrieve` should have been called");
  wasCalled = false;

  var rec = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), true,
         "commiting a new record should return true");
  assert.ok(wasCalled, "`createRecord` should have been called");
  wasCalled = false;

  MyApp.store.writeStatus(rec.get('storeKey'), Record.READY_CLEAN);

  rec.set('zero', 0);
  assert.equal(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), true,
         "updating a record should return true");
  assert.ok(wasCalled, "`updateRecord` should have been called");
  wasCalled = false;

  MyApp.store.writeStatus(rec.get('storeKey'), Record.READY_CLEAN);

  rec.destroy();
  // broken in Store
  assert.equal(MyApp.store.commitRecord(MyApp.Foo, 'foo', rec.get('storeKey')), true,
     "destroying the record should return true");
  assert.ok(wasCalled, "`destroyRecord` should have been called");
});

test("The dataSource will return true when all records committed return true", function (assert) {
  var ds = MyApp.DataSource.create({
    createRecord: function () { return true; },
    updateRecord: function () { return true; },
    destroyRecord: function () { return true; }
  });

  MyApp.store.set('dataSource', ds);

  var rec1 = MyApp.store.createRecord(MyApp.Foo, {}),
      rec2, rec3;

  assert.equal(MyApp.store.commitRecords(), true,
         "commiting a single new record should return true");

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);

  rec1.set('zero', 0);
  rec2 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), true,
         "commiting records for an 'update' and 'create' should return true");

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);
  MyApp.store.writeStatus(rec2.get('storeKey'), Record.READY_CLEAN);

  rec1.destroy();
  rec2.set('one', 1);
  rec3 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), true,
         "commiting records for an 'update', 'create', and 'destroy' should return true");
});

test("The dataSource will return MIXED_STATE when all records committed return true and false", function (assert) {
  var ds = MyApp.DataSource.create({
    createRecord: function () { return false; },
    updateRecord: function () { return true; },
    destroyRecord: function () { return false; }
  });

  MyApp.store.set('dataSource', ds);

  var rec1 = MyApp.store.createRecord(MyApp.Foo, {}),
      rec2, rec3;

  assert.equal(MyApp.store.commitRecords(), false,
         "commiting a single new record should return false");

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);

  rec1.set('zero', 0);
  rec2 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), MIXED_STATE,
         "commiting records for an 'update' and 'create' should return %@".fmt(MIXED_STATE));

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);
  MyApp.store.writeStatus(rec2.get('storeKey'), Record.READY_CLEAN);

  rec1.destroy();
  rec2.set('one', 1);
  rec3 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), MIXED_STATE,
         "commiting records for an 'update', 'create', and 'destroy' should return %@".fmt(MIXED_STATE));
});

test("The dataSource will return false when all records committed return false", function (assert) {
  var ds = MyApp.DataSource.create({
    createRecord: function () { return false; },
    updateRecord: function () { return false; },
    destroyRecord: function () { return false; }
  });
  MyApp.store.set('dataSource', ds);

  var rec1 = MyApp.store.createRecord(MyApp.Foo, {}),
      rec2, rec3;

  assert.equal(MyApp.store.commitRecords(), false,
         "commiting a single new record should return false");

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);

  rec1.set('zero', 0);
  rec2 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), false,
         "commiting records for an 'update' and 'create' should return false");

  MyApp.store.writeStatus(rec1.get('storeKey'), Record.READY_CLEAN);
  MyApp.store.writeStatus(rec2.get('storeKey'), Record.READY_CLEAN);

  rec1.destroy();
  rec2.set('one', 1);
  rec3 = MyApp.store.createRecord(MyApp.Foo, {});

  assert.equal(MyApp.store.commitRecords(), false,
         "commiting records for an 'update', 'create', and 'destroy' should return false");
});

test("The store calls reset on the dataSource when reset", function (assert) {
  MyApp.store.set('dataSource', MyApp.DataSource.create());
  resetWasCalled = false; // Just to be sure

  MyApp.store.reset();
  assert.ok(resetWasCalled, "should have called reset");
});
