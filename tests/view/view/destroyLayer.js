// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, equals, ok */

import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';

module("View#destroyLayer");

test("it if has no layer, does nothing", function (assert) {
  var callCount = 0;
  var view = View.create({
    willDestroyLayer: function () { callCount++; }
  });
  assert.ok(!view.get('layer'), 'precond - does falseT have layer');

  view.destroyLayer();
  assert.equal(callCount, 0, 'did not invoke callback');
});

test("if it has a layer, calls willDestroyLayer on receiver and child views then deletes the layer", function (assert) {
  var callCount = 0;

  var view = View.create({
    willDestroyLayer: function () { callCount++; },
    childViews: [View.extend({
      // no willDestroyLayer here... make sure no errors are thrown
      childViews: [View.extend({
        willDestroyLayer: function () { callCount++; }
      })]
    })]
  });
  view.createLayer();
  assert.ok(view.get('layer'), 'precond - view has layer');

  view.destroyLayer();
  assert.equal(callCount, 2, 'invoked destroy layer');
  assert.ok(!view.get('layer'), 'view no longer has layer');
});

test("if it has a layer, calls willDestroyLayerMixin on receiver and child views if defined (comes from mixins)", function (assert) {
  var callCount = 0;

  // make sure this will call both mixins...
  var mixinA = {
    willDestroyLayerMixin: function () { callCount++; }
  };

  var mixinB = {
    willDestroyLayerMixin: function () { callCount++; }
  };

  var view = View.create(mixinA, mixinB, {
    childViews: [View.extend(mixinA, mixinB, {
      childViews: [View.extend(mixinA)]
    })]
  });
  view.createLayer();
  view.destroyLayer();
  assert.equal(callCount, 5, 'invoked willDestroyLayerMixin on all mixins');
});

test("returns receiver", function (assert) {
  var view = View.create().createLayer();
  assert.equal(view.destroyLayer(), view, 'returns receiver');
});

/**
  There is a bug that if childView layers are rendered when the parentView's
  layer is created, the `layer` property on the childView will not be
  cached.  What occurs is that if the childView is removed from the parent
  view without ever having its `layer` requested, then when it comes time
  to destroy the layer of the childView, it will get('layer'), which had a
  bug that only returned a layer if the view has a parent view.  However,
  since the child was removed from the parent first and then destroyed, it
  no longer has a parent view and would return undefined for its `layer`.

  This left elements in the DOM.

  UPDATE:  The addition of the View statechart prevents this from happening.
*/
test("Tests that if the childView's layer was never cached and the childView is removed, it should still destroy the childView's layer", function (assert) {
  var childView,
    layerId,
    pane,
    view;

  childView = View.create({});

  layerId = childView.get('layerId');

  view = View.create({
    childViews: [childView]
  });

  pane = Pane.create({
    childViews: [view]
  }).append();

  assert.ok(document.getElementById(layerId), 'child layer should be in the DOM');
  assert.ok(!childView._view_layer, 'child view should not have cached its layer');
  view.removeChild(childView);
  // Before View states, this would be the case
  // assert.ok(document.getElementById(layerId), 'child layer should be in the DOM');
  assert.ok(!document.getElementById(layerId), 'child layer should not be in the DOM');
  childView.destroy();
  assert.ok(!document.getElementById(layerId), 'child layer should not be in the DOM');

  pane.remove();
  pane.destroy();
});
