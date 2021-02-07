// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals,ok */

import { SC } from '../../../core/core.js';
import { View, CoreView, Pane } from  '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';

var parentView;

/** Test the View states. */
module("View States", {

  beforeEach: function () {
    parentView = View.create();
  },

  afterEach: function () {
    parentView.destroy();
    parentView = null;
  }

});

/**
  Test the state, in particular supported actions.
  */
test("Test unrendered state.", function (assert) {
  var handled,
    view = View.create();

  // Test expected state of the view.
  assert.equal(view.viewState, CoreView.UNRENDERED, "A newly created view should be in the state");
  assert.ok(!view.get('isAttached'), "isAttached should be false");
  assert.ok(!view.get('_isRendered'), "_isRendered should be false");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doShow();
  assert.ok(!handled, "Calling _doShow() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doShow() doesn't change state");

  handled = view._doAttach(document.body);
  assert.ok(!handled, "Calling _doAttach(document.body) should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  assert.ok(!handled, "Calling _doDestroyLayer() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doDestroyLayer() doesn't change state");

  handled = view._doDetach();
  assert.ok(!handled, "Calling _doDetach() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doDetach() doesn't change state");

  SC.run(function () {
    handled = view._doHide();
  });
  assert.ok(!handled, "Calling _doHide() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doHide() doesn't change state");

  handled = view._doUpdateContent();
  assert.ok(!handled, "Calling _doUpdateContent() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  assert.ok(!handled, "Calling _doUpdateLayout() should not be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doUpdateLayout() doesn't change state");


  // HANDLED ACTIONS

  handled = view._doRender();
  assert.ok(handled, "Calling _doRender() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doRender() changes state");


  // CLEAN UP
  view.destroy();
});

/**
  Test the state, in particular supported actions.
  */
test("Test unattached state.", function (assert) {
  var handled,
    view = View.create();

  // Test expected state of the view.
  view._doRender();
  assert.equal(view.viewState, CoreView.UNATTACHED, "A newly created view that is rendered should be in the state");
  assert.ok(!view.get('isAttached'), "isAttached should be false");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()

  // UNHANDLED ACTIONS
  handled = view._doDetach();
  assert.ok(!handled, "Calling _doDetach() should not be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doDetach() doesn't change state");

  handled = view._doRender();
  assert.ok(!handled, "Calling _doRender() should not be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doRender() doesn't change state");


  // HANDLED ACTIONS

  SC.run(function () {
    handled = view._doHide();
  });
  assert.ok(handled, "Calling _doHide() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doHide() doesn't change state");

  handled = view._doShow();
  assert.ok(handled, "Calling _doShow() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doShow() doesn't change state");

  handled = view._doAttach(document.body);
  assert.ok(handled, "Calling _doAttach(document.body) should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) changes state");

  // Reset
  view.destroy();
  view = View.create();
  view._doRender();

  handled = view._doDestroyLayer();
  assert.ok(handled, "Calling _doDestroyLayer() should be handled");
  assert.equal(view.viewState, CoreView.UNRENDERED, "Calling _doDestroyLayer() changes state");

  // Reset
  view.destroy();
  view = View.create();
  view._doRender();

  handled = view._doUpdateContent();
  assert.ok(handled, "Calling _doUpdateContent() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  assert.ok(handled, "Calling _doUpdateLayout() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doUpdateLayout() doesn't change state");

  // Reset
  view.destroy();
  view = View.create();
  view._doRender();

  handled = view._doAttach(document.body);
  assert.ok(handled, "Calling _doAttach(document.body) with unrendered orphan parentView should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) changes state");


  // CLEAN UP
  view.destroy();
});


/**
  Test the state, in particular supported actions.
  */
test("Test attached_shown state.", function (assert) {
  var handled,
    view = View.create();

  // Test expected state of the view.
  view._doRender();
  view._doAttach(document.body);
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "A newly created orphan view that is rendered and attached should be in the state");
  assert.ok(view.get('isAttached'), "isAttached should be true");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");

  // _doAttach(document.body)
  // _doDestroyLayer()
  // _doDetach()
  // _doHide()
  // _doRender()
  // _doShow()
  // _doUpdateContent()
  // _doUpdateLayout()


  // UNHANDLED ACTIONS
  handled = view._doAttach(document.body);
  assert.ok(!handled, "Calling _doAttach(document.body) should not be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doAttach(document.body) doesn't change state");

  handled = view._doDestroyLayer();
  assert.ok(!handled, "Calling _doDestroyLayer() should not be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doDestroyLayer() doesn't change state");

  handled = view._doRender();
  assert.ok(!handled, "Calling _doRender() should not be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doRender() doesn't change state");

  handled = view._doShow();
  assert.ok(!handled, "Calling _doShow() should not be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doShow() doesn't change state");


  // HANDLED ACTIONS

  handled = view._doUpdateContent();
  assert.ok(handled, "Calling _doUpdateContent() should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doUpdateContent() doesn't change state");

  handled = view._doUpdateLayout();
  assert.ok(handled, "Calling _doUpdateLayout() should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doUpdateLayout() doesn't change state");

  handled = view._doDetach();
  assert.ok(handled, "Calling _doDetach() should be handled");
  assert.equal(view.viewState, CoreView.UNATTACHED, "Calling _doDetach() changes state");

  // Reset
  view.destroy();
  view = View.create();
  view._doRender();
  view._doAttach(document.body);

  SC.run(function () {
    handled = view._doHide();
  });
  assert.ok(handled, "Calling _doHide() should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "Calling _doHide() changes state");


  // CLEAN UP
  view.destroy();
});


test("Calling destroy layer, clears the layer from all child views.",  function () {
  var child = View.create(),
    view = View.create({ childViews: [child] });

  view._doAdopt(parentView);
  parentView._doRender();

  assert.ok(parentView.get('layer'), "The parentView should have a reference to the layer.");
  assert.ok(view.get('layer'), "The view should have a reference to the layer.");
  assert.ok(child.get('layer'), "The child should have a reference to the layer.");

  parentView._doDestroyLayer();
  assert.equal(parentView.get('layer'), null, "The parentView should not have a reference to the layer.");
  assert.equal(view.get('layer'), null, "The view should not have a reference to the layer.");
  assert.equal(child.get('layer'), null, "The child should not have a reference to the layer.");

  // CLEAN UP
  view.destroy();
});

/** Test the View state propagation to child views. */
module("View Adoption", {

  beforeEach: function () {
    parentView = Pane.create();
  },

  afterEach: function () {
    parentView.destroy();
    parentView = null;
  }

});


test("Test adding a child brings that child to the same state as the parentView.", function (assert) {
  var child = View.create(),
    view = View.create({ childViews: [child] });

  // Test expected state of the view.
  view._doAdopt(parentView);
  assert.equal(parentView.viewState, CoreView.UNRENDERED, "A newly created parentView should be in the state");
  assert.equal(view.viewState, CoreView.UNRENDERED, "A newly created child view of unrendered parentView should be in the state");
  assert.equal(child.viewState, CoreView.UNRENDERED, "A newly created child view of unrendered parentView's child view should be in the state");
  assert.ok(!view.get('_isRendered'), "_isRendered should be false");
  assert.ok(!view.get('isAttached'), "isAttached should be false");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Render the view.
  view._doRender();
  assert.equal(view.viewState, CoreView.UNATTACHED, "A rendered child view of unrendered parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_PARTIAL, "A rendered child view of unrendered parentView's child view should be in the state");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(!view.get('isAttached'), "isAttached should be false");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Attach the view.
  view._doAttach(document.body);
  assert.equal(view.viewState, CoreView.ATTACHED_PARTIAL, "An attached child view of unrendered parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_PARTIAL, "An attached child view of unrendered parentView's child view should be in the state");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(view.get('isAttached'), "isAttached should be true");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Reset
  view.destroy();
  child = View.create();
  view = View.create({ childViews: [child] });

  parentView._doRender();
  view._doAdopt(parentView);
  assert.equal(parentView.viewState, CoreView.UNATTACHED, "A newly created parentView that is rendered should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_PARTIAL, "A newly created child view of unattached parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_PARTIAL, "A newly created child view of unattached parentView's child view should be in the state");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(view.get('isAttached'), "isAttached should be true");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Attach the view.
  view._doAttach(document.body);
  assert.equal(view.viewState, CoreView.ATTACHED_PARTIAL, "An attached child view of unattached parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_PARTIAL, "An attached child view of unattached parentView's child view should be in the state");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(view.get('isAttached'), "isAttached should be true");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Reset
  view.destroy();
  child = View.create();
  view = View.create({ childViews: [child] });

  parentView._doAttach(document.body);
  view._doAdopt(parentView);
  assert.equal(parentView.viewState, CoreView.ATTACHED_SHOWN, "A newly created parentView that is attached should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "A newly created child view of attached parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "A child of newly created view of attached parentView should be in the state");
  assert.ok(view.get('_isRendered'), "_isRendered should be true");
  assert.ok(view.get('isAttached'), "isAttached should be true");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");


  // CLEAN UP
  view.destroy();
});


test("Test showing and hiding parentView updates child views.", function (assert) {
  var handled,
    child = View.create(),
    view = View.create({ childViews: [child] });

  // Test expected state of the view.
  parentView._doRender();
  parentView._doAttach(document.body);
  view._doAdopt(parentView);
  assert.equal(parentView.viewState, CoreView.ATTACHED_SHOWN, "A newly created parentView that is attached should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "A newly created child view of attached parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "A newly created child view of attached parentView's child view should be in the state");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");

  // Hide the parentView.
  SC.run(function () {
    parentView._doHide();
  });
  assert.equal(parentView.viewState, CoreView.ATTACHED_HIDDEN, "A hidden parentView that is attached should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "A child view of attached_hidden parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "A child view of attached_hidden parentView's child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Show the parentView/hide the view.
  handled = parentView._doShow();
  assert.ok(handled, "Calling _doShow() on parentView should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "Calling _doShow() on parentView changes state on view.");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "Calling _doShow() on parentView changes state on child");

  SC.run(function () {
    handled = view._doHide();
  });
  assert.ok(handled, "Calling _doHide() should be handled");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "Calling _doHide() on view changes state on view");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "Calling _doHide() on view changes state on child");

  // Reset
  SC.run(function () {
    parentView._doHide();
  });
  view.destroy();
  child = View.create();
  view = View.create({ childViews: [child] });
  view._doAdopt(parentView);

  // Add child to already hidden parentView.
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "A child view of attached_hidden parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "A child view of attached_hidden parentView's child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");

  // Reset
  parentView.destroy();
  parentView = View.create();
  parentView._doRender();
  child = View.create();
  view = View.create({ childViews: [child] });
  view._doAdopt(parentView);

  // Attach a parentView with children
  assert.equal(view.viewState, CoreView.ATTACHED_PARTIAL, "A child view of unattached parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_PARTIAL, "A child view of unattached parentView's child view should be in the state");
  parentView._doAttach(document.body);
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "A child view of attached_shown parentView should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "A child view of attached_shown parentView's child view should be in the state");

  // CLEAN UP
  view.destroy();
});

test("Test showing parentView with transitionShow", function (assert) {
  var parentView = View.create({
    isVisible: false,
    transitionShow: { run: function() {} }
  });
  var childView = View.create();
  childView._doAdopt(parentView);
  parentView._doRender();
  parentView._doAttach(document.body);

  SC.run(function() { parentView.set('isVisible', true); });

  assert.equal(parentView.viewState, View.ATTACHED_SHOWING, "Upon being made visible, a view with a transition is in state");
  assert.equal(childView.viewState, View.ATTACHED_SHOWN, "A visible view whose parent is ATTACHED_SHOWING is in state.");

  parentView.destroy();
  parentView = null;
  childView.destroy();
  childView = null;
});

test("Test hiding with transitionHide", function (assert) {
  var child = View.create(),
    transitionHide = { run: function () {} },
    view = View.create({ childViews: [child] });

  // Set up.
  parentView._doRender();
  parentView._doAttach(document.body);
  view._doAdopt(parentView);

  // Hide the parentView with transitionHide
  parentView.set('transitionHide', transitionHide);
  SC.run(function () {
    parentView._doHide();
  });
  assert.ok(parentView.get('isVisibleInWindow'), "isVisibleInWindow of parentView should be true");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
  assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");

  SC.run(function () {
    parentView.didTransitionOut();
  });
  assert.ok(!parentView.get('isVisibleInWindow'), "isVisibleInWindow of parentView should be false after didTransitionOut");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false after didTransitionOut");
  assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false after didTransitionOut");

  // CLEAN UP
  view.destroy();
});

test("Adjusting unrelated layout property (not specified in transition's layoutProperties) during transition.", function (assert) {

  assert.timeout(250);

  var transition = {
    layoutProperties: ['opacity'],
    run: function (view) {
      console.log('transition in: run function')
      view.adjust('opacity', 0);
      view.invokeNext(view.didTransitionIn);
    }
  };

  let cb;

  var view = View.create({
    transitionIn: transition,
    layout: { height: 40 },
    didTransitionIn: function didTransitionIn () {
      didTransitionIn.base.apply(this, arguments);
      assert.equal(this.getPath('layout.height'), 30, "height adjusted during an opacity transition is retained after the transition is complete");
      cb(); // resume 
    }
  });

  SC.run(function() {
    view._doRender();
    view._doAttach(document.body);
    assert.equal(view.getPath('layout.height'), 40, 'PRELIM: View height starts at 40');
    assert.equal(view.get('viewState'), View.ATTACHED_BUILDING_IN, "PRELIM: View is building in");
    view.adjust('height', 30);
    cb = assert.async();
  });


});

/** isVisible */
var child, view;
module("View isVisible integration with shown and hidden state", {

  beforeEach: function () {
    SC.run(function () {
      parentView = View.create();
      parentView._doRender();
      parentView._doAttach(document.body);

      child = View.create(),
      view = View.create({
        // STUB: _executeDoUpdateContent
        _executeDoUpdateContent: CoreTest.stub('_executeDoUpdateContent', CoreView.prototype._executeDoUpdateContent),
        // STUB: _doUpdateVisibleStyle
        _doUpdateVisibleStyle: CoreTest.stub('_doUpdateVisibleStyle', CoreView.prototype._doUpdateVisibleStyle),

        childViews: [child],
        displayProperties: ['foo'],
        foo: false
      });
    });
  },

  afterEach: function () {
    view.destroy();
    parentView.destroy();
    parentView = null;
  }

});

test("Test showing and hiding a hidden view in same run loop should not update visibility or content.", function (assert) {
  view._doAdopt(parentView);

  SC.run(function () {
    view.set('isVisible', false);
  });

  view._executeDoUpdateContent.expect(0);
  view._doUpdateVisibleStyle.expect(1);

  // Hide the view using isVisible.
  SC.run(function () {
    view.set('foo', true);
    assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");

    assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
    assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

    view.set('isVisible', true);
    assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "The view should now be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should now be in the state");

    assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
    assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");

    view.set('isVisible', false);
  });

  view._executeDoUpdateContent.expect(0);
  view._doUpdateVisibleStyle.expect(3);
});

test("Test hiding and showing a shown view in same run loop should not update visibility.", function (assert) {
  view._doAdopt(parentView);

  // Hide the view using isVisible.
  SC.run(function () {
    view.set('foo', true);
    view.set('isVisible', false);
    assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");

    assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
    assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

    view.set('isVisible', true);
    assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");

    assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
    assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");
  });

  view._executeDoUpdateContent.expect(1);
  view._doUpdateVisibleStyle.expect(2);
});


test("Test showing and hiding a hiding view in same run loop should not update visibility or content.", function (assert) {
  var transitionHide = { run: function () {} };

  view._doAdopt(parentView);

  view.set('transitionHide', transitionHide);

  SC.run(function () {
    view.set('foo', true);
    view.set('isVisible', false);
  });

  // Hide the view using isVisible.
  SC.run(function () {
    assert.equal(view.viewState, CoreView.ATTACHED_HIDING, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");

    assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
    assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");

    view.set('isVisible', true);
    assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");

    assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
    assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");

    view.set('isVisible', false);
  });

  view._executeDoUpdateContent.expect(1);
  view._doUpdateVisibleStyle.expect(0);
});

test("Test hiding and showing a showing view in same run loop should not update visibility.", function (assert) {
  var transitionShow = { run: function () {} };

  view._doAdopt(parentView);

  view.set('transitionShow', transitionShow);

  SC.run(function () {
    view.set('foo', true);
    view.set('isVisible', false);
  });

  SC.run(function () {
    view.set('isVisible', true);
  });

  // Hide the view using isVisible.
  SC.run(function () {
    assert.equal(view.viewState, CoreView.ATTACHED_SHOWING, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");

    assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be true");
    assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be true");

    view.set('isVisible', false);
    assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
    assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");

    assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
    assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

    view.set('isVisible', true);
  });

  view._executeDoUpdateContent.expect(1);
  view._doUpdateVisibleStyle.expect(4);
});


test("Test hiding and showing an attached child view with child views.", function (assert) {
  view._doAdopt(parentView);

  // Hide the view using isVisible.
  SC.run(function () {
    view.set('isVisible', false);
  });

  assert.equal(parentView.viewState, CoreView.ATTACHED_SHOWN, "The parentView view should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

  // Show the view using isVisible.
  SC.run(function () {
    view.set('isVisible', true);
  });

  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should now be true");
  assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should now be true");
});


test("Test hiding an attached parentView view and then adding child views.", function (assert) {
  // Hide the parentView using isVisible and then adopting child views.
  SC.run(function () {
    parentView.set('isVisible', false);
    view._doAdopt(parentView);
  });

  assert.equal(parentView.viewState, CoreView.ATTACHED_HIDDEN, "The parentView view should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");

  // Show the parentView using isVisible.
  SC.run(function () {
    parentView.set('isVisible', true);
  });

  assert.equal(parentView.viewState, CoreView.ATTACHED_SHOWN, "The parentView view should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_SHOWN, "The child view should be in the state");
  assert.ok(view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  assert.ok(child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
});


test("Test showing an attached parentView view while hiding the child view.", function (assert) {
  SC.run(function () {
    parentView.set('isVisible', false);
    view._doAdopt(parentView);

    // Hide the view and then show the parentView using isVisible.
    view.set('isVisible', false);
    parentView.set('isVisible', true);
  });

  assert.equal(parentView.viewState, CoreView.ATTACHED_SHOWN, "The parentView view should be in the state");
  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
});


test("Test adding a hidden child view to attached shown parentView.", function (assert) {
  // Hide the view with isVisible and then add to parentView.
  SC.run(function () {
    view.set('isVisible', false);
    view._doAdopt(parentView);
  });

  assert.equal(view.viewState, CoreView.ATTACHED_HIDDEN, "The view should be in the state");
  assert.equal(child.viewState, CoreView.ATTACHED_HIDDEN_BY_PARENT, "The child view should be in the state");
  assert.ok(!view.get('isVisibleInWindow'), "isVisibleInWindow should be false");
  assert.ok(!child.get('isVisibleInWindow'), "isVisibleInWindow of child should be false");
});

test("In ATTACHED_SHOWN state, _isVisibleDidChange should not call _doShow.", function (assert) {
  var view = View.create();

  // Test expected state of the view.
  view._doRender();
  view._doAttach(document.body);
  assert.equal(view.viewState, CoreView.ATTACHED_SHOWN, "A newly created orphan view that is rendered and attached should be in the state");

  // set up _doShow to fail, if called
  view._doShow = function() {
    assert.ok(false, '_doShow should not be called in the ATTACHED_SHOWN state');
  };

  // call _isVisibleDidChange
  view._isVisibleDidChange();
});

test("In ATTACHED_SHOWING state, _isVisibleDidChange should not call _doShow.", function (assert) {
 // Test expected state of the view.
  view._doRender();
  view._doAttach(document.body);

  var transitionShow = { run: function () {} };
  view.set('transitionShow', transitionShow);

  SC.run(function () {
    view.set('isVisible', false);
    view.set('isVisible', true);
  });

  assert.equal(view.viewState, CoreView.ATTACHED_SHOWING, "The view should be in the state");

  // set up _doShow to fail, if called
  view._doShow = function() {
    assert.ok(false, '_doShow should not be called in the ATTACHED_SHOWING state');
  };

  // call _isVisibleDidChange
  view._isVisibleDidChange();
});