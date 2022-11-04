// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";
 

// test parsing of query string
var q, scope1, scope2;
module("Query#queryWithScope", {
  beforeEach: function() {
    q = Query.create({
      conditions: "foo = bar",
      parameters: { foo: "bar" },
      orderBy: "foo",
      recordType: Record,
      recordTypes: [Record],
      location: Query.REMOTE
    }).freeze();
    
    scope1 = SC.CoreSet.create();
    scope2 = SC.CoreSet.create();
  },
  
  afterEach: function() {
    q = scope1 = scope2 = null;
  }
});

function verifyCopy(copy, original) {
  var keys = 'conditions orderBy recordType recordTypes parameters location'.w();
  keys.forEach(function(key) {
    assert.equal(copy.get(key), original.get(key), 'copy.%@ should equal original.%@'.fmt(key, key));
  });
}

test("getting into scope first time", function (assert) {
  
  var q2 = q.queryWithScope(scope1);
  verifyCopy(q2, q);
  assert.equal(q2.get('scope'), scope1, 'new query should have scope1');
  
  var q3 = q.queryWithScope(scope1);
  assert.equal(q3, q2, 'calling again with same scope should return same instance');
});

test("chained scope", function (assert) {
  var q2 = q.queryWithScope(scope1) ;
  var q3 = q2.queryWithScope(scope2);
  
  verifyCopy(q3, q2);
  assert.equal(q3.get('scope'), scope2, 'new query should have scope2');
  
  var q4 = q2.queryWithScope(scope2);
  assert.equal(q4, q3, 'calling again with same scope should return same instance');
});

