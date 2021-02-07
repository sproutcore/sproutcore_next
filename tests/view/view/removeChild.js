// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


import { View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';

/*global module test equals context ok same */

// .......................................................
// removeChild()
//

var parent, child;
module("View#removeChild", {
	beforeEach: function() {
		parent = View.create({ childViews: [
      View.extend({
        updateLayerLocationIfNeeded: CoreTest.stub('updateLayerLocationIfNeeded', View.prototype.updateLayerLocationIfNeeded)
      })
    ] });
		child = parent.childViews[0];
	}
});

test("returns receiver", function (assert) {
	assert.equal(parent.removeChild(child), parent, 'receiver');
});

test("removes child from parent.childViews array", function (assert) {
  assert.ok(parent.childViews.indexOf(child)>=0, 'precond - has child in childViews array before remove');
  parent.removeChild(child);
  assert.ok(parent.childViews.indexOf(child)<0, 'removed child');
});

test("sets parentView property to null", function (assert) {
  assert.ok(child.get('parentView'), 'precond - has parentView');
  parent.removeChild(child);
  assert.ok(!child.get('parentView'), 'parentView is now null');
});

test("does nothing if passed null", function (assert) {

  // monkey patch callbacks to make sure nothing runs.
  var callCount = 0;
  parent.willRemoveChild = parent.didRemoveChild = function() { callCount++; };

  parent.removeChild(null);
  assert.equal(callCount, 0, 'did not invoke callbacks');
});

test("invokes child.willRemoveFromParent before removing if defined", function (assert) {

  // monkey patch to test
  var callCount = 0;
  child.willRemoveFromParent = function() {
    // verify invoked BEFORE removal
    assert.equal(child.get('parentView'), parent, 'still in parent');
    callCount++;
  };

  parent.removeChild(child);
  assert.equal(callCount, 1, 'invoked callback');
});

test("invokes parent.willRemoveChild before removing if defined", function (assert) {

  // monkey patch to test
  var callCount = 0;
  parent.willRemoveChild = function(view) {
    assert.equal(view, child, 'passed child as param');

    // verify invoked BEFORE removal
    assert.equal(child.get('parentView'), parent, 'still in parent');
    callCount++;
  };

  parent.removeChild(child);
  assert.equal(callCount, 1, 'invoked callback');
});


test("invokes child.didRemoveFromParent AFTER removing if defined", function (assert) {

  // monkey patch to test
  var callCount = 0;
  child.didRemoveFromParent = function(view) {
    assert.equal(view, parent, 'passed parent as param');

    // verify invoked AFTER removal
    assert.ok(!child.get('parentView'), 'no longer in parent');
    callCount++;
  };

  parent.removeChild(child);
  assert.equal(callCount, 1, 'invoked callback');
});

test("invokes parent.didRemoveChild before removing if defined", function (assert) {

  // monkey patch to test
  var callCount = 0;
  parent.didRemoveChild = function(view) {
    assert.equal(view, child, 'passed child as param');

    // verify invoked BEFORE removal
    assert.ok(!child.get('parentView'), 'no longer in parent');
    callCount++;
  };

  parent.removeChild(child);
  assert.equal(callCount, 1, 'invoked callback');
});

// VERIFY LAYER CHANGES ARE DEFERRED
// test("should not move layer immediately");
// , function() {

//   parent.createLayer();

// 	var parentLayer = parent.get('layer'), childLayer = child.get('layer');
//   assert.ok(parentLayer, 'precond - parent has layer');
//   assert.ok(childLayer, 'precond - child has layer');
//   assert.equal(childLayer.parentNode, parentLayer, 'child layer belong to parent');

//   parent.removeChild(child);
//   assert.equal(childLayer.parentNode, parentLayer, 'child layer belong to parent');
// });

// .......................................................
// removeAllChildren()
//
var view;
module("View#removeAllChildren", {
  beforeEach: function() {
    view = View.create({
      childViews: [View, View, View]
    });
  }
});

test("removes all child views", function (assert) {
  assert.equal(view.childViews.length, 3, 'precond - has child views');

  view.removeAllChildren();
  assert.equal(view.childViews.length, 0, 'removed all children');
});

test("returns receiver", function (assert) {
	assert.equal(view.removeAllChildren(), view, 'receiver');
});

// .......................................................
// removeFromParent()
//
module("View#removeFromParent");

test("removes view from parent view", function (assert) {
  parent = View.create({ childViews: [View] });
  child = parent.childViews[0];
  assert.ok(child.get('parentView'), 'precond - has parentView');

  child.removeFromParent();
  assert.ok(!child.get('parentView'), 'no longer has parentView');
  assert.ok(parent.childViews.indexOf(child)<0, 'no longer in parent childViews');
});

test("returns receiver", function (assert) {
	assert.equal(child.removeFromParent(), child, 'receiver');
});

test("does nothing if not in parentView", function (assert) {
  var callCount = 0;
  child = View.create();

	// monkey patch for testing...
	child.willRemoveFromParent = function() { callCount++; };
	assert.ok(!child.get('parentView'), 'precond - has no parent');

	child.removeFromParent();
	assert.equal(callCount, 0, 'did not invoke callback');
});


