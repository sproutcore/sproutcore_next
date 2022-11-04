// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, equals, same */

import { SC } from "../../../core/core.js";
import { Store, Record, Query } from "../../../datastore/datastore.js";


var store, Employee, Engineer, colin;

/** Test the interaction of a polymorphic record with the store. */
module("Record:Interaction with Store", {

  beforeEach: function() {
    SC.run(function () {
      store = Store.create();

      Employee = Record.extend({
        name: Record.attr(String)
      });

      Employee.isPolymorphic = true;

      Engineer = Employee.extend({
        isEngineer: true
      });

      colin = store.createRecord(Engineer, { guid: 1, name: 'Colin' });
    });
  },

  afterEach: function() {
    SC.run(function () {
      store.destroy();

      store = Employee = Engineer = colin = null;
    });
  }

});

test("store.replaceIdFor() should update the storeKeysById() object on the record class", function (assert) {
  var storeKey = colin.get('storeKey');

  assert.equal(Engineer.storeKeysById()['1'], storeKey, "The storeKey should be the same.");
  assert.equal(Engineer.storeKeysById()['1'], Employee.storeKeysById()['1'], "The storeKey should match at any requested polymorphic level.");
  assert.deepEqual(Engineer.storeKeysById(), Employee.storeKeysById(), "The storeKey to id mapping is actually the same instance between each polymorphic level.");

  Store.replaceIdFor(storeKey, 2);

  assert.equal(Engineer.storeKeysById()['2'], storeKey, "The storeKey should still be the same after replacing the id.");
  assert.equal(Engineer.storeKeysById()['2'], Employee.storeKeysById()['2'], "The storeKey should still match at any requested polymorphic level after replacing the id.");
  assert.deepEqual(Engineer.storeKeysById(), Employee.storeKeysById(), "The storeKey to id mapping is actually the same instance between each polymorphic level.");
});
