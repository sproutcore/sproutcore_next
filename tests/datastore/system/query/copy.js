// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";
// test parsing of query string
module("Query#copy");

test("basic copy", function (assert) {
  var q=  Query.create({
    conditions: "foo = bar",
    parameters: { foo: "bar" },
    orderBy: "foo",
    recordType: Record,
    recordTypes: [Record],
    location: Query.REMOTE,
    scope: SC.CoreSet.create()
  }).freeze();
  
  var keys = 'conditions orderBy recordType recordTypes parameters location scope'.w();
  var copy = q.copy();
  
  assert.equal(copy.isFrozen, false, 'copy should not be frozen');
  keys.forEach(function(key) {
    assert.equal(copy.get(key), q.get(key), 'copy.%@ should = original.%@'.fmt(key, key));
  }, this);
  
});
