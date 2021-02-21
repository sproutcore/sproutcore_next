// ==========================================================================
// Project:   SproutCore
// License:   Licensed under MIT license
// ==========================================================================
/*globals CoreTest, module, test, ok, equals, same, expect, start, stop */

import { SC } from '../../../core/core.js';
import { ControlTestPane } from '../test_support/control_test_pane.js';
import { SwipeGesture, AUTOCAPITALIZE_NONE, AUTOCAPITALIZE_SENTENCES, AUTOCAPITALIZE_WORDS, AUTOCAPITALIZE_CHARACTERS, MainPane } from '../../../view/view.js';


var gesture;
module("SwipeGesture", {

  beforeEach: function () {
    gesture = SwipeGesture;
  },

  afterEach: function () {
    if (gesture.destroy) { gesture.destroy(); }
    gesture = null;
  }
});

/* Properties */
test("Default Properties:", function (assert) {
  gesture = gesture.create();
  assert.equal(gesture.name, 'swipe', "The default value of name is");
});

/* Methods */
// This method tests the given angle against an approved angle within tolerance.
test("Method: _sc_testAngle", function (assert) {
  gesture = gesture.create({});

  var testAngle,
      targetAngle;

  // Test the target angle 0°.
  targetAngle = 0;
  testAngle = 6;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 5;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 4;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 0;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -4;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -5;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -6;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle 180°.
  targetAngle = 180;
  testAngle = -174;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -175;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -176;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 180;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 176;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 175;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 174;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle -180°.
  targetAngle = -180;
  testAngle = -174;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -175;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -176;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 180;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 176;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 175;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 174;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle 90°.
  targetAngle = 90;
  testAngle = 96;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 95;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 94;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 90;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 86;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 85;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 84;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -90;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is the inverse of the target, %@°, the method returns".fmt(testAngle, targetAngle));

  // Test the target angle -90°.
  targetAngle = -90;
  testAngle = -96;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -95;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -94;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the positive tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -90;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the target angle for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -86;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is within the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -85;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), true, "If the angle, %@, is equal to the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = -84;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is outside of the negative tolerance for target, %@°, the method returns".fmt(testAngle, targetAngle));

  testAngle = 90;
  assert.equal(gesture._sc_testAngle(Math.abs(testAngle), testAngle >= 0, targetAngle, 5), false, "If the angle, %@, is the inverse of the target, %@°, the method returns".fmt(testAngle, targetAngle));
});
