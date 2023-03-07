// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { SCArray } from "../../../../core/mixins/array.js";
import { Freezable } from "../../../../core/mixins/freezable.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run } from "../../../../core/system/runloop.js";
import { ListView } from "../../../../desktop/desktop.js";
import { CollectionRowDelegate } from "../../../../desktop/mixins/collection_row_delegate.js";

var view, del, content;
module("ListView.rowDelegate", {
  beforeEach: function() {
    del = SC.Object.create(CollectionRowDelegate);

    // fake empty array that implements delegate
    content = SC.Object.create(CollectionRowDelegate, SCArray, Freezable, {

      isFrozen: true,

      length: 0,

      objectAt: function(idx) { return undefined; }
    });

  }
});

// ..........................................................
// BASIC CONFIGURATION
//

test("no delegate and no content", function (assert) {
  view = ListView.create();
  assert.equal(view.get('delegate'), null, 'precond - delegate should be null');
  assert.equal(view.get('content'), null, 'precond - content should be null');
  assert.equal(view.get('rowDelegate'), view, 'default row delegate should view');
});

test("with no delegate and content not delegate", function (assert) {
  var array = [];
  view = ListView.create({ content: array });

  assert.equal(view.get('delegate'), null, 'precond - delegate should be null');
  assert.ok(!view.get('content').isCollectionRowDelegate, 'precond - content should not be CollectionRowDelegate');
  assert.equal(view.get('rowDelegate'), view, 'default row delegate should view');
});

test("with no delegate and content is delegate", function (assert) {
  view = ListView.create({ content: content });

  assert.equal(view.get('delegate'), null, 'precond - delegate should be null');
  assert.equal(view.get('content').isCollectionRowDelegate, true, 'precond - content should be CollectionRowDelegate');
  assert.equal(view.get('rowDelegate'), content, 'row delegate should be content');
});

test("with delegate and content is delegate", function (assert) {
  view = ListView.create({ delegate: del, content: content });

  assert.equal(view.get('delegate').isCollectionRowDelegate, true, 'precond - delegate should be CollectionRowDelegate');
  assert.equal(view.get('content').isCollectionRowDelegate, true, 'precond - content should be CollectionRowDelegate');
  assert.equal(view.get('rowDelegate'), del, 'row delegate should be delegate');
});

// ..........................................................
// CHANGING PROPERTIES
//

test("modifying delegate and content", function (assert) {
  var callCount = 0 ;

  view = ListView.create();
  view.addObserver('rowDelegate', function() { callCount++; });

  assert.equal(view.get('delegate'), null, 'precond - delegate should be null');
  assert.equal(view.get('content'), null, 'precond - content should be null');
  assert.equal(view.get('rowDelegate'), view, 'default row delegate should view');

  // test setting content
  callCount=0;
  run(function() { view.set('content', content); });
  assert.ok(callCount>0, 'rowDelegate should change when setting content');
  assert.equal(view.get('rowDelegate'), content, 'rowDelegate should change after setting content');

  // test setting delegate
  callCount=0;
  run(function() { view.set('delegate', del); });
  assert.ok(callCount>0, 'rowDelegate should change when setting delegate');
  assert.equal(view.get('rowDelegate'), del, 'rowDelegate should change to delegate after setting delegate');

  // test changing content
  callCount=0;
  run(function() { view.set('content', []); });
  assert.ok(callCount>0, 'rowDelegate should change when setting content');
  assert.equal(view.get('rowDelegate'), del, 'rowDelegate should stay delegate as long as delegate remains');

  // test changing delegate
  callCount=0;
  run(function() { view.set('delegate', null); });
  assert.ok(callCount>0, 'rowDelegate should change when setting delegate');
  assert.equal(view.get('rowDelegate'), view, 'rowDelegate should go back to view when delegate and content cleared or do not implement');

});

// ..........................................................
// NOTIFICATIONS
//

test("changing the rowHeight should invalidate all row heights", function (assert) {
  var indexes = null;
  view = ListView.create({
    content:  '1 2 3 4 5'.w(), // provide some content
    delegate: del,

    // override for testing
    rowSizeDidChangeForIndexes: function(passed) {
      indexes = passed;
    }
  });

  indexes = null;
  del.set('rowHeight', 30);
  assert.deepEqual(indexes, IndexSet.create(0,5), 'changing row height should call rowSizeDidChangeForIndexes(0..5)');

  // remove del and try again to verify that it stops tracking changes
  view.set('delegate', null);
  indexes = null;
  del.set('rowHeight', 23);
  assert.equal(indexes, null, 'once delegate is removed changed rowHeight should not impact anything');

  // change row height on the view without a delegate to verify new observers
  // are setup.
  indexes = null;
  view.set('rowHeight', 14);
  assert.deepEqual(indexes, IndexSet.create(0,5), 'changing row height should call rowSizeDidChangeForIndexes(0..5)');

});


test("changing the customRowHeightIndexes should invalidate impacted row heights", function (assert) {
  var indexes = null;
  view = ListView.create({
    content:  '1 2 3 4 5'.w(), // provide some content
    delegate: del,

    // override for testing
    rowSizeDidChangeForIndexes: function(passed) {
      indexes = passed;
    }
  });

  // try changing the index set
  indexes = null;
  var set = IndexSet.create(2,2);
  del.set('customRowHeightIndexes', set);
  assert.deepEqual(indexes, set, 'setting customRowHeightIndexes for first time should invalidate indexes only');

  // modify the set
  indexes = null ;
  set.add(1,3);
  // assert.deepEqual(indexes, set, 'modifying index set should invalidate all old and new indexes');
  assert.ok(indexes.contains(set), 'modifying index set should invalidate all old and new indexes');

  // changing to a new set
  indexes =null ;
  var set2 = IndexSet.create(0,1);
  del.set('customRowHeightIndexes', set2);
  // assert.deepEqual(indexes, set.copy().add(set2), 'setting new indexes should invalidate both old and new indexes');
  assert.ok(indexes.contains(set) && indexes.contains(set2) && indexes.length === (set.length + set2.length), 'setting new indexes should invalidate both old and new indexes');

  // remove an set
  indexes =null ;
  del.set('customRowHeightIndexes', null);
  // assert.deepEqual(indexes, set2, 'setting indexes to null should invalidate old index set');
  assert.ok(indexes.contains(set2) && indexes.length === set2.length, 'setting indexes to null should invalidate old index set');

  // try removing delegate
  del.set('customRowHeightIndexes', set2);
  indexes = null;
  view.set('delegate', null);
  // assert.deepEqual(indexes, set2, 'removing delegate should invalidate old index set');
  assert.ok(indexes.contains(set2) && indexes.length === set2.length, 'removing delegate should invalidate old index set');

  // change delegate once removed.
  indexes = null ;
  del.set('customRowHeightIndexes', set);
  assert.equal(indexes, null, 'modifying delegate once removed should not change view');

});
