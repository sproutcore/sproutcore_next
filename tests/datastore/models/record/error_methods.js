// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


var store, Application;
module("Record Error Methods", {
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

test("Verify error methods behave correctly", function (assert) {
  var thing1 = store.find(Application.Thing, 1);
  var storeKey = thing1.get('storeKey');

  var thing2 = store.find(Application.Thing, 2);

  SC.RunLoop.begin();
  store.writeStatus(storeKey, Record.BUSY_LOADING);
  store.dataSourceDidError(storeKey, Record.GENERIC_ERROR);
  SC.RunLoop.end();

  assert.ok((thing1.get('isError') === true), "isError on thing1 should be true");
  assert.ok((thing2.get('isError') === false), "isError on thing2 should be false");

  assert.equal(thing1.get('errorObject'), Record.GENERIC_ERROR,
    "get('errorObject') on thing1 should return the correct error object");

  assert.equal(thing2.get('errorObject'), null,
    "get('errorObject') on thing2 should return null");
});
