// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { run } from "../../../../core/system/runloop.js";
import { ScrollView } from "../../../../desktop/desktop.js";
import { ALIGN_BOTTOM, ALIGN_CENTER, ALIGN_LEFT, ALIGN_MIDDLE, ALIGN_RIGHT, ALIGN_TOP, ImageView } from "../../../../view/view.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";

/*global module, test, equals */

var pane;
var imageUrl = new URL('../../../../view/resources/images/sproutcore-512.png', import.meta.url); // 'http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg';

var scrollViewOriginalHeight = 100;
var scrollViewOriginalWidth = 200;

var contentViewOriginalHeight = 400;
var contentViewOriginalWidth = 400;

var pane = ControlTestPane.design()
  .add("scrollView with content view of fixed height", ScrollView.design({
    // ScrollView with overflowing contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: true,
    minimumScale: 0.01,
    maximumScale: 100
  }))
  .add("scrollview with content view attached to top and bottom", ScrollView.design({
    // ScrollView with overflowing contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: ImageView.design({ value: imageUrl, layout: { top: 0, bottom: 0, width: contentViewOriginalWidth }}),

    canScale: true,
    minimumScale: 0.01,
    maximumScale: 100
  }))
  .add("scrollView with content view of fixed height center-center-aligned", ScrollView.design({
    // ScrollView with overflowing contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: true,
    minimumScale: 0.01,
    maximumScale: 100,

    horizontalAlign: ALIGN_CENTER,
    verticalAlign: ALIGN_MIDDLE
  }))
  .add("scrollView with content view of fixed height bottom-right-aligned", ScrollView.design({
    // ScrollView with overflowing contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: true,
    minimumScale: 0.01,
    maximumScale: 100,

    horizontalAlign: ALIGN_RIGHT,
    verticalAlign: ALIGN_BOTTOM
  }))
  .add("scrollView with content view of fixed height and bottom-right initial alignment", ScrollView.design({
    // ScrollView with overflowing contentView
    layout: { top: 0, left: 0, height: scrollViewOriginalHeight, width: scrollViewOriginalWidth },
    contentView: ImageView.design({ value: imageUrl, layout: { height: contentViewOriginalHeight, width: contentViewOriginalWidth }}),

    canScale: true,
    minimumScale: 0.01,
    maximumScale: 100,

    horizontalAlign: ALIGN_LEFT,
    verticalAlign: ALIGN_TOP,
    initialHorizontalAlign: ALIGN_RIGHT,
    initialVerticalAlign: ALIGN_BOTTOM
  }));

module("ScrollView", {
  beforeEach: function () {
    pane.standardSetup().beforeEach();
  },

  afterEach: function () {
    pane.standardSetup().afterEach();
  }
});

// ------------------------------
// BASIC
//

test('Initial values of scale and horizontal offsets are good', function (assert) {
  var scrollView = pane.view('scrollView with content view of fixed height');

  assert.equal(scrollView.get('scale'), 1, 'Initial scale is 1');

  assert.equal(scrollView.get('horizontalScrollOffset'), 107, 'Initial horizontal offset must be half the maximumHorizontalScrollOffset');
  assert.equal(scrollView.get('verticalScrollOffset'), 0, 'Initial vertical offset must be zero');
});

test("Content view is scaled based on scroll view's scale property", function (assert) {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    contentView = scrollView.get('contentView');

  run(function() {
    scrollView.set('scale', 0.1);
  });

  assert.equal(scrollView.get('scale'), 0.1, 'Scale has been updated to 0.1');

  assert.equal(contentView.getPath('frame.width'), 0.1 * contentViewOriginalWidth, "Content view's width is scaled smaller based on scroll view's scale");
  assert.equal(contentView.getPath('frame.height'), 0.1 * contentViewOriginalHeight, "Content view's height is scaled smaller based on scroll view's scale");

  run(function() {
    scrollView.set('scale', 10);
  });

  assert.equal(scrollView.get('scale'), 10, 'Scale has been updated to 10');

  assert.equal(contentView.getPath('frame.width'), 10 * contentViewOriginalWidth, "Content view's width is scaled larger based on scroll view's scale");
  assert.equal(contentView.getPath('frame.height'), 10 * contentViewOriginalHeight, "Content view's height is scaled larger based on scroll view's scale");

});

// ------------------------------
// Fully visible - static
//

test('When contentView is fully visible, it is positioned according to horizontalAlign', function (assert) {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    containerView = scrollView.get('containerView'),
    contentView = scrollView.get('contentView');

  run(function() {
    scrollView.set('scale', 0.1);
  });

  run(function() {
    scrollView.set('horizontalAlign', ALIGN_LEFT);
  });

  assert.equal(contentView.getPath('frame.x'), 0, "Content view's x offset is 0 when horizontalAlign is set to ALIGN_LEFT");

  run(function() {
    scrollView.set('horizontalAlign', ALIGN_CENTER);
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.width') - contentView.getPath('frame.width')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);
  assert.equal(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is centered when horizontalAlign is set to ALIGN_CENTER");

  run(function() {
    scrollView.set('horizontalAlign', ALIGN_RIGHT);
  });

  expectedContentViewOffsetX = containerView.getPath('frame.width') - contentView.getPath('frame.width');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  assert.equal(contentView.getPath('frame.x'), expectedContentViewOffsetX, "Content view is aligned right when horizontalAlign is set to ALIGN_RIGHT");
});

test('When contentView is fully visible, it is positioned according to verticalAlign', function (assert) {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    containerView = scrollView.get('containerView'),
    contentView = scrollView.get('contentView');

  run(function() {
    scrollView.set('scale', 0.1);
  });

  run(function() {
    scrollView.set('verticalAlign', ALIGN_TOP);
  });

  assert.equal(contentView.getPath('frame.y'), 0, "Content view's y offset is 0 when verticalAlign is set to ALIGN_TOP");

  run(function() {
    scrollView.set('verticalAlign', ALIGN_MIDDLE);
  });

  var expectedContentViewOffsetX = (containerView.getPath('frame.height') - contentView.getPath('frame.height')) / 2;
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  assert.equal(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is centered when verticalAlign is set to ALIGN_MIDDLE");

  run(function() {
    scrollView.set('verticalAlign', ALIGN_BOTTOM);
  });

  expectedContentViewOffsetX = containerView.getPath('frame.height') - contentView.getPath('frame.height');
  expectedContentViewOffsetX = Math.round(expectedContentViewOffsetX);

  assert.equal(contentView.getPath('frame.y'), expectedContentViewOffsetX, "Content view is aligned to the bottom when verticalAlign is set to ALIGN_BOTTOM");
});

// ------------------------------
// Zoomed in - static
//

test('When zoomed into the contentView, the content view should remain centered around visible center', function (assert) {
  var scrollView = pane.view('scrollView with content view of fixed height'),
    containerFrame = scrollView.getPath('containerView.frame');

  // The percentage offsets for horizontal: ALIGN_CENTER & vertical: ALIGN_TOP for the given content and container size.
  var hPct = 0.5,
      vPct = 0.1075;

  run(function() {
    // Note: Before any scrolling occurs, scale changes adhere to initial alignments.
    scrollView.set('horizontalScrollOffset', scrollView.get('horizontalScrollOffset'));
    scrollView.set('verticalScrollOffset', scrollView.get('verticalScrollOffset'));

    scrollView.set('scale', 10);
  });

  var newOffsets = {
    h: hPct * (scrollView.get('maximumHorizontalScrollOffset') + containerFrame.width) - (containerFrame.width / 2),
    v: vPct * (scrollView.get('maximumVerticalScrollOffset') + containerFrame.height) - (containerFrame.height / 2)
  };

  assert.equal(scrollView.get('horizontalScrollOffset'), newOffsets.h, "Content view left offset remains centered to visible center when zoomed into contentView");
  assert.equal(scrollView.get('verticalScrollOffset'), newOffsets.v, "Content view top offset remains centered to visible center when zoomed into contentView");
});

// ------------------------------
// Zooming in
//

/*
  The following tests ensure that the content sticks to minimums or maximums when scaling. However, this seems like the incorrect
  behavior. Instead zooming should respect the content's visible center (e.g. OS X Preview zooming behavior).
  */
// test('When zoomed into the contentView, the horizontal offset should stick to minimum if it was previously set to minimum', function() {
//   var scrollView = pane.view('scrollView with content view of fixed height'),
//     containerFrame = scrollView.getPath('containerView.frame');

//   // first, zoom in a bit and set the horizontal offset to minimum
//   run(function() {
//     scrollView.set('scale', 10);
//     scrollView.set('horizontalScrollOffset', scrollView.get('minimumHorizontalScrollOffset'));
//   });

//   // verify that the horizontal offset is minimum

//   assert.equal(scrollView.get('horizontalScrollOffset'), scrollView.get('minimumHorizontalScrollOffset'), 'Horizontal offset is at minimum after setting it to be thus');

//   // now, zoom in a bit more and make sure it's still minimum

//   // The percentage offsets for horizontal: 0 @ scale of 10 & vertical: ALIGN_TOP for the given content and container size.
//   var hPct = (0 + (containerFrame.width / 2)) / (scrollView.get('maximumHorizontalScrollOffset') + containerFrame.width),
//       vPct = 0.125;

//   run(function() {
//     scrollView.set('scale', 11);
//   });

//   var newOffsets = {
//     h: hPct * (scrollView.get('maximumHorizontalScrollOffset') + containerFrame.width) - (containerFrame.width / 2),
//     v: vPct * (scrollView.get('maximumVerticalScrollOffset') + containerFrame.height) - (containerFrame.height / 2)
//   };

//   assert.equal(scrollView.get('horizontalScrollOffset'), newOffsets.h, 'Horizontal offset is still at minimum after scaling');
// });

// test('When zoomed into the contentView, the horizontal offset should stick to maximum if it was previously set to maximum', function() {
//   var scrollView = pane.view('scrollView with content view of fixed height');

//   // first, zoom in a bit and set the horizontal offset to maximum
//   run(function() {
//     scrollView.set('scale', 10);
//     scrollView.scrollTo(scrollView.get('maximumHorizontalScrollOffset'));
//   });

//   // verify that the horizontal offset is maximum

//   assert.equal(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), 'Horizontal offset is at maximum after setting it to be thus');

//   // now, zoom in a bit more and make sure it's still maximum

//   run(function() {
//     scrollView.set('scale', 11);
//   });

//   assert.equal(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), 'Horizontal offset is still at maximum after scaling');
// });

// test('When zoomed into the contentView, the vertical offset should stick to minimum if it was previously set to minimum', function() {
//   var scrollView = pane.view('scrollView with content view of fixed height');

//   // first, zoom in a bit and set the vertical offset to minimum
//   run(function() {
//     scrollView.set('scale', 10);
//     scrollView.scrollTo(null, scrollView.get('minimumVerticalScrollOffset'));
//   });

//   // verify that the vertical offset is minimum

//   assert.equal(scrollView.get('verticalScrollOffset'), scrollView.get('minimumVerticalScrollOffset'), 'Vertical offset is at minimum after setting it to be thus');

//   // now, zoom in a bit more and make sure it's still minimum

//   run(function() {
//     scrollView.set('scale', 11);
//   });

//   assert.equal(scrollView.get('verticalScrollOffset'), scrollView.get('minimumVerticalScrollOffset'), 'Vertical offset is still at minimum after scaling');
// });

// test('When zoomed into the contentView, the vertical offset should stick to maximum if it was previously set to maximum', function() {
//   var scrollView = pane.view('scrollView with content view of fixed height');

//   // first, zoom in a bit and set the vertical offset to maximum
//   run(function() {
//     scrollView.set('scale', 10);
//     scrollView.scrollTo(null, scrollView.get('maximumVerticalScrollOffset'));
//   });

//   // verify that the vertical offset is maximum

//   assert.equal(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is at maximum after setting it to be thus');

//   // now, zoom in a bit more and make sure it's still maximum

//   run(function() {
//     scrollView.set('scale', 11);
//   });

//   assert.equal(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), 'Vertical offset is still at maximum after scaling');
// });

// ---------------------------------------------------
// Zooming in from fully-visible with fresh view
//

// test("Zooming from fully-visible to clipped with different alignments", function() {

//   // TOP & LEFT
//   var scrollView = pane.view('scrollView with content view of fixed height');

//   run(function() {
//     scrollView.set('scale', 0.1);
//   });
//   run(function() {
//     scrollView.set('scale', 1);
//   });
//   assert.equal(scrollView.get('horizontalScrollOffset'), 0, "Scaling a fresh left-aligned view in from fully-visible aligns it to the left");
//   assert.equal(scrollView.get('verticalScrollOffset'), 0, "Scaling a fresh top-aligned view in from fully-visible aligns it to the top");

//   // CENTER
//   scrollView = pane.view('scrollView with content view of fixed height center-center-aligned');

//   run(function() {
//     scrollView.set('scale', 0.1);
//   });
//   run(function() {
//     scrollView.set('scale', 1);
//   });
//   assert.equal(scrollView.get('horizontalScrollOffset'), (scrollView.get('maximumHorizontalScrollOffset')) / 2, "Scaling a fresh horizontally-center-aligned view in from fully-visible aligns it to the center");
//   assert.equal(scrollView.get('verticalScrollOffset'), (scrollView.get('maximumVerticalScrollOffset')) / 2, "Scaling a fresh vertically-middle-aligned view in from fully-visible aligns it to the center");

//   // BOTTOM & RIGHT
//   scrollView = pane.view('scrollView with content view of fixed height bottom-right-aligned');

//   run(function() {
//     scrollView.set('scale', 0.1);
//   });
//   run(function() {
//     scrollView.set('scale', 1);
//   });
//   assert.equal(scrollView.get('horizontalScrollOffset'), scrollView.get('maximumHorizontalScrollOffset'), "Scaling a fresh right-aligned view in from fully-visible aligns it to the right");
//   assert.equal(scrollView.get('verticalScrollOffset'), scrollView.get('maximumVerticalScrollOffset'), "Scaling a fresh bottom-aligned view in from fully-visible aligns it to the bottom");
// });

test("Initial alignments different than alignments", function (assert) {
  // This view is aligned top-left but with initial position at bottom-right. It should start at maximum offsets; when
  // scaled out it should instead pin to the minimum offsets.
  var view = pane.view('scrollView with content view of fixed height and bottom-right initial alignment');
  assert.equal(view.get('horizontalScrollOffset'), view.get('maximumHorizontalScrollOffset'), "initialHorizontalAlign correctly informs initial position when not scaled out");
  assert.equal(view.get('verticalScrollOffset'), view.get('maximumVerticalScrollOffset'), "initialVerticalAlign correctly informs initial position when not scaled out");

  run(function() {
    view.set('scale', 0.1);
  });

  assert.equal(view.get('horizontalScrollOffset'), 0, "horizontalAlign correctly takes over from initialHorizontalAlign when scaled out");
  assert.equal(view.get('verticalScrollOffset'), 0, "verticalAlign correctly takes over from initialVerticalAlign when scaled out");

});
