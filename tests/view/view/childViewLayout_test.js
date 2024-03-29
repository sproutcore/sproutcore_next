// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2013 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

/*global module, test, equals, ok */

var view;

/** Test the View states. */
module("View:childViewLayout", {

  beforeEach: function () {
    view = View.create();
  },

  afterEach: function () {
    view.destroy();
    view = null;
  }

});

test("basic VERTICAL_STACK", function (assert) {
  SC.run(function() {
    view = View.create({

      childViewLayout: View.VERTICAL_STACK,

      childViewLayoutOptions: {
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, right: 10, top: 20 },
      sectionA: View.design({
        layout: { height: 100 }
      }),

      sectionB: View.design({
        layout: { border: 1, height: 50 }
      }),

      sectionC: View.design({
        layout: { left: 10, right: 10, height: 120 }
      })

    });
  });

  assert.equal(view.sectionA.layout.top, 10, "sectionA top should be 10");
  assert.equal(view.sectionB.layout.top, 115, "sectionB top should be 115");
  assert.equal(view.sectionC.layout.top, 170, "sectionC top should be 170");
  assert.equal(view.layout.height, 310, "view height should be 310");

});

test("basic HORIZONTAL_STACK", function (assert) {
  SC.run(function() {
    view = View.create({
      childViewLayout: View.HORIZONTAL_STACK,
      childViewLayoutOptions: {
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 5
      },
      childViews: ['sectionA', 'sectionB', 'sectionC'],
      layout: { left: 10, bottom: 20, top: 20 },

      sectionA: View.design({
        layout: { width: 100 }
      }),

      sectionB: View.design({
        layout: { border: 1, width: 50 }
      }),

      sectionC: View.design({
        layout: { top: 10, bottom: 10, width: 120 }
      })
    });
  });

  assert.equal(view.sectionA.layout.left, 10, "sectionA left should be 10");
  assert.equal(view.sectionB.layout.left, 115, "sectionB left should be 115");
  assert.equal(view.sectionC.layout.left, 170, "sectionC left should be 170");
  assert.equal(view.layout.width, 310, "view width should be 310");

});

test("HORIZONTAL_STACK - with fillRatio", function (assert) {
  var view = null;
  SC.run(function() {
    view = View.create({
      layout: { height: 10, width: 200 },
      childViewLayout: View.HORIZONTAL_STACK,
      childViewLayoutOptions: {
        resizeToFit: false,
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 10
      },
      childViews: [ "c1", "c2", "c3", "c4", "c5" ],

      c1: View.create({
        layout: { height: 10, width: 10 },
      }),
      c2: View.create({
        layout: { height: 10 },
        fillRatio: 1
      }),
      c3: View.create({
        layout: { height: 10, width: 10 },
      }),
      c4: View.create({
        layout: { height: 10 },
        fillRatio: 2
      }),
      c5: View.create({
        layout: { height: 10 },
        border: 1,
        isVisible: false
      }),
    });
  });

  assert.equal(view.c1.layout.left, 10, "c1 left should be 10");
  assert.equal(view.c2.layout.left, 30, "c2 left should be 10");
  assert.equal(view.c2.get( "borderFrame" ).width, 40, "c2 width should be 40");
  assert.equal(view.c3.layout.left, 80, "c3 left should be 10");
  assert.equal(view.c4.layout.left, 100, "c4 left should be 10");
  assert.equal(view.c4.get( "borderFrame" ).width, 80, "c4 width should be 80");

  SC.run(function() {
    view.c2.set( "isVisible", false );
    view.c4.set( "isVisible", false );
    view.c5.set( "isVisible", true );
  });

  assert.equal(view.c1.layout.left, 10, "c1 left should be 10");
  assert.equal(view.c3.layout.left, 30, "c3 left should be 30");
  assert.equal(view.c5.layout.left, 50, "c5 left should be 50");
  assert.equal(view.c5.get( "borderFrame" ).width, 130, "being the last child, c5 will extend to fill the available space, width should be 130");
});


test("VERTICAL_STACK - with fillRatio", function (assert) {
  var view = null;
  SC.run(function() {
    view = View.create({
      layout: { width: 10, height: 200 },
      childViewLayout: View.VERTICAL_STACK,
      childViewLayoutOptions: {
        resizeToFit: false,
        paddingBefore: 10,
        paddingAfter: 20,
        spacing: 10
      },
      childViews: [ "c1", "c2", "c3", "c4", "c5" ],

      c1: View.create({
        layout: { width: 10, height: 10 },
      }),
      c2: View.create({
        layout: { width: 10 },
        fillRatio: 1
      }),
      c3: View.create({
        layout: { width: 10, height: 10 },
      }),
      c4: View.create({
        layout: { width: 10 },
        fillRatio: 2
      }),
      c5: View.create({
        layout: { width: 10 },
        border: 1,
        isVisible: false
      }),
    });
  });

  assert.equal(view.c1.layout.top, 10, "c1 top should be 10");
  assert.equal(view.c2.layout.top, 30, "c2 top should be 10");
  assert.equal(view.c2.get( "borderFrame" ).height, 40, "c2 height should be 40");
  assert.equal(view.c3.layout.top, 80, "c3 top should be 10");
  assert.equal(view.c4.layout.top, 100, "c4 top should be 10");
  assert.equal(view.c4.get( "borderFrame" ).height, 80, "c4 height should be 80");

  SC.run(function() {
    view.c2.set( "isVisible", false );
    view.c4.set( "isVisible", false );
    view.c5.set( "isVisible", true );
  });

  assert.equal(view.c1.layout.top, 10, "c1 top should be 10");
  assert.equal(view.c3.layout.top, 30, "c3 top should be 30");
  assert.equal(view.c5.layout.top, 50, "c5 top should be 50");
  assert.equal(view.c5.get( "borderFrame" ).height, 130, "being the last child, c5 will extend to fill the available space, height should be 130");
});
