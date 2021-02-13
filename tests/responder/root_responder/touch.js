// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ========================================================================
// RootResponder Tests: Touch
// ========================================================================
/*global module, test, ok, equals */

import { SC } from '../../../core/core.js'; 
import { SCEvent } from '../../../event/event.js';
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane, View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';


var pane, view, layer, evt, evt2;

module("RootResponder", {
  beforeEach: function() {
    // Create our pane.
    pane = Pane.extend({
      childViews: ['contentView'],
      contentView: View.extend({
        acceptsMultitouch: true,
        touchStart: function() {},
        touchesDragged: function() {},
        touchEnd: function() {}
      })
    });
    // (Actually create it, in a run loop.)
    SC.run(function() {
      pane = pane.create().append();
    });

    // Get our view and layer.
    view = pane.contentView;
    layer = view.get('layer');
    // Create and fill in our events.
    evt = SCEvent.simulateEvent(layer, 'touchstart', { touches: [], identifier: 4, changedTouches: [], pageX: 100, pageY: 100 });
    evt2 = SCEvent.simulateEvent(layer, 'touchstart', { touches: [], identifier: 5, changedTouches: [], pageX: 200, pageY: 200 });
    evt.changedTouches.push(evt);
    evt.changedTouches.push(evt2);
    evt2.changedTouches.push(evt);
    evt2.changedTouches.push(evt2);
  },

  afterEach: function() {
    pane.destroy();
    evt = evt2 = layer = view = pane = null;
  }
});

// With v1.11, Touch now provides its own velocity along each axis.
test("Touch velocity", function (assert) {
  // Get a layer
  var touch,
    lastTimestamp;

  lastTimestamp = evt.timeStamp;

  // Trigger touchstart
  SCEvent.trigger(layer, 'touchstart', [evt]);

  touch = RootResponder.responder._touches[evt.identifier];

  assert.equal(touch.velocityX, 0, "Horizontal velocity begin at zero");
  assert.equal(touch.velocityY, 0, "Vertical velocity begin at zero");

  // Copy the last DOM touch as the basis of an updated DOM touch.
  touch = SC.copy(touch);
  touch.pageX += 100;
  touch.pageY += 100;

  evt = SCEvent.simulateEvent(layer, 'touchmove', { touches: [touch], identifier: 4, changedTouches: [touch] });
  evt.timeStamp = lastTimestamp + 100;

  SCEvent.trigger(layer, 'touchmove', [evt]);

  touch = RootResponder.responder._touches[evt.identifier];

  assert.equal(touch.velocityX, 1, 'VelocityX for 100 pixels in 100 ms is 1.');
  assert.equal(touch.velocityY, 1, 'VelocityY for 100 pixels in 100 ms is 1.');

});

test("averagedTouchesForView", function (assert) {
  // Start touch.
  SCEvent.trigger(layer, 'touchstart', evt);

  // Copy the last DOM touch as the basis of an updated DOM touch.
  var touch1 = RootResponder.responder._touches[evt.identifier];
  var touch2 = RootResponder.responder._touches[evt2.identifier];

  // Get our starting average.
  var expectedAverageX = (touch1.pageX + touch2.pageX) / 2,
    expectedAverageY = (touch1.pageY + touch2.pageY) / 2,
    startAverage = SC.clone(RootResponder.responder.averagedTouchesForView(view));

  assert.equal(startAverage.x, expectedAverageX, "averagedTouchesForView correctly returns touch location averages (x)");
  assert.equal(startAverage.y, expectedAverageY, "averagedTouchesForView correctly returns touch location averages (y)");
  assert.ok(startAverage.d, "averagedTouchesForView's distance measurement should ... be a nonzero number. (Pythagoras doesn't play nice with integers.)");

  // Pinch out by 50 pixels in every direction.
  touch1.pageX = 50;
  touch1.pageY = 50;
  touch2.pageX = 250;
  touch2.pageY = 250;

  var moveEvt = SCEvent.simulateEvent(layer, 'touchmove', { touches: [touch1, touch2], identifier: 6, changedTouches: [touch1, touch2] });
  SCEvent.trigger(layer, 'touchmove', moveEvt);

  // Get our post-pinch average.
  var endAverage = RootResponder.responder.averagedTouchesForView(view);

  assert.ok(startAverage.x === endAverage.x && startAverage.y === endAverage.y, 'Touches moved symmetrically, so gesture center should not have moved.');
  assert.equal(endAverage.d, startAverage.d * 2, "Touches moved apart by 2x; gesture distance should have doubled");
});
