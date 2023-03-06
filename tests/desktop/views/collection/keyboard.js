// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { ArrayController } from "../../../../core/controllers/array_controller.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";
import { CollectionView } from "../../../../desktop/desktop.js";
import { SCEvent } from "../../../../event/event.js";
import { SC } from "../../../../core/core.js";
import { run, RunLoop } from "../../../../core/system/runloop.js";

var controller = ArrayController.create({
	content: "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
    return SC.Object.create({ value: x });
  })
});

var pane = ControlTestPane.design();
pane.add('default', CollectionView, {
	content: controller.get('arrangedObjects')
});

/**
  Simulates a key press on the specified view.

  @param {View} view the view
  @param {Number} keyCode key to simulate
  @param {Boolean} [isKeyPress] simulate key press event
  @param {Boolean} [shiftKey] simulate shift key pressed
  @param {Boolean} [ctrlKey] simulate ctrlKey pressed
*/
function keyPressOn(view, keyCode, isKeyPress, shiftKey, ctrlKey) {
  var layer = view.get('layer'),
    opts = {
      shiftKey: !!shiftKey,
      ctrlKey: !!ctrlKey,
      keyCode: keyCode,
      charCode: isKeyPress ? keyCode : 0,
      which: keyCode
    },
    ev;

  assert.ok(layer, 'keyPressOn() precond - view %@ should have layer'.fmt(view.toString()));

  ev = SCEvent.simulateEvent(layer, 'keydown', opts);
  SCEvent.trigger(layer, 'keydown', [ev]);

  if (isKeyPress) {
    ev = SCEvent.simulateEvent(layer, 'keypress', opts);
    SCEvent.trigger(layer, 'keypress', [ev]);
  }

  ev = SCEvent.simulateEvent(layer, 'keyup', opts);
  SCEvent.trigger(layer, 'keyup', [ev]);
  RunLoop.begin().end();
  layer = null;
}

module("CollectionView Keyboard events and handlers", {
	beforeEach: function() {
    pane.standardSetup().beforeEach();
	},
	afterEach: function() {
		pane.standardSetup().afterEach();
	}
});

test("selectAll (ctrl+a handler)", function (assert) {
	run(function() {
		pane.view('default').selectAll();
	});
	assert.equal(pane.view('default').getPath('selection.length'), 10, "selectAll selects all when allowsMultipleSelection is true (default)");
	run(function() {
		controller.set('allowsMultipleSelection', false);
		pane.view('default').set('selection', null);
		pane.view('default').selectAll();
	});
	assert.ok(!pane.view('default').getPath('selection.length'), "selectAll has no effect when allowsMultipleSelection is not set");

	// Cleanup
	controller.set('allowsMultipleSelection', true);
});

test("deselectAll", function (assert) {
	var view = pane.view('default');
	run(function() {
		view.selectAll();
	});
	assert.equal(view.getPath('selection.length'), 10, "PRELIM: All items are selected");
	run(function() {
		view.deselectAll();
	});
	assert.equal(view.getPath('selection.length'), 0, "deselectAll clears the selection when allowsEmptySelection is true (default)");
	run(function() {
		view.selectAll();
	})
	assert.equal(view.getPath('selection.length'), 10, "PRELIM: All items are re-selected");
	run(function() {
		controller.set('allowsEmptySelection', false);
		view.deselectAll();
	});
	assert.equal(view.getPath('selection.length'), 10, "deselectAll has no effect when allowsEmptySelection is false")
});

// There was a specific bug in which insertNewLine when no selection was set, but
// isEditable & canEditContent were true, that it would throw an exception.
test("insertNewline doesn't throw exception when no selection", function (assert) {
	var collection = pane.view('default');

	// Prep.
	collection.set('isEditable', true);
	collection.set('canEditContent', true);

	run(function() {
		try {
			collection.insertNewline();
			assert.ok(true, "Calling insertNewline without a selection should not throw an exception.");
		} catch (ex) {
			assert.ok(false, "Calling insertNewline without a selection should not throw an exception. %@".fmt(ex));
		}
	});
});

test("moveDownAndModifySelection", function (assert) {
  var view = pane.view('default');

  run(function () {
    pane.becomeKeyPane();
    view.set('acceptsFirstResponder', true);
    view.becomeFirstResponder();
    view.select(1);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should have a single selected row');
  run(function () {
    keyPressOn(view, SCEvent.KEY_DOWN, false, true, false);
  });
  assert.equal(view.getPath('selection.length'), 2, 'Should have an additional selected row');
  run(function () {
    view.select(1);
    controller.set('allowsMultipleSelection', false);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should have a single selected row');
  run(function () {
    keyPressOn(view, SCEvent.KEY_DOWN, false, true, false);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should still have a single selected row');

  // Cleanup
  controller.set('allowsMultipleSelection', true);
});

test("moveUpAndModifySelection", function (assert) {
  var view = pane.view('default');

  run(function () {
    pane.becomeKeyPane();
    view.set('acceptsFirstResponder', true);
    view.becomeFirstResponder();
    view.select(1);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should have a single selected row');
  run(function () {
    keyPressOn(view, SCEvent.KEY_UP, false, true, false);
  });
  assert.equal(view.getPath('selection.length'), 2, 'Should have an additional selected row');
  run(function () {
    view.select(1);
    controller.set('allowsMultipleSelection', false);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should have a single selected row');
  run(function () {
    keyPressOn(view, SCEvent.KEY_UP, false, true, false);
  });
  assert.equal(view.getPath('selection.length'), 1, 'Should still have a single selected row');

  // Cleanup
  controller.set('allowsMultipleSelection', true);
});

// TODO: yeah all the other keyboard stuff.
