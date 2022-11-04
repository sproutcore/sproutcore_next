// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var MyApp, q;

// test parsing of query string
module("Query instance and memory management", {
  beforeEach: function() {
    
    SC.RunLoop.begin();
    
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });
    
    // setup a dummy model
    MyApp.Foo = Record.extend();
    MyApp.Bar = Record.extend();
    MyApp.BarChild = MyApp.Bar.extend();
    MyApp.Baz = Record.extend();
    
    // load some data
    MyApp.store.loadRecords(MyApp.Foo, [{
      guid: 1,
      firstName: "John",
      lastName: "Doe",
      year: 1974
    }, {
      guid: 2,
      firstName: "Jane",
      lastName: "Doe",
      year: 1975
    }]);
    
    MyApp.store.loadRecords(MyApp.Bar, [{
      guid: 3,
      firstName: "Emily",
      lastName: "Parker",
      year: 1975,
      active: null
    }, {
      guid: 4,
      firstName: "Johnny",
      lastName: "Cash",
      active: false
    }]);
    
    SC.RunLoop.end();
    
  },
  
  afterEach: function() {
    MyApp = q = null;
  }
});

// ..........................................................
// BASIC TESTS
// 
test("Record Arrays should not be created more than once if a query is re-run", function (assert) {
  
  var qFoo = Query.create({
    recordType: MyApp.Foo
  });
  var qBar = Query.create({
    recordType: MyApp.Bar
  });
  
  assert.ok(!MyApp.store.getPath('recordArrays.length'), "RecordArrays length must start as empty.");
  var raFoo = MyApp.store.find(qFoo);
  assert.equal(MyApp.store.getPath('recordArrays.length'), 1, "RecordArrays length must be 1 after new query");
  var raFoo2 = MyApp.store.find(qFoo);
  assert.equal(MyApp.store.getPath('recordArrays.length'), 1, "RecordArrays length must not increment after second identical query");
  var raBar = MyApp.store.find(qBar);
  assert.equal(MyApp.store.getPath('recordArrays.length'), 2, "RecordArrays length must be 2 after second new query.");
  
  assert.equal(raFoo2, raFoo, "Record array must return same instance.");
  
  raFoo.destroy();
  raBar.destroy();
  qFoo.destroy();
  qBar.destroy();
});

test("Reset must destroy all cached record arrays.", function (assert) {
  
  var qFoo = Query.create({
    recordType: MyApp.Foo
  });
  var qBar = Query.create({
    recordType: MyApp.Bar
  });

  assert.ok(!MyApp.store.getPath('recordArrays.length'), "RecordArrays length must start as empty.");
  var raFoo = MyApp.store.find(qFoo);
  var raBar = MyApp.store.find(qBar);
  assert.equal(MyApp.store.getPath('recordArrays.length'), 2, "RecordArrays length must be 2 after two new queries.");
  
  MyApp.store.reset();
  assert.ok(!MyApp.store.getPath('recordArrays.length'), "Cached record array must be empty after reset()");
  assert.ok(raFoo.get('isDestroyed'), "Record Array 1 must be destroyed after reset()");
  assert.ok(raBar.get('isDestroyed'), "Record Array 2 must be destroyed after reset()");
  
});