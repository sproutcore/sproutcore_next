// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, ok, equals, same, test, MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, ManyArray } from "../../../../datastore/datastore.js";


// test core array-mapping methods for ManyArray
var store, storeKey, storeId, rec, storeIds, recs, arrayRec, MyApp;
module("ManyArray core methods", {
  beforeEach: function() {

    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });

    // setup a dummy model
    MyApp.Foo = Record.extend({});

    SC.RunLoop.begin();

    // load some data
    storeIds = [1,2,3,4];
    MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe", age: 32 },
      { guid: 2, firstName: "Jane", lastName: "Doe", age: 30 },
      { guid: 3, firstName: "Emily", lastName: "Parker", age: 7 },
      { guid: 4, firstName: "Johnny", lastName: "Cash", age: 17 },
      { guid: 50, firstName: "Holder", fooMany: storeIds }
    ]);

    storeKey = MyApp.store.storeKeyFor(MyApp.Foo, 1);

    // get record
    rec = MyApp.store.materializeRecord(storeKey);
    storeId = rec.get('id');

    // get many array.
    arrayRec = MyApp.store.materializeRecord(MyApp.store.storeKeyFor(MyApp.Foo, 50));

    recs = ManyArray.create({
      record: arrayRec,
      propertyName: "fooMany",
      recordType: MyApp.Foo,
      isEditable: true
    });
    arrayRec.relationships = [recs];
  },

  afterEach: function() {
    SC.RunLoop.end();
  }
});

// ..........................................................
// LENGTH
//

test("should pass through length", function (assert) {
  assert.equal(recs.get('length'), storeIds.length, 'rec should pass through length');
});

test("changing storeIds length should change length of rec array also", function (assert) {

  var oldlen = recs.get('length');

  storeIds.pushObject(Store.generateStoreKey()); // change length

  assert.ok(storeIds.length > oldlen, 'precond - storeKeys.length should have changed');
  assert.equal(recs.get('length'), storeIds.length, 'rec should pass through length');
});

// ..........................................................
// objectAt
//

test("should materialize record for object", function (assert) {
  assert.equal(storeIds[0], storeId, 'precond - storeIds[0] should be storeId');
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');
});

test("reading past end of array length should return undefined", function (assert) {
  assert.equal(recs.objectAt(2000), undefined, 'recs.objectAt(2000) should be undefined');
});

/** Changed in Version 1.11
  Previously, you could modify the datahash's storeIds array directly because it was observed,
  however the act of observing the array adds the observable properties to it, which
  in effect alters the array. This is now prohibited and all access must be done through the
  proper KVO channels on the ManyArray.
  */
test("modifying the underlying storeId should *not* change the returned materialized record", function (assert) {

  // read record once to make it materialized
  var rec2 = recs.objectAt(1);

  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // create a new record.
  var newRec = MyApp.store.createRecord(MyApp.Foo, { guid: 5, firstName: "Fred" });
  var storeId2 = newRec.get('id');

  // add to beginning of storeKey array
  storeIds.unshiftObject(storeId2);
  recs.recordPropertyDidChange();

  assert.equal(recs.get('length'), 5, 'should now have length of 5');
  assert.equal(recs.objectAt(0), rec, 'objectAt(0) should return the old record still');
  assert.equal(recs.objectAt(1), rec2, 'objectAt(1) should return the old second record still');
});

test("reading a record not loaded in store should trigger retrieveRecord", function (assert) {
  var callCount = 0;

  // patch up store to record a call and to make it look like data is not
  // loaded.

  MyApp.store.removeDataHash(storeKey, Record.EMPTY);
  MyApp.store.retrieveRecord = function() { callCount++; };

  var rec = recs.objectAt(0);
  assert.equal(MyApp.store.readStatus(rec), Record.EMPTY, 'precond - storeKey must not be loaded');

  assert.equal(callCount, 1, 'store.retrieveRecord() should have been called');
});

// ..........................................................
// replace()
//

test("adding a record to the ManyArray should pass through storeIds", function (assert) {

  // read record once to make it materialized
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // create a new record.
  var rec2 = MyApp.store.createRecord(MyApp.Foo, { guid: 5, firstName: "rec2" });
  var storeId2 = rec2.get('id');

  // add record to beginning of record array
  recs.unshiftObject(rec2);

  // verify record array
  assert.equal(recs.get('length'), 5, 'should now have length of 2');
  assert.equal(recs.objectAt(0), rec2, 'recs.objectAt(0) should return new record');
  assert.equal(recs.objectAt(1), rec, 'recs.objectAt(1) should return old record');

  // verify storeKeys
  storeIds = arrayRec.readAttribute('fooMany'); // array might have changed
  assert.equal(storeIds.objectAt(0), storeId2, 'storeKeys[0] should return new storeKey');
  assert.equal(storeIds.objectAt(1), storeId, 'storeKeys[1] should return old storeKey');
});

// ..........................................................
// Property Observing
//

/** Changed in Version 1.11
  Previously, you could modify the datahash's storeIds array directly because it was observed,
  however the act of observing the array adds the observable properties to it, which
  in effect alters the array. This is now prohibited and all access must be done through the
  proper KVO channels on the ManyArray.
  */
test("changing the underlying storeIds should *not* notify observers of records", function (assert) {

  // setup observer
  var obj = SC.Object.create({
    cnt: 0,
    observer: function() { this.cnt++; }
  });
  recs.addObserver('[]', obj, obj.observer);

  // now modify storeKeys
  storeIds.pushObject(5);
  assert.equal(obj.cnt, 0, 'observer should not have fired after changing storeKeys directly');
});

/** Changed in Version 1.11
  Previously, you could modify the datahash's storeIds array directly because it was observed,
  however the act of observing the array adds the observable properties to it, which
  in effect alters the array. This is now prohibited and all access must be done through the
  proper KVO channels on the ManyArray.
  */
test("swapping storeIds array should change ManyArray and observers", function (assert) {

  // setup alternate storeKeys
  var rec2 = MyApp.store.createRecord(MyApp.Foo, { guid: 5, firstName: "rec2" });
  var storeId2 = rec2.get('id');
  var storeIds2 = [storeId2];

  // setup observer
  var obj = SC.Object.create({
    cnt: 0,
    observer: function() {
      this.cnt++;
    }
  });
  recs.addObserver('[]', obj, obj.observer);

  // read record once to make it materialized
  assert.equal(recs.objectAt(0), rec, 'recs.objectAt(0) should materialize record');

  // now swap storeKeys
  obj.cnt = 0 ;
  arrayRec.writeAttribute('fooMany', storeIds2);

  SC.RunLoop.begin();
  SC.RunLoop.end();

  // verify observer fired and record changed
  assert.equal(obj.cnt, 1, 'observer should have fired after swap');
  assert.equal(recs.get('length'), 1, 'should reflect new length');
  assert.equal(recs.objectAt(0), rec2, 'recs.objectAt(0) should return new rec');

  // modify storeKey2, make sure observer fires and content changes
  obj.cnt = 0;
  storeIds2.unshiftObject(storeId);
  assert.equal(obj.cnt, 0, 'observer should not have fired after direct edit');
  assert.equal(recs.get('length'), 2, 'should reflect new length still: DANGER!');
  assert.equal(recs.objectAt(0), rec2, 'recs.objectAt(0) should return old rec still');

});

test("reduced properties", function (assert) {
  assert.equal(recs.get('@sum(age)'), 32+30+7+17, 'sum reducer should return the correct value');
  assert.equal(recs.get('@max(age)'), 32, 'max reducer should return the correct value');
  assert.equal(recs.get('@min(age)'), 7, 'min reducer should return the correct value');
  assert.equal(recs.get('@average(age)'), (32+30+7+17)/4.0, 'average reducer should return the correct value');
});

test("Test that _findInsertionLocation returns the correct location.", function (assert) {
  var location,
    newRec,
    sortByFirstName = function (a, b) {
      if (a.get('firstName') == b.get('firstName')) return 0;
      else if (a.get('firstName') < b.get('firstName')) return -1;
      else return 1;
    };

  // Order the many array manually by firstName.
  arrayRec.set('fooMany', [3,2,1,4]);
  recs._records = null;
  recs.arrayContentDidChange(0, 4, 4);

  // Check the insertion location of a record that should appear first.
  newRec = SC.Object.create({ guid: 5, firstName: "Adam", lastName: "Doe", age: 15 });
  location = recs._findInsertionLocation(newRec, 0, recs.get('length') - 1, sortByFirstName);

  assert.equal(location, 0, "The insertion location should be");

  // Check the insertion location of a record that should appear in the middle.
  newRec = SC.Object.create({ guid: 5, firstName: "Farmer", lastName: "Doe", age: 95 });
  location = recs._findInsertionLocation(newRec, 0, recs.get('length') - 1, sortByFirstName);

  assert.equal(location, 1, "The insertion location should be");

  newRec = SC.Object.create({ guid: 5, firstName: "Jen", lastName: "Doe", age: 95 });
  location = recs._findInsertionLocation(newRec, 0, recs.get('length') - 1, sortByFirstName);

  assert.equal(location, 2, "The insertion location should be");

  newRec = SC.Object.create({ guid: 5, firstName: "Johnny", lastName: "Doe", age: 95 });
  location = recs._findInsertionLocation(newRec, 0, recs.get('length') - 1, sortByFirstName);

  assert.equal(location, 3, "The insertion location should be");

  // Check the insertion location of a record that should appear last.
  newRec = SC.Object.create({ guid: 5, firstName: "Zues", lastName: "Doe", age: 95 });
  location = recs._findInsertionLocation(newRec, 0, recs.get('length') - 1, sortByFirstName);

  assert.equal(location, 4, "The insertion location should be");
});

// ..........................................................
// New records
//

test("Test new record support. INCOMPLETE.", function (assert) {
  var newRec = MyApp.store.createRecord(MyApp.Foo, { firstName: "Adam", lastName: "Doe", age: 15 }),
    holder = MyApp.store.find(MyApp.Foo, 50);

  recs.set('supportNewRecords', false);
  try {
    recs.pushObject(newRec);
    assert.ok(false, "Should not be able to push a record without an id without supportNewRecords.");
  } catch (ex) {
    assert.ok(true, "Should not be able to push a record without an id without supportNewRecords.");
  }

  recs.set('supportNewRecords', true);
  try {
    recs.pushObject(newRec);
    assert.ok(true, "Should be able to push a record without an id normally.");
  } catch (ex) {
    assert.ok(false, "Should be able to push a record without an id normally.");
  }

  assert.equal(newRec.get('id'), undefined, "The transient record should still have an undefined id.");
  assert.equal(recs.objectAt(4), newRec, "The transient record should be accessible in the many array.");
  //assert.equal(holder.get('status'), Record.READY_CLEAN, "The record should not be dirtied when the transient record is added.");
  SC.warn("The record should not be dirtied when the transient record is added. Not yet implemented.");

  SC.run(function () {
    newRec.set('id', 200);
  });

  assert.equal(newRec.get('id'), 200, "The post-transient record should have an id of 200.");
  //assert.equal(holder.get('status'), Record.READY_DIRTY, "The record should be dirtied when the relationship is actually updated.");
  SC.warn("The record should be dirtied when the relationship is actually updated. Not yet implemented.");

});
