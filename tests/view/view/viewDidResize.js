// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, same */
import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';

// ..........................................................
// viewDidResize()
//
module("View#viewDidResize");

test("invokes parentViewDidResize on all child views", function (assert) {
  var callCount = 0 ;
  var ChildView = View.extend({
    parentViewDidResize: function() { callCount++; }
  });

  var view = View.create({
    childViews: [ChildView, ChildView, ChildView]
  });

  // now test...
  SC.run(function() { view.viewDidResize(); });
  assert.equal(callCount, 3, 'should invoke parentViewDidResize() on all children');
});

test("parentViewDidResize should only be called when the parent's layout property changes in a manner that may affect child views.", function (assert) {
  var callCount = 0 ;
  var view = View.create({
    // use the callback below to detect when viewDidResize is icalled.
    childViews: [View.extend({
      parentViewDidResize: function() { callCount++; }
    })]
  });

  SC.run(function () { view.set('layout', { top: 10, left: 20, height: 50, width: 40 }); });
  assert.equal(callCount, 1, 'parentViewDidResize should invoke once');

  SC.run(function () { view.adjust('top', 0); });
  assert.equal(callCount, 1, 'parentViewDidResize should invoke once');

  SC.run(function () { view.adjust('height', 60); });
  assert.equal(callCount, 2, 'parentViewDidResize should invoke twice');

  // This is tricky, if the height increases, but the same size border is added, the effective height/width is unchanged.
  /*
    Testing for this type of change on every call to adjust isn't worth the computation cost. Essentially,
    what we lose is that parentViewDidResize will get called still if a view happens to adjust its border and
    size at the same time, such that its frame doesn't change, which has a very small chance of occurring and
    isn't critical if it does occur.
    */
  // SC.run(function () { view.adjust({'height': 70, 'borderTop': 10 }); });
  // assert.equal(callCount, 2, 'parentViewDidResize should invoke twice');
});

test("The view's frame should only notify changes when its layout changes if the effective size or position actually change.", function (assert) {
  var view2 = View.create({
      frameCallCount: 0,
      frameDidChange: function() {
        this.frameCallCount++;
      }.observes('frame'),
      viewDidResize: CoreTest.stub('viewDidResize', View.prototype.viewDidResize)
    }),
    view1 = View.create({
      childViews: [view2],
      layout: { width: 200, height: 200 }
    });

  // Because the view is created independently and then added to a parent, it's frame should change
  // once when added to the parent.
  assert.equal(view2.get('frameCallCount'), 1, 'frame should have notified changing once.');

  SC.run(function () { view2.set('layout', { height: 50, width: 50 }); });
  assert.equal(view2.get('frameCallCount'), 2, 'frame should have notified changing twice.');

  SC.run(function () { view2.adjust('top', 0); });
  assert.equal(view2.get('frameCallCount'), 3, 'frame should have notified changing thrice.');

  SC.run(function () { view2.adjust('height', 100); });
  assert.equal(view2.get('frameCallCount'), 4, 'frame should have notified changing four times.');

  // Tricky.
  SC.run(function () { view2.adjust({ 'height': 110, 'borderTop': 10, 'top': -10 }); });
  assert.equal(view2.get('frameCallCount'), 5, 'frame should have notified changing five times.');

  SC.run(function () { view2.adjust('width', null); });
  assert.equal(view2.get('frameCallCount'), 6, 'frame should have notified changing six times.');

  // Tricky.
  SC.run(function () { view2.adjust('width', 200); });
  assert.equal(view2.get('frameCallCount'), 7, 'frame should have notified changing seven times.');
});

test("making sure that the frame value is correct inside viewDidResize()", function (assert) {
  // We want to test to be sure that when the view's viewDidResize() method is
  // called, its frame has been updated.  But rather than run the test inside
  // the method itself, we'll cache a global reference to the then-current
  // value and test it later.
  var cachedFrame;

  var view = View.create({

    layout: { left:0, top:0, width:400, height:400 },

    viewDidResize: function viewDidResize () {
        viewDidResize.base.apply(this, arguments);

        // Set a global reference to my frame at this point so that we can
        // test for the correct value later.
        cachedFrame = this.get('frame');
      }
  });


  // Access the frame once before resizing the view, to make sure that the
  // previous value was cached.  That way, when we ask for the frame again
  // after the resize, we can verify that the cache invalidation logic is
  // working correctly.
  var originalFrame = view.get('frame');

  SC.RunLoop.begin();
  view.adjust('height', 314);
  SC.RunLoop.end();

  // Now that we've adjusted the view, the cached view (as it was inside its
  // viewDidResize() method) should be the same value, because the cached
  // 'frame' value should have been invalidated by that point.
  assert.deepEqual(view.get('frame').height, cachedFrame.height, 'height');
});


// ..........................................................
// parentViewDidResize()
//
module("View#parentViewDidResize");

test("When parentViewDidResize is called on a view, it should only notify on frame and cascade the call to child views if it will be affected by the parent's resize.", function (assert) {
  var view = View.create({
      // instrument...
      frameCallCount: 0,
      frameDidChange: function() {
        this.frameCallCount++;
      }.observes('frame'),
      viewDidResize: CoreTest.stub('viewDidResize', View.prototype.viewDidResize)
    }),
    parentView = View.create({
      childViews: [view],
      layout: { height: 100, width: 100 }
    });

  // try with fixed layout
  SC.run(function () {
    view.set('layout', { top: 10, left: 10, height: 10, width: 10 });
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ width: 90, height: 90 });
  });
  view.viewDidResize.expect(0, "Should not notify view resize with fixed position and fixed size");
  assert.equal(view.frameCallCount, 0, 'Should not notify frame changed with fixed position and fixed size.');

  // Try with flexible height
  SC.run(function () {
    view.set('layout', { top: 10, left: 10, bottom: 10, width: 10 });
    // Adjust height.
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ height: 80 });
  });
  view.viewDidResize.expect(1, "View with fixed width and flexible height SHOULD resize when parent's height is adjusted");
  assert.equal(view.frameCallCount, 1, "Adjusting parent's height SHOULD notify frame with fixed position, fixed width and flexible height");

  // Adjust width.
  view.viewDidResize.reset(); view.frameCallCount = 0;

  SC.run(function () {
    parentView.adjust({ width: 80 });
  });
  view.viewDidResize.expect(0, "View with fixed width and flexible height should falseT resize when parent's width is adjusted");
  assert.equal(view.frameCallCount, 0, "Adjusting parent's width should falseT notify frame with fixed position, fixed width and flexible height");

  // Adjust both.
  view.viewDidResize.reset(); view.frameCallCount = 0;

  SC.run(function () {
    parentView.adjust({ width: 90, height: 90 });
  });
  view.viewDidResize.expect(1, "View with fixed width and flexible height SHOULD resize when parent's height and width are adjusted");
  assert.equal(view.frameCallCount, 1, "Adjusting parent's height and width SHOULD notify frame with fixed position, fixed width and flexible height");

  // try with flexible width
  SC.run(function () {
    view.set('layout', { top: 10, left: 10, height: 10, right: 10 });
    // Adjust height.
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ height: 80 });
  });
  view.viewDidResize.expect(0, "View with flexible width and fixed height should falseT resize when parent's height is adjusted");
  assert.equal(view.frameCallCount, 0, "Adjusting parent's height should falseT notify frame with fixed position, flexible width and fixed height");

  // Adjust width.
  view.viewDidResize.reset(); view.frameCallCount = 0;
  SC.run(function () {
    parentView.adjust({ width: 80 });
  });
  view.viewDidResize.expect(1, "View with flexible width and fixed height SHOULD resize when parent's width is adjusted");
  assert.equal(view.frameCallCount, 1, "Adjusting parent's width SHOULD notify frame with fixed position, flexible width and fixed height");

  // Adjust both.
  view.viewDidResize.reset(); view.frameCallCount = 0;
  SC.run(function () {
    parentView.adjust({ width: 90, height: 90 });
  });
  view.viewDidResize.expect(1, "View with flexible width and fixed height SHOULD resize when parent's height and width are adjusted");
  assert.equal(view.frameCallCount, 1, "Adjusting parent's height and width SHOULD notify frame with fixed position, flexible width and fixed height");

  // try with right align
  SC.run(function () {
    view.set('layout', { top: 10, right: 10, height: 10, width: 10 });
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ width: 60, height: 60 });
  });
  view.viewDidResize.expect(0);
  assert.equal(view.frameCallCount, 1, 'right align: should notify frame changed when isFixedPosition: %@ and isFixedSize: %@'.fmt(view.get('isFixedPosition'), view.get('isFixedSize')));

  // try with bottom align
  SC.run(function () {
    view.set('layout', { left: 10, bottom: 10, height: 10, width: 10 });
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ width: 50, height: 50 });
  });
  view.viewDidResize.expect(0);
  assert.equal(view.frameCallCount, 1, 'bottom align: should notify frame changed when isFixedPosition: %@ and isFixedSize: %@'.fmt(view.get('isFixedPosition'), view.get('isFixedSize')));

  // try with center horizontal align
  SC.run(function () {
    view.set('layout', { centerX: 10, top: 10, height: 10, width: 10 });
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ width: 40, height: 40 });
  });
  view.viewDidResize.expect(0);
  assert.equal(view.frameCallCount, 1, 'centerX: should notify frame changed when isFixedPosition: %@ and isFixedSize: %@'.fmt(view.get('isFixedPosition'), view.get('isFixedSize')));

  // try with center vertical align
  SC.run(function () {
    view.set('layout', { left: 10, centerY: 10, height: 10, width: 10 });
    view.viewDidResize.reset(); view.frameCallCount = 0;
    parentView.adjust({ width: 30, height: 30 });
  });
  view.viewDidResize.expect(0);
  assert.equal(view.frameCallCount, 1, 'centerY: should notify frame changed when isFixedPosition: %@ and isFixedSize: %@'.fmt(view.get('isFixedPosition'), view.get('isFixedSize')));
});

// ..........................................................
// beginLiveResize()
//
module("View#beginLiveResize");

test("invokes willBeginLiveResize on receiver and any child views that implement it", function (assert) {
  var callCount = 0;
  var ChildView = View.extend({
    willBeginLiveResize: function() { callCount++ ;}
  });

  var view = ChildView.create({ // <-- has callback
    childViews: [View.extend({ // <-- this does not implement callback
      childViews: [ChildView] // <-- has callback
    })]
  });

  callCount = 0 ;
  view.beginLiveResize();
  assert.equal(callCount, 2, 'should invoke willBeginLiveResize when implemented');
});

test("returns receiver", function (assert) {
  var view = View.create();
  assert.equal(view.beginLiveResize(), view, 'returns receiver');
});

// ..........................................................
// endLiveResize()
//
module("View#endLiveResize");

test("invokes didEndLiveResize on receiver and any child views that implement it", function (assert) {
  var callCount = 0;
  var ChildView = View.extend({
    didEndLiveResize: function() { callCount++; }
  });

  var view = ChildView.create({ // <-- has callback
    childViews: [View.extend({ // <-- this does not implement callback
      childViews: [ChildView] // <-- has callback
    })]
  });

  callCount = 0 ;
  view.endLiveResize();
  assert.equal(callCount, 2, 'should invoke didEndLiveResize when implemented');
});

test("returns receiver", function (assert) {
  var view = View.create();
  assert.equal(view.endLiveResize(), view, 'returns receiver');
});
