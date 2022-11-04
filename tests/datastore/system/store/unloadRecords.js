// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

(function() {
  var store, Person, Place;

  module("Store#unloadRecords", {
    beforeEach: function() {
      Person = Record.extend({
        name: Record.attr(String)
      });

      Place = Record.extend({
        name: Record.attr(String)
      });

      SC.RunLoop.begin();

      store = Store.create();

      store.loadRecords(Person, [
        {guid: 1, name: 'Soups'},
        {guid: 2, name: 'Palmdale'},
        {guid: 3, name: 'Dubs'}
      ]);

      store.loadRecords(Place, [
        {guid: 4, name: "San Francisco"},
        {guid: 5, name: "St. John's"}
      ]);

      SC.RunLoop.end();
    },
    afterEach: function() {
      store = Person = Place = null;
    }
  });

  test("Unload all records of a record type", function (assert) {
    var records = store.find(Person);
    assert.equal(records.get('length'), 3, "precond - store has 3 records loaded");
    store.unloadRecords(Person);
    records = store.find(Person);
    assert.equal(records.get('length'), 0, "Number of People records left");
  });

  test("Unload only certain records of a record type", function (assert) {
    var records = store.find(Person);
    assert.equal(records.get('length'), 3, "precond - store has 3 records loaded");
    store.unloadRecords(Person, [1, 2]);
    records = store.find(Person);
    assert.equal(records.get('length'), 1, "Number of People records left");
  });

  test("Unload all records of passed record types", function (assert) {
    var people = store.find(Person),
        places = store.find(Place);

    assert.equal(people.get('length'), 3, "precond - store has 3 Person records loaded");
    assert.equal(places.get('length'), 2, "precond - store has 2 Place records loaded");

    store.unloadRecords([Person, Place]);

    people = store.find(Person);
    places = store.find(Place);

    assert.equal(people.get('length'), 0, "Number of People records left");
    assert.equal(places.get('length'), 0, "Number of Place records left");
  });

  test("Unload certain records of passed record types", function (assert) {
    var people = store.find(Person),
        places = store.find(Place);

    assert.equal(people.get('length'), 3, "precond - store has 3 Person records loaded");
    assert.equal(places.get('length'), 2, "precond - store has 2 Place records loaded");

    store.unloadRecords([Person, Person, Place], [1, 2, 4]);

    people = store.find(Person);
    places = store.find(Place);

    assert.equal(people.get('length'), 1, "Number of People records left");
    assert.equal(places.get('length'), 1, "Number of Place records left");
  });

})();
