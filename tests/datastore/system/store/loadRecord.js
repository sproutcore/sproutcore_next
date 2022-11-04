// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var store, dataHashes;
var Person;


module("Store#loadRecord", {
  beforeEach: function() {

    Person = Record.extend({
      first: Record.attr(String, { isRequired: true}),
      last: Record.attr(String),
      age: Record.attr(Number),
      isAlive: Record.attr(Boolean)
    });

    SC.RunLoop.begin();

    store = Store.create();

    dataHashes = [

    {
      guid: 1,
      first: "John",
      last: "Sproutish",
      age: 35,
      isAlive: true},

    {
      guid: 2,
      first: "Sarah",
      last: "Coop",
      age: 28,
      isAlive: true }];

    SC.RunLoop.end();
  }
});

test("loadRecord loads new / update existing record in store", function (assert) {
  var aDataHash = dataHashes[0];
  var storeKey = store.loadRecord(Person, aDataHash);
  assert.ok(storeKey, "A store key is generated for a new record.");

  var doesStoreKeyResolveToPK = aDataHash.guid === store.idFor(storeKey);
  assert.ok(doesStoreKeyResolveToPK, "The storeKey resolves to the correct Primary Key");

  var isStatusCorrect = store.peekStatus(storeKey) & Record.READY_CLEAN;
  assert.ok(isStatusCorrect, "Record is in Record.READY_CLEAN state after loading into store.");

  // Change the record
  aDataHash['age'] = 40;
  var storeKeyAfterUpdate = store.loadRecord(Person, aDataHash);
  assert.ok(storeKey === storeKeyAfterUpdate, "When the same record is loaded a second time its store key remains unchanged.");

  var record = store.materializeRecord(storeKey);
  assert.ok(record.get('age') === 40, "Record in store is updated with new values from data hash.");
});

test("The data hash of the record should be correct BEFORE the status changes.", function (assert) {
  var rec1;
  var aDataHash = dataHashes[0];
  var storeKey = store.loadRecord(Person, aDataHash);

  store.set('dataSource', DataSource.create({
    retrieveRecords: function () { return true; }
  }));

  //create record
  rec1 = store.materializeRecord(storeKey);

  rec1.addObserver('status', function tst () {
    if (this.get('status') === Record.READY_CLEAN) {
      assert.equal(this.get('last'), "Post-Sproutish", "The string attribute should be correct since the status has updated.");
      rec1.removeObserver('status', tst);
    }
  });

  SC.run(function () {
    rec1.refresh();
  });

  store.loadRecord(Person, {guid: 1 , first: "John", last: "Post-Sproutish", age: 35 , isAlive: true}, 1);
});
