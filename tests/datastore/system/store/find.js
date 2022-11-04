// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query, DataSource } from "../../../../datastore/datastore.js";



// test querying through find() on the store
module("Query querying find() on a store", {
  beforeEach: function() {
    SC.RunLoop.begin();
    // setup dummy app and store
    window.MyApp = SC.Object.create({});

    // setup a dummy model
    MyApp.Foo = Record.extend();
    MyApp.Bar = Record.extend();

    // setup data source that just returns cached storeKeys
    MyApp.DataSource = DataSource.create({

      fetch: function(store, query) {
        this.query = query;
        this.store = store;
        this.fetchCount++ ;

        // used by tests to verify remote queries
        if (query.get('location') === Query.REMOTE) {
          if (query.get('recordType') === MyApp.Foo) {
            store.dataSourceDidFetchQuery(query, this.get('storeKeys'));
          }
        }

        return true ;
      },

      reset: function() {
        this.query = this.store = null ;
        this.fetchCount = this.prepareCount = 0 ;
      },

      fetchEquals: function(store, query, count, desc) {
        if (desc===undefined && typeof count === 'string') {
          desc = count;  count = undefined;
        }
        if (count===undefined) count = 1;

        assert.equal(this.store, store, desc + ': should get store');
        assert.equal(this.query, query, desc + ': should get query');
        assert.equal(this.fetchCount, count, desc + ': should get count');
      },

      destroyRecord: function(store, storeKey){
        store.dataSourceDidDestroy(storeKey);
        return true;
      }

    });

    MyApp.store = Store.create().from(MyApp.DataSource);

    var records = [
      { guid: 1, firstName: "John", lastName: "Doe", married: true },
      { guid: 2, firstName: "Jane", lastName: "Doe", married: false },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975, married: true },
      { guid: 4, firstName: "Johnny", lastName: "Cash", married: true },
      { guid: 5, firstName: "Bert", lastName: "Berthold", married: true }
    ];

    // load some data
    MyApp.DataSource.storeKeys = MyApp.store.loadRecords(MyApp.Foo, records);
    SC.RunLoop.end();

    SC.RunLoop.begin();
    // for sanity check, load two record types
    MyApp.store.loadRecords(MyApp.Bar, records);
    SC.RunLoop.end();

  },

  afterEach: function() {
    MyApp = null ;
    Record.subclasses.clear(); //reset
  }

});

// ..........................................................
// FINDING SINGLE RECORDS
//

test("find(recordType, id)", function (assert) {

  assert.equal(MyApp.store.find('MyApp.Foo', 1).get('firstName'), 'John', 'should return foo(1)');
  assert.equal(MyApp.store.find(MyApp.Foo, 1).get('firstName'), 'John', 'should return foo(1)');
});

test("find(record)", function (assert) {

  var rec1 = MyApp.store.find(MyApp.Foo, 1);
  assert.equal(MyApp.store.find(rec1), rec1, 'find(rec1) should return rec1');

  var rec2 = MyApp.store.chain().find(rec1);
  assert.ok(rec2 !== rec1, 'nested.find(rec1) should not return same instance');
  assert.equal(rec2.get('storeKey'), rec1.get('storeKey'), 'nested.find(rec1) should return same record in nested store');
});

// ..........................................................
// RECORD ARRAY CACHING
//

test("caching for a single store", function (assert) {
  var r1 = MyApp.store.find(MyApp.Foo);
  var r2 = MyApp.store.find(MyApp.Foo);
  assert.ok(!!r1, 'should return a record array');
  assert.ok(r1.isEnumerable, 'returned item should be enumerable');
  assert.equal(r1.get('store'), MyApp.store, 'return object should be owned by store');
  assert.equal(r2, r1, 'should return same record array for multiple calls');
});

test("find() caching for a chained store", function (assert) {
  var r1 = MyApp.store.find(MyApp.Foo);

  var child = MyApp.store.chain();
  var r2 = child.find(MyApp.Foo);
  var r3 = child.find(MyApp.Foo);

  assert.ok(!!r1, 'should return a record array from base store');
  assert.equal(r1.get('store'), MyApp.store, 'return object should be owned by store');

  assert.ok(!!r2, 'should return a recurd array from child store');
  assert.equal(r2.get('store'), child, 'return object should be owned by child store');

  assert.ok(r2 !== r1, 'return value for child store should not be same as parent');
  assert.equal(r3, r2, 'return value from child store should be the same after multiple calls');

  // check underlying queries
  assert.ok(!!r1.get('query'), 'record array should have a query');
  assert.equal(r2.get('query'), r1.get('query'), 'record arrays from parent and child stores should share the same query');
});

test("data source must get the right calls", function (assert) {
  var ds = MyApp.store.get('dataSource');

  ds.reset();
  var records = MyApp.store.find(MyApp.Foo);
  var q = Query.local(MyApp.Foo);
  ds.fetchEquals(MyApp.store, q, 'after fetch');
});

// ..........................................................
// RECORD PROPERTIES
//

test("should find records based on boolean", function (assert) {
  SC.RunLoop.begin();
  var q = Query.local(MyApp.Foo, "married=true");
  var records = MyApp.store.find(q);
  assert.equal(records.get('length'), 4, 'record length should be 4');
  SC.RunLoop.end();
});

test("should find records based on query string", function (assert) {

  SC.RunLoop.begin();
  var q = Query.local(MyApp.Foo, { conditions:"firstName = 'John'" });
  var records = MyApp.store.find(q);
  assert.equal(records.get('length'), 1, 'record length should be 1');
  assert.equal(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  SC.RunLoop.end();
});

test("should find records based on Query", function (assert) {
  var q = Query.create({
    recordType: MyApp.Foo,
    conditions:"firstName = 'Jane'"
  });

  var records = MyApp.store.find(q);

  assert.equal(records.get('length'), 1, 'record length should be 1');
  assert.equal(records.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');
});

test("modifying a record should update RecordArray automatically", function (assert) {
  var q    = Query.local(MyApp.Foo, "firstName = 'Jane'"),
      recs = MyApp.store.find(q);

  assert.equal(recs.get('length'), 1, 'record length should be 1');
  assert.equal(recs.objectAt(0).get('firstName'), 'Jane', 'name should be Jane');

  SC.RunLoop.begin();

  var r2 = MyApp.store.find(MyApp.Foo, 3);
  assert.ok(r2.get('firstName') !== 'Jane', 'precond - firstName is not Jane');
  r2.set('firstName', 'Jane');

  SC.RunLoop.end();

  assert.equal(recs.get('length'), 2, 'record length should increase');
  assert.deepEqual(recs.getEach('firstName'), ['Jane', 'Jane'], 'check all firstNames are Jane');

  // try the other direction...
  SC.RunLoop.begin();
  r2.set('firstName', 'Ester');
  SC.RunLoop.end();

  assert.equal(recs.get('length'), 1, 'record length should decrease');

});

test("should find records based on Query without recordType", function (assert) {

  var q = Query.local(Record, { conditions: "lastName = 'Doe'", orderBy: "firstName" });

  var records = MyApp.store.find(q);
  assert.equal(records.get('length'), 4, 'record length should be 4');

  assert.deepEqual(records.getEach('firstName'), 'Jane Jane John John'.w(), 'firstNames should match');
});

test("should find records within a passed record array", function (assert) {

  SC.RunLoop.begin();

  var q = Query.create({
    recordType: MyApp.Foo,
    conditions: "firstName = 'Emily'"
  });

  var recArray = MyApp.store.find(MyApp.Foo);
  var records  = recArray.find(q);

  assert.equal(records.get('length'), 1, 'record length should be 1');
  assert.equal(records.objectAt(0).get('firstName'), 'Emily', 'name should be Emily');

  SC.RunLoop.end();

});

test("sending a new store key array from the data source should update record array", function (assert) {

  var q       = Query.remote(MyApp.Foo),
      records = MyApp.store.find(q);

  SC.RunLoop.begin();
  assert.equal(records.get('length'), 5, 'record length should be 5');
  SC.RunLoop.end();

  var newStoreKeys = MyApp.DataSource.storeKeys.copy();
  newStoreKeys.pop();

  // .replace() will call .enumerableContentDidChange()
  SC.RunLoop.begin();
  MyApp.store.dataSourceDidFetchQuery(q, newStoreKeys);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 4, 'record length should be 4');

});


test("loading more data into the store should propagate to record array", function (assert) {

  var records = MyApp.store.find(MyApp.Foo);

  assert.equal(records.get('length'), 5, 'record length before should be 5');

  SC.RunLoop.begin();

  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);

  SC.RunLoop.end();

  assert.equal(records.get('length'), 6, 'record length after should be 6');
});

test("loading more data into the store should propagate to record array with query", function (assert) {

  var q = Query.local(MyApp.Foo, "firstName = 'John'"),
      records = MyApp.store.find(q);

  assert.equal(records.get('length'), 1, 'record length before should be 1');

  SC.RunLoop.begin();
  var newStoreKeys = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 10, firstName: "John", lastName: "Johnson" }
  ]);
  SC.RunLoop.end();

  // .replace() will call .enumerableContentDidChange()
  // and should fire original Query again
  assert.equal(records.get('length'), 2, 'record length after should be 2');

  // subsequent updates to store keys should also work
  SC.RunLoop.begin();
  var newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Norman" }
  ]);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 3, 'record length after should be 3');
});

test("Loading records after Query should show up", function (assert) {

  var q = Query.local(MyApp.Foo, "firstName = 'John'"),
      records = MyApp.store.find(q);

  assert.equal(records.get('length'), 1, 'record length should be 1');
  assert.equal(records.objectAt(0).get('firstName'), 'John', 'name should be John');

  var recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 3, 'record length should be 3');

  assert.equal(records.objectAt(0).get('firstName'), 'John', 'name should be John');
  assert.equal(records.objectAt(1).get('firstName'), 'John', 'name should be John');
  assert.equal(records.objectAt(2).get('firstName'), 'John', 'name should be John');
});

test("Loading records after getting empty record array based on Query should update", function (assert) {

  var q = Query.local(MyApp.Foo, "firstName = 'Maria'");
  var records = MyApp.store.find(q);
  assert.equal(records.get('length'), 0, 'record length should be 0');

  var recordsToLoad = [
    { guid: 20, firstName: "Maria", lastName: "Johnson" }
  ];

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Foo, recordsToLoad);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 1, 'record length should be 1');

  assert.equal(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
});

test("Changing a record should make it show up in RecordArrays based on Query", function (assert) {

  var q, records, record;

  q = Query.local(MyApp.Foo, "firstName = 'Maria'");
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 0, 'record length should be 0');

  SC.RunLoop.begin();
  record = MyApp.store.find(MyApp.Foo, 1);
  record.set('firstName', 'Maria');
  SC.RunLoop.end();

  assert.equal(records.get('length'), 1, 'record length should be 1');
  assert.equal(records.objectAt(0).get('firstName'), 'Maria', 'name should be Maria');
});

test("Deleting a record should make the RecordArray based on Query update accordingly", function (assert) {

  var q, records;

  q = Query.local(MyApp.Foo, "firstName = 'John'");
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 1, 'record length should be 1');

  SC.RunLoop.begin();
  records.objectAt(0).destroy();
  SC.RunLoop.end();

  assert.equal(records.get('length'), 0, 'record length should be 0');
});

test("Using find() with Query on store with no data source should work", function (assert) {

  var q, records, recordsToLoad;

  SC.RunLoop.begin();

  // create a store with no data source
  MyApp.store3 = Store.create();

  q = Query.local(MyApp.Foo, "firstName = 'John'");
  records = MyApp.store3.find(q);
  assert.equal(records.get('length'), 0, 'record length should be 0');

  recordsToLoad = [
    { guid: 20, firstName: "John", lastName: "Johnson" },
    { guid: 21, firstName: "John", lastName: "Anderson" },
    { guid: 22, firstName: "Barbara", lastName: "Jones" }
  ];

  MyApp.store3.loadRecords(MyApp.Foo, recordsToLoad);

  SC.RunLoop.end();

  assert.equal(records.get('length'), 2, 'record length should be 2');
});

test("Using orderBy in Query returned from find()", function (assert) {

  var q, records;

  q = Query.local(MyApp.Foo, { orderBy: "firstName ASC" });
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 5, 'record length should be 5');

  assert.deepEqual(records.getEach('firstName'), ["Bert", "Emily", "Jane", "John", "Johnny"], 'first name should be properly sorted');
});

test("Using orderBy in Query returned from find() and loading more records to original store key array", function (assert) {

  var q, records, newStoreKeys2;

  q = Query.local(MyApp.Foo, { orderBy:"firstName ASC" });
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 5, 'record length should be 5');

  assert.equal(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');
  assert.equal(records.objectAt(4).get('firstName'), 'Johnny', 'name should be Johnny');

  SC.RunLoop.begin();
  newStoreKeys2 = MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  SC.RunLoop.end();

  assert.equal(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  assert.equal(records.objectAt(1).get('firstName'), 'Bert', 'name should be Bert');
  assert.equal(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');

});


test("Using orderBy in Query and loading more records to the store", function (assert) {

  var q, records;

  SC.RunLoop.begin();
  q = Query.local(MyApp.Foo, { orderBy:"firstName ASC" });
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 5, 'record length should be 5');
  assert.equal(records.objectAt(0).get('firstName'), 'Bert', 'name should be Bert');

  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "Anna", lastName: "Petterson" }
  ]);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 6, 'record length should be 6');

  assert.equal(records.objectAt(0).get('firstName'), 'Anna', 'name should be Anna');
  assert.equal(records.objectAt(5).get('firstName'), 'Johnny', 'name should be Johnny');

});

test("Chaining find() queries", function (assert) {

  var q, records, q2, records2;

  q = Query.local(MyApp.Foo, "lastName='Doe'");
  records = MyApp.store.find(q);
  assert.equal(records.get('length'), 2, 'record length should be 2');

  q2 = Query.local(MyApp.Foo, "firstName='John'");
  records2 = records.find(q2);

  assert.equal(records2.get('length'), 1, 'record length should be 1');
  assert.equal(records2.objectAt(0).get('firstName'), 'John', 'name should be John');

});

test("Chaining find() queries and loading more records", function (assert) {

  var q, q2, records;

  SC.RunLoop.begin();
  q = Query.local(MyApp.Foo, "lastName='Doe'");
  q2 = Query.local(MyApp.Foo, "firstName='John'");

  records = MyApp.store.find(q).find(q2);
  assert.equal(records.get('length'), 1, 'record length should be 1');

  MyApp.store.loadRecords(MyApp.Foo, [
    { guid: 11, firstName: "John", lastName: "Doe" }
  ]);
  SC.RunLoop.end();

  assert.equal(records.get('length'), 2, 'record length should be 2');
});


module("create record");

test("creating record appears in future find()", function (assert) {
  var Rec, store, r;

  Rec = Record.extend({ title: Record.attr(String) });
  store = Store.create();

  SC.run(function() {
    store.loadRecords(Rec,
      [ { title: "A", guid: 1 },
        { title: "B", guid: 2 } ]);
  });

  assert.equal(store.find(Rec).get('length'), 2, 'should have two initial record');

  SC.run(function() {
    store.createRecord(Rec, { title: "C" });

    // NOTE: calling find() here should flush changes to the record arrays
    // so that find() always returns an accurate result
    r = store.find(Rec);
    assert.equal(r.get('length'), 3, 'should return additional record');
  });

  r = store.find(Rec);
  assert.equal(r.get('length'), 3, 'should return additional record');
});

