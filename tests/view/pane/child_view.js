// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ok, equals, expect, test, module*/

import { SC } from '../../../core/core.js';
import { View, CoreView, Pane } from '../../../view/view.js';

module("Pane - childViews");

test("Pane should not attempt to recompute visibility on child views that do not have visibility support", function (assert) {
  var pane = Pane.create({
    childViews: ['noVisibility'],

    noVisibility: CoreView
  });

  // tomdale insists on slowing down the tests with extra scope chain traversals
  var errored = false;

  try {
    pane.append();
  } catch (e) {
    errored = true;
  }

  assert.ok(!errored, "appending a pane with child views without visibility does not result in an error");
  pane.remove();

  // Clean up.
  pane.destroy();
});

test("Pane should only render once when appended.", function (assert) {
  var pane = Pane.create({
    childViews: ['child'],

    paneValue: null,

    render: function () {
      assert.ok(true, 'Render was called once on pane.');
    },

    child: View.extend({
      childValueBinding: SC.Binding.oneWay('.pane.paneValue'),

      childValueDidChange: function () {
        assert.equal(this.get('childValue'), 'bar', "Bound value should be set once to 'bar'");
      }.observes('childValue'),

      render: function () {
        assert.ok(true, 'Render was called once on child.');
      }
    })
  });

  SC.run(function () {
    pane.append();

    pane.set('paneValue', 'foo');
    pane.set('paneValue', 'bar');
  });

  pane.remove();

  assert.expect(3);

  // Clean up.
  pane.destroy();
});
