// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { ArrayController } from "../../../../core/controllers/array_controller.js";
import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { RunLoop } from "../../../../core/system/runloop.js";
import { SelectionSet } from "../../../../core/system/selection_set.js";
import { CollectionView } from "../../../../desktop/desktop.js";
import { SCEvent } from "../../../../event/event.js";
import { platform } from "../../../../responder/responder.js";
import { MainPane } from "../../../../view/view.js";

var view, content, contentController, pane, actionCalled = 0;

module("CollectionView Touch Events", {
  beforeEach: function() {

    platform.simulateTouchEvents();

    RunLoop.begin();

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

    RunLoop.end();
  },

  afterEach: function() {
    RunLoop.begin();
    pane.remove();
    actionCalled = 0;
    RunLoop.end();
  }
});

/*
  Simulates touching the specified index.  If you pass verify as true or false
  also verifies that the item view is subsequently selected or not.

  @param {CollectionView} view the view
  @param {Number} index the index to touch on
  @param {SelectionSet} expected expected selection
  @param {Number} delay delay before running the test (optional)
  @returns {void}
*/
function touchOn(view, index, expected, delay) {
  var itemView = view.itemViewForContentIndex(index),
      layer    = itemView.get('layer'),
      opts     = {},
      sel, ev, modifiers;

  assert.ok(layer, 'precond - itemView[%@] should have layer'.fmt(index));

  ev = SCEvent.simulateEvent(layer, 'mousedown', opts);
  SCEvent.trigger(layer, 'mousedown', [ev]);

  ev = SCEvent.simulateEvent(layer, 'mouseup', opts);
  SCEvent.trigger(layer, 'mouseup', [ev]);

  if (expected !== undefined) {
    var f = function() {
      RunLoop.begin();
      sel = view.get('selection');

      assert.ok(expected ? expected.isEqual(sel) : expected === sel, 'should have selection: %@ after touch on item[%@], actual: %@'.fmt(expected, index, sel));
      RunLoop.end();
      if (delay) window.start() ; // starts the test runner
    };

    if (delay) {
      stop() ; // stops the test runner
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
// basic touch
//

test("touching an item should select it", function (assert) {
  touchOn(view, 3, selectionFromIndex(3));
});

test("touching a selected item should maintain it selected", function (assert) {
  view.select(IndexSet.create(1,3));
  touchOn(view, 3, selectionFromIndex(3));
});

test("touching two times on an item should select it", function (assert) {
  touchOn(view, 3);
  touchOn(view, 3);
  var itemView = view.itemViewForContentIndex(3);
  assert.equal(itemView.get('isSelected'), true, 'itemView.isSelected should remain true after touched two times');
});

test("touching unselected item should clear selection and select it", function (assert) {
  view.select(IndexSet.create(1,5));
  touchOn(view, 7, selectionFromIndex(7));
});

test("first responder", function (assert) {
  touchOn(view, 3);
  assert.equal(view.get('isFirstResponder'), true, 'view.isFirstResponder should be true after touch start');
});

test("touching a collection view with null content should not throw an error", function (assert) {
  var failed = false;
  view.set('content', null);
  try {
    var l = view.get('layer'),
        evt = SCEvent.simulateEvent(l, 'mousedown');
    SCEvent.trigger(l, 'mousedown', [evt]);
  }
  catch (e) { failed = true; }
  assert.ok(!failed, "touching a collection view with null content should not throw an error");
});

test("touching an item should select it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  touchOn(view, 3, selectionFromIndex(3));
});

test("touching an unselected item should select it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  touchOn(view, 3, selectionFromIndex(3));
});

test("touching a selected item should deselect it when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  view.select(IndexSet.create(3,1));
  touchOn(view, 3, SelectionSet.create());
});

test("touching a selected item should remove it from the selection when useToggleSelection is true", function (assert) {
  view.set('useToggleSelection', true);
  view.select(IndexSet.create(1,5));
  touchOn(view, 5, selectionFromIndexSet(IndexSet.create(1,4)));
});

test("touching an unselected item should select it and clear the previous selection when useToggleSelection is true and allowsMultipleSelection is not", function (assert) {
  view.set('useToggleSelection', true);
  contentController.set('allowsMultipleSelection', false);
  touchOn(view, 1, selectionFromIndex(1));
  touchOn(view, 3, selectionFromIndex(3));
});

test("touching an unselected item should fire action when useToggleSelection is true and actOnSelect is true", function (assert) {
  view.set('useToggleSelection', true);
  view.set('actOnSelect', true);

  assert.equal(actionCalled, 0, "precond - action hasn't been called");
  touchOn(view, 1);
  assert.equal(actionCalled, 1, "Action called when item is selected");
});

test("touching an item when isSelectable is false doesn't do anything", function (assert) {
  view.set('isSelectable', false);
  touchOn(view, 1, null);
});

test("touching an item when isEnabled is false doesn't do anything", function (assert) {
  view.set('isEnabled', false);
  touchOn(view, 1, null);
});
