// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";
// ..........................................................
// UTILITIES
//

var TestRecord, TestRecord2;
var loc;

function queryEquals(q, location, recordType, conditions, extra, desc) {
  if (desc===undefined && typeof extra === 'string') {
    desc = extra;  extra = undefined ;
  }
  if (!desc) desc = '';

  assert.ok(!!q, desc + ': should have a query');
  assert.equal(q.get('isFrozen'), true, desc + ": should be frozen");

  if (q) {
    if (location) {
      assert.equal(q.get('location'), location, desc + ": should have location");
    }

    if (recordType && recordType.isEnumerable) {
      assert.deepEqual(q.get('recordTypes'), recordType, desc + ': should have recordTypes (plural)');
    } else {
      assert.equal(q.get('recordType'), recordType, desc + ': should have recordType (singular)');
    }

    if (location === 'local') {
      assert.equal(q.get('conditions'), conditions, desc + ': should have conditions');
    }

    if (extra) {
      for (var key in extra) {
        if (!extra.hasOwnProperty(key)) continue;
        assert.equal(q.get(key), extra[key], desc + ': should have extra key ' + key);
      }
    }
  }
}

// ..........................................................
// BASIC TESTS
//


module("Query.local()", {
  beforeEach: function() {
    window.TestRecord = TestRecord = Record.extend();
    window.TestRecord2 = TestRecord2 = Record.extend();;
    loc = 'local';
  },

  afterEach: function() {
    window.TestRecord = window.TestRecord2 = null; // cleanup
    Record.subclasses = SC.Set.create(); // reset 
  }
});

function invokeWith() {
  return Query[loc].apply(Query, arguments);
}

test("basic query with just record type", function (assert) {
  var q, q1, q2, q3, q4;

  // local
  q = invokeWith(TestRecord);
  queryEquals(q, loc, TestRecord, null, 'first query');

  q1 = invokeWith(TestRecord);
  assert.equal(q1, q, 'second call should return cached value');

  // using string for record type name should work
  q2 = invokeWith("TestRecord");
  assert.equal(q2, q, 'queryFor with string should return cached value');

  // using an array of a single item should be treated as a single item
  q3 = invokeWith([TestRecord]);
  assert.equal(q3, q, 'queryFor([TestRecord]) should return cached value');

  // ditto w/ strings
  q4 = invokeWith(['TestRecord']);
  assert.equal(q4, q, 'queryFor(["TestRecord"]) with string should return cached value');

});

test("query with multiple recordtypes", function (assert) {

  var types = [TestRecord, TestRecord2],
      q1, q2, q3, q4, q5, set;

  // create first query
  q1 = invokeWith(types);
  queryEquals(q1, loc, types, null, 'first query');

  // try again - should get cache
  q2 = invokeWith(types);
  assert.equal(q2, q1, 'second queryFor call should return cached value');

  // try again - different order
  q3 = invokeWith([TestRecord2, TestRecord]);
  assert.equal(q3, q1, 'queryFor with different order of record types should return same cached value');

  // try again - using a set
  set = SC.Set.create().add(TestRecord).add(TestRecord2);
  q4  = invokeWith(set);
  assert.equal(q4, q1, 'should return cached query even if using an enumerable for types');

  // try again using strings
  q5 = invokeWith('TestRecord TestRecord2'.w());
  assert.equal(q5, q1, 'should return cached query even if string record names are used');
});

test("query with record type and conditions", function (assert) {

  var q1, q2, q3, q4, q5, q6, q7;

  q1 = invokeWith(TestRecord, 'foobar');
  queryEquals(q1, loc, TestRecord, 'foobar', 'first query');

  q2 = invokeWith(TestRecord, 'foobar');
  assert.equal(q2, q1, 'second call to queryFor(TestRecord, foobar) should return cached instance');

  q3 = invokeWith(TestRecord2, 'foobar');
  queryEquals(q3, loc, TestRecord2, 'foobar', 'query(TestRecord2, foobar)');
  assert.ok(q3 !== q1, 'different recordType same conditions should return new query');

  q4 = invokeWith(TestRecord, 'baz');
  queryEquals(q4, loc, TestRecord, 'baz', 'query(TestRecord2, baz)');
  assert.ok(q4 !== q1, 'different conditions should return new query');

  q5 = invokeWith(TestRecord, 'baz');
  assert.equal(q5, q4, 'second call for different conditions should return cache');
});

test("query with record types and conditions hash", function (assert) {

  var q = invokeWith([TestRecord, TestRecord2], {});
  queryEquals(q, loc, [TestRecord, TestRecord2], null, 'first query');

});

test("query with no record type and with conditions", function (assert) {
  var q1, q2;

  q1 = invokeWith(null, 'foobar');
  queryEquals(q1, loc, Record, 'foobar', 'first query');

  q2 = invokeWith(null, 'foobar');
  assert.equal(q2, q1, 'should return cached value');
});

test("query with recordtype, conditions, and parameters hash", function (assert) {
  var opts  = { opt1: 'bar', opt2: 'baz' },
      q1, q2;

  q1 = invokeWith(TestRecord, 'foo', opts);
  queryEquals(q1, loc, TestRecord, 'foo', { parameters: opts }, 'first query');

  q2 = invokeWith(TestRecord, 'foo', opts);
  assert.ok(q1 !== q2, 'second call to queryFor with opts cannot be cached');
  queryEquals(q1, loc, TestRecord, 'foo', { parameters: opts }, 'second query');
});

test("query with recordtype, conditions, and parameters array", function (assert) {
  var opts  = ['foo', 'bar'],
      q1, q2;

  q1 = invokeWith(TestRecord, 'foo', opts);
  queryEquals(q1, loc, TestRecord, 'foo', { parameters: opts }, 'first query should include parameters prop');

  q2 = invokeWith(TestRecord, 'foo', opts);
  assert.ok(q1 !== q2, 'second call to queryFor with opts cannot be cached');
  queryEquals(q1, loc, TestRecord, 'foo', { parameters: opts }, 'second query');
});

test("passing query object", function (assert) {

  var local = Query.local(TestRecord),
      remote = Query.remote(TestRecord),
      q;

  q = invokeWith(local);
  assert.equal(q, local, 'invoking with local query should return same query');
  assert.equal(q.get('location'), loc, 'query should have expected location');

  q = invokeWith(remote);
  assert.ok(q !== remote, 'invoke with remote query should return new instance');
  assert.equal(q.get('location'), loc, 'query should have expected location');
});

test("no options (matches everything)", function (assert) {
  var q1, q2;

  q1 = invokeWith();
  queryEquals(q1, loc, Record, null, 'first query - matches everything');

  q2 = invokeWith();
  assert.equal(q2, q1, 'should return same cached query');

});


module("Query.remote()", {
  beforeEach: function() {
    window.TestRecord = TestRecord;
    window.TestRecord2 = TestRecord2;
    loc = 'remote';
  },

  afterEach: function() {
    window.TestRecord = window.TestRecord2 = null; // cleanup
  }
});

// function invokeWith() {
//   return Query[loc].apply(Query, arguments);
// }

test("basic query with just record type", function (assert) {
  var q, q1, q2, q3, q4;

  // local
  q = invokeWith(TestRecord);
  queryEquals(q, loc, TestRecord, null, 'first query');

  q1 = invokeWith(TestRecord);
  assert.equal(q1, q, 'second call should return cached value');

  // using string for record type name should work
  q2 = invokeWith("TestRecord");
  assert.equal(q2, q, 'queryFor with string should return cached value');

  // using an array of a single item should be treated as a single item
  q3 = invokeWith([TestRecord]);
  assert.equal(q3, q, 'queryFor([TestRecord]) should return cached value');

  // ditto w/ strings
  q4 = invokeWith(['TestRecord']);
  assert.equal(q4, q, 'queryFor(["TestRecord"]) with string should return cached value');

});

test("query with multiple recordtypes", function (assert) {

  var types = [TestRecord, TestRecord2],
      q1, q2, q3, q4, q5, set;

  // create first query
  q1 = invokeWith(types);
  queryEquals(q1, loc, types, null, 'first query');

  // try again - should get cache
  q2 = invokeWith(types);
  assert.equal(q2, q1, 'second queryFor call should return cached value');

  // try again - different order
  q3 = invokeWith([TestRecord2, TestRecord]);
  assert.equal(q3, q1, 'queryFor with different order of record types should return same cached value');

  // try again - using a set
  set = SC.Set.create().add(TestRecord).add(TestRecord2);
  q4  = invokeWith(set);
  assert.equal(q4, q1, 'should return cached query even if using an enumerable for types');

  // try again using strings
  q5 = invokeWith('TestRecord TestRecord2'.w());
  assert.equal(q5, q1, 'should return cached query even if string record names are used');
});

test("query with record type and options", function (assert) {

  var q1, q2, q3, q4, q5, q6, q7,
    opts = { foo: 'bar' };

  q1 = invokeWith(TestRecord, opts);
  queryEquals(q1, loc, TestRecord, opts, 'first query');

  q2 = invokeWith(TestRecord, opts);
  assert.ok(q2 !== q1, 'second call to queryFor(TestRecord, opts) should return new instance');

  q3 = invokeWith(TestRecord2, opts);
  queryEquals(q3, loc, TestRecord2, 'foobar', 'query(TestRecord2, foobar)');
  assert.ok(q3 !== q1, 'different recordType same options should return new query');

  q4 = invokeWith(TestRecord, {});
  queryEquals(q4, loc, TestRecord, 'baz', 'query(TestRecord2, baz)');
  assert.ok(q4 !== q1, 'different options should return new query');

  q5 = invokeWith(TestRecord, {});
  assert.ok(q5 !== q4, 'second call for different options should return new query');
});

test("query with record types and options hash", function (assert) {

  var q = invokeWith([TestRecord, TestRecord2], {});
  queryEquals(q, loc, [TestRecord, TestRecord2], null, 'first query');

});

test("passing query object", function (assert) {

  var local = Query.local(TestRecord),
      remote = Query.remote(TestRecord),
      q;

  q = invokeWith(local);
  assert.ok(q !== local, 'invoke with local query should return new instance');
  assert.equal(q.get('location'), loc, 'query should have expected location');

  q = invokeWith(remote);
  assert.equal(q, remote, 'invoking with remote query should return same query');
  assert.equal(q.get('location'), loc, 'query should have expected location');
});

test("no options (matches everything)", function (assert) {
  var q1, q2;

  q1 = invokeWith();
  queryEquals(q1, loc, Record, null, 'first query - matches everything');

  q2 = invokeWith();
  assert.equal(q2, q1, 'should return same cached query');

});
