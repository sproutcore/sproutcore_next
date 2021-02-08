// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, ok, equals */
import { SC } from '../../../core/core.js';
import { View, CoreView, Pane } from '../../../view/view.js';

var originalTabbing;

module("View - Keyboard support with Tabbing Only Inside Document", {
  beforeEach: function () {
    originalTabbing = SC.getSetting('TABBING_ONLY_INSIDE_DOCUMENT');
    SC.setSetting('TABBING_ONLY_INSIDE_DOCUMENT', true);
  },

  afterEach: function () {
    SC.setSetting('TABBING_ONLY_INSIDE_DOCUMENT', originalTabbing);
  }
});

test("Views only attempt to call performKeyEquivalent on child views that support it", function (assert) {
  var performKeyEquivalentCalled = 0;

  var view = View.design({
    childViews: ['unsupported', 'supported'],

    unsupported: CoreView,
    supported: View.design({
      performKeyEquivalent: function (str) {
        performKeyEquivalentCalled++;
        return false;
      }
    })
  });

  view = view.create();
  view.performKeyEquivalent("ctrl_r");

  assert.ok(performKeyEquivalentCalled > 0, "performKeyEquivalent is called on the view that supports it");
  view.destroy();
});

/**
  nextValidKeyView tests
*/

test("nextValidKeyView is receiver if it is the only view that acceptsFirstResponder", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: View,

      view6: View
    })
  });
  pane.append();

  assert.equal(pane.view1.view4.get('nextValidKeyView'), pane.view1.view4, "nextValidKeyView is receiver");

  pane.remove();
  pane.destroy();
});

test("nextValidKeyView is null if no views have acceptsFirstResponder === true", function (assert) {
  var pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: View
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: View,

      view6: View
    })
  });
  pane.append();

  assert.ok(SC.none(pane.view1.view4.get('nextValidKeyView')), "nextValidKeyView is null");

  pane.remove();
  pane.destroy();
});

test("firstKeyView and nextKeyView of parents are respected", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2', 'view7'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    }),

    view7: View.extend({
      childViews: ['view8', 'view9'],

      view8: testView,

      view9: testView
    })
  });

  pane.append();

  assert.equal(pane.view2.view6.get('nextValidKeyView'), pane.view7.view8, "order is correct when first and next not set");

  pane.set('firstKeyView', pane.view2);
  pane.view2.set('nextKeyView', pane.view1);
  pane.view1.set('nextKeyView', pane.view7);

  assert.equal(pane.view2.view6.get('nextValidKeyView'), pane.view1.view3, "order is respected when first and next are set");
  pane.remove();
  pane.destroy();
});

test("nextValidKeyView is chosen correctly when nextKeyView is not a sibling", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: View
    })
  });

  pane.append();

  pane.view1.view4.set('nextKeyView', pane.view2.view5);
  pane.view2.view5.set('nextKeyView', pane.view1.view4);

  assert.equal(pane.view1.view4.get('nextValidKeyView'), pane.view2.view5, "nextValidKeyView is correct");
  assert.equal(pane.view2.view5.get('nextValidKeyView'), pane.view1.view4, "nextValidKeyView is correct");
  pane.remove();
  pane.destroy();
});

test("nextValidKeyView is chosen correctly when child of parent's previous sibling has nextKeyView set", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    })
  });

  pane.view1.view3.set('nextKeyView', pane.view1.view4);
  pane.append();

  assert.equal(pane.view2.view5.get('nextValidKeyView'), pane.view2.view6, "nextValidKeyView chosen is next sibling");
  pane.remove();
  pane.destroy();
});

test("nextValidKeyView checks for acceptsFirstResponder", function (assert) {
  var pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      acceptsFirstResponder: true
    }),

    view2: View.extend({
      acceptsFirstResponder: false
    })
  });

  pane.view1.set('nextKeyView', pane.view2);
  pane.append();

  assert.ok(pane.view1.get('nextValidKeyView') !== pane.view2, "nextValidKeyView is not nextKeyView because nextKeyView acceptsFirstResponder === false");
  pane.remove();
  pane.destroy();
});

test("nextValidKeyView prioritizes parent's lastKeyView even if nextKeyView is set", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      lastKeyView: function () {
        return this.view3;
      }.property(),

      view3: testView,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    })
  });

  pane.append();

  assert.equal(pane.view1.view3.get('nextValidKeyView'), pane.view2.view5, "lastKeyView was respected; views after lastKeyView were skipped");
  pane.remove();
  pane.destroy();
});

/**
  previousValidKeyView tests
*/

test("previousValidKeyView is receiver if it is the only view that acceptsFirstResponder", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: View,

      view6: View
    })
  });

  pane.append();

  assert.equal(pane.view1.view4.get('previousValidKeyView'), pane.view1.view4, "previousValidKeyView is receiver");
  pane.remove();
  pane.destroy();
});

test("previousValidKeyView is null if no views have acceptsFirstResponder === true", function (assert) {
  var pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: View
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: View,

      view6: View
    })
  });

  pane.append();

  assert.ok(SC.none(pane.view1.view4.get('previousValidKeyView')), "previousValidKeyView is null");
  pane.remove();
  pane.destroy();
});

test("lastKeyView and previousKeyView of parents are respected", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2', 'view7'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: testView
    }),

    view7: View.extend({
      childViews: ['view8', 'view9'],

      view8: testView,

      view9: testView
    })
  });

  pane.append();

  assert.equal(pane.view2.view5.get('previousValidKeyView'), pane.view1.view4, "order is correct when last and previous not set");

  pane.set('lastKeyView', pane.view2);
  pane.view2.set('previousKeyView', pane.view7);
  pane.view1.set('previousKeyView', pane.view1);

  assert.equal(pane.view2.view5.get('previousValidKeyView'), pane.view7.view9, "order is respected when last and previous are set");
  pane.remove();
  pane.destroy();
});

test("previousValidKeyView is chosen correctly when previousKeyView is not a sibling", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: View,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      view5: testView,

      view6: View
    })
  });

  pane.append();

  pane.view1.view4.set('previousKeyView', pane.view2.view5);
  pane.view2.view5.set('previousKeyView', pane.view1.view4);

  assert.equal(pane.view1.view4.get('previousValidKeyView'), pane.view2.view5, "previousValidKeyView is correct");
  assert.equal(pane.view2.view5.get('previousValidKeyView'), pane.view1.view4, "previousValidKeyView is correct");
  pane.remove();
  pane.destroy();
});

test("previousValidKeyView prioritizes parent's firstKeyView even if previousKeyView is set", function (assert) {
  var testView = View.extend({acceptsFirstResponder: true}),
  pane = Pane.create({
    childViews: ['view1', 'view2'],

    view1: View.extend({
      childViews: ['view3', 'view4'],

      view3: testView,

      view4: testView
    }),

    view2: View.extend({
      childViews: ['view5', 'view6'],

      firstKeyView: function () {
        return this.view6;
      }.property(),

      view5: testView,

      view6: testView
    })
  });

  pane.append();

  assert.equal(pane.view2.view6.get('previousValidKeyView'), pane.view1.view4, "firstKeyView was respected; views before firstKeyView were skipped");
  pane.remove();
  pane.destroy();
});


// module("View - Keyboard support with Tabbing Outside of Document");

// test("forward tab with no next responder moves out of document");

// test("backwards tab with no previous responder moves out of document");
