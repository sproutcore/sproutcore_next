// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTest, module, test, equals, same*/

import { SC } from '../../../core/core.js';
import { Pane, View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';
import { RootResponder, device, PORTRAIT_ORIENTATION } from '../../../responder/responder.js';

var pane, view1, view2, view3, view4, view5;

SC.setSetting('LOG_DESIGN_MODE', true);

// Localized layout.
SC.metricsFor('English', {
  'Medium.left': 0.25,
  'Medium.right': 0.25,
});

var largeLayout = { top: 0, bottom: 0, centerX: 0, width: 100 },
  mediumLayout = { top: 0, bottom: 0, left: 0.25, right: 0.25 },
  normalLayout = { top: 0, bottom: 0, left: 0, right: 0 },
  smallLayout = { top: 0, bottom: 0, left: 10, right: 10 };

var DesignModeTestView = View.extend({

  modeAdjust: {
    s: { layout: { left: 10, right: 10 } },
    m: { layout: "Medium".locLayout() },
    l: { layout: { left: null, right: null, centerX: 0, width: 100 } }
  },

  init: function init () {
    init.base.apply(this, arguments);

    // Stub the set method.
    this.set = CoreTest.stub('setDesignMode', {
      action: View.prototype.set,
      expect: function (callCount) {
        var i, setDesignModeCount = 0;

        for (i = this.history.length - 1; i >= 0; i--) {
          if (this.history[i][1] === 'designMode') {
            setDesignModeCount++;
          }
        }

        assert.equal(setDesignModeCount, callCount, "set('designMode', ...) should have been called %@ times.".fmt(callCount));
      }
    });
  }
});

module("View/Pane Design Mode Support", {
  beforeEach: function () {

    view4 = DesignModeTestView.create({});

    view3 = DesignModeTestView.create({
      childViews: [view4],

      // Override - no large design layout.
      modeAdjust: {
        s: { layout: { left: 10, right: 10 } },
        m: { layout: "Medium".locLayout() }
      }
    });

    view2 = DesignModeTestView.create({});

    view1 = DesignModeTestView.create({
      childViews: [view2, view3]
    });

    view5 = DesignModeTestView.create({});

    pane = Pane.extend({
      childViews: [view1]
    });
  },

  afterEach: function () {
    if (pane.remove) { pane.remove(); }

    pane = view1 = view2 = view3 = view4 = view5 = null;

    RootResponder.responder.set('designModes', null);
  }

});


test("When RootResponder has no designModes, it doesn't set designMode on its panes or their childViews", function (assert) {
  pane = pane.create();

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  SC.run(function () {
    pane.append();
  });

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  assert.equal(view1.get('designMode'), undefined, "view1 designMode should be");
  assert.equal(view2.get('designMode'), undefined, "view2 designMode should be");
  assert.equal(view3.get('designMode'), undefined, "view3 designMode should be");
  assert.equal(view4.get('designMode'), undefined, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), normalLayout, "view1 layout should be");
  assert.deepEqual(view2.get('layout'), normalLayout, "view2 layout should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "view3 layout should be");
  assert.deepEqual(view4.get('layout'), normalLayout, "view4 layout should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view'], "view1 classNames should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view'], "view2 classNames should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view'], "view3 classNames should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view'], "view4 classNames should be");
});

test("When RootResponder has no designModes, and you add a view to a pane, it doesn't set designMode on the new view.", function (assert) {
  pane = pane.create();

  SC.run(function () {
    pane.append();
    pane.appendChild(view5);
  });

  // adjustDesign() shouldn't be called
  view5.set.expect(0);

  assert.equal(view5.get('designMode'), undefined, "designMode should be");

  assert.deepEqual(view5.get('layout'), normalLayout, "layout should be");

  assert.deepEqual(view5.get('classNames'), ['sc-view'], "classNames should be");
});

test("When RootResponder has designModes, it sets designMode on its panes and their childViews", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  pane = pane.create();

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  SC.run(function () {
    pane.append();
  });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view1.get('designMode'), modeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), largeLayout, "view1 layout should be");
  assert.deepEqual(view2.get('layout'), largeLayout, "view2 layout should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "view3 layout should be");
  assert.deepEqual(view4.get('layout'), largeLayout, "view4 layout should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-large'], "view1 classNames should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-large'], "view2 classNames should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-large'], "view3 classNames should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-large'], "view4 classNames should be");
});

test("When updateDesignMode() is called on a pane, it sets designMode properly on itself and its childViews.", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  SC.run(function () {
    pane = pane.create().append();
  });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view1.get('designMode'), modeName, "Test 1 view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "Test 1 view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "Test 1 view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "Test 1 view4 designMode should be");

  assert.deepEqual(view1.get('layout'), largeLayout,  "Test 1 layout of view1 should be");
  assert.deepEqual(view2.get('layout'), largeLayout,  "Test 1 layout of view2 should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "Test 1 layout of view3 should be");
  assert.deepEqual(view4.get('layout'), largeLayout,  "Test 1 layout of view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-large'], "Test 1 classNames of view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-large'], "Test 1 classNames of view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-large'], "Test 1 classNames of view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-large'], "Test 1 classNames of view4 should be");

  var newModeName = orientation === PORTRAIT_ORIENTATION ? 's_p' : 's_l';

  SC.run(function () {
    pane.updateDesignMode(modeName, newModeName);
  });

  // designMode should be set (crossed threshold)
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  assert.equal(view1.get('designMode'), newModeName, "Test 2 view1 designMode should be");
  assert.equal(view2.get('designMode'), newModeName, "Test 2 view2 designMode should be");
  assert.equal(view3.get('designMode'), newModeName, "Test 2 view3 designMode should be");
  assert.equal(view4.get('designMode'), newModeName, "Test 2 view4 designMode should be");

  assert.deepEqual(view1.get('layout'), smallLayout, "Test 2 layout of view1 should be");
  assert.deepEqual(view2.get('layout'), smallLayout, "Test 2 layout of view2 should be");
  assert.deepEqual(view3.get('layout'), smallLayout, "Test 2 layout of view3 should be");
  assert.deepEqual(view4.get('layout'), smallLayout, "Test 2 layout of view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-small'], "Test 2 classNames of view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-small'], "Test 2 classNames of view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-small'], "Test 2 classNames of view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-small'], "Test 2 classNames of view4 should be");
});

test("When RootResponder has designModes, and you add a view to a pane, it sets designMode on the new view.", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  SC.run(function () {
    pane = pane.create().append();
    pane.appendChild(view5);
  });

  // designMode should be set
  view5.set.expect(1);
  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view5.get('designMode'), modeName, "designMode of view5 should be");

  assert.deepEqual(view5.get('classNames'), ['sc-view', 'sc-large'], "classNames of view5 should be");
});

test("When you set designModes on RootResponder, it sets designMode on its panes and their childViews.", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  SC.run(function () {
    pane = pane.create().append();
  });

  // designMode should not be set
  view1.set.expect(0);
  view2.set.expect(0);
  view3.set.expect(0);
  view4.set.expect(0);

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view1.get('designMode'), modeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), largeLayout, "layout of view1 should be");
  assert.deepEqual(view2.get('layout'), largeLayout, "layout of view2 should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "layout of view3 should be");
  assert.deepEqual(view4.get('layout'), largeLayout, "layout of view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-large'], "classNames of view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-large'], "classNames of view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-large'], "classNames of view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-large'], "classNames of view4 should be");
});

test("When you change designModes on RootResponder, it sets designMode on the pane and its childViews if the design mode has changed.", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  SC.run(function () {
    pane = pane.create().append();
  });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view1.get('designMode'), modeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), largeLayout, "layout for view1 should be");
  assert.deepEqual(view2.get('layout'), largeLayout, "layout for view2 should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "layout for view3 should be");
  assert.deepEqual(view4.get('layout'), largeLayout, "layout for view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-large'], "classNames for view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-large'], "classNames for view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-large'], "classNames for view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-large'], "classNames for view4 should be");

  // Change the small threshold
  responder.set('designModes', { s: ((windowSize.width + 10) * (windowSize.height + 10)) / window.devicePixelRatio, l: Infinity });

  // designMode should be set
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  var newModeName = orientation === PORTRAIT_ORIENTATION ? 's_p' : 's_l';
  assert.equal(view1.get('designMode'), newModeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), newModeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), newModeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), newModeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), smallLayout, "layout for view1 should be");
  assert.deepEqual(view2.get('layout'), smallLayout, "layout for view2 should be");
  assert.deepEqual(view3.get('layout'), smallLayout, "layout for view3 should be");
  assert.deepEqual(view4.get('layout'), smallLayout, "layout for view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-small'], "classNames for view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-small'], "classNames for view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-small'], "classNames for view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-small'], "classNames for view4 should be");

  // Add a medium threshold
  responder.set('designModes', {
    s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio,
    m: ((windowSize.width + 10) * (windowSize.height + 10)) / window.devicePixelRatio,
    l: Infinity
  });

  // designMode should be set
  view1.set.expect(3);
  view2.set.expect(3);
  view3.set.expect(3);
  view4.set.expect(3);

  modeName = orientation === PORTRAIT_ORIENTATION ? 'm_p' : 'm_l';
  assert.equal(view1.get('designMode'), modeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), mediumLayout, "layout for view1 should be");
  assert.deepEqual(view2.get('layout'), mediumLayout, "layout for view2 should be");
  assert.deepEqual(view3.get('layout'), mediumLayout, "layout for view3 should be");
  assert.deepEqual(view4.get('layout'), mediumLayout, "layout for view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-medium'], "classNames for view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-medium'], "classNames for view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-medium'], "classNames for view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-medium'], "classNames for view4 should be");
});

// test("When the design mode changes, overrides are reverted.");
// This is extremely complex to achieve. Left as a warning for now.
//   , function () {
//   var windowSize,
//     responder = RootResponder.responder,
//     orientation = device.orientation;

//   windowSize = responder.get('currentWindowSize');
//   responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

//   SC.run(function () {
//     pane = pane.create().append();
//   });

//   assert.deepEqual(view1.get('layout'), largeLayout,  "Test 1 layout of view1 should be");
//   assert.deepEqual(view2.get('layout'), largeLayout,  "Test 1 layout of view2 should be");

//   SC.run(function () {
//     view1.adjust('top', 10); // Original layout goes from implied top: 0 to top: 10.
//     view2.adjust('height', 100); // Original layout goes from implied bottom: 0 to bottom: undefined.
//   });

//   var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
//   var newModeName = orientation === PORTRAIT_ORIENTATION ? 's_p' : 's_l';

//   SC.run(function () {
//     pane.updateDesignMode(modeName, newModeName);
//   });

//   var adjustedSmallLayout1 = { top: 10, bottom: 0, left: 10, right: 10 },
//       adjustedSmallLayout2 = { top: 0, height: 100, left: 10, right: 10 };

//   assert.deepEqual(view1.get('layout'), adjustedSmallLayout1, "Test 2 layout for view1 should be");
//   assert.deepEqual(view2.get('layout'), adjustedSmallLayout2, "Test 2 layout for view2 should be");
// });

test("When you unset designModes on RootResponder, it clears designMode on its panes and their childViews.", function (assert) {
  var windowSize,
    responder = RootResponder.responder,
    orientation = device.orientation;

  windowSize = responder.get('currentWindowSize');
  responder.set('designModes', { s: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, l: Infinity });

  SC.run(function () {
    pane = pane.create().append();
  });

  // designMode should be set (for initialization)
  view1.set.expect(1);
  view2.set.expect(1);
  view3.set.expect(1);
  view4.set.expect(1);

  var modeName = orientation === PORTRAIT_ORIENTATION ? 'l_p' : 'l_l';
  assert.equal(view1.get('designMode'), modeName, "view1 designMode should be");
  assert.equal(view2.get('designMode'), modeName, "view2 designMode should be");
  assert.equal(view3.get('designMode'), modeName, "view3 designMode should be");
  assert.equal(view4.get('designMode'), modeName, "view4 designMode should be");

  assert.deepEqual(view1.get('layout'), largeLayout, "layout of view1 should be");
  assert.deepEqual(view2.get('layout'), largeLayout, "layout of view2 should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "layout of view3 should be");
  assert.deepEqual(view4.get('layout'), largeLayout, "layout of view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view', 'sc-large'], "classNames of view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view', 'sc-large'], "classNames of view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view', 'sc-large'], "classNames of view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view', 'sc-large'], "classNames of view4 should be");

  // Unset designModes
  responder.set('designModes', null);

  // designMode should be set
  view1.set.expect(2);
  view2.set.expect(2);
  view3.set.expect(2);
  view4.set.expect(2);

  assert.equal(view1.get('designMode'), null, "designMode of view1 should be");
  assert.equal(view2.get('designMode'), null, "designMode of view2 should be");
  assert.equal(view3.get('designMode'), null, "designMode of view3 should be");
  assert.equal(view4.get('designMode'), null, "designMode of view4 should be");

  assert.deepEqual(view1.get('layout'), normalLayout, "layout of view1 should be");
  assert.deepEqual(view2.get('layout'), normalLayout, "layout of view2 should be");
  assert.deepEqual(view3.get('layout'), normalLayout, "layout of view3 should be");
  assert.deepEqual(view4.get('layout'), normalLayout, "layout of view4 should be");

  assert.deepEqual(view1.get('classNames'), ['sc-view'], "classNames of view1 should be");
  assert.deepEqual(view2.get('classNames'), ['sc-view'], "classNames of view2 should be");
  assert.deepEqual(view3.get('classNames'), ['sc-view'], "classNames of view3 should be");
  assert.deepEqual(view4.get('classNames'), ['sc-view'], "classNames of view4 should be");
});
