// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { Pane, View } from '../../../view/view.js';

/*global module test equals context ok same Q$ htmlbody */
var pane, fooView, barView, defaultResponder, evt, callCount ;
module("Pane#sendEvent", {
  beforeEach: function() {

    callCount = 0;
    var handler = function(theEvent) {
      callCount++ ;
      assert.equal(theEvent, evt, 'should pass event');
    };

    defaultResponder = SC.Object.create({ defaultEvent: handler });
    pane = Pane.create({
      defaultResponder: defaultResponder,
      paneEvent: handler,
      childViews: ['fooView'],
      fooView: View.extend({
        fooEvent: handler,
        childViews: ['barView'],
        barView: View.extend({
          barEvent: handler
        })
      })
    });
    fooView = pane.fooView;
    assert.ok(fooView.fooEvent, 'fooView has fooEvent handler');

    barView = fooView.barView;
    assert.ok(barView.barEvent, 'barView has barEvent handler');

    evt = SC.Object.create(); // mock
  },

  afterEach: function() {
    pane.destroy();
    pane = fooView = barView = defaultResponder = evt = null ;
  }
});

test("when invoked with target = nested view", function (assert) {
  var handler;

  // test event handler on target
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt, barView);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, barView, 'should return view that handled event');

  // test event handler on target parent
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt, barView);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, fooView, 'should return responder that handled event');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendEvent('defaultEvent', evt, barView);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, defaultResponder, 'should return responder that handled event');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendEvent('imaginary', evt, barView);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

});



test("when invoked with target = middle view", function (assert) {
  var handler ;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt, fooView);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on target
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt, fooView);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, fooView, 'should return responder that handled event');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendEvent('defaultEvent', evt, fooView);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, defaultResponder, 'should return responder that handled event');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendEvent('imaginary', evt, fooView);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

});



test("when invoked with target = pane", function (assert) {
  var handler ;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt, pane);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on target
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt, pane);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendEvent('defaultEvent', evt, pane);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, defaultResponder, 'should return responder that handled event');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendEvent('imaginary', evt, pane);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

});



test("when invoked with target = deepest descendent view and cutoff view = middle view to cut off the responder chain", function (assert) {
  var handler;

  // Test arrested event handling where a handler exists on responder chain but above the cutoff view.
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt, barView, fooView);
  assert.equal(callCount, 0, 'should not invoke handler found on responder chain but above the cutoff view');
  assert.equal(handler, null, 'should return no responder');

  // Test arrested event handling a handler exists within the truncated responder chain.
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt, barView, fooView);
  assert.equal(callCount, 1, 'should invoke handler found within truncated responder chain');
  assert.equal(handler, barView, 'should return barView as having handled barEvent');

  // Test that defaultResponder is falseT given an opportunity to handle an arrested event
  callCount = 0;
  handler = pane.sendEvent('defaultEvent', evt, barView, fooView);
  assert.equal(callCount, 0, 'should not invoke default handler if the responder chain is truncated');
  assert.equal(handler, null, 'should return no responder');

});



test("when invoked with target = null", function (assert) {
  var handler ;

  // should start @ first responder
  pane.firstResponder = fooView;

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on target
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, fooView, 'should return responder that handled event');

  // test event handler on default responder
  callCount = 0;
  handler = pane.sendEvent('defaultEvent', evt);
  assert.equal(callCount, 1, 'should invoke handler');
  assert.equal(handler, defaultResponder, 'should return responder that handled event');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendEvent('imaginary', evt);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on pane itself
  callCount = 0;
  handler = pane.sendEvent('paneEvent', evt);
  assert.equal(callCount, 1, 'should invoke handler on pane');
  assert.equal(handler, pane, 'should return pane as responder that handled event');

});

test("when invoked with target = null, no default or first responder", function (assert) {
  var handler ;

  // no first or default responder
  pane.set('firstResponder', null);
  pane.set('defaultResponder', null);

  // test event handler on child view of target
  callCount = 0;
  handler = pane.sendEvent('barEvent', evt);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on target
  callCount = 0;
  handler = pane.sendEvent('fooEvent', evt);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test unhandled event handler
  callCount = 0;
  handler = pane.sendEvent('imaginary', evt);
  assert.equal(callCount, 0, 'should not invoke handler');
  assert.equal(handler, null, 'should return no responder');

  // test event handler on pane itself
  callCount = 0;
  handler = pane.sendEvent('paneEvent', evt);
  assert.equal(callCount, 1, 'should invoke handler on pane');
  assert.equal(handler, pane, 'should return pane as responder that handled event');

});
