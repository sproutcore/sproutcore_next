// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


(function() {

  var store, Person, Male, Female, colin, maggie;

  module("Polymorphic Record - Simple", {
    beforeEach: function() {
      SC.RunLoop.begin();

      store = Store.create();

      Person = Record.extend();
      Person.isPolymorphic = true;

      Male = Person.extend({
        isMale: true
      });

      Female = Person.extend({
        isFemale: true
      });

      colin = store.createRecord(Male, {
        guid: '1'
      });

      maggie = store.createRecord(Female, {
        guid: '2'
      });
    },

    afterEach: function() {
      store = Person = Male = Female = colin = maggie = null;
      SC.RunLoop.end();
    }
  });

  test("Adding isPolymorphic to extend() hash applies it to record class", function (assert) {
    var Test = Record.extend({
      isPolymorphic: true
    });
    var test = store.createRecord(Test, {});

    assert.ok(Test.isPolymorphic, "Record class should have gotten passed isPolymorphic value");
    assert.ok(test.isPolymorphic === null || test.isPolymorphic === undefined, "Created record instance should not have isPolymorphic property");
  });

  test("Store#find works with abstract record type", function (assert) {
    var person1 = store.find(Person, '1'),
        person2 = store.find(Person, '2');

    assert.equal(person1, colin, "find on Person record type with guid 1 should return male record");
    assert.ok(SC.kindOf(person1, Male) && person1.isMale, "returned record should be of type Male");

    assert.equal(person2, maggie, "find on Person record type with guid 2 should return female record");
    assert.ok(SC.kindOf(person2, Female) && person2.isFemale, "returned record should be of type Female");
  });

  test("Creating a record of a different concrete type with the same id errors", function (assert) {
    assert.expect(1);

    try {
      store.createRecord(Female, {
        guid: '1'
      });
    } catch (e) {
      assert.ok(true, "Error occurred when trying to create type with same guid");
    }
  });

  test("Changing the 'id' updates the storeKeys for all types of the same record", function (assert) {
    var person1 = store.find(Person, '1'),
      person2 = store.find(Person, '2');

    assert.equal(person1, colin, "find on Person record type with guid 1 should return male record");
    colin.set('id', 'x');
    person1 = store.find(Person, '1');

    assert.ok(person1 !== colin, "find on Person record type with guid 1 should not work anymore");

    person1 = store.find(Person, 'x');
    assert.equal(person1, colin, "find on Person record type with guid x should return male record");
  });
})();
