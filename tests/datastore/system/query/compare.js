// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";
// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, rec6, rec7, rec8,
rec9, rec10, rec11, rec12, rec13, rec14, rec15, rec16, rec17, rec18, rec19, rec20,
MyApp, q;

module("Query comparison of records", {
  beforeEach: function() {

    SC.RunLoop.begin();

    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });

    MyApp.Address = Record.extend({});

    // setup a dummy model
    MyApp.Foo = Record.extend({
      address: Record.toOne(MyApp.Address, { nested: true })
    });

    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", year: 1974, address: { guid: 2, street: "2 Street" } },
      { guid: 2, firstName: "Jane", lastName: "Doe", year: 1975, address: { guid: 1, street: "1 Street" } },
      { guid: 3, firstName: "Emily", lastName: "Parker", year: 1975, active: null },
      { guid: 4, firstName: "Johnny", lastName: "Cash", active: false },
      { guid: 5, firstName: "Bert", lastName: "Berthold", active: true }
    ]);

    SC.RunLoop.end();

    rec1 = MyApp.store.find(MyApp.Foo,1);
    rec2 = MyApp.store.find(MyApp.Foo,2);
    rec3 = MyApp.store.find(MyApp.Foo,3);
    rec4 = MyApp.store.find(MyApp.Foo,4);
    rec5 = MyApp.store.find(MyApp.Foo,5);
    rec6 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Clark", lastName: "Douglas", active: true });
    rec7 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Amy", lastName: "Simmons", active: true });
    rec8 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Fred", lastName: "Chambers", active: false });
    rec9 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Mari", lastName: "Chambers", active: false });
    rec10 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Glenn", lastName: "Armour", active: true });
    rec11 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Jake", lastName: "Timmons", active: true });
    rec12 = MyApp.store.createRecord(MyApp.Foo, { firstName: "John", lastName: "Fitzgerald", active: true });
    rec13 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Carly", lastName: "Anderson", active: true });
    rec14 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Clark", lastName: "Thompson", active: true });
    rec15 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Indi", lastName: "Karish", active: true });
    rec16 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Yi Jia", lastName: "Li", active: true });
    rec17 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Marcel", lastName: "Frontenac", active: true });
    rec18 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Amie", lastName: "Frontenac", active: true });
    rec19 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Amelie", lastName: "Auguste", active: true });
    rec20 = MyApp.store.createRecord(MyApp.Foo, { firstName: "Percy", lastName: "Douglas", active: true });

    q = Query.create();
  },

  afterEach: function () {
    Record.subclasses = SC.Set.create();
  }
});


// ..........................................................
// TESTS
//

test("parse() should work with conditions = null", function (assert) {
  assert.expect(0);
  q.parse();
});

test("building the order", function (assert) {
  // undefined orderBy
  q.orderBy = null;
  q.parse();
  assert.equal(q._order.length, 0, 'order should be empty');

  // empty orderBy
  q.orderBy = "";
  q.parse();
  assert.equal(q._order.length, 0, 'order should be empty');

  // single property
  q.orderBy = "firstName";
  q.parse();
  assert.equal(q._order[0].propertyName,'firstName', 'propertyName should be firstName');

  // more properties
  q.orderBy = "lastName, firstName";
  q.parse();
  assert.equal(q._order[0].propertyName,'lastName', 'propertyName should be lastName');
  assert.equal(q._order[1].propertyName,'firstName', 'propertyName should be firstName');

  // more properties with direction
  q.orderBy = "lastName, firstName, year DESC";
  q.parse();
  assert.equal(q._order[0].propertyName,'lastName', 'propertyName should be lastName');
  assert.ok(!q._order[0].descending, 'descending should be false');
  assert.equal(q._order[1].propertyName,'firstName', 'propertyName should be firstName');
  assert.ok(!q._order[1].descending, 'descending should be false');
  assert.equal(q._order[2].propertyName,'year', 'propertyName should be year');
  assert.ok(q._order[2].descending, 'descending should be true');
});

test("no order should result in comparison by guid", function (assert) {
  q.orderBy = null;
  q.parse();
  assert.equal(q.compare(rec1,rec2), -1, 'guid 1 should be before guid 2');
});

/**
  This test was added to prove new code that switched from ordering by guid
  if there is no orderBy property on the query to ordering by storeKey if
  there is no orderBy property.  The reason is that new records that haven't
  been committed may not have a guid and therefore comparing null to null
  would result in the order changing slightly in Chrome when the array length
  grew over 10 items long.  For some reason if every comparison in the sort
  returns 0, the first item and second item swap places and then the new first
  and the middle item swap places (or vice versa).  If you get objectAt(0) on
  this type of RecordArray, it cycles between three different values.

  See it in action in Chrome 17.0 on Mac:

  > [0,1,2,3,4,5,6,7,8,9].sort(function(a,b) { return 0; })
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
  > [0,1,2,3,4,5,6,7,8,9,10].sort(function(a,b) { return 0; })
    [5, 0, 2, 3, 4, 1, 6, 7, 8, 9, 10]
    // WTF?  So the next time the RecordArray flushes its array will be
    // [5, 0, 2, 3, 4, 1, 6, 7, 8, 9, 10] and it keeps changing each flush.
  > [5, 0, 2, 3, 4, 1, 6, 7, 8, 9, 10].sort(function(a,b) { return 0; })
    [1, 5, 2, 3, 4, 0, 6, 7, 8, 9, 10]
*/
test("storeKeys should maintain order between repeat calls to orderStoreKeys even if the array is longer than 10 items and the matching records have no ids", function (assert) {
  var records,
      storeKeysSorted1,
      storeKeysSorted2,
      storeKeys;

  q.orderBy = null;
  q.parse();

  records = MyApp.store.find(MyApp.Foo);
  records.flush();

  storeKeys = records.get('storeKeys');
  storeKeysSorted1 = Query.orderStoreKeys(records.get('storeKeys'), q, MyApp.store).copy();
  storeKeysSorted2 = Query.orderStoreKeys(records.get('storeKeys'), q, MyApp.store).copy();
  assert.deepEqual(storeKeysSorted1, storeKeysSorted2, 'Each time you call orderStoreKeys, it should return the same order if the storeKeys haven\'t changed');
});

test("comparing non existent properties", function (assert) {
  q.orderBy = "year";
  q.parse();
  assert.equal(q.compare(rec5,rec1), -1, 'null should be before 1974');
});

test("comparing null and boolean properties", function (assert) {
  q.orderBy = "active";
  q.parse();
  assert.equal(q.compare(rec3,rec4), -1, 'null should be before false');
  assert.equal(q.compare(rec4,rec5), -1, 'false should be before true');
});

test("comparing number properties", function (assert) {
  q.orderBy = "year";
  q.parse();
  assert.equal(q.compare(rec1,rec2), -1, '1974 should be before 1975');

  q.orderBy = "year DESC";
  q.parse();
  assert.equal(q.compare(rec1,rec2), 1, '1974 should be after 1975 with DESC');
});


test("comparing string properties", function (assert) {
  q.orderBy = "firstName";
  q.parse();
  assert.equal(q.compare(rec1,rec2), 1, 'John should be after Jane');

  q.orderBy = "firstName DESC";
  q.parse();
  assert.equal(q.compare(rec1,rec2), -1, 'John should be before Jane with DESC');
});

test("comparing by equal properties should use guid for order", function (assert) {
  q.orderBy = "lastName";
  q.parse();
  assert.equal(q.compare(rec1,rec2), -1, 'guid 1 should be before guid 2');
});

test("specifying a custom orderBy comparison function", function (assert) {
  var usedCustomFunction = false;
  q.orderBy = function(rec1, rec2) {
    // We'll be explicit about our use of a custom comparison function, in
    // addition to returning later years first.
    usedCustomFunction = true;
    return SC.compare(rec2.get('year'), rec1.get('year'));
  };
  q.parse();
  assert.equal(q.compare(rec1,rec2), 1, 'guid 2 should be before guid 1');
  assert.equal(usedCustomFunction, true, 'we should have used our custom comparison function');
});

test("compare by custom query comparison", function (assert) {
  var usedQueryComparison = false;
  Query.registerComparison('firstName', function (r1, r2) {
    usedQueryComparison = true;
    return SC.compare(r2, r1);
  });
  q.orderBy = 'firstName';
  q.parse();
  assert.equal(q.compare(rec1,rec2), -1, 'Jane should be after John');
  assert.equal(usedQueryComparison, true, 'we should have used our query comparison function');
});

test('comparing through association', function (assert) {
  q.orderBy = 'address.street'
  q.parse();
  assert.equal(q.compare(rec1,rec2), 1, 'guid 2 should be before guid 1');
});

test('comparing through association with custom comparison', function (assert) {
  Query.registerComparison('address.street', function (r1, r2) {
    return SC.compare(r1, r2);
  });
  q.orderBy = 'address.street';
  q.parse();
  assert.equal(q.compare(rec1,rec2), 1, 'guid 2 should be before guid 1');
});
