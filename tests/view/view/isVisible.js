// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View metrics Unit Tests
// ========================================================================
/*globals module test ok isObj equals expects */

import { SC } from '../../../core/core.js';
import { View, MainPane, Pane, CoreView } from '../../../view/view.js';

/**
  These tests verify that all view metrics -- frame, clippingFrame,
  isVisibleInWindow, etc. are correct.
*/


// ..........................................................
// BASE TESTS
//
// These tests exercise the API.  See below for tests that cover edge
// conditions.  If you find a bug, we recommend that you add a test in the
// edge case section.

var FRAME = { x: 10, y: 10, width: 30, height: 30 };

var pane, view; // test globals

module("isVisible", {

  beforeEach: function() {
    pane = MainPane.create();
    view = View.create();
  },

  afterEach: function() {
    view.destroy();
    pane.remove().destroy();
    pane = view = null;
  }

});

test("a new view should not be visible initially", function (assert) {
  assert.ok(view.get('isVisible'), "view.get('isVisible') === false");
});

test("initializing with isVisible: false, should still add the proper class on append", function (assert) {
  var newView = View.create({
    isVisible: false
  });

  SC.RunLoop.begin();
  pane.append();
  pane.appendChild(newView);
  SC.RunLoop.end();
  assert.ok(newView.$().hasClass('sc-hidden'), "newView.$().hasClass('sc-hidden') should be true");
});

test("adding a new view to a visible pane should make it visible", function (assert) {
  assert.ok(view.get('isVisible'), "view.get('isVisible') === true");
  assert.ok(pane.get('isVisible'), "pane.get('isVisible') === true");
  SC.RunLoop.begin();
  pane.appendChild(view);
  pane.append();
  view.set('isVisible', false);
  SC.RunLoop.end();
  assert.ok(!view.get('isVisible'), "after pane.appendChild(view), view.get('isVisible') === true");
  assert.ok(view.$().hasClass('sc-hidden'), "after view.set('isVisible', false), view.$().hasClass('sc-hidden') should be true");
});

test("a view with visibility can have a child view without visibility", function (assert) {
  var pane = Pane.create({
    childViews: ['visibleChild'],

    visibleChild: View.design({
      childViews: ['noVisibilityChild'],
      noVisibilityChild: CoreView
    })
  });

  var errored = false;

  try {
    pane.append();
    pane.remove().destroy();
  } catch(e) {
    errored = true;
  } finally {
    try {
      pane.remove().destroy();
    } catch(e2) {
      errored = true;
    }
  }

  assert.ok(!errored, "Inserting a pane containing a child with visibility that itself has a child without visibility does not cause an error");
});

// Test for issue #1093.
test("a view whose pane is removed during an isVisible transition gets correctly hidden", function (assert) {
  SC.RunLoop.begin();
  var pane = Pane.create({
    childViews: ['childView'],
    childView: View.extend({
      transitionHide: { run: function (view) {
        view.animate('opacity', 0, 0.4, function () { this.didTransitionOut(); });
      }}
    })
  });
  pane.append();
  pane.childView.set('isVisible', false);
  assert.equal(pane.childView.get('viewState'), CoreView.ATTACHED_HIDING, 'View is transitioning');
  pane.remove();
  SC.RunLoop.end();
  SC.RunLoop.begin();
  pane.append();
  assert.ok(pane.childView.$().hasClass('sc-hidden'), 'View was successfully hidden.')
  pane.remove();
  pane.destroy();
  SC.RunLoop.end();
});
