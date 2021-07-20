// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, htmlbody, ok, equals, same, stop, start*/

import { ControlTestPane } from '../test_support/control_test_pane.js';
import { CoreView, View, Page, LabelView, ContainerView } from '../../../view/view.js';
import { SC } from '../../../core/core.js';

// htmlbody('<style> .sc-control-test-pane .wrapper { overflow: none; } </style>');

(function() {
  var pane = ControlTestPane.design({ height: 100 });

  pane.add("basic", ContainerView, {
    isEnabled: true
  });

  pane.add("disabled", ContainerView, {
    isEnabled: false
  });

  pane.add("nowShowingDefault", ContainerView, {
    nowShowing: 'start',

    start: LabelView.design({
      value: 'Start'
    })

  });

  pane.add("deepNowShowing", ContainerView, {
    viewPage: Page.extend({
      view1: View,
      view2: View
    }),
    init: function init () { 
      // sc_super(); 
      init.base.apply(this, arguments);
      this.viewPage = this.viewPage.create(); 
    } // have to create page
  });

  pane.add("nestedContainer", ContainerView, {
    nowShowing: 'container1',

    container1: ContainerView.create({
      nowShowing: 'view1',

      view1: View.create(),
      view2: View.create()
    }),
    container2: ContainerView.create({
      nowShowing: 'view3',

      view3: View.create(),
      view4: View.create()
    })
  });

  pane.add("cleans-up-views", ContainerView, {
    nowShowing: 'uninstantiatedView',

    uninstantiatedView: View
  });

    // .add("disabled - single selection", ListView, {
    //   isEnabled: false,
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: singleSelection
    // })
    //
    // .add("single selection", ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: singleSelection
    // })
    //
    // .add("multiple selection, contiguous", ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: multiSelectionContiguous
    // })
    //
    // .add("multiple selection, discontiguous", ListView, {
    //   content: content,
    //   contentValueKey: 'title',
    //   selection: multiSelectionDiscontiguous
    // })

  // ..........................................................
  // TEST VIEWS
  //
  module('ContainerView UI', pane.standardSetup());

  test("basic", function (assert) {
    var view = pane.view('basic');
    assert.ok(!view.$().hasClass('disabled'), 'should not have disabled class');
    assert.ok(!view.$().hasClass('sel'), 'should not have sel class');

    var contentView = view.get('contentView') ;

    // assert.ok(contentView.SC.kindOf(ContainerView), 'default contentView is an ContainerView');
    // assert.ok(contentView.get('contentView') === null, 'default contentView should have no contentView itself');
  });

  test("disabled", function (assert) {
    var view = pane.view('disabled');
    assert.ok(view.$().hasClass('disabled'), 'should have disabled class');
    assert.ok(!view.$().hasClass('sel'), 'should not have sel class');
  });

  // test("disabled - single selection", function() {
  //   var view = pane.view('disabled - single selection');
  //   assert.ok(view.$().hasClass('disabled'), 'should have disabled class');
  //   assert.ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
  //  });
  //
  //  test("single selection", function() {
  //    var view = pane.view('single selection');
  //    assert.ok(view.itemViewAtContentIndex(0).$().hasClass('sc-collection-item'), 'should have sc-collection-item class');
  //    assert.ok(view.itemViewAtContentIndex(0).$().hasClass('sel'), 'should have sel class');
  //   });

  test("changing nowShowing", function (assert) {
    var view = pane.view('basic');
    // Set nowShowing to an instantiated object.
    var viewToAdd = LabelView.create({value: 'View1'});
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView').get('value'), 'View1', 'contentView changes as intended when an instantiated view is passed to nowShowing');

    // Set nowShowing to an uninstantiated object.
    viewToAdd = LabelView.design({value: 'View2'});
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView').get('value'), 'View2', 'contentView changes as intended when an uninstantiated view (class) is passed to nowShowing');

    // Set nowShowing to an CoreView
    viewToAdd = CoreView.design({value: 'View5'});
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView').get('value'), 'View5', 'contentView instantiates and inserts an CoreView');

    // Set nowShowing to a non-view object.
    viewToAdd = SC.Object;
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a non-view');

    // Set nowShowing to a string.
    var viewForString = LabelView.create({value: 'View3'});
    view.set('label', viewForString);
    view.set('nowShowing', 'label');
    assert.equal(view.get('contentView').get('value'), 'View3', 'contentView changes as intended when an instantiated view is passed to nowShowing');

    // Set nowShowing to a nonexistent string.
    viewToAdd = 'NonexistentNamespace.NonexistentViewClass';
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to a string pointing at nothing');

    // Set nowShowing to null.
    viewToAdd = null;
    view.set('nowShowing', viewToAdd);
    assert.equal(view.get('contentView'), null, 'contentView changes to null when nowShowing is set to null');

  });

  test("default nowShowing", function (assert) {
    var view = pane.view("nowShowingDefault");

    var contentView = view.get('contentView');

    // contentView should reflect nowShowing
    assert.ok(contentView, "should have contentView");
    assert.equal(contentView.get('value'), 'Start', 'contentView value should be "Start"');

  });

  test("nowShowing as local property path", function (assert) {
    var view = pane.view('deepNowShowing');

    view.set("nowShowing", '.viewPage.view1');

    assert.ok(view.get('contentView') === view.getPath('viewPage.view1'), "Setting nowShowing to a local property path correctly updates the contentView.");
  });

  test("Cleans up instantiated views", function (assert) {
    var view = pane.view("cleans-up-views");

    var contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', View.create()); });
    assert.equal(contentView.isDestroyed, true, "should have destroyed the previous view it instantiated (from path)");

    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', View.extend()); });
    assert.equal(contentView.isDestroyed, false, "should not have destroyed the previous view because it was already instantiated");

    contentView = view.get('contentView');
    SC.run(function() { view.set('nowShowing', null); });
    assert.equal(contentView.isDestroyed, true, "should have destroyed the previous view it instantiated (from class)");
  });

  test("Nested container view", function (assert) {
    var view = pane.view('nestedContainer'),
      container1 = view.get('container1'),
      container2 = view.get('container2');

    assert.equal(container1.get('isVisibleInWindow'), true, "nowShowing#view1: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), true, "nowShowing#view1: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view1: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), false, "nowShowing#view1: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view1: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view1: view4 visbility should be");

    assert.equal(container1.getPath('frame.height'), 100, 'nowShowing#view1: container1 height should be');
    assert.equal(container1.getPath('view1.frame.height'), 100, 'nowShowing#view1: view1 height should be');


    container1.set("nowShowing", 'view2');

    assert.equal(container1.get('isVisibleInWindow'), true, "nowShowing#view2: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view2: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), true, "nowShowing#view2: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), false, "nowShowing#view2: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view2: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view2: view4 visbility should be");

    assert.equal(container1.getPath('view2.frame.height'), 100, 'nowShowing#view2: view2 height should be');


    view.set("nowShowing", 'container2');

    assert.equal(container1.get('isVisibleInWindow'), false, "nowShowing#view3: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view3: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view3: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), true, "nowShowing#view3: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), true, "nowShowing#view3: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view3: view4 visbility should be");

    assert.equal(container2.getPath('frame.height'), 100, 'nowShowing#view3: container2 height should be');
    assert.equal(container2.getPath('view3.frame.height'), 100, 'nowShowing#view3: view3 height should be');


    container2.set("nowShowing", 'view4');

    assert.equal(container1.get('isVisibleInWindow'), false, "nowShowing#view4: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view4: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view4: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), true, "nowShowing#view4: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view4: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), true, "nowShowing#view4: view4 visbility should be");

    assert.equal(container2.getPath('frame.height'), 100, 'nowShowing#view4: container2 height should be');
    assert.equal(container2.getPath('view4.frame.height'), 100, 'nowShowing#view4: view4 height should be');


    container1.set("nowShowing", 'view1');
    view.set("nowShowing", 'container1');

    assert.equal(container1.get('isVisibleInWindow'), true, "nowShowing#view1: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), true, "nowShowing#view1: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view1: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), false, "nowShowing#view1: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view1: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), false, "nowShowing#view1: view4 visbility should be");

    assert.equal(container1.getPath('frame.height'), 100, 'nowShowing#view1: container1 height should be');
    assert.equal(container1.getPath('view1.frame.height'), 100, 'nowShowing#view1: view1 height should be');


    container2.get('view4').adjust('top', 10); 
    view.set("nowShowing", 'container2');

    assert.equal(container1.get('isVisibleInWindow'), false, "nowShowing#view4: container1 visbility should be");
    assert.equal(container1.getPath('view1.isVisibleInWindow'), false, "nowShowing#view4: view1 visbility should be");
    assert.equal(container1.getPath('view2.isVisibleInWindow'), false, "nowShowing#view4: view2 visbility should be");
    assert.equal(container2.get('isVisibleInWindow'), true, "nowShowing#view4: container2 visbility should be");
    assert.equal(container2.getPath('view3.isVisibleInWindow'), false, "nowShowing#view4: view3 visbility should be");
    assert.equal(container2.getPath('view4.isVisibleInWindow'), true, "nowShowing#view4: view4 visbility should be");

    assert.equal(container2.getPath('frame.height'), 100, 'nowShowing#view4: container2 height should be');
    assert.equal(container2.getPath('view4.frame.height'), 90, 'nowShowing#view4: view4 height should be');

  });

})();
