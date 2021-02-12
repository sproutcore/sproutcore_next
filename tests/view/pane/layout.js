// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

import { SC } from '../../../core/core.js';
import { Pane, View } from '../../../view/view.js';

var pane;

module("Pane#layout", {
  beforeEach: function() {
    pane = Pane.create({
      layout: { top: 0, left: 0, width: 1, height: 1}
    });
    pane.append();
  },

  afterEach: function() {
    pane.remove();
    pane.destroy();
  }
});

test("make sure that a call to adjust actually adjusts the view's size", function (assert) {
  SC.RunLoop.begin();
  pane.adjust({ width: 100, height: 50 });
  SC.RunLoop.end();

  assert.equal(pane.$()[0].style.width, '100px', 'width should have been adjusted');
  assert.equal(pane.$()[0].style.height, '50px', 'height should have been adjusted');
});
