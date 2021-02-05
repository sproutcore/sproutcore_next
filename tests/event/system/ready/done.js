// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC, GLOBAL } from "/core/core.js";

var realMainFunction, realApplicationMode, timesMainCalled;
module("onReady.done", {
  beforeEach: function() {
    timesMainCalled = 0;

    realMainFunction = GLOBAL.main;
    GLOBAL.main = function() {
      timesMainCalled += 1;
    };

    realApplicationMode = SC.mode;
  },

  afterEach: function() {
    GLOBAL.main = realMainFunction;
    SC.mode = realApplicationMode;
    SC.isReady = false;
  }
});

test("When the application is done loading in test mode", function (assert) {
  SC.mode = "TEST_MODE";
  SC.onReady.done();

  assert.equal(timesMainCalled, 0, "main should not have been called");
});

test("When the application is done loading in application mode", function (assert) {
  SC.mode = "APP_MODE";
  SC.onReady.done();

  assert.equal(timesMainCalled, 1, "main should have been called");
});
