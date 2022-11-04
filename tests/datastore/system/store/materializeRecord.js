// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, dataHash;
var Person, Person2;

module("Store#materializeRecord", {
  beforeEach: function() {

    Person = Record.extend({
      first: Record.attr(String, { isRequired: true}),
      last: Record.attr(String),
      age: Record.attr(Number),
      isAlive: Record.attr(Boolean)
    });
    Person2 = Record.extend({
      first: Record.attr(String, { isRequired: true}),
      last: Record.attr(String),
      age: Record.attr(Number),
      isAlive: Record.attr(Boolean),
      init: function init() {
        init.base.apply(this, arguments);
        return this.get('store').materializeRecord(this.get('storeKey'));
      }
    });

    dataHash = {
      guid: 1,
      first: "John",
      last: "Sproutish",
      age: 35,
      isAlive: true
    };

    SC.RunLoop.begin();

    store = Store.create();

    SC.RunLoop.end();
  }
});

test("Returns the same record when called twice.", function (assert) {
  var storeKey = store.loadRecord(Person, dataHash);
  assert.ok(storeKey, "PRELIM: A store key is generated for a new record.");

  var rec1 = store.materializeRecord(storeKey),
      rec2 = store.materializeRecord(storeKey);
  assert.ok(rec1 === rec2, "The same record object is returned from two calls to materializeRecord.");
});

// Tests a bug where records which trigger self-reference during initialization (usually through observers, often
// many layers deep) would cause two or more identical copies of the record object to be created, resulting in
// a stack overflow at best and a set of subtle, impossible-to-debug errors at worst. See GitHub issue #1160.
test("Returns the correct record instance, without error, when called for a record which materializes itself during initialization.", function (assert) {

  var storeKey = store.loadRecord(Person2, dataHash);
  assert.ok(storeKey, "PRELIM: A store key is generated for a new record.");

  var rec1, hasError = false;
  try {
    rec1 = store.materializeRecord(storeKey);
  } catch (e) {
    hasError = true;
  }
  assert.ok(!hasError, "The store successfully materialized a record which self-materializes during initialization.");

  var rec2 = store.materializeRecord(storeKey);

  assert.ok(rec1 === rec2, "The same record object is returned from two calls to materializeRecord for a record which self-materializes during initialization.");



});
