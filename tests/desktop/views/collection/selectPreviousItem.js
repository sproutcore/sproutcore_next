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

module("CollectionView.selectPreviousItem", {
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

test("selectPreviousItem(extend=undefined, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = selectionFromIndex(3),
      actual;

  view.set('selection', sel);
  view.selectPreviousItem();

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should select previous to %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectPreviousItem(extend=false, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = selectionFromIndex(3),
      actual;

  view.set('selection', sel);
  view.selectPreviousItem(false);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should select previous to %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectPreviousItem(extend=true, numberOfItems=undefined)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = SelectionSet.create().add(content,3,2),
      actual;

  view.set('selection', sel);
  view.selectPreviousItem(true);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should extend to previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectPreviousItem(extend=true, numberOfItems=2)", function (assert) {
  var sel = selectionFromIndex(4),
      expected = SelectionSet.create().add(content,2,3),
      actual;

  view.set('selection', sel);
  view.selectPreviousItem(true,2);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should extend to previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

// ..........................................................
// ANCHOR CASES
//

test("anchor test", function (assert) {
  var sel = SelectionSet.create().add(content,2,3),
      expected, actual;

  view.set('selection', sel);

  // TRY 1: Set anchor
  view.selectPreviousItem(true); // first one sets the anchor
  expected = SelectionSet.create().add(content,2,2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 1: should reduce end of selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 2: further reduce selection
  view.selectPreviousItem(true);
  expected = selectionFromIndex(2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 2: should reduce end of selection again (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 3: selection as only anchor, start to increase top
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,1,2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 3: should extend selection at top (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 4: further expand selection from top
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,0,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 4: should extend selection at top again (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 5: at top; can no longer expand selection
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,0,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 5: selection it at top, cannot extend further (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 6: try again just to be sure
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,0,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 6: multiple calls when already at top do nothing (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

});

test("anchor test 2", function (assert) {
  var sel = SelectionSet.create().add(content,4,5),
      expected, actual;

  view.set('selection', sel);

  // TRY 1: Set anchor
  view.selectPreviousItem(true); // first one sets the anchor
  expected = SelectionSet.create().add(content,4,4);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 1: should reduce end of selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 2: further reduce selection
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,4,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 2: should reduce end of selection again (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 3: don't extend.  jumps to previous item and resets selection
  view.selectPreviousItem(false);
  expected = selectionFromIndex(3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 3: not extending clears selection and anchor (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 4: now should expand from top with new selection
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,2,2);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 4: should expand from top of new selection (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));
  sel = actual;

  // TRY 5: at top; can no longer expand selection
  view.selectPreviousItem(true);
  expected = SelectionSet.create().add(content,1,3);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'TRY 5: should further expand top (sel: %@ expected: %@ actual: %@)'.fmt(sel, expected, actual));

});


// ..........................................................
// EDGE CASES
//

test("selectPreviousItem() when selection is 0..0", function (assert) {
  var sel = selectionFromIndex(0),
      expected = selectionFromIndex(0),
      actual;

  view.set('selection', sel);
  view.selectPreviousItem();

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should should not change from previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});

test("selectPreviousItem(true) when selection is 0..1", function (assert) {
  var sel = SelectionSet.create().add(content,0,2),
      expected = SelectionSet.create().add(content,0,2),
      actual;

  view.set('selection', sel);
  view._selectionAnchor = 1 ; // fake anchor
  view.selectPreviousItem(true);

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should should not change from previous of %@ (expected: %@ actual: %@)'.fmt(sel, expected, actual));
});
