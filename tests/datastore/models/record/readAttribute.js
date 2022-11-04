// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


var store, Foo, json, foo ;
module("Record#readAttribute", {
  beforeEach: function() {
    SC.RunLoop.begin();
    store = Store.create();
    Foo = Record.extend();
    json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, Record.READY_CLEAN); 
  },
  
  afterEach: function() {
    SC.RunLoop.end();
  }
});

test("returns unaltered JSON value for existing attributes", function (assert) {
  var key ;
  for(key in json) {
    if (!json.hasOwnProperty(key)) continue;
    assert.equal(foo.get(key), json[key], 'should return value for predefined key %@'.fmt(key));
  }
});

test("returns undefined for unknown JSON attributes", function (assert) {
  assert.equal(foo.get('imaginary'), undefined, 'should return undefined for unknown key "imaginary"');
});

test("returns new value if edited via writeAttribute", function (assert) {
  foo.writeAttribute("bar", "baz");
  assert.equal(foo.readAttribute("bar"), "baz", "should return value for new attribute 'bar'");
});

test("returns undefined when data hash is not present", function (assert) {
  store.removeDataHash(foo.storeKey);
  assert.equal(store.readDataHash(foo.storeKey), null, 'precond - data hash should be removed from store');
  assert.equal(foo.readAttribute("foo"), undefined, "should return undefined if data hash is missing");
});


