// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { run } from "../../../../core/system/runloop.js";
import { ScrollView } from "../../../../desktop/desktop.js";
import { SCEvent } from "../../../../event/event.js";
import { ALIGN_BOTTOM, ALIGN_CENTER, ALIGN_LEFT, ALIGN_MIDDLE, ALIGN_RIGHT, ImageView, MainPane, View } from "../../../../view/view.js";

/*global module, test, ok, equals */

var pane, view, view2, view3, view4;
var appleURL = new URL('../../../../view/resources/images/sproutcore-512.png', import.meta.url); // 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';


module("ScrollView", {
  beforeEach: function () {
    run(function () {
      pane = MainPane.create({
        layout: { height: 114, width: 114 }, // Gives us 100x100 container views without worrying about scrollers (or resorting to horrible, counterproductive hacks)
        childViews: [
          // ScrollView with 4000x4000 contentView. "view" below.
          ScrollView.extend({
            contentView: ImageView.design({ value: appleURL, layout: { height: 4000, width: 4000 }}),
            horizontalAlign: ALIGN_LEFT
          }),
          // ScrollView with 2000x2000 contentView. "view2" below.
          ScrollView.extend({
            contentView: ImageView.design({ value: appleURL, layout: { height: 2000, width: 2000 }}),
            horizontalAlign: ALIGN_LEFT
          }),
          // ScrollView (view3 below) with nested ScrollView (view4 below).
          ScrollView.extend({
            layout: { height: 400, width: 400 },
            horizontalAlign: ALIGN_LEFT,
            contentView: View.design({
              layout: { height: 500, width: 500 },
              childViews: [
                ScrollView.design({
                  layout: { height: 200, width: 200, centerX: 0, centerY: 0 },
                  contentView: ImageView.design({ value: appleURL, layout: { height: 300, width: 300 }}),
                  horizontalAlign: ALIGN_LEFT
                })
              ]
            })
          })
        ],

        expectedVertLine: function (line) {
          var ret = view.get('verticalLineScroll') * line;
          var alt = view.get('maximumVerticalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedHorzLine: function (line) {
          var ret = view.get('horizontalLineScroll') * line;
          var alt = view.get('maximumHorizontalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedVertPage: function (page) {
          var ret = view.get('verticalPageScroll') * page;
          var alt = view.get('maximumVerticalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        },

        expectedHorzPage: function (page) {
          var ret = view.get('horizontalPageScroll') * page;
          var alt = view.get('maximumHorizontalScrollOffset');
          ret = (ret > alt) ? alt : ret;

          return ret;
        }
      });

      pane.append(); // make sure there is a layer...
    });

    view = pane.childViews[0];

    view2 = pane.childViews[1];

    view3 = pane.childViews[2];
    view4 = view3.get('contentView').get('childViews')[0];
  },

  afterEach: function () {
    run(function () {
      pane.destroy();
    });
    pane = view = view2 = view3 = view4 = null;
  }
});


// ------------------------------------
// scrollTo, scrollBy
//

test("Scrolling to a certain co-ordinate of the container view", function (assert) {
  assert.equal(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  assert.equal(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  run(function () {
    view.scrollTo(100, 100);
    assert.equal(view.get('horizontalScrollOffset'), 100, "After scrolling to 100, horizontal offset must be");
    assert.equal(view.get('verticalScrollOffset'), 100, "After scrolling to 100, vertical offset must be");
  });

  run(function () {
    view.scrollTo(5000, 5000);
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After scrolling to 400, horizontal offset must be maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After scrolling to 400, vertical offset must be maximum");
  });
});


test("Scroll offsets are correct when scroll view's frame changes", function (assert) {

  // Scenario: left & top aligned, at maximums, scroll view shrinks: don't move content
  run(function () {
    view.scrollBy(3900, 3900);
    pane.adjust({ width: 64, height: 64 });
    assert.equal(view.get('horizontalScrollOffset'), 3900, "After resizing the pane with adjust height of 64, horizontal offset must not change");
    assert.equal(view.get('verticalScrollOffset'), 3900, "After resizing the pane with adjust width of 64, vertical offset must not change");
  });

  // Reset the parent view.
  run(function () {
    view.scrollTo(0, 0);
    pane.adjust({ width: 114, height: 114 });
  });

  // Scenario: left & top aligned, at maximums, scroll view grows: hug the right & bottom sides.
  run(function () {
    view.scrollBy(3900, 3900);
    pane.adjust({ width: 1014, height: 1014 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the pane with adjust height of 1014, horizontal offset must be maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the pane with adjust width of 1014, vertical offset must be maximum");
  });

  // Reset the parent view.
  run(function () {
    view.scrollTo(0, 0);
    pane.adjust({ width: 114, height: 114 });
  });

  // Set alignments to hug right and bottom edges.
  run(function() {
    view.set('horizontalAlign', ALIGN_RIGHT);
    view.set('verticalAlign', ALIGN_BOTTOM);
  });

  // Scenario: right & bottom aligned, at maximums, scroll view shrinks: hug the right & bottom sides.
  run(function () {
    view.scrollBy(3900, 3900);
    pane.adjust({ width: 64, height: 64 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the pane with adjust height of 64, horizontal offset must be maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the pane with adjust width of 64, vertical offset must be maximum");
  });

  // Reset the parent view.
  run(function () {
    view.scrollTo(0, 0);
    pane.adjust({ width: 114, height: 114 });
  });

  // Scenario: right & bottom aligned, at maximums, scroll view grows: hug the right & bottom sides.
  run(function () {
    view.scrollBy(3900, 3900);
    pane.adjust({ width: 1014, height: 1014 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the pane with adjust height of 1014, horizontal offset must be maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the pane with adjust width of 1014, vertical offset must be maximum");
  });

  // Reset the parent view.
  run(function () {
    view.scrollTo(0, 0);
    pane.adjust({ width: 114, height: 114 });
  });

  // Set alignments to be center and middle.
  run(function() {
    view.set('horizontalAlign', ALIGN_CENTER);
    view.set('verticalAlign', ALIGN_MIDDLE);
  });

  // Scenario: center & middle aligned, at center & middle, scroll view shrinks: stick to center & middle
  run(function () {
    view.scrollBy(1950, 1950);
    pane.adjust({ width: 64, height: 64 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset') / 2, "After resizing the pane with adjust height of 64, horizontal offset should stay centered");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset') / 2, "After resizing the pane with adjust width of 64, vertical offset should stay centered");
  });

  // Reset the parent view.
  run(function () {
    view.scrollTo(0, 0);
    pane.adjust({ width: 114, height: 114 });
  });

  // Scenario: center & middle aligned, at center & middle, scroll view grows: stick to center & middle
  run(function () {
    view.scrollBy(1950, 1950);
    pane.adjust({ width: 1014, height: 1014 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset') / 2, "After resizing the pane with adjust height of 1014, horizontal offset should stay centered");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset') / 2, "After resizing the pane with adjust width of 1014, vertical offset should stay centered");
  });
});

test("Scroll offsets are correct when scroll view's content frame changes", function (assert) {
  var contentView = view.get('contentView');

  // Scenario: left & top aligned, at maximums, content view shrinks: hug the right & bottom sides
  run(function () {
    view.scrollBy(3900, 3900);
    contentView.adjust({ width: 3900, height: 3900 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the content with adjust width of 3900, horizontal offset must be at maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the content with adjust height of 3900 vertical offset must be at maximum");
  });

  // Reset the view.
  run(function () {
    view.scrollTo(0, 0);
    contentView.adjust({ width: 4000, height: 4000 });
  });

  // Scenario: left & top aligned, at maximums, content view grows: don't move
  run(function () {
    view.scrollBy(3900, 3900);
    contentView.adjust({ width: 4100, height: 4100 });
    assert.equal(view.get('horizontalScrollOffset'), 3900, "After resizing the content with adjust width of 4100, horizontal offset must not change");
    assert.equal(view.get('verticalScrollOffset'), 3900, "After resizing the content with adjust height of 4100, vertical offset must not change");
  });

  // Reset the view.
  run(function () {
    view.scrollTo(0, 0);
    contentView.adjust({ width: 4000, height: 4000 });
  });

  // Set alignments to hug right and bottom edges.
  run(function() {
    view.set('horizontalAlign', ALIGN_RIGHT);
    view.set('verticalAlign', ALIGN_BOTTOM);
  });

  // Scenario: right & bottom aligned, at maximums, content view shrinks: hug the right & bottom sides.
  run(function () {
    view.scrollBy(3900, 3900);
    contentView.adjust({ width: 3900, height: 3900 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the content with adjust width of 3900, horizontal offset must be at maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the content with adjust height of 3900 vertical offset must be at maximum");
  });

  // Reset the view.
  run(function () {
    view.scrollTo(0, 0);
    contentView.adjust({ width: 4000, height: 4000 });
  });

  // Scenario: right & bottom aligned, at maximums, content view grows: hug the right & bottom sides.
  run(function () {
    view.scrollBy(3900, 3900);
    contentView.adjust({ width: 4100, height: 4100 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After resizing the content with adjust width of 4100, horizontal offset must be at maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After resizing the content with adjust height of 4100 vertical offset must be at maximum");
  });

  // Reset the view.
  run(function () {
    view.scrollTo(0, 0);
    contentView.adjust({ width: 4000, height: 4000 });
  });

  // Set alignments to be center and middle.
  run(function() {
    view.set('horizontalAlign', ALIGN_CENTER);
    view.set('verticalAlign', ALIGN_MIDDLE);
  });

  // Scenario: center & middle aligned, at center & middle, content view shrinks: stick to center & middle
  run(function () {
    view.scrollBy(1950, 1950);
    contentView.adjust({ width: 3900, height: 3900 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset') / 2, "After resizing the content with adjust width of 3900, horizontal offset should stay centered");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset') / 2, "After resizing the content with adjust height of 3900 vertical offset should stay centered");
  });

  // Reset the view.
  run(function () {
    view.scrollTo(0, 0);
    contentView.adjust({ width: 4000, height: 4000 });
  });

  // Scenario: center & middle aligned, at center & middle, scroll view grows: stick to center & middle
  run(function () {
    view.scrollBy(1950, 1950);
    contentView.adjust({ width: 4100, height: 4100 });
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset') / 2, "After resizing the content with adjust width of 4100, horizontal offset should stay centered");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset') / 2, "After resizing the content with adjust height of 4100 vertical offset should stay centered");
  });
});

test("Scrolling relative to the current possition of the container view", function (assert) {
  assert.equal(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  assert.equal(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  run(function () {
    view.scrollBy(100, 100);
    assert.equal(view.get('horizontalScrollOffset'), 100, "After scrolling by 100, horizontal offset must be");
    assert.equal(view.get('verticalScrollOffset'), 100, "After scrolling by 100, vertical offset must be");
  });

  run(function () {
    view.scrollBy(100, 100);
    assert.equal(view.get('horizontalScrollOffset'), 200, "After scrolling by 100, horizontal offset must be");
    assert.equal(view.get('verticalScrollOffset'), 200, "After scrolling by 100, vertical offset must be");
  });

  run(function () {
    view.scrollBy(5000, 5000);
    assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "After scrolling by 400, horizontal offset must be maximum");
    assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "After scrolling by 400, vertical offset must be maximum");
  });
});

// ----------------------------------------------
// scrollToRect, scrollToVisible, scrollDownLine
//

test("Scrolling to a rectangle", function (assert) {
  assert.equal(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  assert.equal(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");

  run(function () {
    view.scrollToRect({ x: 100, y: 100, width: 2000, height: 2000 });
    assert.equal(view.get('horizontalScrollOffset'), 100, "After scrolling to rect, horizontal offset must be 100");
    assert.equal(view.get('verticalScrollOffset'), 100, "After scrolling to rect, vertical offset must be 100");
  });
});

test("Scrolling to a view", function (assert) {
  var pane;

  run(function () {
    pane = MainPane.create({
      childViews: ['scrollView'],
      scrollView: ScrollView.create({
        layout: { height: 100, width: 100 },
        canScale: true,
        contentView: View.create({
          layout: { height: 500, width: 500 },
          childViews: ['innerView1', 'innerView2'],
          innerView1: View.create({
            layout: { height: 100, width: 100, top: 150, left: 150 }
          }),
          innerView2: View.create({
            layout: { height: 100, width: 100, top: 200, left: 200 }
          })
        })
      })
    });
  });

  var scrollView = pane.scrollView,
    contentView = scrollView.contentView,
    innerView1 = scrollView.contentView.innerView1,
    innerView2 = scrollView.contentView.innerView2;

  run(function() { pane.append(); }); // make sure we have a layer...

  // Test scrolling to views.
  run(function() {
    scrollView.scrollToVisible(innerView1);
  });
  assert.equal(scrollView.get('verticalScrollOffset'), 150, "Scrolling to an inner view at top: 150 should offset the vertical scroll correctly");
  assert.equal(scrollView.get('horizontalScrollOffset'), 150, "Scrolling to an inner view at left: 150 should offset the horizontal scroll correctly");

  run(function() {
    scrollView.scrollToVisible(innerView2);
  });
  assert.equal(scrollView.get('verticalScrollOffset'), 200, "Scrolling to an inner view at top: 200 should offset the vertical scroll correctly");
  assert.equal(scrollView.get('horizontalScrollOffset'), 200, "Scrolling to an inner view at left: 200 should offset the horizontal scroll correctly");

  run(function() {
    scrollView.scrollToVisible(contentView);
  });
  assert.ok(!scrollView.get('horizontalScrollOffset') && !scrollView.get('verticalScrollOffset'), "Scrolling to the contentView itself should return to the upper left.");

  // Test scrolling to views with scale.
  run(function() {
    scrollView.set('scale', 2);
  });

  run(function() {
    scrollView.scrollToVisible(innerView1);
  });
  assert.equal(scrollView.get('verticalScrollOffset'), 300, "Scrolling to an inner view at top: 150 with a content scale of 2 should offset the vertical scroll correctly");
  assert.equal(scrollView.get('horizontalScrollOffset'), 300, "Scrolling to an inner view at left: 150 with a content scale of 2 should offset the horizontal scroll correctly");

  run(function() {
    scrollView.scrollToVisible(innerView2);
  });
  assert.equal(scrollView.get('verticalScrollOffset'), 400, "Scrolling to an inner view at top: 200 with a content scale of 2 should offset the vertical scroll correctly");
  assert.equal(scrollView.get('horizontalScrollOffset'), 400, "Scrolling to an inner view at left: 200 with a content scale of 2 should offset the horizontal scroll correctly");

  run(function() {
    scrollView.scrollToVisible(contentView);
  });
  assert.ok(!scrollView.get('horizontalScrollOffset') && !scrollView.get('verticalScrollOffset'), "Scrolling to the contentView itself should return to the upper left (regardless of scale).");

  // Cleanup.
  pane.destroy();
});

test("Scrolling through line by line", function (assert) {
  var line = 3;
  assert.equal(view.get('horizontalScrollOffset'), 0, "Initial horizontal offset must be zero");
  assert.equal(view.get('verticalScrollOffset'), 0, "Initial vertical offset must be zero");
  run(function () {
    view.scrollDownLine(line);
  });
  assert.equal(view.get('horizontalScrollOffset'), 0, "After scrolling down by lines, horizontal offset is unchanged");
  assert.equal(view.get('verticalScrollOffset'), pane.expectedVertLine(line), "After scrolling down by lines, vertical offset must be");
  run(function () {
    view.scrollUpLine(line);
  });
});

// ------------------------------------
// maximum[Horizontal|Vertical]ScrollOffset
//

test("maximumHorizontalScrollOffset() returns the maximum horizontal scroll dimension", function (assert) {
  var old_horizontalScrollOffset = 2;
  var old_verticalScrollOffset = 2;

  run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(5000, 0);
    assert.equal(view2.get('horizontalScrollOffset'), 1900, 'maximum x coordinate should be 1900');
  });


  run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(-5000, 0);
    assert.equal(view2.get('horizontalScrollOffset'), 0, 'minimum x coordinate should be 0');
  });

});

test("maximumVerticalScrollOffset() returns the maximum vertical scroll dimension", function (assert) {
  var old_horizontalScrollOffset = 2;
  var old_verticalScrollOffset = 2;

  run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(0, 5000);
    assert.equal(view2.get('verticalScrollOffset'), 1900, 'maximum y coordinate should be 1900');
  });

  run(function () {
    view2.set('horizontalScrollOffset', old_horizontalScrollOffset);
    view2.set('verticalScrollOffset', old_verticalScrollOffset);
    view2.scrollBy(0, -5000);
  });
  assert.equal(view2.get('verticalScrollOffset'), 0, 'The minimum y coordinate should be 0');

});

// ------------------------------------
// mouseWheel events


test("Mouse wheel events should only be captured if the scroll can scroll in the direction (both TOP-LEFT).", function (assert) {
  // FIRST GROUP: everything scrolled all the way to the top left
  run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);

  // Scrolling further left is not captured by either scroll view
  assert.ok(!view3.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  assert.ok(!view4.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling further up is not captured by either scroll view
  assert.ok(!view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  assert.ok(!view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling down is captured by the target scroll view
  assert.ok(view3.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  assert.ok(view4.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');

  // Scrolling right is captured by the target scroll view
  assert.ok(view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  assert.ok(view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');
  });
});

test("Mouse wheel events should only be captured if the scroll can scroll in the direction (both BOTTOM-RIGHT).", function (assert) {
  run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(114, 114);

    // Scrolling further right is not captured by either scroll view
  assert.ok(!view3.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  assert.ok(!view4.mouseWheel({ wheelDeltaX: 10, wheelDeltaY: 0 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling further down is not captured by either scroll view
  assert.ok(!view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The inner scroll view should not capture the mousewheel event since it cannot scroll further.');
  assert.ok(!view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: 10 }), 'The outer scroll view should not capture the mousewheel event since it cannot scroll further.');

  // Scrolling up is captured by the target scroll view
  assert.ok(view3.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  assert.ok(view4.mouseWheel({ wheelDeltaX: -10, wheelDeltaY: 0 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');

  // Scrolling left is captured by the target scroll view
  assert.ok(view3.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The inner scroll view should capture the mousewheel event since it can scroll further.');
  assert.ok(view4.mouseWheel({ wheelDeltaX: 0, wheelDeltaY: -10 }), 'The outer scroll view should capture the mousewheel event since it can scroll further.');
  });
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll right).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(114, 114);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 10, wheelDeltaY: 0 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('horizontalScrollOffset'), 114, 'The inner scroll view should still have horizontalScrollOffset');
    assert.equal(view3.get('horizontalScrollOffset'), 10, 'The outer scroll view should now have horizontalScrollOffset');
  });
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll down).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(114, 114);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: 10 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('verticalScrollOffset'), 114, 'The inner scroll view should still have verticalScrollOffset');
    assert.equal(view3.get('verticalScrollOffset'), 10, 'The outer scroll view should now have verticalScrollOffset');
  });
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll left).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(0, 0);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: -10, wheelDeltaY: 0 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
      assert.equal(view4.get('horizontalScrollOffset'), 0, 'The inner scroll view should still have horizontalScrollOffset');
      assert.equal(view3.get('horizontalScrollOffset'), 104, 'The outer scroll view should now have horizontalScrollOffset');

  });
});

test("Mouse wheel events not capturable by the inner scroll should bubble to the outer scroll (scroll up).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(0, 0);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: -10 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('verticalScrollOffset'), 0, 'The inner scroll view should still have verticalScrollOffset');
    assert.equal(view3.get('verticalScrollOffset'), 104, 'The outer scroll view should now have verticalScrollOffset');
  });
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll right).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 10, wheelDeltaY: 0 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('horizontalScrollOffset'), 10, 'The inner scroll view should now have horizontalScrollOffset');
    assert.equal(view3.get('horizontalScrollOffset'), 0, 'The outer scroll view should still have horizontalScrollOffset');
  });
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll up).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(114, 114);
    view4.scrollTo(114, 114);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: -10 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('verticalScrollOffset'), 104, 'The inner scroll view should now have verticalScrollOffset');
    assert.equal(view3.get('verticalScrollOffset'), 114, 'The outer scroll view should still have verticalScrollOffset');
  });
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll left).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(114,  114);
    view4.scrollTo(114,  114);
  });

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: -10, wheelDeltaY: 0 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('horizontalScrollOffset'), 104, 'The inner scroll view should now have horizontalScrollOffset');
    assert.equal(view3.get('horizontalScrollOffset'), 114, 'The outer scroll view should still have horizontalScrollOffset');
  });
});

test("Mouse wheel events capturable by the inner scroll should not bubble to the outer scroll (scroll down).", function (assert) {
  var elem = view4.get('layer'),
      event;

  run(function () {
    view3.scrollTo(0, 0);
    view4.scrollTo(0, 0);
  });

  // window.stop();

  event = SCEvent.simulateEvent(elem, 'mousewheel', { wheelDeltaX: 0, wheelDeltaY: 10 });
  SCEvent.trigger(elem, 'mousewheel', event);

  run(function () {
    assert.equal(view4.get('verticalScrollOffset'), 10, 'The inner scroll view should now have verticalScrollOffset');
    assert.equal(view3.get('verticalScrollOffset'), 0, 'The outer scroll view should still have verticalScrollOffset');
  });
});

// ------------------------------------
// scale
//

test("Setting scale on ScrollView", function (assert) {
  // canScale: false
  run(function() {
    view.set('scale', 0.8);
  });
  assert.equal(view.get('scale'), 1, "Setting scale on a ScrollView with canScale: false doesn't change scale.");

  // canScale: true
  run(function() {
    view.set('canScale', true);
    view.set('scale', 0.8);
  });
  assert.equal(view.get('scale'), 0.8, "Setting scale on a ScrollView with canScale: true changes scale");

  // Exceeding min
  run(function() {
    view.set('scale', -100);
  });
  assert.equal(view.get('scale'), view.get('minimumScale'), "Scale is constrained by minimumScale");

  // Exceeding max
  run(function() {
    view.set('scale', 100);
  });
  assert.equal(view.get('scale'), view.get('maximumScale'), "Scale is constrained by maximumScale");

});

// test("Setting scale on ScrollView with Scalable contentView", function() {
//   var contentView = view.get('contentView'),
//       didCall, withScale;

//   // Patch in Scalable support.
//   contentView.isScalable = true;
//   contentView.applyScale = function(scale) {
//     didCall = true;
//     withScale = scale;
//   };

//   run(function() {
//     view.set('canScale', true);
//     view.set('scale', 0.8);
//   });
//   assert.ok(didCall, "Setting scale on ScrollView with Scalable contentView calls contentView.applyScale.");
//   assert.equal(withScale, 0.8, "Setting scale on ScrollView with Scalable contentView passes the correct scale to contentView.applyScale");
// });


