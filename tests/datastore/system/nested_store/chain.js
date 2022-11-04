// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

import { SC } from "../../../../core/core.js";
import { Store, Record, NestedStore, DataSource } from "../../../../datastore/datastore.js";

var Rec = Record.extend({
  
  title: Record.attr(String),
  
  fired: false,
  
  reset: function() { 
    this.fired = false;
  },
  
  titleDidChange: function() {
    this.fired = true;
  }.observes('title')
    
});

// ..........................................................
// Store#chain - init
//
module("Store#chain - init");

test("initial setup for chained store", function (assert) {
  var parent = Store.create();
  var store  = parent.chain();
  
  assert.ok(store !== parent, 'chain should return new child store');
  
  assert.equal(store.get('parentStore'), parent, 'should have parentStore');
  
  assert.equal(SC.typeOf(store.dataHashes), SC.T_HASH, 'should have dataHashes');
  parent.dataHashes.foo = 'bar';
  assert.equal(store.dataHashes.foo, 'bar', 'dataHashes should inherit from parent');
    
  assert.equal(SC.typeOf(store.revisions), SC.T_HASH, 'should have revisions');
  parent.revisions.foo = 'bar';
  assert.equal(store.revisions.foo, 'bar', 'revisions should inherit from parent');

  assert.equal(SC.typeOf(store.statuses), SC.T_HASH, 'should have statuses');
  parent.statuses.foo = 'bar';
  assert.equal(store.statuses.foo, 'bar', 'statuses should inherit from parent');
  
  assert.ok(!store.locks, 'should not have locks');
  assert.ok(!store.chainedChanges, 'should not have chainedChanges');
  assert.ok(!store.editables, 'should not have editables');
});

test("allow for custom subclasses of NestedStore", function (assert) {
  var parent = Store.create();
  
  // We should get an exception if we specify a "subclass" that's not a class
  var ex = null;
  try {
    var bogus = parent.chain({}, "I am not a class");
  }
  catch(e) {
    ex = e;
  }
  assert.ok(ex  &&  ex.message  &&  ex.message.indexOf('not a valid class') !== -1, 'chain should report that our bogus "class" it is not a valid class');
  
  // We should get an exception if we specify a class that's not a subclass of
  // NestedStore
  ex = null;
  try {
    var bogus = parent.chain({}, Store);
  }
  catch(e) {
    ex = e;
  }
  assert.ok(ex  &&  ex.message  &&  ex.message.indexOf('is not a type of NestedStore') !== -1, 'chain should report that our class needs to be a subclass of NestedStore');
  
  
  // Our specified (proper!) subclass should be respected.
  var MyNestedStoreSubclass = NestedStore.extend();
  var nested = parent.chain({}, MyNestedStoreSubclass);
  assert.ok(nested.kindOf(MyNestedStoreSubclass), 'our nested store should be the NestedStore subclass we specified');
}); 


// ..........................................................
// Store#chain - use & propagation
// 
module("Store#chain - use & propagation");
test("chained store changes should propagate reliably", function (assert) {
  var parent = Store.create(), rec, store, rec2;

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });
  
  rec = parent.find(Rec, 1);
  assert.ok(rec && rec.get('title')==='foo', 'precond - base store should have record');

  // run several times to make sure this works reliably when used several 
  // times in the same app
  
  // trial 1
  SC.RunLoop.begin();
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'bar');
  SC.RunLoop.end();
  
  assert.equal(rec2.get('title'), 'bar', 'chained rec.title should changed');
  assert.equal(rec.get('title'), 'foo', 'original rec.title should NOT change');
  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.equal(rec.fired, false, 'original rec.title should not have notified');
  
  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  assert.equal(rec.get('title'), 'bar', 'original rec.title should change');
  assert.equal(rec.fired, true, 'original rec.title should have notified');  


  // trial 2
  SC.RunLoop.begin();
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='bar', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'baz');
  SC.RunLoop.end();
  
  assert.equal(rec2.get('title'), 'baz', 'chained rec.title should changed');
  assert.equal(rec.get('title'), 'bar', 'original rec.title should NOT change');
  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.equal(rec.fired, false, 'original rec.title should not have notified');
  
  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  assert.equal(rec.get('title'), 'baz', 'original rec.title should change');
  assert.equal(rec.fired, true, 'original rec.title should have notified');  
  

  // trial 3
  SC.RunLoop.begin();
  store = parent.chain();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='baz', 'chain store should have record');
  
  rec.reset();
  rec2.set('title', 'FOO2');
  SC.RunLoop.end();
  
  assert.equal(rec2.get('title'), 'FOO2', 'chained rec.title should changed');
  assert.equal(rec.get('title'), 'baz', 'original rec.title should NOT change');
  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.equal(rec.fired, false, 'original rec.title should not have notified');
  
  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  assert.equal(rec.get('title'), 'FOO2', 'original rec.title should change');
  assert.equal(rec.fired, true, 'original rec.title should have notified');  
});

test("record retrievals triggered from a chained store and returned to the parent store should be reflected in the chained store", function (assert) {
  var parent = Store.create().from(DataSource.create({
    retrieveRecords: function(store, storeKeys, ids) {
      this.invokeLast(function() {
        storeKeys.forEach(function(key, i) {
          store.dataSourceDidComplete(key, { title: 'Stupendous! AB-solutely corking.' });
        });
      })
      return true;
    }
  }));

  var chained = parent.chain(),
      chainedRec, storeKey;

  SC.run(function() {
    chainedRec = chained.find(Rec, 1);
    storeKey = chainedRec.get('storeKey');
    assert.equal(chained.peekStatus(storeKey), Record.BUSY_LOADING, "While retrieving, the record's status should be BUSY_LOADING");
  });

  // This immediate status update is sensitive to the data source's use of invokeNext to load the record.
  assert.equal(chained.peekStatus(storeKey), Record.READY_CLEAN, "After retrieving, the record's status should be READY_CLEAN");


});
