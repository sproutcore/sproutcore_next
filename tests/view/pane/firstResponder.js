// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { Pane, View } from '../../../view/view.js';

/*global module test equals context ok same Q$ CommonSetup */

var pane, r, view0, view1 ;
const CommonSetup = {
  beforeEach: function() {
    pane = Pane.create({
      childViews: [View, View]
    });
    view0 = pane.childViews[0];
    view1 = pane.childViews[1];

    pane.append(); // make visible so it will have root responder
    r = pane.get('rootResponder');
    assert.ok(r, 'has root responder');
  },
  afterEach: function() {
    pane.remove();
    pane.destroy();
    pane = r = view0 = view1 = null ;
  }
};

// ..........................................................
// makeFirstResponder()
//
module("Pane#makeFirstResponder", CommonSetup);

test("make firstResponder from null, not keyPane", function (assert) {
  var okCount = 0, badCount = 0;
  view0.didBecomeFirstResponder = function() { okCount ++; };

  view0.willBecomeKeyResponderFrom = view0.didBecomeKeyResponderFrom =
    function() { badCount ++; };

  pane.makeFirstResponder(view0);
  assert.equal(okCount, 1, 'should invoke didBecomeFirstResponder callbacks');
  assert.equal(badCount, 0, 'should not invoke ..BecomeKeyResponder callbacks');

  assert.equal(pane.get('firstResponder'), view0, 'should set firstResponder to view');

  assert.ok(view0.get('isFirstResponder'), 'should set view.isFirstResponder to true');
  assert.ok(!view0.get('isKeyResponder'), 'should not set view.isKeyResponder');
});


test("make firstResponder from null, is keyPane", function (assert) {
  var okCount = 0 ;
  view0.didBecomeFirstResponder =
  view0.willBecomeKeyResponderFrom = view0.didBecomeKeyResponderFrom =
    function() { okCount++; };

  pane.becomeKeyPane();
  pane.makeFirstResponder(view0);
  assert.equal(okCount, 3, 'should invoke didBecomeFirstResponder + KeyResponder callbacks');

  assert.equal(pane.get('firstResponder'), view0, 'should set firstResponder to view');

  assert.ok(view0.get('isFirstResponder'), 'should set view.isFirstResponder to true');
  assert.ok(view0.get('isKeyResponder'), 'should set view.isKeyResponder');
});


test("make firstResponder from other view, not keyPane", function (assert) {

  // preliminary setup
  pane.makeFirstResponder(view1);
  assert.equal(pane.get('firstResponder'), view1, 'precond - view1 is firstResponder');

  var okCount = 0, badCount = 0;
  view0.didBecomeFirstResponder = function() { okCount ++; };
  view1.willLoseFirstResponder = function() { okCount ++; };

  view0.willBecomeKeyResponderFrom = view0.didBecomeKeyResponderFrom =
    function() { badCount ++; };
  view1.willLoseKeyResponderTo = view0.didLoseKeyResponderTo =
    function() { badCount ++; };

  pane.makeFirstResponder(view0);
  assert.equal(okCount, 2, 'should invoke ..BecomeFirstResponder callbacks');
  assert.equal(badCount, 0, 'should not invoke ..BecomeKeyResponder callbacks');

  assert.equal(pane.get('firstResponder'), view0, 'should set firstResponder to view');

  assert.ok(view0.get('isFirstResponder'), 'should set view.isFirstResponder to true');
  assert.ok(!view0.get('isKeyResponder'), 'should not set view.isKeyResponder');

  assert.ok(!view1.get('isFirstResponder'), 'view1.isFirstResponder should now be set to false');

});


test("make firstResponder from other view, as keyPane", function (assert) {

  // preliminary setup
  pane.becomeKeyPane();
  pane.makeFirstResponder(view1);
  assert.equal(pane.get('firstResponder'), view1, 'precond - view1 is firstResponder');
  assert.ok(view1.get('isFirstResponder'), 'precond - view1.isFirstResponder should be true');
  assert.ok(view1.get('isKeyResponder'), 'precond - view1.isFirstResponder should be true');

  var okCount = 0 ;
  view0.didBecomeFirstResponder = view1.willLoseFirstResponder =
  view0.willBecomeKeyResponderFrom = view0.didBecomeKeyResponderFrom =
  view1.willLoseKeyResponderTo = view1.didLoseKeyResponderTo =
    function() { okCount ++; };

  pane.makeFirstResponder(view0);
  assert.equal(okCount, 6, 'should invoke FirstResponder + KeyResponder callbacks on both views');

  assert.equal(pane.get('firstResponder'), view0, 'should set firstResponder to view');

  assert.ok(view0.get('isFirstResponder'), 'should set view.isFirstResponder to true');
  assert.ok(view0.get('isKeyResponder'), 'should set view.isKeyResponder');

  assert.ok(!view1.get('isFirstResponder'), 'view1.isFirstResponder should now be set to false');
  assert.ok(!view1.get('isKeyResponder'), 'view1.isFirstResponder should now be set to false');

});


test("makeFirstResponder(view) when view is already first responder", function (assert) {

  // preliminary setup
  pane.becomeKeyPane();
  pane.makeFirstResponder(view0);
  assert.equal(pane.get('firstResponder'), view0, 'precond - view0 is firstResponder');
  assert.ok(view0.get('isFirstResponder'), 'precond - view0.isFirstResponder should be true');
  assert.ok(view0.get('isKeyResponder'), 'precond - view0.isFirstResponder should be true');

  var callCount = 0 ;
  view0.didBecomeFirstResponder = view0.willLoseFirstResponder =
  view0.willBecomeKeyResponderFrom = view0.didBecomeKeyResponderFrom =
  view0.willLoseKeyResponderTo = view0.didLoseKeyResponderTo =
    function() { callCount ++; };

  pane.makeFirstResponder(view0);
  assert.equal(callCount, 0, 'should invoke no FirstResponder + KeyResponder callbacks on view');

  assert.equal(pane.get('firstResponder'), view0, 'should keep firstResponder to view');
  assert.ok(view0.get('isFirstResponder'), 'should keep view.isFirstResponder to true');
  assert.ok(view0.get('isKeyResponder'), 'should keep view.isKeyResponder');

});
