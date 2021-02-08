// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test,  equals,  ok */

import { SC } from '../../../core/core.js';
import { View, CoreView } from '../../../view/view.js';

var parent, view, child;

/** Test the View states. */
module("View#enabledState", {

  beforeEach: function () {
    child = View.create();
    view = View.create({ childViews: [child] });
    parent = View.create({ childViews: [view] });
  },

  afterEach: function () {
    parent.destroy();
    parent = view = child = null;
  }

});

/**
  Test the initial state.
  */
test("Test initial states.", function (assert) {
  // Test expected state of the views.
  assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
  assert.equal(view.enabledState, CoreView.ENABLED, "A regular view should be in the state");
  assert.equal(child.enabledState, CoreView.ENABLED, "A regular child view should be in the state");
  assert.ok(parent.get('isEnabled'), "isEnabled should be true");
  assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
  assert.ok(view.get('isEnabled'), "isEnabled should be true");
  assert.ok(view.get('isEnabledInPane'), "isEnabledInPane should be true");
  assert.ok(child.get('isEnabled'), "isEnabled should be true");
  assert.ok(child.get('isEnabledInPane'), "isEnabledInPane should be true");
});

test("Test initial disabled states.", function (assert) {
  var newChild = View.create({}),
    newView = View.create({ isEnabled: false, childViews: [newChild] }),
    newParent;

  assert.equal(newView.enabledState, CoreView.DISABLED, "A disabled on creation view should be in the state");
  assert.equal(newChild.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view of disabled on creation parent should be in the state");

  newParent = View.create({ isEnabled: false, childViews: [newView] });

  assert.equal(newParent.enabledState, CoreView.DISABLED, "A disabled on creation parent view should be in the state");
  assert.equal(newView.enabledState, CoreView.DISABLED_AND_BY_PARENT, "A disabled on creation view of disabled on creation parent should be in the state");
  assert.equal(newChild.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view of disabled on creation parent should be in the state");

  newParent.destroy();
  newView.destroy();
  newChild.destroy();
});

/**
  Test changing isEnabled to false on the child.
  */
test("Test toggling isEnabled on child.", function (assert) {
  SC.run(function () {
    child.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.ENABLED, "A regular view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED, "A disabled child view should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(view.get('isEnabled'), "isEnabled should be true");
    assert.ok(view.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!child.get('isEnabled'), "isEnabled should be false");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });
});

/**
  Test changing isEnabled to false on the view.
  */
test("Test toggling isEnabled on view.", function (assert) {
  SC.run(function () {
    view.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view with disabled ancestor should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!view.get('isEnabled'), "isEnabled should be false");
    assert.ok(!view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });

  SC.run(function () {
    child.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_AND_BY_PARENT, "A disabled child view with disabled ancestor should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!view.get('isEnabled'), "isEnabled should be false");
    assert.ok(!view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(!child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });

  SC.run(function () {
    view.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.ENABLED, "A regular view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED, "A disabled child view should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(view.get('isEnabled'), "isEnabled should be false");
    assert.ok(view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(!child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });
});

/**
  Test changing isEnabled to false on the view.
  */
test("Test toggling isEnabled on parent.", function (assert) {
  SC.run(function () {
    parent.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.DISABLED, "A disabled parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED_BY_PARENT, "A regular view with disabled parent should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view with disabled ancestor should be in the state");
    assert.ok(!parent.get('isEnabled'), "disabled parent isEnabled should be false");
    assert.ok(!parent.get('isEnabledInPane'), "disabled parent isEnabledInPane should be false");
    assert.ok(view.get('isEnabled'), "view isEnabled should be true");
    assert.ok(!view.get('isEnabledInPane'), "view isEnabledInPane should be false");
    assert.ok(child.get('isEnabled'), "child isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "child isEnabledInPane should be false");
  });

  SC.run(function () {
    child.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.DISABLED, "A disabled parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED_BY_PARENT, "A regular view with disabled parent should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_AND_BY_PARENT, "A disabled child view with disabled ancestor should be in the state");
    assert.ok(!parent.get('isEnabled'), "isEnabled should be false");
    assert.ok(!parent.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(view.get('isEnabled'), "view isEnabled should be true");
    assert.ok(!view.get('isEnabledInPane'), "view isEnabledInPane should be false");
    assert.ok(!child.get('isEnabled'), "disabled child isEnabled should be false");
    assert.ok(!child.get('isEnabledInPane'), "disabled child isEnabledInPane should be false");
  });

  SC.run(function () {
    parent.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.ENABLED, "A regular view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED, "A disabled child view should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(view.get('isEnabled'), "isEnabled should be true");
    assert.ok(view.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!child.get('isEnabled'), "disabled child isEnabled should be false");
    assert.ok(!child.get('isEnabledInPane'), "disabled child isEnabledInPane should be false");
  });
});

/**
  Test changing isEnabled to false on the view.
  */
test("Test toggling isEnabled on view.", function (assert) {
  SC.run(function () {
    view.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view with disabled ancestor should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!view.get('isEnabled'), "isEnabled should be false");
    assert.ok(!view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });

  SC.run(function () {
    child.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_AND_BY_PARENT, "A disabled child view with disabled ancestor should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(!view.get('isEnabled'), "isEnabled should be false");
    assert.ok(!view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(!child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });

  SC.run(function () {
    view.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.ENABLED, "A regular view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED, "A disabled child view should be in the state");
    assert.ok(parent.get('isEnabled'), "isEnabled should be true");
    assert.ok(parent.get('isEnabledInPane'), "isEnabledInPane should be true");
    assert.ok(view.get('isEnabled'), "isEnabled should be false");
    assert.ok(view.get('isEnabledInPane'), "isEnabledInPane should be false");
    assert.ok(!child.get('isEnabled'), "isEnabled should be true");
    assert.ok(!child.get('isEnabledInPane'), "isEnabledInPane should be false");
  });
});

/**
  Test changing isEnabled to false on the view.
  */
test("Test shouldInheritEnabled.", function (assert) {
  SC.run(function () {
    view.set('shouldInheritEnabled', false);
    parent.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.DISABLED, "A disabled parent view should be in the state");
    assert.equal(view.enabledState, CoreView.ENABLED, "A regular view with shouldInheritEnabled with disabled parent should be in the state");
    assert.equal(child.enabledState, CoreView.ENABLED, "A regular child view should be in the state");
  });

  SC.run(function () {
    view.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.DISABLED, "A disabled parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view with shouldInheritEnabled and disabled parent should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view with disabled ancestor should be in the state");
  });

  SC.run(function () {
    parent.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.equal(parent.enabledState, CoreView.ENABLED, "A regular parent view should be in the state");
    assert.equal(view.enabledState, CoreView.DISABLED, "A disabled view should be in the state");
    assert.equal(child.enabledState, CoreView.DISABLED_BY_PARENT, "A regular child view with disabled ancestor should be in the state");
  });
});

test("Test toggling isEnabled adds/removes disabled class.", function (assert) {
  parent.createLayer();
  parent._doAttach(document.body);

  assert.ok(!parent.$().hasClass('disabled'), "A regular parent should not have disabled class.");
  SC.run(function () {
    parent.set('isEnabled', false);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.ok(parent.$().hasClass('disabled'), "A disabled parent should have disabled class.");
  });

  SC.run(function () {
    parent.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.ok(!parent.$().hasClass('disabled'), "A re-enabled parent should not have disabled class.");
  });

  parent._doDetach();
  parent.destroyLayer();
});

test("Test optimized display update.", function (assert) {
  SC.run(function () {
    parent.set('isEnabled', false);
  });

  parent.createLayer();
  parent._doAttach(document.body);

  // Test expected state of the views.
  SC.run(function () {
    assert.ok(parent.$().hasClass('disabled'), "A disabled when attached parent should have disabled class.");
  });

  parent._doDetach();
  parent.destroyLayer();
  parent.createLayer();
  parent._doAttach(document.body);

  SC.run(function () {
    parent.set('isEnabled', true);
  });

  // Test expected state of the views.
  SC.run(function () {
    assert.ok(!parent.$().hasClass('disabled'), "A re-enabled parent should not have disabled class.");
  });

  parent._doDetach();
  parent.destroyLayer();
});

test("initializing with isEnabled: false, should still add the proper class on append", function (assert) {
  var newView = View.create({
    isEnabled: false
  });

  parent.createLayer();
  parent._doAttach(document.body);
  parent.appendChild(newView);

  assert.ok(newView.$().hasClass('disabled'), "An initialized as disabled view should have disabled class on append.");
});
