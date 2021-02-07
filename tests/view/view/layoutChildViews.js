// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
import { View } from '../../../view/view.js';

// .......................................................
// layoutChildViews()
//
module("View#layoutChildViews");

test("calls renderLayout() on child views on views that need layout if they have a layer", function (assert) {

	var callCount = 0 ;
	var ChildView = View.extend({
		updateLayout: function(context) { callCount++; }
	});

	var view = View.create({
		childViews: [ChildView, ChildView, ChildView]
	});

	var cv1 = view.childViews[0];
	var cv2 = view.childViews[1];

	// add to set...
	view.layoutDidChangeFor(cv1);
	view.layoutDidChangeFor(cv2);

	view.layoutChildViews();
	assert.equal(callCount, 2, 'updateLayout should be called on two dirty child views');

	// Clean up.
	view.destroy();
});

// .......................................................
// updateLayout()
//
module("View#updateLayout");

test("if view has layout, calls _doUpdateLayoutStyle", function (assert) {

	// falseTE: renderLayout() is also called when a view's
	// layer is first created.  We use isTesting below to
	// avoid running the renderLayout() test code until we
	// are actually doing layout.
	var callCount = 0, isTesting = false ;
	var view = View.create({
		_doUpdateLayoutStyle: function() {
			callCount++;
		}
	});

	view.createLayer(); // we need a layer
	assert.ok(view.get('layer'), 'precond - should have a layer');

	view.updateLayout();
	assert.equal(callCount, 0, 'should not call _doUpdateLayoutStyle() because the view isn\'t shown');

	view.updateLayout(true);
	assert.equal(callCount, 1, 'should call _doUpdateLayoutStyle() because we force it');

	// Clean up.
	view.destroy();
});

test("if view has false layout, should not call renderLayout", function (assert) {

	// falseTE: renderLayout() is also called when a view's
	// layer is first created.  We use isTesting below to
	// avoid running the renderLayout() test code until we
	// are actually doing layout.
	var callCount = 0, isTesting = false ;
	var view = View.create({
		renderLayout: function(context) {
			if (!isTesting) return ;
			callCount++;
		}
	});

	assert.ok(!view.get('layer'), 'precond - should falseT have a layer');

	isTesting= true ;
	view.updateLayout();
	assert.equal(callCount, 0, 'should falseT call renderLayout()');

	// Clean up.
	view.destroy();
});

test("returns receiver", function (assert) {
	var view = View.create();
	assert.equal(view.updateLayout(), view, 'should return receiver');

	// Clean up.
	view.destroy();
});

// .......................................................
//  renderLayout()
//
module('View#renderLayout');

test("adds layoutStyle property to passed context", function (assert) {

	var view = View.create({
		// mock style for testing...
		layoutStyle: { width: 50, height: 50 }
	});
	var context = view.renderContext();

	assert.ok(context.styles().width !== 50, 'precond - should falseT have width style');
	assert.ok(context.styles().height !== 50, 'precond - should falseT have height style');


	view.renderLayout(context);

	assert.equal(context.styles().width, 50, 'should have width style');
	assert.equal(context.styles().height, 50, 'should have height style');

	// Clean up.
	view.destroy();
});

// .......................................................
// layoutChildViewsIfNeeded()
//
var view, callCount ;
module('View#layoutChildViewsIfNeeded', {
	beforeEach: function() {
		callCount = 0;
		view = View.create({
			layoutChildViews: function() { callCount++; }
		});
	},
	afterEach: function() {
		// Clean up.
		view.destroy();
		view = null;
	}
});

test("calls layoutChildViews() if childViewsNeedLayout and isVisibleInWindow & sets childViewsNeedLayout to false", function (assert) {

	view.childViewsNeedLayout = true ;
	view.isVisibleInWindow = true ;
	view.layoutChildViewsIfNeeded();
	assert.equal(callCount, 1, 'should call layoutChildViews()');
	assert.equal(view.get('childViewsNeedLayout'),false,'should set childViewsNeedLayout to false');
});

test("does not call layoutChildViews() if childViewsNeedLayout is false", function (assert) {

	view.childViewsNeedLayout = false ;
	view.isVisibleInWindow = true ;
	view.layoutChildViewsIfNeeded();
	assert.equal(callCount, 0, 'should falseT call layoutChildViews()');
});

test("returns receiver", function (assert) {
	assert.equal(view.layoutChildViewsIfNeeded(), view, 'should return receiver');
});


