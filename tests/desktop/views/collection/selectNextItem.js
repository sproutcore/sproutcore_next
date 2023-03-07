// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { CollectionView } from "../../../../desktop/desktop.js";

var view ;
var content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
  return SC.Object.create({ title: x });
});

module("CollectionView.selectNextItem", {
  beforeEach: function() {
    view = CollectionView.create({
      content: content
    });
  }
});

/*
  Creates an SelectionSet from a given index.

  @param {Number} index the index of the content to select
  @returns {SelectionSet}
*/

function selectionFromIndex(index) {
  var ret = SelectionSet.create();
  ret.addObject(content.objectAt(index));

  return ret;
}

// ..........................................................
// BASIC OPERATIONS
//

test("selectNextItem(extend=undefined, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = selectionFromIndex(5),
      actual;

  view.set('selection', sel);
  view.selectNextItem();

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should select next to %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectNextItem(extend=false, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = selectionFromIndex(5),
      actual;

  view.set('selection', sel);
  view.selectNextItem(false);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should select next to %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectNextItem(extend=true, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = SelectionSet.create().add(content,4,2),
      actual;

  view.set('selection', sel);
  view.selectNextItem(true);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should extend to next of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectNextItem(extend=true, numberOfItems=2)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = SelectionSet.create().add(content,4,3),
      actual;

  view.set('selection', sel);
  view.selectNextItem(true,2);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should extend to next of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

// ..........................................................
// ANCHOR CASES
//

test("anchor test", function (assert) {
  var sel = SelectionSet.create().add(content,5,3),
      expected, actual;

  view.set('selection', sel);

  // TRY 1: Set anchor
  view.selectNextItem(true); // first one sets the anchor
  expected = SelectionSet.create().add(content,5,4);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 1: should extend end of selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 2: further extend selection
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,5,5);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 2: should extend end of selection again (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 3: at end, should do nothing more
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,5,5);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 3: should do nothing at end of selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 4: at end, idempotent
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,5,5);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 4: multiple calls to extend when at end should do nothing (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));

});

test("anchor test 2 - anchor at end", function (assert) {
  var sel = SelectionSet.create().add(content,4,4),
      expected, actual;

  view.set('selection', sel);
  view._selectionAnchor = 7 ; // fake reverse anchor

  // TRY 1: Reduce selection
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,5,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 1: should reduce top of selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 2: further reduce selection
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,6,2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 2: should further reduce top of selection again (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 3: should make selection one item long
  view.selectNextItem(true);
  expected = selectionFromIndex(7);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 3: make selection one item long (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 4: should start to extend selection
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,7,2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 4: extend selection at end (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 5: should extend selection again
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,7,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 5: further extend selection at end (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 6: do nothing
  view.selectNextItem(true);
  expected = SelectionSet.create().add(content,7,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 6: do nothing because we are at end (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

});


// ..........................................................
// EDGE CASES
//

test("selectNextItem() when selection is 9..9", function (assert) {
  var sel = selectionFromIndex(9),
      expected = selectionFromIndex(9),
      actual;

  view.set('selection', sel);
  view.selectNextItem();

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should should not change from previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectNextItem(true) when selection is 8..9", function (assert) {
  var sel = SelectionSet.create().add(content,8,2),
      expected = SelectionSet.create().add(content,8,2),
      actual;

  view.set('selection', sel);
  view._selectionAnchor = 8 ; // fake anchor
  view.selectNextItem(true);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should should not change from previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});
