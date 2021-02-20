// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module test htmlbody ok equals same stop start Q$ */

import { SC, GLOBAL } from '../../../../core/core.js';

var controller, // The sample tree controller to test with
content, // The sample content
TestObject; // Class for sample content objects
//
TestObject = SC.Object.extend({
  title: "test",
  toString: function() {
    return "TestObject(%@)".fmt(this.get("title"));
  }
});

/**
  Common set up and teardown for the module. To run this test manually visit:
  http://localhost:4020/sproutcore/foundation/en/current/tests/controllers/tree/selection_support.html
*/
module("Test SelectionSupport mixin with TreeController.", {
  beforeEach: function() {
  var fruit = "Apples Bananas Cherries Dates Eggfruit".w().map(function(name) {
    return TestObject.create({
      displayName: name
    });
  });
    var fruitGroup = SC.Object.create(SC.TreeItemContent, {
      displayName: 'Fruit',
      treeItemChildren: fruit
    });
    var vegetables = "Arugula Beets Cucumbers Dandelions Endives".w().map(function(name) {
      return TestObject.create({
        displayName: name
      });
    });
      var vegetableGroup = SC.Object.create(SC.TreeItemContent, {
        displayName: 'Vegetables',
        treeItemChildren: vegetables
      });

    content = SC.Object.create(SC.TreeItemContent, {
      treeItemIsGrouped: true,
      treeItemIsExpanded: true,
      treeItemChildren: [fruitGroup, vegetableGroup]
    });

    controller = SC.TreeController.create({
      treeItemIsGrouped: false,
      content: content
    });
  },

  afterEach: function() {
  }
});

/**
  This test is not particularly useful, just a means to get warmed up for more advanced testing below.
*/
test("TreeController(SelectionSupport) defaults", function (assert) {
  assert.ok(controller.get("hasSelectionSupport"), 'tree controller hasSelectionSupport should be true');
  assert.ok(controller.get("allowsSelection"), 'tree controller allowsSelection should be true');
  assert.ok(controller.get("allowsMultipleSelection"), 'tree controller allowsMultipleSelection should be true');
  assert.ok(controller.get("allowsEmptySelection"), 'tree controller allowsEmptySelection should be true');
});

/**
  Make sure that first selectable object works even though the content and order may change.
*/
test("TreeController(SelectionSupport) first selectable object", function (assert) {
  assert.equal(controller.get('firstSelectableObject'), content.treeItemChildren[0].treeItemChildren[0], 'first selectable object should be the first object in arrangedObjects');

  // Reorder the content
  // content.treeItemChildren.sort(function(a,b) { return b > a; });
  // controller.set('orderBy', 'DESC title');
  //
  // assert.equal(controller.get('firstSelectableObject'), content.treeItemChildren[4], 'first selectable object should be the first object in arrangedObjects (changed order)');
});

/**
  Make sure that the empty selection property is honoured.
*/
test("TreeController(SelectionSupport) selection is empty only if allowed", function (assert) {
  var selectionSet, source = controller.get('arrangedObjects'),
  indexSet;

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(!controller.get('hasSelection'), 'tree controller should not have a selection');
  assert.ok(indexSet === null, 'selection set should not have an indexSet');

  // Disable allowing empty selection
  controller.set('allowsEmptySelection', false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'tree controller should have a selection');
  assert.ok(indexSet !== null, 'selection set should have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should have length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[0]), 'selection should be the first content object');
});

/**
  Make sure that the multiple selection property is honoured.
*/
test("TreeController(SelectionSupport) selection is multiple only if allowed", function (assert) {
  var selectionSet, source = controller.get('arrangedObjects'),
  indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[0], content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[1].treeItemChildren[4]], false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'tree controller should have a selection');
  assert.ok(indexSet !== null, 'selection set should have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[0]), 'selection should contain the first content object');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the third content object');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[4]), 'selection should contain the fifth content object');

  // Disable allowing multiple selection
  controller.set('allowsMultipleSelection', false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should have length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[4]), 'selection should be the fifth content object');
});

/**
  Test that selection remains while content grows.
*/
test("TreeController(SelectionSupport) selection remains while content grows", function (assert) {
  var selectionSet, source, newObject, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  // Add an item to the content
  newObject = TestObject.create({
    title: 'Figs'
  });
  content.treeItemChildren[0].treeItemChildren.pushObject(newObject);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 13, 'tree controller content should have 13 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length,  3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the second content object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[2]), 'selection should contain the third content object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');
});

/**
  Test that selection remains while content shrinks, but doesn't effect the selection.
*/
test("TreeController(SelectionSupport) selection remains while content shrinks", function (assert) {
  var selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  // Remove an item from the content without effecting the selection
  content.treeItemChildren[0].treeItemChildren.removeAt(0);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 11, 'tree controller content should have 11 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[0]), 'selection should contain the second content object (now first) of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the third content object (now second) of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object (still first) of the second group');

  // Remove another item from the content without effecting the selection
  content.treeItemChildren[1].treeItemChildren.removeAt(4);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 10, 'tree controller content should have 10 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[0]), 'selection should contain the second content object (still first) of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the third content object (still second) of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object (still first) of the second group');
});

/**
  Test that selection changes while content shrinks effecting the selection.
*/
test("TreeController(SelectionSupport) selection changes while content shrinks effecting the selection", function (assert) {
  var selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  // Remove an item from the content effecting the selection
  content.treeItemChildren[0].treeItemChildren.removeAt(2);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 11, 'tree controller content should have 11 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 2, 'selection set should length 2');
  assert.equal(indexSet.length, 2, 'selection set should have an indexSet with length 2');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the second content object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');

  // Remove another item from the content effecting the selection
  content.treeItemChildren[1].treeItemChildren.removeAt(0);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 10, 'tree controller content should have 10 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[1]), 'selection should contain the second content object of the first group');
});

/**
  Test that selection remains while content is replaced without effecting the selection.
*/
test("TreeController(SelectionSupport) selection remains while content is replaced without effecting the selection", function (assert) {
  var newObject1, newObject2, selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  newObject1 = TestObject.create({
    title: 'Figs'
  });
  newObject2 = TestObject.create({
    title: 'Grapefruits'
  });

  // Replace an item in the content without effecting the selection
  content.treeItemChildren[0].treeItemChildren.replace(0, 1, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 13, 'tree controller content should have 13 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[2]), 'selection should contain the second content (now third) object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[3]), 'selection should contain the third content (now fourth) object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');

  // Replace another item in the content without effecting the selection
  content.treeItemChildren[1].treeItemChildren.replace(3, 1, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 14, 'tree controller content should have 14 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length, 3, 'index set should have length 3');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[2]), 'selection should contain the second content (still third) object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[0].treeItemChildren[3]), 'selection should contain the third content (still fourth) object of the first group');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');
});

/**
  Test that selection remains while content is replaced effecting the selection.
*/
test("TreeController(SelectionSupport) selection remains while content is replaced effecting the selection", function (assert) {
  var newObject1, newObject2, selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  newObject1 = TestObject.create({
    title: 'Figs'
  });
  newObject2 = TestObject.create({
    title: 'Grapefruits'
  });

  // Replace an item in the content effecting the selection
  content.treeItemChildren[0].treeItemChildren.replace(1, 2, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 12, 'tree controller content should have 12 items');
  assert.ok(controller.get('hasSelection'), 'tree controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');

  // Replace another item in the content effecting the selection
  content.treeItemChildren[1].treeItemChildren.replace(0, 1, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 13, 'tree controller content should have 13 items');
  assert.ok(!controller.get('hasSelection'), 'tree controller should not have a selection');
  assert.equal(selectionSet.get('length'), 0, 'selection set should have length 0');
  assert.ok(indexSet === null, 'selection set should not have an indexSet');
});

/**
  Test that selection is cleared if the content is nulled.

  There was a bug that setting the content of a tree controller to null would
  throw an exception.
*/
test("TreeController(SelectionSupport) selection cleared if content is removed.", function (assert) {
  var newObject1, newObject2, selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content.treeItemChildren[0].treeItemChildren[1], content.treeItemChildren[0].treeItemChildren[2], content.treeItemChildren[1].treeItemChildren[0]], false);

  selectionSet = controller.get('selection');
  assert.equal(selectionSet.get('length'), 3, 'selection set should length 1');
  assert.ok(selectionSet.containsObject(content.treeItemChildren[1].treeItemChildren[0]), 'selection should contain the first content object of the second group');

  // Clear out the content of the tree controller.
  controller.set('content', null);

  // Selection should be empty.
  selectionSet = controller.get('selection');
  assert.equal(selectionSet.get('length'), 0, 'selection set should have length 0');
});

test("TreeController(SelectionSupport) selection settings should persist between controller and tree item observer", function (assert) {
  var treeItemObserver = controller.get('arrangedObjects');

  SC.RunLoop.begin();
  controller.set('allowsSelection', true);
  controller.set('allowsMultipleSelection', true);
  controller.set('allowsEmptySelection', true);
  SC.RunLoop.end();

  assert.equal(treeItemObserver.get('allowsSelection'), true, 'allowsSelection on the treeItemObserver should be true');
  assert.equal(treeItemObserver.get('allowsMultipleSelection'), true, 'allowsMultipleSelection on the treeItemObserver should be true');
  assert.equal(treeItemObserver.get('allowsEmptySelection'), true, 'allowsEmptySelection on the treeItemObserver should be true');

  SC.RunLoop.begin();
  controller.set('allowsSelection', false);
  controller.set('allowsMultipleSelection', false);
  controller.set('allowsEmptySelection', false);
  SC.RunLoop.end();

  assert.equal(treeItemObserver.get('allowsSelection'), false, 'allowsSelection on the treeItemObserver should be false');
  assert.equal(treeItemObserver.get('allowsMultipleSelection'), false, 'allowsMultipleSelection on the treeItemObserver should be false');
  assert.equal(treeItemObserver.get('allowsEmptySelection'), false, 'allowsEmptySelection on the treeItemObserver should be false');

});
