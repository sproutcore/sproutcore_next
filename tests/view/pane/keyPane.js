// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ CommonSetup */


import { SC } from '../../../core/core.js';
import { Pane, View } from '../../../view/view.js';

var pane, r, view ;
const CommonSetup = {
  beforeEach: function() {
    pane = Pane.create({
      childViews: [View]
    });
    view = pane.childViews[0];
    pane.makeFirstResponder(view);

    pane.append(); // make visible so it will have root responder
    r = pane.get('rootResponder');
    assert.ok(r, 'has root responder');
  },
  afterEach: function() {
    pane.remove();
    pane.destroy();
    pane = r = view = null ;
  }
};

// ..........................................................
// becomeKeyPane()
//
module("Pane#becomeKeyPane", CommonSetup);

test("should become keyPane if not already keyPane", function (assert) {
  assert.ok(r.get('keyPane') !== pane, 'precond - pane is not currently key');

  pane.becomeKeyPane();
  assert.equal(r.get('keyPane'), pane, 'pane should be keyPane');
  assert.equal(pane.get('isKeyPane'), true, 'isKeyPane should be set to true');
});

test("should do nothing if acceptsKeyPane is false", function (assert) {
  assert.ok(r.get('keyPane') !== pane, 'precond - pane is not currently key');

  pane.acceptsKeyPane = false ;
  pane.becomeKeyPane();
  assert.ok(r.get('keyPane') !== pane, 'pane should not be keyPane');
  assert.equal(pane.get('isKeyPane'), false, 'isKeyPane should be false');
});

test("should invoke willBecomeKeyPane & didBecomeKeyPane", function (assert) {
  var callCount = 0 ;
  pane.willBecomeKeyPaneFrom = pane.didBecomeKeyPaneFrom = function() {
    callCount++;
  };

  pane.becomeKeyPane();
  assert.equal(callCount, 2, 'should invoke both callbacks');

  callCount = 0;
  pane.becomeKeyPane();
  assert.equal(callCount, 0, 'should not invoke callbacks if already key pane');
});

test("should invoke callbacks and update isKeyResponder state on firstResponder", function (assert) {
  var callCount = 0;
  view.willBecomeKeyResponderFrom = view.didBecomeKeyResponderFrom =
    function() { callCount++; };

  assert.equal(view.get('isKeyResponder'), false, 'precond - view is not keyResponder');
  assert.equal(view.get('isFirstResponder'), true, 'precond - view is firstResponder');

  pane.becomeKeyPane();
  assert.equal(callCount, 2, 'should invoke both callbacks');
  assert.equal(view.get('isKeyResponder'), true, 'should be keyResponder');
});

// ..........................................................
// resignKeyPane()
//
module("Pane#resignKeyPane", CommonSetup);

test("should resign keyPane if keyPane", function (assert) {
  pane.becomeKeyPane();
  assert.ok(r.get('keyPane') === pane, 'precond - pane is currently key');

  pane.resignKeyPane();
  assert.ok(r.get('keyPane') !== pane, 'pane should falseT be keyPane');
  assert.equal(pane.get('isKeyPane'), false, 'isKeyPane should be set to false');
});

// technically this shouldn't happen, but someone could screw up and change
// acceptsKeyPane to false once the pane has already become key
test("should still resign if acceptsKeyPane is false", function (assert) {
  pane.becomeKeyPane();
  assert.ok(r.get('keyPane') === pane, 'precond - pane is currently key');

  pane.acceptsKeyPane = false ;
  pane.resignKeyPane();
  assert.ok(r.get('keyPane') !== pane, 'pane should falseT be keyPane');
  assert.equal(pane.get('isKeyPane'), false, 'isKeyPane should be set to false');
});

test("should invoke willLoseKeyPaneTo & didLoseKeyPaneTo", function (assert) {
  pane.becomeKeyPane();
  assert.ok(r.get('keyPane') === pane, 'precond - pane is currently key');

  var callCount = 0 ;
  pane.willLoseKeyPaneTo = pane.didLoseKeyPaneTo = function() {
    callCount++;
  };

  pane.resignKeyPane();
  assert.equal(callCount, 2, 'should invoke both callbacks');

  callCount = 0;
  pane.resignKeyPane();
  assert.equal(callCount, 0, 'should not invoke callbacks if already key pane');
});

test("should invoke callbacks and update isKeyResponder state on firstResponder", function (assert) {
  var callCount = 0;
  view.willLoseKeyResponderTo = view.didLoseKeyResponderTo =
    function() { callCount++; };

  pane.becomeKeyPane();
  assert.equal(view.get('isKeyResponder'), true, 'precond - view is keyResponder');
  assert.equal(view.get('isFirstResponder'), true, 'precond - view is firstResponder');

  pane.resignKeyPane();
  assert.equal(callCount, 2, 'should invoke both callbacks');
  assert.equal(view.get('isKeyResponder'), false, 'should be keyResponder');
});

