// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView } from "../../../../desktop/desktop.js";
import { CollectionViewDelegate } from "../../../../desktop/desktop.js";
import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { run } from "../../../../core/system/runloop.js";
var view, sel, content ;

module("CollectionView.deselect", {
  beforeEach: function() {

    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

    sel  = SelectionSet.create().add(content,4,4);

    view = CollectionView.create({
      content: content,
      selection: sel
    });
  }
});

// ..........................................................
// BASIC OPERATIONS
//

test("deselect(indexes=Number)", function (assert) {
  var expected = SelectionSet.create().add(content,4,4).remove(content,6),
      actual ;

  run(function() { view.deselect(6); });

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should remove index (expected: %@ actual: %@)'.fmt(expected, actual));
});


test("deselect(indexes=IndexSet)", function (assert) {
  var actual, expected = SelectionSet.create()
                                .add(content,4,4).remove(content,6,2);

  run(function() { view.deselect(IndexSet.create(6,2)); });

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should remove index (expected: %@ actual: %@)'.fmt(expected, actual));
});


test("deselect() with empty selection", function (assert) {
  var expected = SelectionSet.create(),
      actual ;

  run(function() { view.set('selection', expected); });
  run(function() { view.deselect(IndexSet.create(6,2)); });

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'deselect should do nothing (expected: %@ actual: %@)'.fmt(expected, actual));
});

// ..........................................................
// DELEGATE TESTS
//

var del;

module("CollectionView.deselect - delegate support", {
  beforeEach: function() {

    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

    del  = SC.Object.create(CollectionViewDelegate);
    sel  = SelectionSet.create().add(content, 4,4);
    view = CollectionView.create({
      delegate: del,
      selection: sel,
      content: content
    });
  }
});

test("should call delegate if set", function (assert) {
  var callCount1 = 0, callCount2 = 0 ;
  del.collectionViewShouldDeselectIndexes = function(v, indexes, extend) {
    callCount1++;
    return indexes;
  };

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {
    callCount2++;
    return indexes ;
  };

  view.deselect(3);
  assert.equal(callCount1, 1, 'should invoke collectionViewShouldDeselectIndexes on delegate 1x');
  assert.equal(callCount2, 1, 'should invoke collectionViewSelectionForProposedSelection on delegate 1x if change is allowed');

});

test("not calling collectionViewSelectionForProposedSelection if collectionViewShouldDeselectIndexes returns null", function (assert) {
  var callCount1 = 0, callCount2 = 0 ;
  del.collectionViewShouldDeselectIndexes = function(v, indexes, extend) {
    callCount1++;
    return null;
  };

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {
    callCount2++;
    return indexes ;
  };

  view.deselect(3);
  assert.equal(callCount1, 1, 'should invoke collectionViewShouldDeselectIndexes on delegate 1x');
  assert.equal(callCount2, 0, 'should NOT invoke collectionViewSelectionForProposedSelection on delegate since no change was allowed');

});

test("del.collectionViewShouldDeselectIndexes - replacing selection", function (assert) {

  del.collectionViewShouldDeselectIndexes = function(v, indexes, extend) {
    return indexes.without(3);
  };
  view.deselect(IndexSet.create(0,4));

  var expected = sel.copy().remove(content,IndexSet.create(0,4).remove(3)),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should only include those allowed by delegate (i.e. not index 3) (expected: %@ actual: %@)'.fmt(expected, actual));

});

test("del.collectionViewShouldDeselectIndexes - returns empty index set", function (assert) {

  del.collectionViewShouldDeselectIndexes = function(v, indexes) {
    return indexes.without(5);
  };

  view.deselect(4);
  view.deselect(5); // should be ignored
  var expected = sel.copy().remove(content,4),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should deselect only items returned by delegate (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewShouldDeselectIndexes - delegate returns null", function (assert) {

  del.collectionViewShouldDeselectIndexes = function(v, indexes, extend) {
    return null;
  };

  view.deselect(4); // should be ignored
  var expected = sel,
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should not change if delegate returns null (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewSelectionForProposedSelection - returns indexes", function (assert) {

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {

    var expected = sel.copy().remove(content,5),
        actual   = indexes;
    assert.ok(expected.isEqual(actual), 'should pass proposed selection to delegate (expected: %@ actual: %@)'.fmt(expected, actual));

    assert.equal(v, view, 'should pass view to delegate');

    return SelectionSet.create().add(content, 10,20);
  };

  view.deselect(5); // should be ignored
  var expected = SelectionSet.create().add(content, 10,20),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should set selection to whatever is returned from delegate (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewSelectionForProposedSelection - returns null", function (assert) {

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {
    return null;
  };

  view.deselect(5); // should be ignored
  var expected = SelectionSet.create(),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should set selection to empty set if returns null (expected: %@ actual: %@)'.fmt(expected, actual));

});

// ..........................................................
// SPECIAL CASES
//

test("deselecting a range should remove individual objects in range also", function (assert) {

  var obj = content.objectAt(1);
  var expected = SelectionSet.create().add(content, 5,3),
      actual;

  sel.addObject(obj);
  view.deselect(IndexSet.create(0,5));

  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should remove content[1] from selection (expected: %@ actual: %@)'.fmt(expected, actual));
});


