// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module test htmlbody ok assert.equal same stop start Q$ */
import { SC, GLOBAL } from '../../../../core/core.js';

var controller, // The sample array controller to test with
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
  http://localhost:4020/sproutcore/foundation/en/current/tests/controllers/array/selection_support.html
*/
module("Test SC.SelectionSupport mixin with ArrayController.", {
  beforeEach: function() {
    content = "Apples Bananas Cherries Dates Eggfruit".w().map(function(name) {
      return TestObject.create({
        title: name
      });
    });

    controller = SC.ArrayController.create({
      content: content
    });
  },

  afterEach: function() {
  }
});

/**
  This test is not particularly useful, just a means to get warmed up for more advanced testing below.
*/
test("SC.ArrayController(SC.SelectionSupport) defaults",
function() {
  assert.ok(controller.get("hasSelectionSupport"), 'array controller hasSelectionSupport should be true');
  assert.ok(controller.get("allowsSelection"), 'array controller allowsSelection should be true');
  assert.ok(controller.get("allowsMultipleSelection"), 'array controller allowsMultipleSelection should be true');
  assert.ok(controller.get("allowsEmptySelection"), 'array controller allowsEmptySelection should be true');
});

/**
  Make sure that first selectable object works even though the content and order may change.
*/
test("SC.ArrayController(SC.SelectionSupport) first selectable object",
function() {
  assert.equal(controller.get('firstSelectableObject'), content[0], 'first selectable object should be the first object in arrangedObjects');

  // Reorder the content
  controller.set('orderBy', 'title DESC');

  assert.equal(controller.get('firstSelectableObject'), content[4], 'first selectable object should be the first object in arrangedObjects (changed order)');
});

/**
  Make sure that the empty selection property is honoured.
*/
test("SC.ArrayController(SC.SelectionSupport) selection is empty only if allowed",
function() {
  var selectionSet, source = controller.get('arrangedObjects'),
  indexSet;

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(!controller.get('hasSelection'), 'array controller should not have a selection');
  assert.ok(indexSet === null, 'selection set should not have an indexSet');

  // Disable allowing empty selection
  controller.set('allowsEmptySelection', false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'array controller should have a selection');
  assert.ok(indexSet !== null, 'selection set should have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should have length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content[0]), 'selection should be the first content object');
});

/**
  Make sure that the multiple selection property is honoured.
*/
test("SC.ArrayController(SC.SelectionSupport) selection is multiple only if allowed",
function() {
  var selectionSet, source = controller.get('arrangedObjects'),
  indexSet;

  // Select 3 items
  controller.selectObjects([content[0], content[2], content[4]], false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'array controller should have a selection');
  assert.ok(indexSet !== null, 'selection set should have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content[0]), 'selection should contain the first content object');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the third content object');
  assert.ok(selectionSet.containsObject(content[4]), 'selection should contain the fifth content object');

  // Disable allowing multiple selection
  controller.set('allowsMultipleSelection', false);

  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should have length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content[4]), 'selection should be the fifth content object');
});

/**
  Test that selection remains while content grows.
*/
test("SC.ArrayController(SC.SelectionSupport) selection remains while content grows",
function() {
  var selectionSet, source, newObject, indexSet;

  // Select 3 items
  controller.selectObjects([content[1], content[2], content[3]], false);

  // Add an item to the content
  newObject = TestObject.create({
    title: 'Figs'
  });
  controller.addObject(newObject);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 6, 'array controller content should have six items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length,  3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the second content object');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the third content object');
  assert.ok(selectionSet.containsObject(content[3]), 'selection should contain the fourth content object');
});

/**
  Test that selection remains while content shrinks, but doesn't effect the selection.
*/
test("SC.ArrayController(SC.SelectionSupport) selection remains while content shrinks",
function() {
  var selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content[1], content[2], content[3]], false);

  // Remove an item from the content without effecting the selection
  controller.removeObject(content[0]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 4, 'array controller content should have four items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content[0]), 'selection should contain the second content object (now first)');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the third content object (now second)');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the fourth content object (now third)');

  // Remove another item from the content without effecting the selection
  controller.removeObject(content[3]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 3, 'array controller content should have three items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 3, 'selection set should have length 3');
  assert.equal(indexSet.length, 3, 'selection set should have an indexSet with length 3');
  assert.ok(selectionSet.containsObject(content[0]), 'selection should contain the second content object (still first)');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the third content object (still second)');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the fourth content object (still third)');
});

/**
  Test that selection changes while content shrinks effecting the selection.
*/
test("SC.ArrayController(SC.SelectionSupport) selection changes while content shrinks effecting the selection",
function() {
  var selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content[1], content[2], content[3]], false);

  // Remove an item from the content effecting the selection
  controller.removeObject(content[2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 4, 'array controller content should have four items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 2, 'selection set should have length 2');
  assert.equal(indexSet.length, 2, 'selection set should have an indexSet with length 2');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the second content object');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the fourth content object (now third)');

  // Remove another item from the content effecting the selection
  controller.removeObject(content[1]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 3, 'array controller content should have three items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 1, 'selection set should have length 1');
  assert.equal(indexSet.length, 1, 'selection set should have an indexSet with length 1');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the fourth content object (now second)');
});

/**
  Test that selection remains while content is replaced without effecting the selection.
*/
test("SC.ArrayController(SC.SelectionSupport) selection remains while content is replaced without effecting the selection",
function() {
  var newObject1, newObject2, selectionSet, source, indexSet;

  // Select 2 items
  controller.selectObjects([content[1], content[2]], false);

  newObject1 = TestObject.create({
    title: 'Figs'
  });
  newObject2 = TestObject.create({
    title: 'Grapefruits'
  });

  // Replace an item in the content without effecting the selection
  controller.replace(3, 1, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 6, 'array controller content should have six items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 2, 'selection set should have length 2');
  assert.equal(indexSet.length, 2, 'selection set should have an indexSet with length 2');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the second content object');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the third content object');

  // Replace another item in the content without effecting the selection
  controller.replace(0, 1, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 7, 'array controller content should have seven items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 2, 'selection set should have length 2');
  assert.equal(indexSet.length, 2, 'selection set should have an indexSet with length 2');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the second content object (now third)');
  assert.ok(selectionSet.containsObject(content[3]), 'selection should contain the third content object (now fourth)');
});

/**
  Test that selection remains while content is replaced effecting the selection.
*/
test("SC.ArrayController(SC.SelectionSupport) selection remains while content is replaced effecting the selection",
function() {
  var newObject1, newObject2, selectionSet, source, indexSet;

  // Select 3 items
  controller.selectObjects([content[1], content[2], content[3]], false);

  newObject1 = TestObject.create({
    title: 'Figs'
  });
  newObject2 = TestObject.create({
    title: 'Grapefruits'
  });

  // Replace an item in the content effecting the selection
  controller.replace(3, 1, [newObject1]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 5, 'array controller content should have five items');
  assert.ok(controller.get('hasSelection'), 'array controller should still have a selection');
  assert.ok(indexSet !== null, 'selection set should still have an indexSet');
  assert.equal(selectionSet.get('length'), 2, 'selection set should have length 2');
  assert.equal(indexSet.length, 2, 'selection set should have an indexSet with length 2');
  assert.ok(selectionSet.containsObject(content[1]), 'selection should contain the second content object');
  assert.ok(selectionSet.containsObject(content[2]), 'selection should contain the third content object');

  // Replace another item in the content effecting the selection
  controller.replace(1, 2, [newObject1, newObject2]);

  source = controller.get('arrangedObjects');
  selectionSet = controller.get('selection');
  indexSet = selectionSet.indexSetForSource(source);
  assert.equal(source.get('length'), 5, 'array controller content should have five items');
  assert.ok(!controller.get('hasSelection'), 'array controller should not still have a selection');
  assert.equal(selectionSet.get('length'), 0, 'selection set should have length 0');
  assert.ok(indexSet === null, 'selection set should not still have an indexSet');
});

test("replacing content in an ArrayController propagates changes to bound arrangedObjects", function (assert) {
  assert.equal(controller.getPath('arrangedObjects.length'), 5, "precond - controller has 5 items");

  var obj, listChanged = 0;

  SC.run(function() {
    obj = SC.Object.create({
      testController: controller,
      listBinding: ".testController.arrangedObjects",
      listDidChange: function() {
        listChanged++;
      }.observes('list')
    });
  });

  assert.equal(obj.getPath('list.length'), 5, "precond - binding has 5 items");

  SC.run(function() {
    controller.set('content', []);
  });

  assert.equal(controller.getPath('arrangedObjects.length'), 0, "precond - controller has 5 items");
  assert.equal(obj.getPath('list.length'), 0, "binding has 0 items");
  assert.equal(listChanged, 1, "listDidChange was called");
});

/**
  There was a bug that when the content swapped out of an ArrayController with allowsEmptySelection
  set to false, the selection would remain as the first object from the last content.
  This was due to the firstObject (and lastObject) not being updated properly.
*/
test("SC.ArrayController(SC.SelectionSupport) selection updates properly when allowsEmptySelection is false and the content changes",
function() {
  var firstSelectableObject,
    newObject = TestObject.create({
        title: 'New Object'
      });

  // Disable allowing empty selection
  controller.set('allowsEmptySelection', false);
  assert.ok(controller.get('selection').containsObject(content[0]), 'selection should be the first original content object');

  // Swap the content.
  controller.set('content', [newObject]);
  assert.ok(controller.get('selection').containsObject(newObject), 'selection should be the first new content object');
});
