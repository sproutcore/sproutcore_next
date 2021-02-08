// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ */

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';
import { CoreQuery as Q$ } from '../../../event/event.js';

// ..........................................................
// createLayer()
//
module("View#createLayer");

test("returns the receiver", function (assert) {
  var v = View.create();
  assert.equal(v.createLayer(), v, 'returns receiver');
  v.destroy();
});

test("calls renderToContext() and sets layer to resulting element", function (assert) {
  var v = View.create({
    tagName: 'span',

    renderToContext: function(context, firstTime) {
      context.push("foo");
    }
  });

  assert.equal(v.get('layer'), null, 'precondition - has no layer');
  v.createLayer();

  var elem = v.get('layer');
  assert.ok(!!elem, 'has element now');
  assert.equal(elem.innerHTML, 'foo', 'has innerHTML from context');
  assert.equal(elem.tagName.toString().toLowerCase(), 'span', 'has tagName from view');
  elem = null ;
  v.destroy();
});

test("invokes didCreateLayer() on receiver and all child views", function (assert) {
  var callCount = 0, mixinCount = 0,
      callees = [];
  var v = View.create({

    didCreateLayer: function() { callees.push(this); callCount++; },
    didCreateLayerMixin: function() { mixinCount++; },

    childViews: [View.extend({
      didCreateLayer: function() { callees.push(this); callCount++; },
      childViews: [View.extend({
        didCreateLayer: function() { callees.push(this); callCount++; },
        didCreateLayerMixin: function() { mixinCount++; }
      }), View.extend({ /* no didCreateLayer */ })]
    })]
  });

  // Grab the child and grandchild view for easy reference.
  var childView = v.get('childViews').objectAt(0),
      grandChildView = childView.get('childViews').objectAt(0);

  // verify setup...
  assert.ok(v.didCreateLayer, 'precondition - has root');
  assert.ok(v.childViews[0].didCreateLayer, 'precondition - has firstChild');
  assert.ok(v.childViews[0].childViews[0].didCreateLayer, 'precondition - has nested child');
  assert.ok(!v.get('layer'), 'has no layer');

  v.createLayer();
  assert.equal(callCount, 3, 'did invoke all methods');
  assert.equal(mixinCount, 2, 'did invoke all mixin methods');
  assert.deepEqual(callees, [grandChildView, childView, v], "The didCreateLayer function should be called bottom-up so that parent's that alter children, do so while the child is in the proper state.");
  v.destroy();
});

test("generated layer include HTML from child views as well", function (assert) {
  var v = View.create({
    childViews: [ View.extend({ layerId: "foo" })]
  });

  v.createLayer();
  assert.ok(Q$('#foo', v.get('layer')).get(0), 'has element with child layerId');
  v.destroy();
});

test("does falseT assign layer to child views immediately", function (assert) {
  var v = View.create({
    childViews: [ View.extend({ layerId: "foo" })]
  });
  v.createLayer();
  assert.ok(!v.childViews[0]._view_layer, 'has no layer yet');
  v.destroy();
});

// ..........................................................
// USE CASES
//

// when view is first created, createLayer is falseT called

// when view is added to parent view, and parent view is already visible in
// window, layer is created just before adding it to the DOM

// when a pane is added to the window, the pane layer is created.

// when a pane with an exiting layer is removed from the DOM, the layer is removed from the DOM, but it is not destroyed.

// what if we move a view from a parentView that has a layer to a parentView that does falseT have a layer.   Delete layer.

// what if a move a view from a parentView that does falseT have a layer to a parentView that DOES have a layer.
