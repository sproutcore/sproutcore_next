// ==========================================================================
// Project:   SproutCore
// Copyright: @2012 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTest, module, test, equals, same*/

import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';

var pane1, pane2;


module("RootResponder Design Mode Support", {
  beforeEach: function() {
    pane1 = Pane.create({
      updateDesignMode: CoreTest.stub('updateDesignMode', Pane.prototype.updateDesignMode)
    }).append();

    pane2 = Pane.create({
      updateDesignMode: CoreTest.stub('updateDesignMode', Pane.prototype.updateDesignMode)
    }).append();
  },

  afterEach: function() {
    pane1.remove();
    pane2.remove();
    pane1 = pane2 = null;
  }

});

test("When you set designModes on the root responder, it preps internal arrays.", function (assert) {
  var windowSize,
    designModes,
    responder = RootResponder.responder;

  windowSize = responder.get('currentWindowSize');

  assert.equal(responder._designModeNames, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
  assert.equal(responder._designModeThresholds, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");

  designModes = { small: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, large: Infinity };

  responder.set('designModes', designModes);
  assert.deepEqual(responder._designModeNames, ['small', 'large'], "If designModes value is set, there should be an ordered _designModeNames internal array.");
  assert.deepEqual(responder._designModeThresholds, [((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, Infinity], "If designModes value is set, there should be an ordered_designModeNames internal array.");

  designModes = { small: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, medium: ((windowSize.width + 10) * (windowSize.height + 10)) / window.devicePixelRatio, large: Infinity };

  responder.set('designModes', designModes);
  assert.deepEqual(responder._designModeNames, ['small', 'medium', 'large'], "If designModes value is set, there should be an ordered _designModeNames internal array.");
  assert.deepEqual(responder._designModeThresholds, [((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, ((windowSize.width + 10) * (windowSize.height + 10)) / window.devicePixelRatio, Infinity], "If designModes value is set, there should be an ordered_designModeNames internal array.");

  responder.set('designModes', null);
  assert.equal(responder._designModeNames, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
  assert.equal(responder._designModeThresholds, undefined, "If no designModes value is set, there should not be any _designModeNames internal array.");
});

test("When you set designModes on the root responder, it calls updateDesignMode on all its panes.", function (assert) {
  var windowSize,
    designModes,
    responder = RootResponder.responder;

  windowSize = responder.get('currentWindowSize');

  pane1.updateDesignMode.expect(1);
  pane2.updateDesignMode.expect(1);

  designModes = { small: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, large: Infinity };

  responder.set('designModes', designModes);
  pane1.updateDesignMode.expect(2);
  pane2.updateDesignMode.expect(2);

  designModes = { small: ((windowSize.width - 10) * (windowSize.height - 10)) / window.devicePixelRatio, medium: ((windowSize.width + 10) * (windowSize.height + 10)) / window.devicePixelRatio, large: Infinity };

  responder.set('designModes', designModes);
  pane1.updateDesignMode.expect(3);
  pane2.updateDesignMode.expect(3);

  responder.set('designModes', null);
  pane1.updateDesignMode.expect(4);
  pane2.updateDesignMode.expect(4);
});
