// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


(function() {

  var store, Person, Place, Male, Female, home, colin, maggie;

  module("Polymorphic Record - toOne tests", {
    beforeEach: function() {
      SC.RunLoop.begin();
      store = Store.create();

      Person = Record.extend({
        name: Record.attr(String)
      });
      Person.isPolymorphic = true;

      Place = Record.extend({
        where: Record.attr(String),
        person: Record.toOne(Person, {inverse: 'place'})
      });

      Male = Person.extend({
        isMale: true
      });

      Female = Person.extend({
        isFemale: true
      });

      home = store.createRecord(Place, {
        guid: '0',
        where: 'Canada',
        person: '1'
      });

      colin = store.createRecord(Male, {
        guid: '1',
        name: 'Colin'
      });

      maggie = store.createRecord(Female, {
        guid: '2',
        name: 'Maggie'
      });
    },
    afterEach: function() {
      store = Person = Place = Male = Female = home = colin = maggie = null;
      SC.RunLoop.end();
    }
  });

  test("toOne relationship returns record of correct type", function (assert) {
    assert.equal(home.get('person'), colin, "Correct record is returned for polymorphic relationship");
    assert.ok(SC.kindOf(home.get('person'), Male), "Correct record type is returned for polymorphic relationship");
  });

  test("setting toOne relationship works", function (assert) {
    home.set('person', maggie);
    assert.ok(SC.kindOf(home.get('person'), Female), "Changing toOne to record of different type works");
  });

  test("Requesting a specific subclass returns only that type.", function (assert) {
    var males = store.find(Male),
      females = store.find(Female),
      people = store.find(Person);

    assert.equal(males.get('length'), 1, "Only a single male record should be returned.");
    assert.equal(females.get('length'), 1, "Only a single female record should be returned.");
    assert.equal(people.get('length'), 2, "Two person records should be returned.");
  });

})();
