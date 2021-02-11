// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View Animation Unit Tests
// ========================================================================
/*global module, test, ok, equals, stop, start, expect*/
import { SC } from '../../../core/core.js';
import { View, Pane, LayoutState } from '../../../view/view.js';
import { platform } from '../../../responder/responder.js';
import { browser}  from '../../../event/event.js';

/* These unit tests verify:  animate(). */
var view, pane, originalSupportsTransitions = platform.supportsCSSTransitions;

function styleFor(view) {
  return view.get('layer').style;
}

function transitionFor(view) {
  return styleFor(view)[browser.experimentalStyleNameFor('transition')];
}

var commonSetup = function (wantsAcceleratedLayer) {
  return {
    beforeEach: function () {

      SC.run(function () {
        pane = Pane.create({
          backgroundColor: '#ccc',
          layout: { top: 0, right: 0, width: 200, height: 200, zIndex: 100 }
        });
        pane.append();

        view = View.create({
          backgroundColor: '#888',
          layout: { left: 0, top: 0, height: 100, width: 100 },
          wantsAcceleratedLayer: wantsAcceleratedLayer || false
        });
        pane.appendChild(view);
      });
    },

    afterEach: function () {
      SC.run(function () {
        pane.destroy();
      });
      pane = view = null;
    }
  };
}



if (platform.supportsCSSTransitions) {

  module("ANIMATION", commonSetup());

  test("should work", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'left 1s ease 0s', 'add transition');
      assert.equal(100, view.get('layout').left, 'left is 100');

      // start();
      cb();
    }, 5);
  });

  test("animate + adjust: no conflict", function (assert) {
    // stop(4000);
    const cb = assert.async()

    SC.run(function () {
      view.animate('left', 100, { duration: 0.1 });
      view.adjust('top', 100);
      view.adjust({ 'width': null, 'right': 100 });
    });

    setTimeout(function () {
      assert.equal(view.get('layout').left, 100, 'left is');
      assert.equal(view.get('layout').top, 100, 'top is');
      assert.equal(view.get('layout').right, 100, 'right is');
      assert.equal(view.get('layout').width, undefined, 'width is');

      SC.run(function () {
        view.animate('top', 200, { duration: 0.1 });
        view.adjust('left', 0);
        view.adjust({ 'width': 100, 'right': null });
      });

      setTimeout(function () {
        assert.equal(view.get('layout').left, 0, 'left is');
        assert.equal(view.get('layout').top, 200, 'top is');
        assert.equal(view.get('layout').right, undefined, 'right is');
        assert.equal(view.get('layout').width, 100, 'width is');

        // start();
        cb();
      }, 200);
    }, 200);
  });

  test("animate + adjust: conflict", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.run(function () {
      view.animate('left', 100, { duration: 0.1 });
      view.adjust('left', 200);
    });

    setTimeout(function () {
      assert.equal(view.get('layout').left, 200, 'left is');

      SC.run(function () {
        view.animate('top', 200, { duration: 0.1 });
        // Adjust back to current value should still cancel the animation.
        view.adjust('top', 0);
      });

      setTimeout(function () {
        assert.equal(view.get('layout').top, 0, 'top is');

        // start();
        cb();
      }, 200);
    }, 200);
  });

  test("callbacks work in general", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.run(function () {
      view.animate('left', 100, { duration: 0.5 }, function () {
        assert.ok(true, "Callback was called.");
        assert.equal(view, this, "`this` should be the view");

        // start();
        cb();
      });
    });
  });

  test("callbacks work in general with target method", function (assert) {
    // stop(4000);
    const cb = assert.async();

    var ob = SC.Object.create({
      callback: function () {
        assert.ok(true, "Callback was called.");
        assert.equal(ob, this, "`this` should be the target object");

        // start();
        cb();
      }
    });

    SC.run(function () {
      view.animate('left', 100, { duration: 0.5 }, ob, 'callback');
    });
  });

  test("callbacks should have appropriate data", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 0.5 }, function (data) {
      // TODO: Test this better
      assert.ok(data.event, "has event");
      assert.equal(data.view, view, "view is correct");
      assert.equal(data.isCancelled, false, "animation is not cancelled");

      // start();
      cb();
    });
    SC.RunLoop.end();
  });

  test("handles delay function string", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1, delay: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'left 1s ease 1s', 'uses delay');

      // start();
      cb();
    }, 5);
  });

  test("handles timing function string", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1, timing: 'ease-in' });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'left 1s ease-in 0s', 'uses ease-in timing');

      // start();
      cb();
    }, 5);
  });

  test("handles timing function array", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.RunLoop.begin();
    view.animate('left', 100, { duration: 1, timing: [0.1, 0.2, 0.3, 0.4] });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'left 1s cubic-bezier(0.1, 0.2, 0.3, 0.4) 0s', 'uses cubic-bezier timing');

      // start();
      cb();
    }, 5);
  });

  test("should allow multiple keys to be set at once", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.RunLoop.begin();
    view.animate({ top: 100, left: 100 }, { duration: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'top 1s ease 0s, left 1s ease 0s', 'should add transition');
      assert.equal(100, view.get('layout').top, 'top is 100');
      assert.equal(100, view.get('layout').left, 'left is 100');

      // start();
      cb();
    }, 5);
  });

  test("should not animate any keys that don't change", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.RunLoop.begin();
    view.animate({ top: 0, left: 100 }, { duration: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'left 1s ease 0s', 'should only add left transition');
      assert.equal(0, view.get('layout').top, 'top is 0');
      assert.equal(100, view.get('layout').left, 'left is 100');

      // start();
      cb();
    }, 5);
  });

  test("animating height with a centerY layout should also animate margin-top", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.RunLoop.begin();
    view.adjust({ top: null, centerY: 0 });
    view.animate({ height: 10 }, { duration: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'height 1s ease 0s, margin-top 1s ease 0s', 'should add height and margin-top transitions');
      assert.equal(view.get('layout').height, 10, 'height');
      assert.equal(view.get('layout').centerY, 0, 'centerY');

      // start();
      cb();
    }, 5);
  });

  test("animating width with a centerX layout should also animate margin-left", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.RunLoop.begin();
    view.adjust({ left: null, centerX: 0 });
    view.animate({ width: 10 }, { duration: 1 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(transitionFor(view), 'width 1s ease 0s, margin-left 1s ease 0s', 'should add width and margin-left transitions');
      assert.equal(view.get('layout').width, 10, 'width');
      assert.equal(view.get('layout').centerX, 0, 'centerX');

      // start();
      cb();
    }, 5);
  });

  // Pretty sure this does the job
  test("callbacks should be called only once for a grouped animation", function (assert) {
    // stop(4000);
    var stopped = true;
    const cb = assert.async();
    assert.expect(1);

    SC.run(function () {
      view.animate({ top: 100, left: 100, width: 400 }, { duration: 0.5 }, function () {
        assert.ok(stopped, 'callback called back');
        if (stopped) {
          stopped = false;
          // Continue on in a short moment.  Before the test times out, but after
          // enough time for a second callback to possibly come in.
          setTimeout(function () {
            // start();
            cb();
          }, 200);
        }
      });
    });
  });

  // This behavior should be up for debate.  Does the callback call immediately, or does it wait until the end of
  // the specified animation period?  Currently we're calling it immediately.
  test("callback should be called immediately when a property is animated to its current value.", function (assert) {
    // stop(4000);
    const cb = assert.async();
    assert.expect(1);

    SC.run(function () {
      view.animate('top', view.getPath('layout.top'), { duration: 0.5 }, function () {
        assert.ok(true, 'callback called back');

        // start();
        cb();
      });
    });
  });

  // This behavior should be up for debate.  Does the callback call immediately, or does it wait until the end of
  // the specified animation period?  Currently we're calling it immediately.
  test("callback should be called immediately when a property is animated to its current value (even if the value is implied).", function (assert) {
    // stop(4000);
    const cb = assert.async();
    assert.expect(1);

    var implicitView = View.create({
        backgroundColor: '#ABC',
        layout: { left: 0 } // implicit layout: { top: 0, right: 0, bottom: 0 }
      });
    pane.appendChild(implicitView);

    SC.run(function () {
      implicitView.animate('top', 0, { duration: 0.5 }, function () {
        assert.ok(true, 'callback called back');

        // start();
        cb();
      });
    });
  });

  test("callback should be called when a property is animated with a duration of zero.", function (assert) {
    // stop(4000);
    const cb = assert.async();
    assert.expect(1);

    SC.RunLoop.begin();
    view.animate('top', 20, { duration: 0 }, function () {
      assert.ok(true, 'callback called back');
      // start();
      cb();
    });
    SC.RunLoop.end();
  });

  test("multiple animations should be able to run simultaneously", function (assert) {
    // stop(4000);
    const cb = assert.async();
    assert.expect(2);

    SC.run(function () {
      view.animate('top', 100, { duration: 0.25 }, function () {
        assert.ok(true, 'top finished');
      });

      view.animate('left', 100, { duration: 0.5 }, function () {
        assert.ok(true, 'left finished');
        // start();
        cb();
      });
    });
  });

  test("altering existing animation should call callback as cancelled", function (assert) {
    // stop(4000);
    const cb = assert.async();

    var order = 0;
    assert.expect(6);

    SC.run(function () {
      view.animate('top', 100, { duration: 0.5 }, function (data) {
        // Test the order to ensure that this is the proper callback that is used.
        assert.equal(order, 0, 'should be called first');
        order = 1;
        assert.equal(data.isCancelled, true, 'first cancelled');
      });

      // Test calling animate twice in the same run loop.
      view.animate('top', 100, { duration: 0.75 }, function (data) {
        // Test the order to ensure that this is the proper callback that is used.
        assert.equal(order, 1, 'should be called second');
        order = 2;
        assert.equal(data.isCancelled, true, 'second cancelled');
      });
    });

    setTimeout(function () {
      SC.run(function () {
        view.animate('top', 0, { duration: 0.75 }, function (data) {
          // Test the order to ensure that this is the proper callback that is used.
          assert.equal(order, 2, 'should be called third');
          assert.equal(data.isCancelled, false, 'third not cancelled');
          // start();
          cb();
        });
      });
    }, 100);
  });

  test("should not cancel callback when value hasn't changed", function (assert) {
    var callbacks = 0, wasCancelled = false, check = 0;
    // stop(4000);
    const cb = assert.async();
    SC.run(function () {
      // this triggers the initial layoutStyle code
      view.animate('left', 79, { duration: 0.5 }, function (data) {
        callbacks++;
        wasCancelled = data.isCancelled;
      });

      // this triggers a re-render, re-running the layoutStyle code
      view.displayDidChange();
    });

    setTimeout(function () {
      // capture the callbacks value
      check = callbacks;
    }, 250);

    setTimeout(function () {
      assert.equal(check, 0, "the callback should not have been cancelled initially");
      assert.equal(callbacks, 1, "the callback should have been fired");
      assert.equal(wasCancelled, false, "the callback should not have been cancelled");

      // start();
      cb();
    }, 1000);
  });

  // There was a bug in animation that once one property was animated, a null
  // version of it existed in _activeAnimations, such that when another property
  // was animated it would throw an exception iterating through _activeAnimations
  // and not expecting a null value.
  test("animating different attributes at different times should not throw an error", function (assert) {
    // Run test.
    // stop(4000);
    const cb = assert.async();

    // assert.expect(0);

    // Override and wrap the problematic method to capture the error.
    view.transitionDidEnd = function () {
      try {
        View.prototype.transitionDidEnd.apply(this, arguments);
        assert.ok(true);
      } catch (ex) {
        assert.ok(false);
      }
    };

    SC.RunLoop.begin();
    view.animate('left', 75, { duration: 0.2 });
    SC.RunLoop.end();

    setTimeout(function () {
      SC.RunLoop.begin();
      view.animate('top', 50, { duration: 0.2 });
      SC.RunLoop.end();
    }, 400);

    setTimeout(function () {
      // start();
      cb();
    }, 1000);
  });

  test("should handle transform attributes", function (assert) {
    // stop(4000);
    const cb = assert.async();

    SC.run(function () {
      view.animate('rotateX', 45, { duration: 1 });
    });

    setTimeout(function () {
      assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 1s ease 0s', 'add transition');
      assert.equal(styleFor(view)[browser.experimentalStyleNameFor('transform')], 'rotateX(45deg)', 'has both transforms');
      assert.equal(45, view.get('layout').rotateX, 'rotateX is 45deg');

      // start();
      cb();
    }, 50);
  });

  test("should handle conflicting transform animations", function (assert) {
    /*global console*/
    // stop(4000);
    const cb = assert.async();

    var originalConsoleWarn = console.warn;
    console.warn = function (warning) {
      assert.equal(warning, "Developer Warning: Can't animate transforms with different durations, timings or delays! Using the first options specified.", "proper warning");
    };

    SC.run(function () {
      view.animate('rotateX', 45, { duration: 1 }).animate('scale', 2, { duration: 2 });
    });

    setTimeout(function () {
      assert.expect(5);

      assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 1s ease 0s', 'use duration of first');
      assert.equal(styleFor(view)[browser.experimentalStyleNameFor('transform')], 'rotateX(45deg) scale(2)');
      assert.equal(45, view.get('layout').rotateX, 'rotateX is 45deg');
      assert.equal(2, view.get('layout').scale, 'scale is 2');

      console.warn = originalConsoleWarn;

      // start();
      cb();
    }, 25);
  });

  test("removes animation property when done", function (assert) {
    // stop(4000);
    const cb = assert.async();
    SC.RunLoop.begin();
    view.animate({ top: 100, scale: 2 }, { duration: 0.5 });
    SC.RunLoop.end();

    setTimeout(function () {
      assert.equal(view.get('layout').animateTop, undefined, "animateTop is undefined");
      assert.equal(view.get('layout').animateScale, undefined, "animateScale is undefined");

      // start();
      cb();
    }, 1000);
  });

  test("Test that cancelAnimation() removes the animation style and fires the callback with isCancelled set.", function (assert) {
    // stop(4000);
    const cb = assert.async();

    assert.expect(7);

    SC.run(function () {
      view.animate({ left: 100 }, { duration: 0.5 }, function (data) {
        assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
      });
    });

    setTimeout(function () {
      SC.run(function () {
        var style = styleFor(view);

        assert.equal(style.left, '100px', 'Tests the left style after animate');
        assert.equal(style.top, '0px', 'Tests the top style after animate');
        assert.equal(transitionFor(view), 'left 0.5s ease 0s', 'Tests the CSS transition property');
        view.cancelAnimation();
      });
    }, 5);

    setTimeout(function () {
      var style = styleFor(view);

      assert.equal(style.left, '100px', 'Tests the left style after cancel');
      assert.equal(style.top, '0px', 'Tests the top style after cancel');
      assert.equal(transitionFor(view), '', 'Tests the CSS transition property');
      // start();
      cb();
    }, 50);
  });

  test("Test that cancelAnimation(LayoutState.CURRENT) removes the animation style, stops at the current position and fires the callback with isCancelled set.", function (assert) {
    // stop(4000);
    const cb = assert.async();
    assert.expect(9);

    SC.run(function () {
      view.animate({ left: 100, top: 100, width: 400 }, { duration: 0.5 }, function (data) {
        assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
      });
    });

    setTimeout(function () {
      SC.run(function () {
        var style = styleFor(view);

        assert.equal(style.left, '100px', 'Tests the left style after animate');
        assert.equal(style.top, '100px', 'Tests the top style after animate');
        assert.equal(style.width, '400px', 'Tests the width style after animate');
        assert.equal(transitionFor(view), 'left 0.5s ease 0s, top 0.5s ease 0s, width 0.5s ease 0s', 'Tests the CSS transition property');
        view.cancelAnimation(LayoutState.CURRENT);
      });
    }, 100);

    setTimeout(function () {
      var style = styleFor(view);

      assert.ok((parseInt(style.left, 10) > 0) && (parseInt(style.left, 10) < 100), 'Tests the left style after cancel');
      assert.ok((parseInt(style.top, 10) > 0) && (parseInt(style.top, 10) < 100), 'Tests the top style after cancel');
      assert.ok((parseInt(style.width, 10) > 100) && (parseInt(style.width, 10) < 400), 'Tests the width style after cancel');
      assert.equal(transitionFor(view), '', 'Tests the CSS transition property');
      // start();
      cb();
    }, 200);
  });

  test("Test that cancelAnimation(LayoutState.START) removes the animation style, returns to the start position and fires the callback with isCancelled set.", function (assert) {
    // stop(4000);
    const cb = assert.async();

    assert.expect(9);

    SC.run(function () {
      view.animate({ left: 100, top: 100, width: 400 }, { duration: 0.5 }, function (data) {
        assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
      });
    });

    setTimeout(function () {
      SC.run(function () {
        var style = styleFor(view);

        assert.equal(style.left, '100px', 'Tests the left style after animate');
        assert.equal(style.top, '100px', 'Tests the top style after animate');
        assert.equal(style.width, '400px', 'Tests the width style after animate');
        assert.equal(transitionFor(view), 'left 0.5s ease 0s, top 0.5s ease 0s, width 0.5s ease 0s', 'Tests the CSS transition property');
        view.cancelAnimation(LayoutState.START);
      });
    }, 100);

    setTimeout(function () {
      var style = styleFor(view);

      assert.equal(style.left, '0px', 'Tests the left style after cancel');
      assert.equal(style.top, '0px', 'Tests the top style after cancel');
      assert.equal(style.width, '100px', 'Tests the width style after animate');
      assert.equal(transitionFor(view), '', 'Tests the CSS transition property');
      // start();
      cb();
    }, 200);
  });

  if (platform.supportsCSS3DTransforms) {
    module("ANIMATION WITH ACCELERATED LAYER", commonSetup(true));

    test("handles acceleration when appropriate", function (assert) {
      // stop(4000);
      const cb = assert.async();
      SC.RunLoop.begin();
      view.animate('top', 100, { duration: 1 });
      SC.RunLoop.end();

      setTimeout(function () {
        assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 1s ease 0s', 'transition is on transform');

        // start();
        cb();
      }, 5);
    });

    test("doesn't use acceleration when not appropriate", function (assert) {
      // stop(4000);
      const cb = assert.async();

      SC.RunLoop.begin();
      view.adjust({ height: null, bottom: 0 });
      view.animate('top', 100, { duration: 1 });
      SC.RunLoop.end();

      setTimeout(function () {
        assert.equal(transitionFor(view), 'top 1s ease 0s', 'transition is not on transform');

        // start();
        cb();
      }, 5);
    });

    test("combines accelerated layer animation with compatible transform animations", function (assert) {
      // stop(4000);
      const cb = assert.async();

      SC.RunLoop.begin();
      view.animate('top', 100, { duration: 1 }).animate('rotateX', 45, { duration: 1 });
      SC.RunLoop.end();

      setTimeout(function () {
        var transform = styleFor(view)[browser.experimentalStyleNameFor('transform')];

        // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
        assert.ok(transform.match(/translateX\(0px\) translateY\(100px\)/), 'has translate');
        assert.ok(transform.match(/rotateX\(45deg\)/), 'has rotateX');

        // start();
        cb();
      }, 5);
    });

    test("should not use accelerated layer if other transforms are being animated at different speeds", function (assert) {
      // stop(4000);
      const cb = assert.async();
      SC.RunLoop.begin();
      view.animate('rotateX', 45, { duration: 2 }).animate('top', 100, { duration: 1 });
      SC.RunLoop.end();

      setTimeout(function () {
        var style = styleFor(view);

        assert.equal(style[browser.experimentalStyleNameFor('transform')], 'rotateX(45deg)', 'transform should only have rotateX');
        assert.equal(style.top, '100px', 'should not accelerate top');

        // start();
        cb();
      }, 5);
    });

    test("callbacks should work properly with acceleration", function (assert) {
      // stop(4000);
      const cb = assert.async();
      SC.run(function () {
        view.animate({ top: 100, left: 100, scale: 2 }, { duration: 0.25 }, function () {
          assert.ok(true);

          // start();
          cb();
        });
      });
    });

    test("should not add animation for properties that have the same value as existing layout", function (assert) {
      var callbacks = 0;

      SC.RunLoop.begin();
      // we set width to the same value, but we change height
      view.animate({width: 100, height: 50}, { duration: 0.5 }, function () { callbacks++; });
      SC.RunLoop.end();

      assert.ok(callbacks === 0, "precond - callback should not have been run yet");

      // stop(4000);
      const cb = assert.async();

      // we need to test changing the width at a later time
      setTimeout(function () {
        // start();
        

        assert.equal(callbacks, 1, "callback should have been run once, for height change");

        SC.RunLoop.begin();
        view.animate('width', 50, { duration: 0.5 });
        SC.RunLoop.end();

        assert.equal(callbacks, 1, "callback should still have only been called once, even though width has now been animated");
        cb();
      }, 1000);
    });

    test("Test that cancelAnimation() removes the animation style and fires the callback with isCancelled set.", function (assert) {
      // stop(4000);
      const cb = assert.async();
      SC.run(function () {
        view.animate({ left: 100, top: 100, width: 400 }, { duration: 0.5 }, function (data) {
          assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
        });
      });

      setTimeout(function () {
        SC.run(function () {
          var style = styleFor(view),
          transform = style[browser.experimentalStyleNameFor('transform')];
          transform = transform.match(/\d+/g);

          // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
          assert.equal(transform[0], '100',  "Test translateX after animate.");
          assert.equal(transform[1], '100',  "Test translateY after animate.");

          assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 0.5s ease 0s, width 0.5s ease 0s', 'Tests the CSS transition property');

          assert.equal(style.left, '0px', 'Tests the left style after animate');
          assert.equal(style.top, '0px', 'Tests the top style after animate');
          assert.equal(style.width, '400px', 'Tests the width style after animate');

          view.cancelAnimation();
        });
      }, 250);

      setTimeout(function () {
        var style = styleFor(view);
        assert.equal(style.width, '400px', 'Tests the width style after cancel');

        var transform = style[browser.experimentalStyleNameFor('transform')];
        transform = transform.match(/\d+/g);

        assert.equal(transform[0], '100',  "Test translateX after cancel.");
        assert.equal(transform[1], '100',  "Test translateY after cancel.");

        assert.equal(transitionFor(view), '', 'Tests that there is no CSS transition property after cancel');

        // start();
        cb();
      }, 350);
    });

    test("Test that cancelAnimation(LayoutState.CURRENT) removes the animation style, stops at the current position and fires the callback with isCancelled set.", function (assert) {
      // stop(4000);
      const cb = assert.async();


      SC.run(function () {
        view.animate({ left: 200, top: 200, width: 400 }, { duration: 1 }, function (data) {
          assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
        });
      });

      setTimeout(function () {
        SC.run(function () {
          var style = styleFor(view),
          transform = style[browser.experimentalStyleNameFor('transform')];
          transform = transform.match(/\d+/g);

          // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
          assert.equal(transform[0], '200',  "Test translateX after animate.");
          assert.equal(transform[1], '200',  "Test translateY after animate.");
          assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 1s ease 0s, width 1s ease 0s', 'Tests the CSS transition property');

          assert.equal(style.left, '0px', 'Tests the left style after animate');
          assert.equal(style.top, '0px', 'Tests the top style after animate');
          assert.equal(style.width, '400px', 'Tests the width style after animate');

          view.cancelAnimation(LayoutState.CURRENT);
        });
      }, 250);

      setTimeout(function () {
        var style = styleFor(view),
          layout = view.get('layout');

        assert.equal(transitionFor(view), '', 'Tests that there is no CSS transition property after cancel');

        // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
        assert.ok((layout.left > 0) && (layout.left < 200), 'Tests the left style, %@, after cancel is greater than 0 and less than 200'.fmt(style.left));
        assert.ok((layout.top > 0) && (layout.top < 200), 'Tests the top style, %@, after cancel is greater than 0 and less than 200'.fmt(style.top));
        assert.ok((parseInt(style.width, 10) > 100) && (parseInt(style.width, 10) < 400), 'Tests the width style, %@, after cancel is greater than 100 and less than 400'.fmt(style.width));
        // start();
        cb();
      }, 750);
    });

    test("Test that cancelAnimation(LayoutState.START) removes the animation style, goes back to the start position and fires the callback with isCancelled set.", function (assert) {
      // stop(4000);
      const cb = assert.async();
      // expect(12);
      assert.timeout(4000);
      SC.run(function () {
        view.animate({ left: 100, top: 100, width: 400 }, { duration: 0.5 }, function (data) {
          assert.ok(data.isCancelled, "The isCancelled property of the data should be true.");
        });
      });

      setTimeout(function () {
        SC.run(function () {
          var style = styleFor(view),
          transform = style[browser.experimentalStyleNameFor('transform')];
          assert.equal(style.left, '0px', 'Tests the left style after animate');
          assert.equal(style.top, '0px', 'Tests the top style after animate');
          assert.equal(style.width, '400px', 'Tests the width style after animate');

          transform = transform.match(/\d+/g);

          // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
          assert.equal(transform[0], '100',  "Test translateX after animate.");
          assert.equal(transform[1], '100',  "Test translateY after animate.");

          assert.equal(transitionFor(view), browser.experimentalCSSNameFor('transform') + ' 0.5s ease 0s, width 0.5s ease 0s', 'Tests the CSS transition property');
          view.cancelAnimation(LayoutState.START);
        });
      }, 250);

      setTimeout(function () {
        var style = styleFor(view);

        var transform = style[browser.experimentalStyleNameFor('transform')];
        transform = transform.match(/\d+/g);

        assert.equal(transitionFor(view), '', 'Tests that there is no CSS transition property after cancel');

        // We need to check these separately because in some cases we'll also have translateZ, this way we don't have to worry about it
        assert.equal(transform[0], '0',  "Test translateX after cancel.");
        assert.equal(transform[1], '0',  "Test translateY after cancel.");
        assert.equal(style.width, '100px', 'Tests the width style after cancel');
        // start();
        cb();
      }, 350);
    });
  } 
  else {
    // test("This platform appears to not support CSS 3D transforms.");
    console.log("This platform appears to not support CSS 3D transforms.");
  }
} 
else {
  // test("This platform appears to not support CSS transitions.");
  console.log("This platform appears to not support CSS transitions.");
}


/// PASSING


module("ANIMATION WITHOUT TRANSITIONS", {
  beforeEach: function () {
    commonSetup().beforeEach();
    platform.supportsCSSTransitions = false;
  },

  afterEach: function () {
    commonSetup().afterEach();
    platform.supportsCSSTransitions = originalSupportsTransitions;
  }
});

test("should update layout", function (assert) {
  // stop(4000);
  const cb = assert.async();
  SC.RunLoop.begin();
  view.animate('left', 100, { duration: 1 });
  SC.RunLoop.end();

  setTimeout(function () {
    assert.equal(view.get('layout').left, 100, 'left is 100');
    // start();
    cb();
  }, 5);
});

test("should still run callback", function (assert) {
  // stop(4000);
  const cb = assert.async();
  assert.expect(1);

  SC.RunLoop.begin();
  view.animate({ top: 200, left: 100 }, { duration: 1 }, function () {
    assert.ok(true, "callback called");
    // start();
    cb();
  });
  SC.RunLoop.end();
});


module("Animating in the next run loop", commonSetup());

test("Calling animate while flushing the invokeNext queue should not throw an exception", function (assert) {
  try {
    SC.run(function () {
      view.invokeNext(function () {
        this.animate({ top: 250 }, { duration: 1 });
      });

      view.animate({ top: 200 }, { duration: 1 });
    });

    SC.run(function () {
      // The first call to _animate and the function with animate in it run.
    });

    SC.run(function () {
      // The second call to _animate from the function with animate in it.
    });
  } catch (ex) {
    assert.ok(false, "failure");
  }

  assert.ok(true, "success");
});
