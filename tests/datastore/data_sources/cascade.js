// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test Sample */

import { Record, Store, DataSource, CascadeDataSource} from '../../../datastore/datastore.js';
import { SC } from '../../../core/core.js';

var store;

module("CascadeDataSource", {
  beforeEach: function () {
    SC.RunLoop.begin();

    var Sample = (window.Sample = SC.Object.create());

    Sample.FooDataSource = DataSource.extend({
      commitRecords: function (st, createStoreKeys, updateStoreKeys, destroyStoreKeys, params) {
        assert.equal(store, st, "should equal store");
        assert.equal(0, createStoreKeys[0], "should equal [0]");
        assert.equal(1, updateStoreKeys[0], "should equal [1]");
        assert.equal(2, destroyStoreKeys[0], "should equal [2]");
        assert.equal('world', params.hello, 'should equal { hello: "world" }');
        return true;
      },

      retrieveRecords: function () {
        assert.ok(true, "retrieveRecords should be handled by baz");
        return false;
      },

      fetch: function (store, query) {
        assert.ok(true, "fetch should be handled by bar");
        return false;
      },

      cancel: function (st, storeKeys) {
        assert.equal(store, st, "should equal store");
        assert.equal(1, storeKeys[0], "should equal [1]");
        return false;
      }
    });
    Sample.fooDataSource = Sample.FooDataSource.create();

    Sample.BarDataSource = DataSource.extend({
      commitRecords: function () {
        assert.ok(false, "should never be called, since foo handles commitRecords first");
        return false;
      },

      retrieveRecords: function () {
        assert.ok(true, "retrieveRecords should be handled by baz");
        return false;
      },

      fetch: function (st, query) {
        assert.equal(store, st, "should equal store");
        assert.equal('query', query, "should equal 'query'");
        return true;
      }
    });
    Sample.barDataSource = Sample.BarDataSource.create();

    Sample.BazDataSource = DataSource.extend({
      commitRecords: function () {
        assert.ok(false, "should never be called, since foo handles commitRecords first");
        return false;
      },

      retrieveRecords: function (st, storeKeys, ids) {
        assert.equal(store, st, "should equal store");
        assert.equal(0, storeKeys[0], "should equal [0]");
        assert.equal("id", ids[0], 'should equal ["id"]');
        return true;
      },

      fetch: function () {
        assert.ok(false, "should never be called, since bar handles fetch first");
        return false;
      }
    });
    Sample.bazDataSource = Sample.BazDataSource.create();

    Sample.dataSource = CascadeDataSource.create({
      dataSources: "foo bar baz".w(),

      foo: Sample.fooDataSource,
      bar: Sample.barDataSource,
      baz: Sample.bazDataSource
    });

    store = Store.create({ dataSource: Sample.dataSource });
  },

  afterEach: function () {
    SC.RunLoop.end();
  }
});

test("Verify dataSources points to the actual dataSource", function (assert) {
  var dataSource = Sample.dataSource;
  assert.equal(dataSource.dataSources[0], dataSource.foo, 'should equal data source foo');
  assert.equal(dataSource.dataSources[1], dataSource.bar, 'should equal data source bar');
  assert.equal(dataSource.dataSources[2], dataSource.baz, 'should equal data source baz');
});

test("Verify dataSources added using 'from' are appended in order", function (assert) {
  Sample.dataSource = CascadeDataSource.create()
       .from(Sample.fooDataSource)
       .from(Sample.barDataSource)
       .from(Sample.bazDataSource);

  var dataSource = Sample.dataSource;
  assert.equal(dataSource.dataSources[0], Sample.fooDataSource, 'should equal data source foo');
  assert.equal(dataSource.dataSources[1], Sample.barDataSource, 'should equal data source bar');
  assert.equal(dataSource.dataSources[2], Sample.bazDataSource, 'should equal data source baz');
});

test("Verify dataSource returns 'true' when handled by a child dataSource for commitRecords", function (assert) {
  assert.ok(Sample.dataSource.commitRecords(store, [0], [1], [2], { hello: "world" }),
     "commitRecords should be handled by foo");
});

test("Verify dataSource returns 'true' when handled by a child dataSource for fetch", function (assert) {
  assert.ok(Sample.dataSource.fetch(store, 'query'), "fetch should be handled by bar");
});

test("Verify dataSource returns 'true' when handled by a child dataSource for retrieveRecords", function (assert) {
  assert.ok(Sample.dataSource.retrieveRecords(store, [0], ['id']), "retrieveRecords should be handled by baz");
});

test("Verify dataSource returns 'false' when not handled by a child dataSource", function (assert) {
  assert.ok(!Sample.dataSource.cancel(store, [1]), "cancel should be handled by no data source");
});
