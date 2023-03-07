// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from "../../../../core/core.js";
import { ArrayController } from "../../../../core/controllers/array_controller.js";
import { MainPane } from "../../../../view/view.js";
import { SCEvent } from "../../../../event/event.js";
import { run, RunLoop } from "../../../../core/system/runloop.js";
import { CollectionView } from "../../../../desktop/desktop.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { IndexSet } from "../../../../core/system/index_set.js";

/* globals equals, ok, test, module, start, stop */
var view, content, contentController, pane, actionCalled = 0;

module("CollectionView Mouse Events", {
  beforeEach: function() {
    run(function () {
      content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
        return SC.Object.create({ value: x });
      });

      contentController = ArrayController.create({
        content: content,
        allowsMultipleSelection: true
      });

      view = CollectionView.create({
        content: contentController,

        layout: { top: 0, left: 0, width: 300, height: 500 },

        layoutForContentIndex: function(idx) {
          return { left: 0, right: 0, top: idx * 50, height: 50 };
        },

        isVisibleInWindow: true,
        acceptsFirstResponder: true,
        action: function() {
          actionCalled++;
        }
      });

      pane = MainPane.create();
      pane.appendChild(view);
      pane.append();
    });
  },

  afterEach: function() {
    run(function () {
      pane.destroy();
      pane = view = content = contentController = null;
      actionCalled = 0;
    });
  }
});

/*
  Simulates clicking on the specified index.  If you pass verify as true or false
  also verifies that the item view is subsequently selected or not.

  @param {CollectionView} view the view
  @param {Number} index the index to click on
  @param {Boolean} shiftKey simulate shift key pressed
  @param {Boolean} ctrlKey simulate ctrlKey pressed
  @param {SelectionSet} expected expected selection
  @param {Number} delay delay before running the test (optional)
  @returns {void}
*/
function clickOn(assert, view, index, shiftKey, ctrlKey, expected, delay) {
  var itemView = view.itemViewForContentIndex(index),
      layer    = itemView.get('layer'),
      opts     = { shiftKey: shiftKey, ctrlKey: ctrlKey },
      sel, ev, modifiers;

  let done;
  if (delay) {
    done = assert.async();
  }

  assert.ok(layer, 'precond - itemView[%@] should have layer'.fmt(index));

  ev = SCEvent.simulateEvent(layer, 'mousedown', opts);
  SCEvent.trigger(layer, 'mousedown', [ev]);

  ev = SCEvent.simulateEvent(layer, 'mouseup', opts);
  SCEvent.trigger(layer, 'mouseup', [ev]);

  if (expected !== undefined) {
    var f = function() {
      RunLoop.begin();
      sel = view.get('selection');

      modifiers = [];
      if (shiftKey) modifiers.push('shift');
      if (ctrlKey) modifiers.push('ctrl');
      modifiers = modifiers.length > 0 ? modifiers.join('+') : 'no modifiers';
      assert.ok(expected ? expected.isEqual(sel) : expected === sel, 'should have selection: %@ after click with %@ on item[%@], actual: %@'.fmt(expected, modifiers, index, sel));
      RunLoop.end();
      if (delay) { done(); }// starts the test runner
    };

    if (delay) {
      setTimeout(f, delay) ;
    } else f() ;
  }

  layer = itemView = null ;
}

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

/*
  Creates an SelectionSet from a given IndexSet.

  @param {Number} index the index of the content to select
  @returns {SelectionSet}
*/
function selectionFromIndexSet(indexSet) {
  var ret = SelectionSet.create();
  ret.add(content, indexSet);

  return ret;
}

// ..........................................................
// basic click
//

test("clicking on an item should select it", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
});

test("clicking on a selected item should clear selection after 300ms and reselect it", function (assert) {
  run(function () {
    view.select(IndexSet.create(1,5));
  });
  clickOn(assert, view, 3, false, false, selectionFromIndex(3), 500);
});

test("clicking on unselected item should clear selection and select it", function (assert) {
  run(function () {
    view.select(IndexSet.create(1,5));
  });
  clickOn(assert, view, 7, false, false, selectionFromIndex(7));
});

test("first responder", function (assert) {
  clickOn(assert, view, 3);
  assert.equal(view.get('isFirstResponder'), true, 'view.isFirstResponder should be true after mouse down');
});

test("clicking on a collection view with null content should not throw an error", function (assert) {
  var failed = false;
  run(function () {
    view.set('content', null);
  });

  try {
    var l = view.get('layer'),
        evt = SCEvent.simulateEvent(l, 'mousedown');
    SCEvent.trigger(l, 'mousedown', [evt]);
  }
  catch (e) { failed = true; }
  assert.ok(!failed, "clicking on a collection view with null content should not throw an error");
});

test("clicking on an item should select it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
});

test("clicking on an unselected item should select it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
});

test("clicking on a selected item should deselect it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  run(function () {
    view.select(IndexSet.create(3,1));
  });
  clickOn(assert, view, 3, false, false, SelectionSet.create());
});

test("clicking on an unselected item should select it and add it to the selection when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  clickOn(assert, view, 1, false, false, selectionFromIndex(1));
  clickOn(assert, view, 3, false, false, selectionFromIndex(1).addObject(content.objectAt(3)));
});

test("clicking on a selected item should remove it from the selection when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  run(function () {
    view.select(IndexSet.create(1,5));
  });
  clickOn(assert, view, 5, false, false, selectionFromIndexSet(IndexSet.create(1,4)));
});

test("clicking on an unselected item should select it and clear the previous selection when useToggleSelection is true and allowsMultipleSelection is not", function (assert) {
  view.set('useToggleSelection', true);
  contentController.set('allowsMultipleSelection', false);
  clickOn(assert, view, 1, false, false, selectionFromIndex(1));
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
});

test("clicking on an unselected item should fire action when actOnSelect is true", function (assert) {
  view.set('actOnSelect', true);

  assert.equal(actionCalled, 0, "precond - action hasn't been called");
  clickOn(assert, view, 1, false, false);
  assert.equal(actionCalled, 1, "Action called when item is selected");
});

test("clicking on an unselected item should fire action when useToggleSelection is true and actOnSelect is true", function (assert) {
  view.set('useToggleSelection', true);
  view.set('actOnSelect', true);

  assert.equal(actionCalled, 0, "precond - action hasn't been called");
  clickOn(assert, view, 1, false, false);
  assert.equal(actionCalled, 1, "Action called when item is selected");
});

test("clicking on an unselected item should fire action when useToggleSelection is true and selectOnMouseDown is true and actOnSelect is true", function (assert) {
  view.set('actOnSelect', true);
  view.set('useToggleSelection', true);
  view.set('selectOnMouseDown', true);

  assert.equal(actionCalled, 0, "precond - action hasn't been called");
  clickOn(assert, view, 1, false, false);
  assert.equal(actionCalled, 1, "Action called when item is selected");
});

test("click on an item when isSelectable is false doesn't do anything", function (assert) {
  view.set('isSelectable', false);
  clickOn(assert, view, 1, false, false, null);
});

test("click on an item when isEnabled is false doesn't do anything", function (assert) {
  run(function () {
    view.set('isEnabled', false);
  });
  clickOn(assert, view, 1, false, false, null);
});

// ..........................................................
// double click
//

test("double-clicking on an unselected item should fire action when actOnSelect is false", function (assert) {
  assert.equal(actionCalled, 0, "precond - action hasn't been called");
  clickOn(assert, view, 1, false, false);
  assert.equal(actionCalled, 0, "No action is called on first click");
  clickOn(assert, view, 1, false, false);
  assert.equal(actionCalled, 1, "Action called when item receives second click");
});

// ..........................................................
// ctrl-click mouse down
//

test("ctrl-clicking on unselected item should add to selection", function (assert) {
  clickOn(assert, view,3, false, true, selectionFromIndex(3));
  clickOn(assert, view,5, false, true, selectionFromIndex(3).addObject(content.objectAt(5)));
});

test("ctrl-clicking on selected item should remove from selection", function (assert) {
  clickOn(assert, view,3, false, true, selectionFromIndex(3));
  clickOn(assert, view,5, false, true, selectionFromIndex(3).addObject(content.objectAt(5)));
  clickOn(assert, view,3, false, true, selectionFromIndex(5));
  clickOn(assert, view,5, false, true, SelectionSet.create());
});

// ..........................................................
// shift-click mouse down
//

test("shift-clicking on an item below should extend the selection", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
  clickOn(assert, view, 5, true, false, selectionFromIndexSet(IndexSet.create(3,3)));
});


test("shift-clicking on an item above should extend the selection", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
  clickOn(assert, view, 1, true, false, selectionFromIndexSet(IndexSet.create(1,3)));
});

test("shift-clicking inside selection first time should reduce selection from top", function (assert) {
  run(function () {
    view.select(IndexSet.create(3,4));
  });
  clickOn(assert, view,4, true, false, selectionFromIndexSet(IndexSet.create(3,2)));
});

test("shift-click below to extend selection down then shift-click inside selection should reduce selection", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
  clickOn(assert, view, 5, true, false, selectionFromIndexSet(IndexSet.create(3,3)));
  clickOn(assert, view,4, true, false, selectionFromIndexSet(IndexSet.create(3,2)));
});

test("shift-click above to extend selection down then shift-click inside selection should reduce top of selection", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
  clickOn(assert, view, 1, true, false, selectionFromIndexSet(IndexSet.create(1,3)));
  clickOn(assert, view,2, true, false, selectionFromIndexSet(IndexSet.create(2,2)));
});

test("shift-click below bottom of selection then shift click on top of selection should select only top item", function (assert) {
  clickOn(assert, view, 3, false, false, selectionFromIndex(3));
  clickOn(assert, view, 5, true, false, selectionFromIndexSet(IndexSet.create(3,3)));
  clickOn(assert, view,3, true, false, selectionFromIndex(3));
});
