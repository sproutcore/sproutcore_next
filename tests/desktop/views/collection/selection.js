// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run } from "../../../../core/system/runloop.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { CollectionView } from "../../../../desktop/desktop.js";

var view ;
var content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
  return SC.Object.create({ title: x });
});

module("CollectionView.selection", {
  beforeEach: function() {
    view = CollectionView.create({
      isVisibleInWindow: true, // force render
      content: content
    });
  }
});

/*
  Helper method to validate that the item views in the view have the
  proper selection state.  Pass in the collection view and the selection.

  @param {CollectionView} view the view to test
  @param {IndexSet} sel the index set
  @param {String} testName the name of the test
  @returns {void}
*/
function verifySelection(view, sel, testName) {
  var childViews = view.get('childViews'),
      len = childViews.get('length'),
      idx, itemView, expected, actual ;

  if (!testName) testName = '';

  assert.equal(len, view.get('nowShowing').get('length'), '%@ precond - must have childViews for each nowShowing'.fmt(testName));

  for(idx=0;idx<len;idx++) {
    itemView = childViews[idx];
    assert.ok(!SC.none(itemView.contentIndex), '%@ precond - itemView[%@] must have contentIndex'.fmt(testName, idx));

    expected = sel.contains(itemView.contentIndex);
    actual   = itemView.get('isSelected');
    assert.equal(actual, expected, '%@ itemView[%@].isSelected should match selection(%@)'.fmt(testName, idx, sel));
  }
}

// ..........................................................
// SELECTION SYNCING WITH ITEM VIEWS
//

test("item views should have proper isSelected state on reload", function (assert) {
  var sel = IndexSet.create(3,2).add(8),
      set = SelectionSet.create().add(view.get('content'), sel);

  view.set('selection', set);
  run(function() { view.reload(); }); // make sure it loads

  verifySelection(view, sel);
});

test("item views should update isSelected state when selection property changes", function (assert) {

  var sel1 = IndexSet.create(3,2),
      sel2 = IndexSet.create(8);

  view.set('selection',SelectionSet.create().add(view.content, sel1));
  run(function() { view.reload(); });
  verifySelection(view, sel1, 'before');

  run(function() {
    view.set('selection',SelectionSet.create().add(view.content, sel2));
  });
  verifySelection(view, sel2, 'after');

});

test("item views should not update isSelected state when old index set selection changes", function (assert) {

  var sel1 = IndexSet.create(3,2),
      sel2 = IndexSet.create(8);

  view.set('selection',SelectionSet.create().add(view.content, sel1));
  run(function() { view.reload(); });
  run(function() {
    view.set('selection', SelectionSet.create().add(view.content, sel2));
  });
  verifySelection(view, sel2, 'before');

  run(function() { sel1.add(10).remove(8); });
  verifySelection(view, sel2, 'after');

});

test("item views should update isSelected state when selection index set is modified", function (assert) {

  var sel = IndexSet.create(3,2),
      content = view.get('content'),
      set = SelectionSet.create().add(content, sel);

  view.set('selection',set);
  run(function() { view.reload(); });
  verifySelection(view, sel, 'before');

  run(function() { set.add(content, 8).remove(content, 4); });
  verifySelection(view, IndexSet.create(3).add(8), 'after');

});


// ..........................................................
// SPECIAL CASES
//

test("reloading some items should still update selection properly", function (assert) {
  var sel1 = IndexSet.create(3,2),
      sel2 = IndexSet.create(4,2).add(8);

  view.set('selection', SelectionSet.create().add(view.content, sel1));
  run(function() { view.reload(); });

  run(function() {
    view.reload(IndexSet.create(4).add(8));
    view.set('selection', SelectionSet.create().add(view.content, sel2));
  });

  verifySelection(view, sel2, 'after');
});

test("select() should round trip", function (assert) {

  var sel = IndexSet.create(3,2);

  run(function() { view.reload(); }); // make sure view is all ready
  run(function() { view.select(sel); });
  verifySelection(view, sel);
});




