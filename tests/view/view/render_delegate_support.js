// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';


/*global module test equals context ok same */

// .......................................................
//  render()
//
module("View#render");

test("Supports backwards-compatible render method", function (assert) {
  var renderCallCount = 0;
  var view = View.create({
    render: function(context, firstTime) {
      renderCallCount++;
      assert.ok(context._STYLE_REGEX, 'passes RenderContext');
      assert.equal(firstTime, true, 'passes true for firstTime');
    }
  });

  view.createLayer();

  view.render = function(context, firstTime) {
    renderCallCount++;
    assert.ok(context._STYLE_REGEX, 'passes RenderContext');
    assert.equal(firstTime, false, 'passes false for firstTime');
  };

  view.updateLayer();

  assert.equal(renderCallCount, 2, 'render should have been called twice');

  // Clean up.
  view.destroy();
});

test("Treats a view as its own render delegate", function (assert) {
  var renderCallCount = 0,
      updateCallCount = 0;

  var view = View.create({
    render: function(context) {
      // Check for existence of _STYLE_REGEX to determine if this is an instance
      // of RenderContext
      assert.ok(context._STYLE_REGEX, 'passes render context');
      renderCallCount++;
    },

    update: function(elem) {
     assert.ok(elem.jquery, 'passes a jQuery object as first parameter');
     updateCallCount++;
    }
  });

  view.createLayer();
  view.updateLayer();
  assert.equal(renderCallCount, 1, "calls render once");
  assert.equal(updateCallCount, 1, "calls update once");

  // Clean up.
  view.destroy();
});

test("Passes data source as first parameter if render delegate is not the view", function (assert) {
  var renderCallCount = 0,
      updateCallCount = 0;

  var view;

  var renderDelegate = SC.Object.create({
    render: function(dataSource, context, firstTime) {
      assert.equal(dataSource, view.get('renderDelegateProxy'), "passes the view's render delegate proxy as data source");
      assert.ok(context._STYLE_REGEX, "passes render context");
      assert.equal(firstTime, undefined, "does not pass third parameter");
      renderCallCount++;
    },

    update: function(dataSource, elem) {
      assert.equal(dataSource, view.get('renderDelegateProxy'), "passes view's render delegate proxy as data source");
      assert.ok(elem.jquery, "passes a jQuery object as first parameter");
      updateCallCount++;
    }
  });

  view = View.create({
    renderDelegate: renderDelegate
  });

  view.createLayer();
  view.updateLayer();
  assert.equal(renderCallCount, 1, "calls render once");
  assert.equal(updateCallCount, 1, "calls update once");

  // Clean up.
  view.destroy();
});

test("Extending view with render delegate by implementing old render method", function (assert) {
  var renderCalls = 0, updateCalls = 0;
  var parentView = View.extend({
    renderDelegate: SC.Object.create({
      render: function(context) {
        renderCalls++;
      },

      update: function(cq) {
        updateCalls++;
      }
    })
  });

  var childView = parentView.create({
    render: function render(context, firstTime) {
      render.base.apply(this, arguments);
    }
  });

  childView.createLayer();
  childView.updateLayer();

  assert.equal(renderCalls, 1, "calls render on render delegate once");
  assert.equal(updateCalls, 1, "calls update on render delegates once");
});

test("Views that do not override render should render their child views", function (assert) {
  var newStyleCount = 0, oldStyleCount = 0, renderDelegateCount = 0;

  var parentView = View.design({
    childViews: 'newStyle oldStyle renderDelegateView'.w(),

    newStyle: View.design({
      render: function(context) {
        newStyleCount++;
      },

      update: function() {
        // no op
      }
    }),

    oldStyle: View.design({
      render: function(context, firstTime) {
        oldStyleCount++;
      }
    }),

    renderDelegateView: View.design({
      renderDelegate: SC.Object.create({
        render: function(dataSource, context) {
          assert.ok(dataSource.isViewRenderDelegateProxy, "Render delegate should get passed a view's proxy for its data source");
          renderDelegateCount++;
        },

        update: function() {
          // no op
        }
      })
    })
  });

  parentView = parentView.create();

  parentView.createLayer();
  parentView.updateLayer();

  assert.equal(newStyleCount, 1, "calls render on new style view once");
  assert.equal(oldStyleCount, 1, "calls render on old style view once");
  assert.equal(renderDelegateCount, 1, "calls render on render delegate once");
});
