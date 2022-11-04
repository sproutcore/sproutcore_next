// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

(function() {
  var store, Person, Place;

  module("Store#unloadRecord", {
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

  test("Unload one record via storeKey", function (assert) {
    var people = store.find(Person),
        record = store.find(Person, 1);

    assert.equal(people.get('length'), 3, "precond - there are 3 People records in the store");

    store.unloadRecord(Person, 1);

    people = store.find(Person);
    assert.equal(people.get('length'), 2, "there are 2 People records in the store after calling unloadRecord");
    assert.ok(store.peekStatus(record) & Record.EMPTY, "Record now has status of Record.EMPTY");
  });

})();
