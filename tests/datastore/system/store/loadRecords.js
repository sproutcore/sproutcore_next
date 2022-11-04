// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

(function() {
  var store, people, places, Person, Place;

  module("Store#loadRecords", {
    beforeEach: function() {
      Person = Record.extend({
        first: Record.attr(String, { isRequired: true}),
        last: Record.attr(String),
        age: Record.attr(Number),
        isAlive: Record.attr(Boolean)
      });

      Place = Record.extend({
        name: Record.attr(String)
      });

      SC.RunLoop.begin();

      store = Store.create();

      people = [ 
        Person.create({ 
          guid: 1,
          first: "John",
          last: "Sproutish",
          age: 35,
          isAlive: true
        }),
        Person.create({
          guid: 2,
          first: "Sarah",
          last: "Coop",
          age: 28,
          isAlive: true
        })
      ];

      places = [
        Place.create({
          guid: 3,
          name: "San Francisco"
        }),
        Place.create({
          guid: 4,
          name: "St. John's"
        })
      ];

      SC.RunLoop.end();
    },
    afterEach: function() {
      store = people = places = Person = Place = null;
    }
  });

  test("loadRecords with single Record type loads new records in store", function (assert) {
    var storeKeys = store.loadRecords(Person, people),
        isStatusCorrect;

    assert.ok(SC.isArray(storeKeys), "An array of store keys is returned");

    storeKeys.forEach(function(storeKey, index) {
      assert.equal(store.idFor(storeKeys[index]), people[index].get('guid'), "The storeKey resolves to the correct Primary Key for index %@".fmt(index));

      assert.ok(store.peekStatus(storeKey) & Record.READY_CLEAN, "Record is in Record.READY_CLEAN state after loading into store for index %@".fmt(index));
    });
  });

  test("loadRecords with multiple Record types loads new records in store", function (assert) {
    var things = [],
        types = [Person, Person, Place, Place],
        storeKeys, record;

    things.pushObjects(people);
    things.pushObjects(places);

    things.forEach(function(thing, index) {
      assert.ok(SC.kindOf(thing, types[index]), "precond - types array contains correct record type for index %@".fmt(index));
    });

    storeKeys = store.loadRecords(types, things);

    assert.ok(SC.isArray(storeKeys), "An array of store keys is returned");

    storeKeys.forEach(function(storeKey, index) {
      record = store.materializeRecord(storeKey);
      
      assert.equal(store.idFor(storeKeys[index]), things[index].get('guid'), "The storeKey resolves to the correct Primary Key for index %@".fmt(index));
      assert.ok(SC.kindOf(record, types[index]), "store returns a record of the correct type for index %@".fmt(index));
      assert.ok(store.peekStatus(storeKey) & Record.READY_CLEAN, "Record is in Record.READY_CLEAN state after loading into store for index %@".fmt(index));
    });
  });
})();
