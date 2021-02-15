// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, ok, equals*/

import { SC } from '../../../core/core.js';
import { View, ContainerView, Pane } from '../../../view/view.js';

var containerView,
  pane,
  view1, view2;

module("ContainerView Transitions", {
  beforeEach: function () {
    SC.run(function () {
      view1 = View.create({
        toString: function () { return 'View 1'; }
      });

      view2 = View.create({
        toString: function () { return 'View 2'; }
      });

      containerView = ContainerView.create({
        nowShowing: view1
      });

      pane = Pane.create({
        layout: { width: 200, height: 200, left: 0, top: 0 },
        childViews: [containerView]
      }).append();
    });
  },

  afterEach: function () {
    pane.remove();
    containerView = pane = view1 = view2 = null;
  }
});


test("Test assumptions on the initial state of the container and views.", function (assert) {
  assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");
  assert.ok(containerView.get('childViews').contains(view1), "View 1 should be a child view of container.");
  assert.ok(!containerView.get('childViews').contains(view2), "View 2 should not be a child view of container.");
});


test("Test that the default transition (null) simply swaps the views.", function (assert) {
  containerView.set('nowShowing', view2);

  assert.equal(containerView.get('contentView'), view2, "Container's contentView should be");
  assert.ok(!containerView.get('childViews').contains(view1), "View 1 should no longer be a child view of container.");
});

test("Test that the isTransitioning property of container view updates accordingly.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.PUSH);
    containerView.set('nowShowing', view2);
  });

  assert.ok(containerView.get('isTransitioning'), "Container view should indicate that it is transitioning.");

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1000);
});

test("Test changing nowShowing while the container is already transitioning with pre-initialized views: DISSOLVE.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.DISSOLVE);
    containerView.set('nowShowing', view2);
  });

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view1);
    });
  }, 100);

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view2);
    });
  }, 150);

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1500);
});

test("Test changing nowShowing while the container is already transitioning with pre-initialized views: MOVE_IN.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.MOVE_IN);
    containerView.set('nowShowing', view2);
  });

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view1);
    });
  }, 100);

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view2);
    });
  }, 150);

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1500);
});


test("Test changing nowShowing while the container is already transitioning with pre-initialized views: REVEAL.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.REVEAL);
    containerView.set('nowShowing', view2);
  });

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view1);
    });
  }, 100);

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view2);
    });
  }, 150);

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1500);
});

test("Test changing nowShowing while the container is already transitioning with pre-initialized views: PUSH.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();
  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.PUSH);
    containerView.set('nowShowing', view2);
  });

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view1);
    });
  }, 100);

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view2);
    });
  }, 150);

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1500);
});

test("Test changing nowShowing while the container is already transitioning with pre-initialized views: FADE_COLOR.", function (assert) {
  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  SC.run(function () {
    containerView.set('transitionSwap', ContainerView.FADE_COLOR);
    containerView.set('nowShowing', view2);
  });

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view1);
    });
  }, 100);

  setTimeout(function () {
    SC.run(function () {
      containerView.set('nowShowing', view2);
    });
  }, 150);

  setTimeout(function () {
    assert.ok(!containerView.get('isTransitioning'), "Container view should not indicate that it is transitioning.");

    // window.start();
    cb();
  }, 1500);
});

test("Test that the container view calls the proper transition plugin methods.", function (assert) {
  var willBuildInToViewCalled = 0,
    buildInToViewCalled = 0,
    buildInDidCancelCalled = 0,
    didBuildInToViewCalled = 0,
    willBuildOutFromViewCalled = 0,
    buildOutFromViewCalled = 0,
    buildOutDidCancelCalled = 0,
    didBuildOutFromViewCalled = 0,
    plugin;

  // Pause the test execution.
  // window.stop(2000);
  const cb = assert.async();

  plugin = {
    willBuildInToView: function () { willBuildInToViewCalled++; },
    buildInToView: function (statechart) {
      buildInToViewCalled++;

      setTimeout(function () {
        statechart.entered();
      }, 200);
    },
    buildInDidCancel: function () { buildInDidCancelCalled++; },
    didBuildInToView: function () { didBuildInToViewCalled++; },
    willBuildOutFromView: function () { willBuildOutFromViewCalled++; },
    buildOutFromView: function (statechart) {
      buildOutFromViewCalled++;

      setTimeout(function () {
        statechart.exited();
      }, 200);
    },
    buildOutDidCancel: function () { buildOutDidCancelCalled++; },
    didBuildOutFromView: function () { didBuildOutFromViewCalled++; }
  };

  containerView.set('transitionSwap', plugin);
  containerView.set('nowShowing', view2);
  assert.equal(willBuildInToViewCalled, 1, "willBuildInToViewCalled() should have been called this many times");
  assert.equal(willBuildOutFromViewCalled, 1, "willBuildOutFromViewCalled() should have been called this many times");
  assert.equal(buildInToViewCalled, 1, "buildInToViewCalled() should have been called this many times");
  assert.equal(buildOutFromViewCalled, 1, "buildOutFromViewCalled() should have been called this many times");
  assert.equal(buildInDidCancelCalled, 0, "buildInDidCancelCalled() should have been called this many times");
  assert.equal(buildOutDidCancelCalled, 0, "buildOutDidCancelCalled() should have been called this many times");
  assert.equal(didBuildInToViewCalled, 0, "didBuildInToViewCalled() should have been called this many times");
  assert.equal(didBuildOutFromViewCalled, 0, "didBuildOutFromViewCalled() should have been called this many times");

  SC.run(function () {
    setTimeout(function () {
      assert.equal(buildInDidCancelCalled, 0, "buildInDidCancelCalled() should have been called this many times");
      assert.equal(buildOutDidCancelCalled, 0, "buildOutDidCancelCalled() should have been called this many times");
      assert.equal(didBuildInToViewCalled, 0, "didBuildInToViewCalled() should have been called this many times");
      assert.equal(didBuildOutFromViewCalled, 0, "didBuildOutFromViewCalled() should have been called this many times");
    }, 100);
  });

  setTimeout(function () {
    assert.equal(buildInDidCancelCalled, 0, "buildInDidCancelCalled() should have been called this many times");
    assert.equal(buildOutDidCancelCalled, 0, "buildOutDidCancelCalled() should have been called this many times");
    assert.equal(didBuildInToViewCalled, 1, "didBuildInToViewCalled() should have been called this many times");
    assert.equal(didBuildOutFromViewCalled, 1, "didBuildOutFromViewCalled() should have been called this many times");

    // window.start();
    cb();
  }, 300);
});
