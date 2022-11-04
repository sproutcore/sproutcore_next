// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, Application;
module("RecordArray Error Methods", {
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
  var q = Query.local(Application.Thing);
  var things = store.find(q);

  SC.RunLoop.begin();
  things.set('status', Record.BUSY_LOADING);
  store.dataSourceDidErrorQuery(q, Record.GENERIC_ERROR);
  SC.RunLoop.end();

  assert.ok((things.get('isError') === true), "isError on things array should be true");

  assert.equal(things.get('errorObject'), Record.GENERIC_ERROR,
    "get('errorObject') on things array should return the correct error object");
});
