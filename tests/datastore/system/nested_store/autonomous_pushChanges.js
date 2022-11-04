// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

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
// Store#autonomous_pushChanges - init
//
module("Store#autonomous_pushChanges - init");

test("record updates pushed from the server via an autonomous chained store should propagate reliably to the main store", function (assert) {
  var parent, rec, store, rec2;

  parent = Store.create().from(Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  assert.ok(rec && rec.get('title')==='foo', 'precond - base store should have record');

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var res = store.pushRetrieve(Rec, 1, { title: "bar" });
  assert.equal(res, rec2.storeKey, "There is no conflict, pushRetrieve was succesful.");
  var dh = store.readDataHash(rec2.storeKey);
  assert.ok(dh && dh.title==='bar', 'dataHash.title should change');
  SC.RunLoop.end();

  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.equal(rec.get('title'), 'foo', 'original rec.title should NOT change');
  assert.equal(rec.fired, false, 'original rec.title should not have notified');

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  assert.equal(rec.get('title'), 'bar', 'original rec.title should change');
  assert.equal(rec.fired, true, 'original rec.title should have notified');
});

test("record destroy pushed from the server via an autonomous chained store should propagate reliably to the main store", function (assert) {
  var parent, rec, store, rec2;

  parent = Store.create().from(Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  assert.ok(rec && rec.get('title')==='foo', 'precond - base store should have record');
  var storeKey1 = rec.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var storeKey2 = rec2.storeKey;
  var res = store.pushDestroy(Rec, 1);

  assert.equal(res, storeKey2, "There is no conflict, pushDestroy was succesful.");
  SC.RunLoop.end();

  rec = parent.find(Rec, 1);
  assert.ok( rec && rec.get('title')==='foo', 'original rec should still be present into the main store');
  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');

  var status2 = store.readStatus(storeKey2);

  assert.equal(store.dataHashes[storeKey2], null, "the data hash should be removed from the chained store");
  assert.equal(status2, Record.DESTROYED_CLEAN, "the status should have changed to DESTROYED_CLEAN ");

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  var status = store.readStatus(storeKey1);

  assert.equal(store.dataHashes[storeKey1], null, "the data hash should be removed from the main store");
  assert.equal(status, Record.DESTROYED_CLEAN, "the status of the record into main store should have changed to DESTROYED_CLEAN ");
});


test("record error status pushed from the server via an autonomous chained store should propagate reliably to the main store", function (assert) {
  var parent, rec, store, rec2;

  parent = Store.create().from(Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "foo", guid: 1 }]);
  });

  rec = parent.find(Rec, 1);
  assert.ok(rec && rec.get('title')==='foo', 'precond - base store should have record');
  var storeKey1 = rec.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  rec2  = store.find(Rec, 1);
  assert.ok(rec2 && rec2.get('title')==='foo', 'chain store should have record');

  var storeKey2 = rec2.storeKey;
  var res = store.pushError(Rec, 1);

  assert.equal(res, storeKey2, "There is no conflict, pushError was succesful.");
  SC.RunLoop.end();

  rec = parent.find(Rec, 1);
  assert.ok( rec && rec.get('title')==='foo' && rec.get("status") === Record.READY_CLEAN, 'original rec should be unchanged into the main store');
  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.ok(store.readStatus(storeKey2) & Record.ERROR, "the status should have changed to ERROR ");

  SC.RunLoop.begin();
  rec.reset();
  store.commitChanges();
  store.destroy();
  SC.RunLoop.end();

  assert.ok(parent.readStatus(storeKey1) & Record.ERROR, "the status of the record into main store should have changed to ERROR ");
});

test("on commitSuccessfulChanges only the clean records from an autonomous chained store should be propagated to the main store", function (assert) {
  var parent, store, apple, apple2, pear, pear2, peach1Key, peach2Key, peach, peach2, orange1Key, orange2Key, orange, orange2;

  parent = Store.create().from(Record.fixtures);

  SC.run(function() {
    parent.loadRecords(Rec, [{ title: "apple", guid: 1 },{ title: "pear", guid: 2 },
                             { title: "peach", guid: 3 },{ title: "orange", guid: 4 }]);
  });

  apple = parent.find(Rec, 1);
  pear = parent.find(Rec, 2);
  peach = parent.find(Rec, 3);
  peach1Key = peach.storeKey;
  orange = parent.find(Rec, 4);
  orange1Key = orange.storeKey;

  SC.RunLoop.begin();
  store = parent.chainAutonomousStore();
  pear2 = store.find(Rec, 2);
  peach2 = store.find(Rec, 3);
  orange2 = store.find(Rec, 4);

  store.pushRetrieve(Rec, 1, { title: "red apple" });
  pear2.set( "title", "big pear" );

  peach2Key = peach2.storeKey;
  store.pushDestroy(Rec, 3);

  orange2Key = orange2.storeKey;
  orange2.destroy();
  SC.RunLoop.end();

  assert.equal(store.get('hasChanges'), true, 'chained store.hasChanges');
  assert.equal(apple.get('title'), 'apple', 'original apple.title should NOT change');
  assert.equal(apple.fired, false, 'original apple.title should not have notified');
  assert.equal(pear.get('title'), 'pear', 'original pear.title should NOT change');
  assert.equal(pear.fired, false, 'original pear.title should not have notified');
  assert.equal(store.readStatus(peach2Key), Record.DESTROYED_CLEAN, 'peach2 should be destroyed clean');
  assert.equal(store.readStatus(orange2Key), Record.DESTROYED_DIRTY, 'orange2 should be destroyed dirty');

  SC.RunLoop.begin();
  apple.reset();
  store.commitSuccessfulChanges();
  SC.RunLoop.end();

  assert.equal(apple.get('title'), 'red apple', 'original apple.title should change');
  assert.equal(apple.fired, true, 'original apple.title should have notified');
  assert.equal(pear.get('title'), 'pear', 'original pear.title should NOT change');
  assert.equal(pear.fired, false, 'original pear.title should not have notified');

  var peachStatus = store.readStatus(peach1Key);
  assert.equal(store.dataHashes[peach1Key], null, "the peach data hash should be removed from the main store");
  assert.equal(peachStatus, Record.DESTROYED_CLEAN, "the status of the peach record into main store should have changed to DESTROYED_CLEAN ");

  var orangeStatus = parent.readStatus(orange1Key);
  assert.equal(orangeStatus, Record.READY_CLEAN, "the status of the orange record into main store should remain unchanged: READY_CLEAN ");

  // attempt a new commitSuccessfulChanges
  SC.RunLoop.begin();
  apple.set( "title", "green apple" );
  store.commitSuccessfulChanges();
  SC.RunLoop.end();

  apple2 = store.find(Rec, 1);
  assert.equal(apple2.get('title'), 'green apple', 'the nested store should fetch the apple data from the main store');

  SC.RunLoop.begin();
  apple.reset();
  apple2.set( "title", "yellow apple" );
  SC.RunLoop.end();

  assert.equal(apple2.get('title'), 'yellow apple', 'apple2  should still be editable into the nested store');
  assert.equal(apple.get('title'), 'green apple', 'original apple.title should NOT change');
  assert.equal(apple.fired, false, 'original apple.title should not have notified');

  SC.RunLoop.begin();
  store.destroy();
  SC.RunLoop.end();
});
