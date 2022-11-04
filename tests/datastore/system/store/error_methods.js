// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, Application;

module("Store Error Methods", {
  beforeEach: function() {

    Application = {};
    Application.Thing = Record.extend({
      name: Record.attr(String)
    });

    SC.RunLoop.begin();
    store = Store.create();

    var records = [
      { guid: 1, name: 'Thing One' },
      { guid: 2, name: 'Thing Two' }
    ];

    var types = [ Application.Thing, Application.Thing ];

    store.loadRecords(types, records);
    SC.RunLoop.end();
  },

  afterEach: function() {
    store = null;
    Application = null;
  }
});

test("Verify readError() returns correct errors", function (assert) {
  var thing1 = store.find(Application.Thing, 1);
  var storeKey = thing1.get('storeKey');

  SC.RunLoop.begin();
  store.writeStatus(storeKey, Record.BUSY_LOADING);
  store.dataSourceDidError(storeKey, Record.GENERIC_ERROR);
  SC.RunLoop.end();

  assert.equal(store.readError(storeKey), Record.GENERIC_ERROR,
    "store.readError(storeKey) should return the correct error object");
});

test("Verify readQueryError() returns correct errors", function (assert) {
  var q = Query.local(Application.Thing);
  var things = store.find(q);

  SC.RunLoop.begin();
  things.set('status', Record.BUSY_LOADING);
  store.dataSourceDidErrorQuery(q, Record.GENERIC_ERROR);
  SC.RunLoop.end();

  assert.equal(store.readQueryError(q), Record.GENERIC_ERROR,
    "store.readQueryError(q) should return the correct error object");
});
