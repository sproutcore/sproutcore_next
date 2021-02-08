// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

// ..........................................................
// createChildViews()
//
module("View#createChildViews");

test("calls createChildView() for each class or string in childViews array", function (assert) {
  var called = [];
  var v = View.create({
    childViews: [
      View.extend({ key: 0 }), // class - should be called
      View.create({ key: 1 }), // instance - will be called
      'customClassName'           // string - should be called
    ],

    // this should be used for the 'customClassName' item above
    customClassName: View.extend({ key: 2 }),

    // patch to record results...
    createChildView: function createChildView (childView) {
      if(childView.isClass) {
        called.push(childView.prototype.key);
      } else {
        called.push(childView.key);
      }
      return createChildView.base.apply(this, arguments);
    }
  });

  // createChildViews() is called automatically during create.
  assert.deepEqual(called, [0,1,2], 'called createChildView for correct children');

  // make sure childViews array is correct now.
  var cv = v.childViews, len = cv.length, idx;
  for(idx=0;idx<len;idx++) {
    assert.equal(cv[idx].key, idx, 'has correct index key');
    assert.ok(cv[idx].isObject, 'isObject - %@'.fmt(cv[idx]));
  }
});

test("should not error when there is a dud view name in childViews list.", function (assert) {
  var called = [];
  var v = View.create({
    childViews: [
      'nonExistantClassName',       // string - should falseT be called
      null,                       // null - should falseT be called
      '',                         // empty string - should falseT be called
      'customClassName'          // string - should be called
    ],
    // this should be used for the 'customClassName' item above
    customClassName: View.extend({ key: 2 }),

    // patch to record results...
    createChildView: function createChildView (childView) {
      called.push(childView.prototype.key);
      assert.ok(childView.isClass, "childView: %@ isClass".fmt(childView));
      return createChildView.base.apply(this, arguments);
    }
  });

  // createChildViews() is called automatically during create.
  assert.deepEqual(called, [2], 'called createChildView for correct children');
  assert.equal(v.getPath('childViews.length'), 1, "The childViews array should not contain any invalid childViews after creation.");
});

test("should not throw error when there is an extra space in the childViews list", function (assert) {
  var called = [];
  var v = View.create({
    childViews: "customClassName  customKlassName".w(),
    // this should be used for the 'customClassName' item above
    customClassName: View.extend({ key: 2 }),
    customKlassName: View.extend({ key: 3 })
  });

  assert.ok(true, "called awake without issue.");

});

test("should not create layer for created child views", function (assert) {
  var v = View.create({
    childViews: [View]
  });
  assert.ok(v.childViews[0].isObject, 'precondition - did create child view');
  assert.equal(v.childViews[0].get('layer'), null, 'childView does not have layer');
});

// ..........................................................
// createChildView()
//

var view, myViewClass ;
module("View#createChildView", {
  beforeEach: function() {
    view = View.create({ page: SC.Object.create() });
    myViewClass = View.extend({ isMyView: true, foo: 'bar' });
  }
});

test("should create view from class with any passed attributes", function (assert) {
  var v = view.createChildView(myViewClass, { foo: "baz" });
  assert.ok(v.isMyView, 'v is instance of myView');
  assert.equal(v.foo, 'baz', 'view did get custom attributes');
});

test("should set newView.parentView to receiver", function (assert) {
  var v = view.createChildView(myViewClass) ;
  assert.equal(v.get('parentView'), view, 'v.parentView == view');
});

test("should set newView.page to receiver.page unless custom attr is passed", function (assert) {
  var v = view.createChildView(myViewClass) ;
  assert.equal(v.get('page'), view.get('page'), 'v.page == view.page');

  var myPage = SC.Object.create();
  v = view.createChildView(myViewClass, { page: myPage }) ;
  assert.equal(v.get('page'), myPage, 'v.page == custom page');
});

// CoreView has basic visibility support based on state now.
// test("should not change isVisibleInWindow property on views that do not have visibility support", function() {
//   var coreView = CoreView.extend({});

//   run(function() { view.set('isVisible', false); });
//   var v = view.createChildView(coreView);

//   assert.ok(v.get('isVisibleInWindow'), "CoreView instance always has isVisibleInWindow set to false");
// });

