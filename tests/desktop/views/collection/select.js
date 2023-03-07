// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView, CollectionViewDelegate } from "../../../../desktop/desktop.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";



var view ;
var content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
  return SC.Object.create({ title: x });
});

module("CollectionView.select", {
  beforeEach: function() {
    view = CollectionView.create({
      content: content
    });
  }
});

// ..........................................................
// BASIC OPERATIONS
//

test("return value", function (assert) {
  assert.equal(view.select(3), view, 'should return receiver')  ;
});

test("calling select(indexes=Number)", function (assert) {

  view.select(3);

  var expected = SelectionSet.create().addObject(content.objectAt(3)),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should have object (expected: %@ actual: %@)'.fmt(expected, actual));
});

test("calling select(indexes=Number, extend=true)", function (assert) {

  var base = SelectionSet.create().add(content, 3,3),
      next = 1,
      expected = base.copy().addObject(content.objectAt(next)),
      actual;

  view.select(IndexSet.create(3,3));
  actual = view.get('selection');
  assert.ok(base.isEqual(actual), 'precond - should have base selection (expected: %@ actual: %@)'.fmt(expected, actual));

  view.select(1, true);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should add set to existing selection (expected: %@ actual: %@)'.fmt(expected, actual));
});

test("calling select(indexes=IndexSet)", function (assert) {

  var expected = SelectionSet.create().add(content, 3,3), actual;

  view.select(IndexSet.create(3,3));
  actual = view.get('selection');

  assert.ok(expected.isEqual(actual), 'selection should have passed index set only (expected: %@ actual: %@)'.fmt(expected, actual));
});

test("calling select(indexes=IndexSet, extend=true)", function (assert) {

  var base = SelectionSet.create().add(content,3,3),
      next = SelectionSet.create().add(content,0,2),
      expected = base.copy().add(content, 0,2),
      actual;

  view.select(IndexSet.create(3,3));
  actual = view.get('selection');
  assert.ok(base.isEqual(actual), 'precond - should have base selection (expected: %@ actual: %@)'.fmt(base, actual));

  var indexes = IndexSet.create(0,2);
  view.select(indexes, true);
  actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should add set to existing selection (expected: %@ actual: %@)'.fmt(expected, actual));
});

test("calling select(indexes=null)", function (assert) {
  view.select(IndexSet.create(4,2));
  view.select(null);

  var expected = SelectionSet.create(),
      actual = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should be empty (expected: %@ actual: %@)'.fmt(expected, actual));
});

// ..........................................................
// DELEGATE TESTS
//

var del;

module("CollectionView.select - delegate support", {
  beforeEach: function() {
    del  = SC.Object.create(CollectionViewDelegate);
    view = CollectionView.create({
      delegate: del,
      content: content
    });
  }
});

test("should call delegate if set", function (assert) {
  var callCount1 = 0, callCount2 = 0 ;
  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    callCount1++;
    return indexes;
  };

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {
    callCount2++;
    return indexes ;
  };

  view.select(3);
  assert.equal(callCount1, 1, 'should invoke collectionViewShouldSelectIndexes on delegate 1x');
  assert.equal(callCount2, 1, 'should invoke collectionViewSelectionForProposedSelection on delegate 1x if change is allowed');

});

test("calling collectionViewSelectionForProposedSelection if collectionViewShouldSelectIndexes returns null", function (assert) {
  var callCount1 = 0, callCount2 = 0 ;
  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    callCount1++;
    return null;
  };

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {
    callCount2++;
    return indexes ;
  };

  view.select(3);
  assert.equal(callCount1, 1, 'should invoke collectionViewShouldSelectIndexes on delegate 1x');
  assert.equal(callCount2, 0, 'should NOT invoke collectionViewSelectionForProposedSelection on delegate since no change was allowed');

});

test("del.collectionViewShouldSelectIndexes - replacing selection", function (assert) {

  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    return indexes.without(3);
  };
  view.select(IndexSet.create(0,4));

  var expected = SelectionSet.create().add(content, 0,4).remove(content,3),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should only include those allowed by delegate (i.e. not index 3) (expected: %@ actual: %@)'.fmt(expected, actual));

});

test("del.collectionViewShouldSelectIndexes - extending selection", function (assert) {

  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    return indexes.without(3);
  };

  view.select(IndexSet.create(0,4));
  view.select(IndexSet.create(3,3), true);

  var expected = SelectionSet.create().add(content,0,6).remove(content,3),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should extend only those allowed by delegate (i.e. not index 3) (expected: %@ actual: %@)'.fmt(expected, actual));

});

test("del.collectionViewShouldSelectIndexes - returns empty index set", function (assert) {

  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    return indexes.without(3);
  };

  view.select(2);
  view.select(3); // should be ignored
  var expected = SelectionSet.create().addObject(content.objectAt(2)),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should not change if delegate does not allow any proposed selected indexes (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewShouldSelectIndexes - delegate returns null", function (assert) {

  view.select(2);

  del.collectionViewShouldSelectIndexes = function(v, indexes, extend) {
    return null;
  };

  view.select(10); // should be ignored
  var expected = SelectionSet.create().addObject(content.objectAt(2)),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'selection should not change if delegate returns null (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewSelectionForProposedSelection - returns indexes", function (assert) {

  del.collectionViewSelectionForProposedSelection = function(v, indexes) {

    var expected = SelectionSet.create().addObject(content.objectAt(10)),
        actual   = indexes;
    assert.ok(expected.isEqual(actual), 'should pass proposed selection to delegate (expected: %@ actual: %@)'.fmt(expected, actual));

    assert.equal(v, view, 'should pass view to delegate');

    return SelectionSet.create().add(content,10,20);
  };

  view.select(10); // should be ignored
  var expected = SelectionSet.create().add(content,10,20),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should set selection to whatever is returned from delegate (expected: %@ actual: %@)'.fmt(expected, actual));

});


test("del.collectionViewSelectionForProposedSelection - returns null", function (assert) {

  del.collectionViewSelectionForProposedSelection = function(v, indexes, extend) {
    return null;
  };

  view.select(10); // should be ignored
  var expected = SelectionSet.create(),
      actual   = view.get('selection');
  assert.ok(expected.isEqual(actual), 'should set selection to empty set if returns null (expected: %@ actual: %@)'.fmt(expected, actual));

});







