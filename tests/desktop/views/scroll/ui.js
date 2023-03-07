// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { run, RunLoop } from "../../../../core/system/runloop.js";
import { OverlayScrollerView, ScrollView } from "../../../../desktop/desktop.js";
import { browser } from "../../../../event/event.js";
import { platform } from "../../../../responder/responder.js";
import { ContainerView, CoreView, ImageView, View } from "../../../../view/view.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";

/*global module, test, ok, equals, expect, stop, start */

(function () {
    var appleURL="http://photos4.meetupstatic.com/photos/event/4/6/9/9/600_4518073.jpeg";
    var iv = ImageView.design({value: appleURL, layout: { height:400, width:400 }});
    var pane = ControlTestPane.design({ height: 100 })
    .add("basic", ScrollView, {

    })

    .add("basic2", ScrollView, {
        contentView: View.extend({
          layout: { height: 400, width: 400 },
          backgroundColor: 'lightblue',
          wantsAcceleratedLayer: true
        })
    })

    .add("basic3", ScrollView, {
      contentView: iv,
      isHorizontalScrollerVisible: false,
      autohidesHorizontalScroller: false,
      autohidesVerticalScroller: false
    })

    .add("basic same size content", ScrollView, {
      horizontalOverlay: true,
      verticalOverlay: true,
      contentView: View.extend({
        layout: { height: 100 },
        backgroundColor: 'lightblue'
      })
    })

    .add("disabled", ScrollView, {
      isEnabled: false
    })

    .add("verticalScrollerLayout",ScrollView, {
      contentView: iv,
      hasHorizontalScroller : false,
      verticalScrollerLayout: { right: 0, top: 0, bottom: 16 },
      isVerticalScrollerVisible: true,
      autohidesVerticalScroller: false

    })
    .add("aria-attributes", ScrollView, {
      contentView: iv
    })

    .add("overlaidScrollers", ScrollView, {
      verticalOverlay: true,
      horizontalOverlay: true
    })

    .add("overlaid touch scrollers", ScrollView, {
      contentView: iv,
      verticalOverlay: true,
      verticalScrollerView: OverlayScrollerView,
      horizontalOverlay: true,
      horizontalScrollerView: OverlayScrollerView
    })

    .add("no fade scrollers", ScrollView, {
      contentView: iv,
      verticalOverlay: true,
      verticalScrollerView: OverlayScrollerView,
      verticalFade: false,
      horizontalOverlay: true,
      horizontalScrollerView: OverlayScrollerView,
      horizontalFade: false
    });

  // ..........................................................
  // TEST VIEWS
  //
  module('ScrollView UI', pane.standardSetup());

  test("Basic presence of child views.", function (assert) {
    var view = pane.view('basic');
    assert.ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    assert.ok(!view.$().hasClass('sel'), 'should not have sel class');

    assert.equal(view.getPath('childViews.length'), 3, 'scroll view should have only three child views');

    var containerView = view.get('containerView') ;
    assert.ok(containerView, 'scroll views should have a container view');
    assert.ok(containerView.kindOf(ContainerView), 'default containerView is a kind of ContainerView');
    assert.ok(containerView.get('contentView') === null, 'default containerView should have a null contentView itself');
    assert.ok(view.get('contentView') === null, 'scroll view should have no contentView by default');
    assert.equal(containerView.getPath('childViews.length'), 0, 'containerView should have no child views');

    var horizontalScrollerView = view.get('horizontalScrollerView');
    assert.ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    assert.ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');

    var verticalScrollerView = view.get('verticalScrollerView');
    assert.ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    assert.ok(verticalScrollerView, 'default scroll view has a vertical scroller');
  });

  test("Basic class names, offsets and CSS transforms", function (assert) {
    var view = pane.view('basic2'),
      contentView = view.get('contentView'),
      elem = contentView.getPath('layer'),
      transformAttr = browser.experimentalStyleNameFor('transform'),
      transformTemplate = 'translateX(%@px) translateY(%@px) translateZ(%@px) scale(%@)';

    // CLASS
    assert.ok(view.$().hasClass('sc-scroll-view'), 'should have sc-scroll-view class');

    // HORIZONTAL SCROLLER
    var horizontalScrollerView = view.get('horizontalScrollerView');
    assert.ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    assert.ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    assert.ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');
    var maxHScroll = view.get('maximumHorizontalScrollOffset');
    assert.ok((maxHScroll > 0), 'Max horizontal scroll should be greater than zero');

    // VERTICAL SCROLLER
    var verticalScrollerView = view.get('verticalScrollerView');
    assert.ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    assert.ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    assert.ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');
    var maxVScroll = view.get('maximumVerticalScrollOffset');
    assert.ok((maxVScroll > 0), 'Max vertical scroll should be greater than zero');

    // SCROLLING VERTICALLY
    run(function() {
      view.scrollTo(0,100);
    });
    assert.equal(view.get('verticalScrollOffset'), 100, 'Vertical scrolling should adjust verticalScrollOffset');
    if (platform.get('supportsCSSTransforms')) {
      assert.equal(elem.style[transformAttr], transformTemplate.fmt(0, -100, 0, 1), 'Vertical scrolling should adjust transform on the contentView layer');
    }
    // TODO: Simulate unsupported browser and test fallback (containerView's marginTop)

    // SCROLLING HORIZONTALLY
    run(function() {
      view.scrollTo(50,0);
    });
    assert.equal(view.get('horizontalScrollOffset'), 50, 'horizontal scrolling should adjust horizontalScrollOffset');
    if (platform.get('supportsCSSTransforms')) {
      assert.equal(elem.style[transformAttr], transformTemplate.fmt(-50, 0, 0, 1), 'Horizontal scrolling should adjust transform on the contentView layer.');
    }
    // TODO: Simulate unsupported browser and test fallback (containerView's marginLeft)

    // ADJUSTING CONTENT LAYOUT WHILE SCROLLED SHOULD STAY CENTERED
    // Reproducing this bug requires that there be no adjustment already scheduled.
    run(function() {
      contentView.adjust('height', 450);
    });

    if (platform.get('supportsCSSTransforms')) {
      assert.equal(elem.style[transformAttr], transformTemplate.fmt(-50, 0, 0, 1), 'Adjusting content size should not affect scroll transform positioning');
    }
    // TODO: Simulate unsupported browser and test fallback (containerView's marginLeft)
  });

  test("Basic scroller visibility", function (assert) {
    var view = pane.view('basic3');

    run(function() { view.set('isHorizontalScrollerVisible', false); });
    assert.ok(!view.get('canScrollHorizontal'), 'cannot scroll in horizontal direction');
    var horizontalScrollerView = view.get('horizontalScrollerView');
    assert.ok(view.get('hasHorizontalScroller'), 'default scroll view wants a horizontal scroller');
    assert.ok(horizontalScrollerView, 'default scroll view has a horizontal scroller');
    assert.ok(horizontalScrollerView.$().hasClass('sc-horizontal'), 'should have sc-horizontal class');
    // var maxHScroll = view.get('maximumHorizontalScrollOffset');
    // assert.equal(maxHScroll , 0, 'Max horizontal scroll should be equal to zero');

    run(function() { view.set('isVerticalScrollerVisible', false); });
    assert.ok(!view.get('canScrollVertical'),'cannot scroll in vertical direction');
    var verticalScrollerView = view.get('verticalScrollerView');
    assert.ok(view.get('hasVerticalScroller'), 'default scroll view wants a vertical scroller');
    assert.ok(verticalScrollerView, 'default scroll view has a vertical scroller');
    assert.ok(verticalScrollerView.$().hasClass('sc-vertical'), 'should have sc-vertical class');
    // var maxVScroll = view.get('maximumVerticalScrollOffset');
    // assert.equal(maxVScroll, 0, 'Max vertical scroll should be equal to zero');
  });

  test("disabled", function (assert) {
     var view = pane.view('disabled');
     assert.ok(view.$().hasClass('disabled'), 'should have disabled class');
     assert.ok(!view.$().hasClass('sel'), 'should not have sel class');
   });

   test("non-zero bottom in vertical scrollbar", function (assert) {
      var view = pane.view('verticalScrollerLayout');
      var scroller = view.get('verticalScrollerView') ;
      assert.ok(scroller, 'should have vertical scroller view');
      assert.equal(scroller.get('layout').bottom,16, 'should have layout.bottom of scroller as ');
      assert.equal(scroller.$()[0].style.bottom,'16px', 'should have style.bottom of scroller as ');
    });

   test('ScrollView should readjust scroll transform if layer changes', function (assert) {
     var view = pane.view('basic2'), cv = view.get('contentView'),
      prevTransform;

    // Get the previous style transform.
    run(function() {
      view.scrollTo(10, 10);
      view._sc_repositionContentViewUnfiltered(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
    });
    prevTransform = cv.get('layer').style[browser.experimentalStyleNameFor('transform')];

    run(cv.replaceLayer, cv);

    assert.equal(cv.get('layer').style[browser.experimentalStyleNameFor('transform')],
      prevTransform,
      'The new layer has had the scroll transform style applied');

    // TODO: Simulate transform-not-supported environment and test fallback (marginTop/Left)
  });

  test('Scroller views of scroll view should have aria attributes set', function (assert) {
    var view = pane.view("aria-attributes"),
        horizontalScrollerView = view.get('horizontalScrollerView'),
        verticalScrollerView   = view.get('verticalScrollerView'),
        contentView            = view.get('contentView');

    assert.equal(horizontalScrollerView.$().attr('aria-controls'), contentView.get('layerId'), "horizontalScroller has aria-controls set");
    assert.equal(verticalScrollerView.$().attr('aria-controls'), contentView.get('layerId'), "verticalScroller has aria-controls set");

    assert.equal(horizontalScrollerView.$().attr('aria-orientation'), 'horizontal', "horizontalScroller has aria-orientation set");
    assert.equal(verticalScrollerView.$().attr('aria-orientation'), 'vertical', "verticalScroller has aria-orientation set");

    assert.equal(horizontalScrollerView.$().attr('aria-valuemin'), 0, "horizontalScroller has aria-valuemin set");
    assert.equal(verticalScrollerView.$().attr('aria-valuemin'), 0, "verticalScroller has aria-valuemin set");

    assert.equal(horizontalScrollerView.$().attr('aria-valuemax'), view.get('maximumHorizontalScrollOffset'), "horizontalScroller has aria-valuemax set");
    assert.equal(verticalScrollerView.$().attr('aria-valuemax'), view.get('maximumVerticalScrollOffset'), "verticalScroller has aria-valuemax set");

    assert.equal(horizontalScrollerView.$().attr('aria-valuenow'), view.get('horizontalScrollOffset'), "horizontalScroller has aria-valuenow set");
    assert.equal(verticalScrollerView.$().attr('aria-valuenow'), view.get('verticalScrollOffset'), "verticalScroller has aria-valuenow set");

    // Aria max-value should change when the content's size is adjusted.
    var previousHeight = contentView.getPath('layout.height');
    run(function() {
      contentView.adjust('height', previousHeight + 50);
    });
    assert.equal(verticalScrollerView.$().attr('aria-valuemax'), view.get('maximumVerticalScrollOffset'), 'Changing the maximum scroll offset changes the aria-maxvalue');

  });

  test('Scroller fading', function (assert) {
    var view = pane.view('overlaid touch scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        opac;
    assert.timeout = 2000;
    const done = assert.async();
    assert.expect(2);
    RunLoop.begin();
    verticalScroller.fadeOut(0.1);
    RunLoop.end();
    setTimeout(function() {
      opac = verticalScroller.$().css('opacity');
      assert.equal(opac, '0', 'after fadeout, scroller opacity should equal zero');
      RunLoop.begin();
      verticalScroller.fadeIn(0.1);
      view._sc_repositionContentViewUnfiltered(); // This method is PRIVATE. (Called here to cheat, synchronously testing an asynchronous operation.)
      RunLoop.end();
      setTimeout(function() {
        opac = verticalScroller.$().css('opacity');
        assert.equal(opac, '0.5', 'after fadein, scroller opacity should equal 0.5');
        done();
      }, 200);

    }, 1000);
  });

  test('ScrollView-directed scroller fading', function (assert) {
    var view = pane.view('overlaid touch scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        opac;

    const done = assert.async();
    assert.expect(2);
    RunLoop.begin();
    view._sc_fadeOutHorizontalScroller();
    view._sc_fadeOutVerticalScroller();
    RunLoop.end();
    setTimeout(function() {
      opac = verticalScroller.$().css('opacity');
      assert.equal(opac, '0', 'after fadeout, scroller opacity should equal zero');
      RunLoop.begin();
      view._sc_fadeInHorizontalScroller();
      view._sc_fadeInVerticalScroller();
      RunLoop.end();
      setTimeout(function() {
        opac = verticalScroller.$().css('opacity');
        assert.equal(opac, '0.5', 'after fadeout, scroller opacity should equal 0.5');
        done();
      }, 200);

    }, 1000);
  });

  test('Scrollers remain visible with horizontalFade: false, verticalFade: false', function (assert) {
    var view = pane.view('no fade scrollers'),
        verticalScroller = view.get('verticalScrollerView'),
        horizontalScroller = view.get('horizontalScrollerView'),
        horizontalOpacity,
        verticalOpacity;

    const done = assert.async();
    // stop(2000);
    assert.expect(2);
    RunLoop.begin();
    view._sc_fadeInHorizontalScroller();
    view._sc_fadeInVerticalScroller();
    RunLoop.end();
    setTimeout(function() {
      verticalOpacity = verticalScroller.$().css('opacity');
      horizontalOpacity = horizontalScroller.$().css('opacity');

      assert.equal(verticalOpacity, '0.5', 'after fadein, vertical scroller opacity should remain 0.5');
      assert.equal(horizontalOpacity, '0.5', 'after fadein, horizontal scroller opacity should remain 0.5');
      done();
    }, 1000);
  });

  test('Adjusting contentView', function (assert) {
    var view = pane.view('basic same size content');

    assert.ok(!view.get('canScrollVertical'), "PRELIM: Can't scroll vertical.");

    run(function() {
      view.contentView.adjust('height', 200);
    });

    assert.ok(view.get('canScrollVertical'), "Can now scroll vertical.");
  });

  test('Replacing contentView', function (assert) {
    var view = pane.view('basic2'),
      newContent;

    // Replacing the content view.
    run(function() {
      newContent = View.create({ backgroundColor: 'blue' });
    });
    assert.equal(newContent.get('viewState'), CoreView.UNRENDERED, 'PRELIM: New view is unrendered');

    run(function() {
      view.set('contentView', newContent);
    });
    assert.ok(view.getPath('containerView.contentView') === newContent, 'New content has been successfully loaded into the container view.');
    assert.equal(newContent.get('viewState'), CoreView.ATTACHED_SHOWN, 'New content has been rendered and attached.');

    // Replacing the content view on an unrendered view.
    run(function() {
      view = ScrollView.create();
      newContent = View.create({ backgroundColor: 'pink' });
      view.set('contentView', newContent);
    });
    assert.ok(view.getPath('containerView.contentView') === newContent, "New content has been successfully loaded into the unrendered view's container view.");

    run(function() {
      view._doRender();
    });
    assert.equal(newContent.get('viewState'), CoreView.ATTACHED_PARTIAL, 'New content renders along with the rest of the view');
  });

})();
