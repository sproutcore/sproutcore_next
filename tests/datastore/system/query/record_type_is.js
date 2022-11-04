// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// test parsing of query string
var rec, q;
module("Query comparison of record types", {
  beforeEach: function() {
    SC.RunLoop.begin();

    // setup dummy app and store
    window.MyApp = SC.Object.create({
      store: Store.create()
    });
    
    // setup a dummy model
    window.MyApp.Foo = Record.extend({});
    
    // load some data
    window.MyApp.store.loadRecords(window.MyApp.Foo, [
      { guid: 1, firstName: "John", lastName: "Doe" }
    ]);
    
    rec = window.MyApp.store.find(window.MyApp.Foo,1);
    
    q = Query.create();

    SC.RunLoop.end();
  }
});


  
test("should handle record types", function (assert) {
  
  q.conditions = "TYPE_IS 'MyApp.Foo'";
  q.parse();
  assert.equal(Store.recordTypeFor(rec.storeKey), SC.objectForPropertyPath('MyApp.Foo'), 'record type should be MyApp.Foo');
  assert.ok(q.contains(rec), 'record with proper type should match');
  
  q.conditions = "TYPE_IS 'MyApp.Baz'";
  q.parse();
  assert.ok(!q.contains(rec), 'record with wrong type should not match');
});
