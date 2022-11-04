// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, ok, equals, same, test */

// NOTE: The test below are based on the Data Hashes state chart.  This models
// the "commit" event in the NestedStore portion of the diagram.

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var parent, store, child, storeKey, json, args;
module("NestedStore#commitChanges", {
  beforeEach: function() {
    SC.RunLoop.begin();

    parent = Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   true
    };
    args = [];

    storeKey = Store.generateStoreKey();

    store = parent.chain(); // create nested store
    child = store.chain();  // test multiple levels deep

    // override commitChangesFromNestedStore() so we can ensure it is called
    // save call history for later evaluation
    parent.commitChangesFromNestedStore =
    child.commitChangesFromNestedStore =
    store.commitChangesFromNestedStore = function(store, changes, force) {
      args.push({
        target: this,
        store: store,
        changes: changes,
        force: force
      });
    };

    SC.RunLoop.end();
  }
});

// ..........................................................
// BASIC STATE TRANSITIONS
//

function testStateTransition(shouldIncludeStoreKey, shouldCallParent) {

  // attempt to commit
  assert.equal(store.commitChanges(), store, 'should return receiver');

  // verify result
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'data edit state');

  if (shouldCallParent === false) {
    assert.ok(!args || args.length===0, 'should not call commitChangesFromNestedStore');
  } else {
    assert.equal(args.length, 1, 'should have called commitChangesFromNestedStore');

    var opts = args[0] || {}; // avoid exceptions
    assert.equal(opts.target, parent, 'should have called on parent store');

    // verify if changes passed to callback included storeKey
    var changes = opts.changes;
    var didInclude = changes && changes.contains(storeKey);
    if (shouldIncludeStoreKey) {
      assert.ok(didInclude, 'passed set of changes should include storeKey');
    } else {
      assert.ok(!didInclude, 'passed set of changes should NOT include storeKey');
    }
  }

  assert.equal(store.get('hasChanges'), false, 'hasChanges should be cleared');
  assert.ok(!store.chainedChanges || store.chainedChanges.length===0, 'should have empty chainedChanges set');
}

test("state = INHERITED", function (assert) {

  // write in some data to parent
  parent.writeDataHash(storeKey, json);

  // check preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.INHERITED, 'precond - data edit state');

  testStateTransition(false, false);
});


test("state = LOCKED", function (assert) {

  // write in some data to parent
  parent.writeDataHash(storeKey, json);
  parent.editables = null ; // manually force to lock state
  store.readDataHash(storeKey);

  // check preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.LOCKED, 'precond - data edit state');
  assert.ok(!store.chainedChanges || !store.chainedChanges.contains(storeKey), 'locked record should not be in chainedChanges set');

  testStateTransition(false, false);
});

test("state = EDITABLE", function (assert) {

  // write in some data to parent
  store.writeDataHash(storeKey, json);
  store.dataHashDidChange(storeKey);

  // check preconditions
  assert.equal(store.storeKeyEditState(storeKey), Store.EDITABLE, 'precond - data edit state');
  assert.ok(store.chainedChanges  && store.chainedChanges.contains(storeKey), 'editable record should be in chainedChanges set');

  testStateTransition(true, true);
});


// ..........................................................
// SPECIAL CASES
// 

test("commiting a changed record should immediately notify outstanding records in parent store", function (assert) {

  var Rec = Record.extend({

    fooCnt: 0,
    fooDidChange: function() { this.fooCnt++; }.observes('foo'),

    statusCnt: 0,
    statusDidChange: function() { this.statusCnt++; }.observes('status'),

    reset: function() { this.fooCnt = this.statusCnt = 0; },

    equals: function(fooCnt, statusCnt, str) {
      if (!str) str = '' ;
      assert.equal(this.get('fooCnt'), fooCnt, str + ':fooCnt');
      assert.equal(this.get('statusCnt'), statusCnt, str + ':statusCnt');
    }

  });

  SC.RunLoop.begin();

  var store = Store.create();
  var prec  = store.createRecord(Rec, { foo: "bar", guid: 1 });

  var child = store.chain();
  var crec  = child.find(Rec, prec.get('id'));

  // check assumptions
  assert.ok(!!crec, 'prerec - should find child record');
  assert.equal(crec.get('foo'), 'bar', 'prerec - child record should have foo');

  // modify child record - should not modify parent
  prec.reset();
  crec.set('foo', 'baz');
  assert.equal(prec.get('foo'), 'bar', 'should not modify parent before commit');
  prec.equals(0,0, 'before commitChanges');

  // commit changes - note: still inside SC.RunLoop
  child.commitChanges();
  assert.equal(prec.get('foo'), 'baz', 'should push data to parent');
  prec.equals(1,1, 'after commitChanges'); // should notify immediately

  SC.RunLoop.end();

  // should not notify again after SC.RunLoop - nothing to do
  prec.equals(1,1,'after SC.RunLoop ends - should not notify again');

});


test("Changes to relationships should propagate to the parent store.", function (assert) {

  var MyApp = window.MyApp = SC.Object.create({
    store: Store.create()
  });

  MyApp.Rec = Record.extend({
    relatedChild: Record.toOne('MyApp.RelatedRec', {
      inverse: 'relatedParent'
    }),

    relatedChildren: Record.toMany('MyApp.RelatedRecs', {
      inverse: 'relatedParent'
    })
  });

  MyApp.RelatedRec = Record.extend({
    relatedParent: Record.toOne('MyApp.Rec', {
      inverse: 'relatedChild',
      isMaster: false
    })
  });

  MyApp.RelatedRecs = Record.extend({
    relatedParent: Record.toOne('MyApp.Rec', {
      inverse: 'relatedChildren',
      isMaster: false
    })
  });

  SC.RunLoop.begin();

  MyApp.store.loadRecord(MyApp.RelatedRec, { guid: 2, relatedParent: 1});
  MyApp.store.loadRecord(MyApp.RelatedRecs, { guid: 3, relatedParent: 1 });
  MyApp.store.loadRecord(MyApp.RelatedRecs, { guid: 4, relatedParent: 1 });
  MyApp.store.loadRecord(MyApp.Rec, { guid: 1, relatedChild: 2, relatedChildren: [3,4] });

  var primaryRec = MyApp.store.find(MyApp.Rec, 1);
  var primaryRelatedRec  = MyApp.store.find(MyApp.RelatedRec, 2);
  var primaryRelatedRecs1  = MyApp.store.find(MyApp.RelatedRecs, 3);
  var primaryRelatedRecs2  = MyApp.store.find(MyApp.RelatedRecs, 4);

  var nestedStore = MyApp.store.chain();
  var nestedRec = nestedStore.find(MyApp.Rec, primaryRec.get('id'));
  var nestedRelatedRec = nestedStore.find(MyApp.RelatedRec, primaryRelatedRec.get('id'));
  var nestedRelatedRecs1 = nestedStore.find(MyApp.RelatedRecs, primaryRelatedRecs1.get('id'));
  var nestedRelatedRecs2 = nestedStore.find(MyApp.RelatedRecs, primaryRelatedRecs2.get('id'));

  // check assumptions
  assert.ok(!!nestedRec, 'Prior to nested changes should find primaryRec in nested store');
  assert.ok(!!nestedRelatedRec, 'Prior to nested changes should find nestedRelatedRec in nested store');
  assert.ok(!!nestedRelatedRecs1, 'Prior to nested changes should find nestedRelatedRecs1 in nested store');
  assert.ok(!!nestedRelatedRecs2, 'Prior to nested changes should find nestedRelatedRecs2 in nested store');
  assert.equal(primaryRec.get('relatedChild'), primaryRelatedRec, 'Prior to changes primaryRec relatedChild should be');
  assert.equal(primaryRelatedRec.get('relatedParent'), primaryRec, 'Prior to changes primaryRelatedRec relatedParent should be');
  assert.equal(primaryRelatedRecs1.get('relatedParent'), primaryRec, 'Prior to changes primaryRelatedRecs1 relatedParent should be');
  assert.equal(primaryRelatedRecs2.get('relatedParent'), primaryRec, 'Prior to changes primaryRelatedRecs2 relatedParent should be');
  assert.equal(primaryRec.get('status'), Record.READY_CLEAN, 'Prior to changes primaryRec status should be READY_CLEAN');
  assert.equal(primaryRelatedRec.get('status'), Record.READY_CLEAN, 'Prior to changes primaryRelatedRec status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs1.get('status'), Record.READY_CLEAN, 'Prior to changes primaryRelatedRecs1 status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs2.get('status'), Record.READY_CLEAN, 'Prior to changes primaryRelatedRecs2 status should be READY_CLEAN');

  nestedRec.set('relatedChild', null);
  nestedRelatedRecs2.set('relatedParent', null);
  nestedRec.get('relatedChildren').popObject();

  // Modifying nested store record relationships should not modify primary store record relationships
  assert.equal(primaryRec.get('relatedChild'), primaryRelatedRec, 'After nested changes primaryRec relatedChild should be');
  assert.equal(primaryRelatedRec.get('relatedParent'), primaryRec, 'After nested changes primaryRelatedRec relatedParent should be');
  assert.equal(primaryRelatedRecs1.get('relatedParent'), primaryRec, 'After nested changes primaryRelatedRecs1 relatedParent should be');
  assert.equal(primaryRelatedRecs2.get('relatedParent'), primaryRec, 'After nested changes primaryRelatedRecs2 relatedParent should be');
  assert.equal(primaryRec.get('status'), Record.READY_CLEAN, 'After nested changes primaryRec status should be READY_CLEAN');
  assert.equal(primaryRelatedRec.get('status'), Record.READY_CLEAN, 'After nested changes primaryRelatedRec status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs1.get('status'), Record.READY_CLEAN, 'After nested changes primaryRelatedRecs1 status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs2.get('status'), Record.READY_CLEAN, 'After nested changes primaryRelatedRecs2 status should be READY_CLEAN');
  assert.equal(nestedRec.get('relatedChild'), null, 'After nested changes nestedRec relatedChild should be');
  assert.equal(nestedRelatedRec.get('relatedParent'), null, 'After nested changes nestedRelatedRec relatedParent should be');
  assert.equal(nestedRelatedRecs1.get('relatedParent'), null, 'After nested changes nestedRelatedRecs1 relatedParent should be');
  assert.equal(nestedRelatedRecs2.get('relatedParent'), null, 'After nested changes nestedRelatedRecs2 relatedParent should be');
  assert.equal(nestedRec.get('status'), Record.READY_DIRTY, 'After nested changes relatedChild status should be READY_DIRTY');
  assert.equal(nestedRelatedRec.get('status'), Record.READY_CLEAN, 'After nested changes nestedRelatedRec status should be READY_CLEAN');
  assert.equal(nestedRelatedRecs1.get('status'), Record.READY_CLEAN, 'After nested changes nestedRelatedRecs1 status should be READY_CLEAN');
  assert.equal(nestedRelatedRecs2.get('status'), Record.READY_CLEAN, 'After nested changes nestedRelatedRecs2 status should be READY_CLEAN');

  // commit changes - note: still inside SC.RunLoop
  nestedStore.commitChanges();
  assert.equal(primaryRec.get('relatedChild'), null, 'After commit changes primaryRec relatedChild should be');
  assert.equal(primaryRelatedRec.get('relatedParent'), null, 'After commit changes primaryRelatedRec relatedParent should be');
  assert.equal(primaryRelatedRecs1.get('relatedParent'), null, 'After commit changes primaryRelatedRecs1 relatedParent should be');
  assert.equal(primaryRelatedRecs2.get('relatedParent'), null, 'After commit changes primaryRelatedRecs2 relatedParent should be');
  assert.equal(primaryRec.get('status'), Record.READY_DIRTY, 'After commit changes primaryRec status should be READY_DIRTY');
  assert.equal(primaryRelatedRec.get('status'), Record.READY_CLEAN, 'After commit changes primaryRelatedRec status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs1.get('status'), Record.READY_CLEAN, 'After commit changes primaryRelatedRecs1 status should be READY_CLEAN');
  assert.equal(primaryRelatedRecs2.get('status'), Record.READY_CLEAN, 'After commit changes primaryRelatedRecs2 status should be READY_CLEAN');

  SC.RunLoop.end();

  delete window.MyApp;
});
