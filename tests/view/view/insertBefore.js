// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

var parent, child;
module("View#insertBefore", {
	beforeEach: function() {
	  child = View.create();
	  parent = View.create({
	    childViews: [View]
	  });
	}
});

test("returns receiver", function (assert) {
  assert.equal(parent.insertBefore(child, null), parent, 'receiver');
});

test("makes set child.parentView = to new parent view", function (assert) {
	assert.ok(child.get('parentView')!==parent, 'precond - parent is not child.parentView yet');

	// add observer to make sure property change triggers
	var callCount = 0;
	child.addObserver('parentView', function() {
	  callCount++;
	});

	parent.insertBefore(child, null);
	assert.equal(child.get('parentView'), parent, 'parent is child.parentView');
	assert.equal(callCount, 1, 'observer did fire');
});

test("insertBefore(child, null) appends child to end of parent.childView's array", function (assert) {
	parent.insertBefore(child, null);
	assert.equal(parent.childViews[parent.childViews.length-1], child, 'child is last childView');
});

test("insertBefore(child, otherChild) inserts child before other child view", function (assert) {

  var otherChild = parent.childViews[0]; // get current first child
  assert.ok(otherChild, 'precond - otherChild is not null');
  parent.insertBefore(child, otherChild);
  assert.equal(parent.childViews[0], child, 'child inserted before other child');
});

test("invokes willAddChild() on receiver if defined before adding child" ,function() {

  // monkey patch to test
  var callCount = 0;
  var otherChild = parent.childViews[0];
  parent.willAddChild = function(newChild, beforeView) {

  	// verify params
  	assert.equal(newChild, child, 'passed newChild');
  	assert.equal(beforeView, otherChild, 'passed beforeView');

  	// verify this is called BEFORE the view is added
  	assert.ok(parent.childViews.indexOf(child)<0, 'should not have child yet');
  	assert.ok(child.get('parentView')!==parent, 'childView not changed yet either');
  	callCount++;
  };


  parent.insertBefore(child, otherChild);
  assert.equal(callCount, 1, 'invoked');
});

test("invokes willAddToParent() on child view if defined before adding child" ,function() {

  // monkey patch to test
  var callCount = 0;
  var otherChild = parent.childViews[0];
  child.willAddToParent = function(parentView, beforeView) {

  	// verify params
  	assert.equal(parentView, parent, 'passed parent');
  	assert.equal(beforeView, otherChild, 'passed beforeView');

  	// verify this is called BEFORE the view is added
  	assert.ok(parent.childViews.indexOf(child)<0, 'should not have child yet');
  	assert.ok(child.get('parentView')!==parent, 'childView not changed yet either');
  	callCount++;
  };


  parent.insertBefore(child, otherChild);
  assert.equal(callCount, 1, 'invoked');
});

test("invokes didAddChild() on receiver if defined after adding child" ,function() {

  // monkey patch to test
  var callCount = 0;
  var otherChild = parent.childViews[0];
  parent.didAddChild = function(newChild, beforeView) {

  	// verify params
  	assert.equal(newChild, child, 'passed newChild');
  	assert.equal(beforeView, otherChild, 'passed beforeView');

  	// verify this is called AFTER the view is added
  	assert.ok(parent.childViews.indexOf(child)>=0, 'should have child');
  	assert.ok(child.get('parentView')===parent, 'childView should have new parentView');
  	callCount++;
  };

  SC.RunLoop.begin();
  parent.insertBefore(child, otherChild);
  SC.RunLoop.end();

  assert.equal(callCount, 1, 'invoked');
});

test("invokes didAddToParent() on child view if defined after adding child" ,function() {

  // monkey patch to test
  var callCount = 0;
  var otherChild = parent.childViews[0];
  child.didAddToParent = function(parentView, beforeView) {

  	// verify params
  	assert.equal(parentView, parent, 'passed parent');
  	assert.equal(beforeView, otherChild, 'passed beforeView');

  	// verify this is called AFTER the view is added
  	assert.ok(parent.childViews.indexOf(child)>=0, 'should have child');
  	assert.ok(child.get('parentView')===parent, 'childView should have new parentView');
  	callCount++;
  };

  SC.RunLoop.begin();
  parent.insertBefore(child, otherChild);
  SC.RunLoop.end();

  assert.equal(callCount, 1, 'invoked');
});

// VERIFY LAYER CHANGES ARE DEFERRED
// test("should not move layer immediately");
// , function() {

//   parent.createLayer();
//   child.createLayer();

//   assert.ok(parent.get('layer'), 'precond - parent has layer');
//   assert.ok(child.get('layer'), 'precond - child has layer');

//   parent.insertBefore(child, null);
//   assert.ok(child.get('layer').parentNode !== parent.get('layer'), 'did not move layer');

// });

// .......................................................
// appendChild()
//

module('View#appendChild', {
  beforeEach: function() {
    parent = View.create({
      childViews: [View, View]
    });

    child = View.create();
  }
});

test("returns receiver", function (assert) {
  assert.equal(parent.appendChild(child, null), parent, 'receiver');
});


test("should add child to end of childViews", function (assert) {
  parent.appendChild(child);
  assert.equal(parent.childViews[parent.childViews.length-1], child, 'child is last child view');
});


