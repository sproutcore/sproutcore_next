// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect */
import { SC } from '../../../core/core.js';
import { ControlTestPane } from '../test_support/control_test_pane.js';
import { TapGesture, AUTOCAPITALIZE_NONE, AUTOCAPITALIZE_SENTENCES, AUTOCAPITALIZE_WORDS, AUTOCAPITALIZE_CHARACTERS, MainPane } from '../../../view/view.js';



var gesture;
module("TapGesture", {

  beforeEach: function () {
    gesture = TapGesture;
  },

  afterEach: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */
test("Default Properties:", function (assert) {
  gesture = gesture.create();
  assert.equal(gesture.name, 'tap', "The default value of name is");
  assert.equal(gesture.touchUnityDelay, 75, "The default value of touchUnityDelay is");
  assert.equal(gesture.tapLengthDelay, 250, "The default value of tapLengthDelay is");
  assert.equal(gesture.tapStartDelay, 150, "The default value of tapStartDelay is");
  assert.equal(gesture.tapWiggle, 10, "The default value of tapWiggle is");
});

/* Methods */

// This method returns true if the new touch is not too much later than the first touch.
// test("Method: touchAddedToSession");
// test("Method: touchCancelledInSession");
// test("Method: touchEndedInSession");
// test("Method: touchesMovedInSession");
// test("Method: touchSessionCancelled");
// test("Method: touchSessionEnded");

// This method registers _sc_firstTouchAddedAt & creates the _sc_tapStartTimer.
test("Method: touchSessionStarted", function (assert) {
  gesture = gesture.create({
    view: {}
  });
  assert.equal(gesture.touchSessionStarted(), undefined, "The method returns");

  assert.ok(gesture._sc_firstTouchAddedAt !== null, 'set', 'set', "The value of _sc_firstTouchAddedAt has been");
  assert.ok(gesture._sc_tapStartTimer !== null, 'created', 'created', "The timer _sc_tapStartTimer has been");
  assert.equal(gesture._sc_tapStartTimer.interval, gesture.get('tapStartDelay'), "The timer has the interval equal to tapStartDelay of");
});

// // This method calls start.
// test("Method: _sc_triggerTapStart", function (assert) {

// });
