// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

// falseTE: This file tests both updateLayer() and the related methods that
// will trigger it.

// ..........................................................
// TEST: updateLayer()
//
import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

module("View#updateLayer");

test("invokes applyAttributesToContext() and then updates layer element", function (assert) {
  var layer = document.createElement('div');

  var times = 0;
  var view = View.create({
    applyAttributesToContext: function() {
      times++;
      this.$().addClass('did-update-' + times);
    }
  });
  view.createLayer();
  view.updateLayer(true);
  assert.ok(view.$().attr('class').indexOf('did-update-2')>=0, 'has class name added by render()');

  // Clean up.
  layer = null;
  view.destroy();
});

// ..........................................................
// TEST: updateLayerIfNeeded()
//
var view, callCount ;
module("View#updateLayerIfNeeded", {
  beforeEach: function() {
    view = View.create({
      isVisible: false,
      _executeDoUpdateContent: function() {
        callCount++;
      }
    });
    callCount = 0 ;

    view.createLayer();
    view._doAttach(document.body);
  },

  afterEach: function () {
    // Clean up.
    view.destroy();
    view = null;
  }

});

test("does not call _executeDoUpdateContent if not in shown state", function (assert) {
  view.updateLayerIfNeeded();
  assert.equal(callCount, 0, '_executeDoUpdateContent did falseT run');
});

test("does call _executeDoUpdateContent if in shown state", function (assert) {
  view.set('isVisible', true);
  assert.equal(view.get('isVisibleInWindow'), true, 'precond - isVisibleInWindow');

  view.updateLayerIfNeeded();
  assert.ok(callCount > 0, '_executeDoUpdateContent() did run');
});

test("returns receiver", function (assert) {
  assert.equal(view.updateLayerIfNeeded(), view, 'returns receiver');
});

test("only runs _executeDoUpdateContent once if called multiple times (since layerNeedsUpdate is set to false)", function (assert) {
  callCount = 0;
  view.set('isVisible', true);
  SC.run(function () {
    view.displayDidChange().displayDidChange().displayDidChange();
  });
  assert.equal(callCount, 1, '_executeDoUpdateContent() called only once');
});
