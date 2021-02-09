// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

module("View - backgroundColor");

test("Basic use", function (assert) {
  var view = View.create({
    backgroundColor: "red"
  });

  view.createLayer();

  assert.equal(view.get('layer').style.backgroundColor, "red", "backgroundColor sets the CSS background-color value");

});

test("Dynamic use", function (assert) {
  var view = View.create({
    backgroundColor: 'red',
    displayProperties: ['backgroundColor']
  });
  
  view.createLayer();
  view.viewState = View.ATTACHED_SHOWN; // hack to get view properties to update.

  assert.equal(view.get('layer').style.backgroundColor, 'red', "PRELIM: backgroundColor sets the CSS background-color value");

  SC.run(function() {
    view.set('backgroundColor', 'blue');
  });

  assert.equal(view.get('layer').style.backgroundColor, 'blue', "Changing backgroundColor when it is a display property updates the CSS background-color value");

  SC.run(function() {
    view.set('backgroundColor', null);
  });

  assert.ok(!view.get('layer').style.backgroundColor, "Setting backgroundColor to null clears the CSS background-color value");

});
