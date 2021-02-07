// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


import { View } from '../../../view/view.js';


/*global module test equals context ok same */

// .......................................................
//  render()
//
module("View#render");

test("default implementation invokes renderChildViews if firstTime = true", function (assert) {

  var rendered = 0, updated = 0, parentRendered = 0, parentUpdated = 0 ;
  var view = View.create({
    displayProperties: ["triggerRenderProperty"],
    childViews: ["child"],

    render: function(context) {
      parentRendered++;
    },

    update: function(jquery) {
      parentUpdated++;
    },

    child: View.create({
      render: function(context) {
        rendered++;
      },

      update: function(jquery) {
        updated++;
      }
    })
  });

  view.createLayer();
  assert.equal(rendered, 1, 'rendered the child');
  assert.equal(parentRendered, 1);

  view.updateLayer(true);
  assert.equal(rendered, 1, 'didn\'t call render again');
  assert.equal(parentRendered, 1, 'didn\'t call the parent\'s render again');
  assert.equal(parentUpdated, 1, 'called the parent\'s update');
  assert.equal(updated, 0, 'didn\'t call the child\'s update');

  // Clean up.
  view.destroy();
});

test("default implementation does not invoke renderChildViews if explicitly rendered in render method", function (assert) {

  var rendered = 0, updated = 0, parentRendered = 0, parentUpdated = 0 ;
  var view = View.create({
    displayProperties: ["triggerRenderProperty"],
    childViews: ["child"],

    render: function(context) {
      this.renderChildViews(context);
      parentRendered++;
    },

    update: function(jquery) {
      parentUpdated++;
    },

    child: View.create({
      render: function(context) {
        rendered++;
      },

      update: function(jquery) {
        updated++;
      }
    })
  });

  view.createLayer();
  assert.equal(rendered, 1, 'rendered the child once');
  assert.equal(parentRendered, 1);
  assert.equal(view.$('div').length, 1);

  view.updateLayer(true);
  assert.equal(rendered, 1, 'didn\'t call render again');
  assert.equal(parentRendered, 1, 'didn\'t call the parent\'s render again');
  assert.equal(parentUpdated, 1, 'called the parent\'s update');
  assert.equal(updated, 0, 'didn\'t call the child\'s update');

  // Clean up.
  view.destroy();
});

test("should invoke renderChildViews if layer is destroyed then re-rendered", function (assert) {

  var rendered = 0, updated = 0, parentRendered = 0, parentUpdated = 0 ;
  var view = View.create({
    displayProperties: ["triggerRenderProperty"],
    childViews: ["child"],

    render: function(context) {
      parentRendered++;
    },

    update: function(jquery) {
      parentUpdated++;
    },

    child: View.create({
      render: function(context) {
        rendered++;
      },

      update: function(jquery) {
        updated++;
      }
    })
  });

  view.createLayer();
  assert.equal(rendered, 1, 'rendered the child once');
  assert.equal(parentRendered, 1);
  assert.equal(view.$('div').length, 1);

  view.destroyLayer();
  view.createLayer();
  assert.equal(rendered, 2, 'rendered the child twice');
  assert.equal(parentRendered, 2);
  assert.equal(view.$('div').length, 1);

  // Clean up.
  view.destroy();
});
// .......................................................
// renderChildViews()
//

module("View#renderChildViews");

test("creates a context and then invokes renderToContext or updateLayer on each childView", function (assert) {

  var runCount = 0, curContext, curFirstTime ;

  var ChildView = View.extend({
    renderToContext: function(context) {
      assert.equal(context.prevObject, curContext, 'passed child context of curContext');

      assert.equal(context.tagName(), this.get('tagName'), 'context setup with current tag name');

      runCount++; // record run
    },

    updateLayer: function() {
      runCount++;
    }
  });

  var view = View.create({
    childViews: [
      ChildView.extend({ tagName: 'foo' }),
      ChildView.extend({ tagName: 'bar' }),
      ChildView.extend({ tagName: 'baz' })
    ]
  });

  // VERIFY: firstTime= true
  curContext = view.renderContext('div');
  curFirstTime= true ;
  assert.equal(view.renderChildViews(curContext, curFirstTime), curContext, 'returns context');
  assert.equal(runCount, 3, 'renderToContext() invoked for each child view');


  // VERIFY: firstTime= false
  runCount = 0 ; //reset
  curContext = view.renderContext('div');
  curFirstTime= false ;
  assert.equal(view.renderChildViews(curContext, curFirstTime), curContext, 'returns context');
  assert.equal(runCount, 3, 'updateLayer() invoked for each child view');

  // Clean up.
  view.destroy();
});

test("creates a context and then invokes renderChildViews to call renderToContext on each childView", function (assert) {

  var runCount = 0, curContext ;

  var ChildView = View.extend({
    renderToContext: function(context) {
      assert.equal(context.prevObject, curContext, 'passed child context of curContext');
      assert.equal(context.tagName(), this.get('tagName'), 'context setup with current tag name');
      runCount++; // record run
    }
  });

  var view = View.create({
    childViews: [
      ChildView.extend({ tagName: 'foo' }),
      ChildView.extend({ tagName: 'bar' }),
      ChildView.extend({ tagName: 'baz' })
    ]
  });

  // VERIFY: firstTime= true
  curContext = view.renderContext('div');
  view.renderChildViews(curContext);
  assert.equal(runCount, 3, 'renderToContext() invoked for each child view');

  // Clean up.
  view.destroy();
});
