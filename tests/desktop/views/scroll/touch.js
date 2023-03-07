// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { run } from "../../../../core/system/runloop.js";
import { ScrollView } from "../../../../desktop/desktop.js";
import { SCROLL } from "../../../../desktop/views/scroll_view.js";
import { SCEvent } from "../../../../event/event.js";
import { RootResponder } from "../../../../responder/responder.js";
import { ALIGN_LEFT, MainPane, View } from "../../../../view/view.js";

/*global module, test, ok, equals */

var pane, scrollView, inner, targetLayer, evt, evt2, evt3,
    scrollStart, innerStart, scrollDragged, innerDragged, scrollEnd, innerEnd, scrollCancel, innerCancel;

// Sets up and tears down our pane and event.
module("ScrollView touch", {
  beforeEach: function() {

    // Initialize our counters.
    scrollStart = scrollDragged = scrollEnd = scrollCancel = 0;
    innerStart = innerDragged = innerEnd = innerCancel = 0;

    // Create our pane.
    pane = MainPane.extend({
      layout: { height: 80 },
      childViews: ['contentView'],
      contentView: ScrollView.extend({

        touchStart: function ts () {
          scrollStart++;
          return ts.base.apply(this, arguments);
        },
        touchesDragged: function td () {
          scrollDragged++;
          return td.base.apply(this, arguments);
        },
        touchEnd: function te () {
          scrollEnd++;
          return te.base.apply(this, arguments);
        },
        touchCancelled: function tc () {
          scrollCancel++;
          return tc.base.apply(this, arguments);
        },

        contentView: View.extend({
          layout: { height: 100 },
          touchStart: function() {
            innerStart++;
          },
          touchesDragged: function(evt, touchesForView) {
            innerDragged++;
            // If we've scrolled more than 15 pixels, pass back to the scroller.
            if (Math.abs(evt.startY - evt.pageY) > 15) {
              touchesForView.invoke('restoreLastTouchResponder');
            }
          },
          touchEnd: function() {
            innerEnd++;
          },
          touchCancelled: function() {
            innerCancel++;
          }
        })
      })
    });
    // (Actually create it, in a run loop.)
    run(function() {
      pane = pane.create().append();
    });

    // Set up our pertinent reused variables.
    scrollView = pane.contentView;
    inner = scrollView.contentView;
    targetLayer = inner.get('layer');

    evt = SCEvent.simulateEvent(targetLayer, 'touchstart');
    evt.touches = [evt];
    evt.identifier = 4;
    evt.pageX = 50;
    evt.pageY = 50;
    evt.changedTouches = [evt];
  },

  afterEach: function() {
    run(pane.destroy, pane);

    pane = scrollView = inner = targetLayer = evt = null;
  }
});


// Test a touch lifecycle with no vertical movement and delaysContentTouches: true - the scroll view will capture the touch,
// but since there was no scroll, it will give inner views a chance to respond to it on touchEnd.
test("Tapping with delaysContentTouches: true", function (assert) {
  // Trigger touchstart
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(scrollStart, 1, "After touchstart, the scroll view's touchStart should have been called once");
  assert.equal(innerStart, 0, "After touchstart, the inner view's touchStart should not have been called, as the touch was captured by the scroll view");

  // Trigger touchmove:
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollDragged, 1, "After touchmove, the scroll view's touchesDragged should have been called once");
  assert.equal(innerDragged, 0, "After touchmove, the inner view's touchesDragged should not have been called, as the touch is still owned by the scroll view");

  // Trigger touchend:
  SCEvent.trigger(targetLayer, 'touchend', evt);

  assert.equal(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
  assert.equal(innerStart, 1, "Once the scroll view has handled touchEnd, it passes the touch to the inner view, so innerStart should have run");
  assert.equal(innerDragged, 0, "The inner view's touchesDragged method should still not have been called");
  assert.equal(innerEnd, 1, "The scroll view ends the touch as soon as the inner view has had a chance to start it, thus tap; this triggers the inner view's touchEnd immediately");
});


// Test a touch lifecycle with some vertical movement and delaysContentTouches: true - The scroll view will capture the
// touch, and since there was a scroll, the inner view will not receive any notifications whatsoever.
test("Dragging with delaysContentTouches: true", function (assert) {
  // Trigger touchstart
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(scrollStart, 1, "After touchstart, the scroll view's touchStart should have been called once");
  assert.equal(innerStart, 0, "After touchstart, the inner view's touchStart should not have been called, as the touch was captured by the scroll view");

  // Give the event some vertical delta:
  evt.pageY += 16;
  // Trigger touchmove:
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollDragged, 1, "After touchmove, the scroll view's touchesDragged should have been called once");
  assert.equal(innerDragged, 0, "After touchmove, the inner view's touchesDragged should not have been called, as the touch is still owned by the scroll view");

  // Trigger touchend:
  SCEvent.trigger(targetLayer, 'touchend', evt);

  assert.equal(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
  assert.equal(innerStart, 0, "inner view's touchStart will not have run, as the touch has moved enough to begin scrolling and will bypass the inner view entirely");
  assert.equal(innerDragged, 0, "The inner view's touchesDragged method should still not have been called");
  assert.equal(innerEnd, 0, "Having never started, the inner view will not receive touchEnd either");
});


// Test a touch lifecycle with no vertical movement and delaysContentTouches: false - the scroll view should not partake in this touch at all.
test("Tapping with delaysContentTouches: false", function (assert) {
  scrollView.set('delaysContentTouches', false);

  // Trigger touchstart
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(scrollStart, 0, "We're not capturing touches, so scroll view's touchStart will not have fired after touchstart");
  assert.equal(innerStart, 1, "After touchstart, inner view's touchStart will have been called once");

  // Trigger touchmove:
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollDragged, 0, "Scroll view's touchesDragged will not have fired, as it is not the touch responder");
  assert.equal(innerDragged, 1, "After touchmove, inner view's touchDragged gets straightforwardly called because it is the touch responder");

  // Trigger touchend:
  SCEvent.trigger(targetLayer, 'touchend', evt);

  assert.equal(scrollEnd, 0, "Again, the scroll view is completely uninvolved in this touch, so its touchEnd doesn't get called");
  assert.equal(innerEnd, 1, "The inner view's touchEnd gets called because of how it's responding to the touch");
});


// Tests a touch lifecycle with some vertical movement and delaysContentTouches: false - the inner view will receive the touch,
// but upon it becoming a drag will voluntarily relinquish it back to the scroll view. (See innerView.touchesDragged in the
// current module.setup method.)
test("Dragging with delaysContentTouches: false", function (assert) {
  scrollView.set('delaysContentTouches', false);

  // Trigger touchstart
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(scrollStart, 0, "Since the scroll view isn't capturing touches, it gets no touchStart love");
  assert.equal(innerStart, 1, "After touchstart, the inner view's touchStart should have been straightforwardly called");

  // Give the event some vertical delta:
  evt.pageY += 16;
  // Trigger touchmove:
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollDragged, 0, "The scroll view's touchDragged should not have been called, since at the time of the event it was not the touch's responder");
  assert.equal(innerDragged, 1, "The inner view's touchesDragged should have straightforwardly handled the event");
  assert.equal(scrollStart, 1, "Having been passed the touch by inner view's touchesDragged, the scroll view's touchStart will now have fired");
  assert.equal(innerCancel, 1, "Having passed the touch back to the scroll view, the inner view's touchCancelled should have run");

  // Trigger touchend:
  SCEvent.trigger(targetLayer, 'touchend', evt);

  assert.equal(scrollEnd, 1, "After touchend, the scroll view's touchEnd should have been called once");
});

var initialPageX = 100,
  initialPageY = 100;

module("ScrollView touch thresholds and locks", {
  beforeEach: function() {
    // Set up our pane (then create it in a run loop).
    pane = MainPane.extend({
      layout: { height: 100, width: 100 },
      childViews: ['contentView'],
      contentView: ScrollView.extend({
        touchScrollThreshold: 10,
        touchSecondaryScrollThreshold: 20,
        touchSecondaryScrollLock: 30,
        horizontalAlign: ALIGN_LEFT,
        contentView: View.extend({
          layout: { height: 200, width: 200 }
        })
      })
    });
    run(function() { pane = pane.create().append(); });

    // Set up our pertinent reused variables.
    scrollView = pane.contentView;
    inner = scrollView.contentView;
    targetLayer = inner.get('layer');

    evt = SCEvent.simulateEvent(targetLayer, 'touchstart');
    evt.touches = [evt];
    evt.identifier = 4;
    evt.pageX = initialPageX;
    evt.pageY = initialPageY;
    evt.changedTouches = [evt];
  },
  afterEach: function() {
    run(pane.destroy, pane);
  }
});

// Disabled. The scroll thresholds don't stop the content from moving, they only allow the touch event to be
// sent to the content if not met. This allows scrolling to begin immediately, not after a small pause.
// test("Touch scroll thresholds", function() {
//   assert.equal(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
//   assert.equal(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

//   // Start touch
//   run(function() {
//     SCEvent.trigger(targetLayer, 'touchstart', evt);
//   });

//   // Move touch up less than touchScrollThreshold.
//   evt.pageY = initialPageY - 9;
//   run(function() {
//     SCEvent.trigger(targetLayer, 'touchmove', evt);
//   });
//   assert.equal(scrollView.get('verticalScrollOffset'), 0, "Scrolling less than touchScrollThreshold results in no scrolling");
//   if (scrollView.get('horizontalScrollOffset') !== 0) assert.ok(false, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

//   // Move touch up more than touchScrollThreshold.
//   evt.pageY = initialPageY - 11;
//   run(function() {
//     SCEvent.trigger(targetLayer, 'touchmove', evt);
//   });
//   assert.equal(scrollView.get('verticalScrollOffset'), 11, "Scrolling more than touchScrollThreshold results in scrolling");
//   if (scrollView.get('horizontalScrollOffset') !== 0) assert.ok(false, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

//   // Move touch sideways less than touchSecondaryScrollThreshold.
//   evt.pageX = initialPageX - 19;
//   run(function() {
//     SCEvent.trigger(targetLayer, 'touchmove', evt);
//   });
//   if (scrollView.get('verticalScrollOffset') !== 11) assert.ok(false, "A touch with no vertical change shouldn't trigger a vertical scroll!");
//   assert.equal(scrollView.get('horizontalScrollOffset'), 0, "With a vertical scroll in motion, scrolling horizontally less than touchSecondaryScrollThreshold results in no scrolling");

//   // Move touch sideways more than touchSecondaryScrollThreshold.
//   evt.pageX = initialPageX - 21;
//   run(function() {
//     SCEvent.trigger(targetLayer, 'touchmove', evt);
//   });
//   if (scrollView.get('verticalScrollOffset') !== 11) assert.ok(false, "A touch with no vertical change shouldn't trigger a vertical scroll!");
//   assert.equal(scrollView.get('horizontalScrollOffset'), 21, "With a vertical scroll in motion, scrolling horizontally by more than touchSecondaryScrollThreshold results in scrolling");

// });

test("Touch scroll lock", function (assert) {
  assert.equal(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

  // Start touch
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  // Move touch up more than touchSecondaryScrollLock.
  evt.pageY = initialPageY - SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('verticalScrollOffset'), SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD, "PRELIM: Scrolling more than touchScrollThreshold results in scrolling");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "A touch with no horizontal change shouldn't trigger a horizontal scroll!");

  // Move touch sideways.
  evt.pageX = initialPageX - 50;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('verticalScrollOffset'), SCROLL.SCROLL_LOCK_GESTURE_THRESHOLD, "A touch with no vertical change shouldn't trigger a vertical scroll!");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "Having scrolled vertically past the scrollGestureSecondaryThreshold, horizontal touch movements are ignored");
});

module("ScrollView touch scale", {
  beforeEach: function() {
    // Create our pane.
    pane = MainPane.extend({
      childViews: ['contentView'],
      contentView: ScrollView.extend({
        layout: { height: 1000, width: 1000 },
        canScale: true,
        horizontalOverlay: true,
        verticalOverlay: true,
        contentView: View.extend({
          layout: { height: 1000, width: 1000 }
        })
      })
    });
    // (Actually create it, in a run loop.)
    run(function() {
      pane = pane.create().append();
    });

    // Set up our pertinent reused variables.
    scrollView = pane.contentView;
    inner = scrollView.contentView;
    targetLayer = inner.get('layer');

    evt = SCEvent.simulateEvent(targetLayer, 'touchstart');
    evt.identifier = 4;
    evt.pageX = 400;
    evt.pageY = 400;

    evt2 = SCEvent.simulateEvent(targetLayer, 'touchstart');
    evt2.identifier = 5;
    evt2.pageX = 600;
    evt2.pageY = 600;

    evt3 = SCEvent.simulateEvent(targetLayer, 'touchstart');
    evt3.identifier = 6;
    evt3.pageX = 600;
    evt3.pageY = 400;
  },
  afterEach: function() {
    run(pane.destroy, pane);
  }
});

/**
  Some quick earned wisdom on testing touches. When you use SCEvent.trigger to trigger a touch event,
  the touch event's `touches` property must be an array with all of the currently operational touches
  (i.e. those previously started and not yet ended); its `changedTouches` property must be all the touches
  whose changes you want the root responder to acknowledge.

  `touchs` and `changedTouches` only need to be present on the event that you're passing to SCEvent.trigger;
  you trigger changes to multiple touches in one event by including them in that touch's `changedTouches`
  property. All `changedTouches` will be used to trigger the same event (for example, 'touchStart'), which
  can lead to testing issues if you pass the incorrect touches.
*/

test("Basic touch scale", function (assert) {
  assert.equal(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");
  assert.equal(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  // Pinch out to 2x.
  evt.pageX = evt.pageY -= 100;
  evt2.pageX = evt2.pageY += 100;
  evt.touches = [evt, evt2];
  // evt.changedTouches = [touch1, touch2];
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  // ScrollView's touch-pinching depends heavily on RootResponder#averagedTouchesForView. If these tests
  // are misbehaving, first verify that RootResponder's touch tests are passing.
  assert.equal(scrollView.get('scale'), 2, "A 2x pinch gesture should double the scroll's scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 500, "A centered pinch gesture should move the horizontal offset by half the content view's change in width");
  assert.equal(scrollView.get('verticalScrollOffset'), 500, "A centered pinch gesture should move the vertical offset by half the content view's change in height");

  // Move the gesture.
  evt.pageX = evt.pageY += 100;
  evt2.pageX = evt2.pageY += 100;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('scale'), 2, "A gesture change with no change in distance should not change scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 400, "Gesture change in position by 100 should move offsets by 100");
  assert.equal(scrollView.get('verticalScrollOffset'), 400, "Gesture change in position by 100 should move offsets by 100");

  // Move and pinch (back to 1x) in the same gesture.
  evt.pageX = evt.pageY = 400;
  evt2.pageX = evt2.pageY = 600;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('scale'), 1, "A pinch + move gesture should change the scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "A pinch + move gesture should update the horizontal offset correctly");
  assert.equal(scrollView.get('verticalScrollOffset'), 0, "A pinch + move gesture should update the vertical offset correctly");
});

test("Adding and removing touches (no scaling).", function (assert) {
  // For this test we need room to scroll.
  run(function() { inner.adjust('height', 2000); });

  assert.equal(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  assert.equal(scrollView.get('maximumVerticalScrollOffset'), 1000, "PRELIM: Vertical offset has room to grow");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");
  assert.equal(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  evt.pageY -= 100;
  evt2.pageY -= 100;
  evt.touches = [evt, evt2];
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 2, "There should still be two touches");
  assert.equal(scrollView.get('scale'), 1, "A two-touch gesture with no pinching should result in no scaling");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "A two-touch vertical scroll gesture should not scroll horizontally");
  assert.equal(scrollView.get('verticalScrollOffset'), 100, "A two-touch vertical scroll gesture should successfully scroll vertically");

  // Add a third touch.
  evt.touches = [evt, evt2];
  evt.changedTouches = [evt3];
  SCEvent.trigger(targetLayer, 'touchstart', evt);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 3, "Adding a third touch should result in three touches");
  assert.equal(scrollView.get('scale'), 1, "Adding a third touch should not impact scaling");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "Adding a third touch should not impact horizontal offset");
  assert.equal(scrollView.get('verticalScrollOffset'), 100, "Adding a third touch should not impact vertical offset");

  // Move all three touches up in tandem.
  evt.pageY -= 100;
  evt2.pageY -= 100;
  evt3.pageY -= 100;
  evt.touches = [evt, evt2, evt3];
  evt.changedTouches = [evt, evt2, evt3];
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('scale'), 1, "A three-touch gesture with no pinching should result in no scaling");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "A now-three-touch vertical scroll gesture should not scroll horizontally");
  assert.equal(scrollView.get('verticalScrollOffset'), 200, "A now-three-touch vertical scroll gesture should successfully scroll vertically");
});

test("Adding and removing touches while scaling.", function (assert) {
  assert.equal(scrollView.get('scale'), 1, "PRELIM: Horizontal offset starts at");
  assert.equal(scrollView.get('verticalScrollOffset'), 0, "PRELIM: Vertical offset starts at");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "PRELIM: Horizontal offset starts at");

  // Start touches.
  evt.touches = [];
  evt.changedTouches = [evt, evt2];
  SCEvent.trigger(targetLayer, 'touchstart', evt);
  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 2, "Two touches should result in two touches");

  // Pinch out to 2x to begin scaling.
  evt.touches = [evt, evt2];
  evt.pageX = evt.pageY = 300;
  evt2.pageX = evt2.pageY = 700;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('scale'), 2, "A 2x pinch gesture should double the scroll's scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 500, "A centered pinch gesture should move the horizontal offset by half the content view's change in width");
  assert.equal(scrollView.get('verticalScrollOffset'), 500, "A centered pinch gesture should move the vertical offset by half the content view's change in height");

  // Remove our second touch.
  evt2.touches = [evt, evt2];
  evt2.changedTouches = [evt2];
  SCEvent.trigger(targetLayer, 'touchend', evt2);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 1, "Removing one of two touches should leave one touch");
  assert.equal(scrollView.get('scale'), 2, "Removing a touch shouldn't change scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 500, "Removing a touch shouldn't change the horizontal offset");
  assert.equal(scrollView.get('verticalScrollOffset'), 500, "Removing a touch shouldn't change the vertical offset");

  // Add third touch to spot second touch just left.
  evt3.touches = [evt];
  evt3.changedTouches = [evt3];
  evt3.pageX = 700;
  evt3.pageY = 700;
  SCEvent.trigger(targetLayer, 'touchstart', evt3);

  assert.equal(RootResponder.responder.touchesForView(scrollView).length, 2, "Adding one touch to one touch should result in two touches");
  assert.equal(scrollView.get('scale'), 2, "Adding a touch shouldn't change scale");
  assert.equal(scrollView.get('horizontalScrollOffset'), 500, "Adding a touch shouldn't change the horizontal offset");
  assert.equal(scrollView.get('verticalScrollOffset'), 500, "Adding a touch shouldn't change the vertical offset");

  // Pinch back to 1x. Should revert everybody to initial values.
  evt.touches = [evt, evt3];
  evt.changedTouches = [evt, evt3];
  evt.pageX = evt.pageY = 400;
  evt3.pageX = evt3.pageY = 600;
  SCEvent.trigger(targetLayer, 'touchmove', evt);

  assert.equal(scrollView.get('scale'), 1, "Pinching back down by half should reverse doubling of scaling");
  assert.equal(scrollView.get('horizontalScrollOffset'), 0, "Pinching back down by half should reverse horizontal offset change");
  assert.equal(scrollView.get('verticalScrollOffset'), 0, "Pinching back down by half should reverse vertical offset change");
});
