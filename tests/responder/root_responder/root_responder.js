// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// ========================================================================
// RootResponder Tests
// ========================================================================
/*global module, test, ok, equals */


import { browser } from '../../../event/event.js';
import { RootResponder } from '../../../responder/responder.js';

var responder;

module("RootResponder", {
	beforeEach: function() {
		responder = RootResponder.create();
	},
	
	afterEach: function() {
    responder.destroy();
  }
});

test("Basic requirements", function (assert) {
  assert.ok(RootResponder, "RootResponder");
  assert.ok(RootResponder.responder && RootResponder.responder, "RootResponder.responder");
  assert.equal(
    RootResponder.responder ? RootResponder.responder.constructor : "no responder!",
    RootResponder,
    "RootResponder.responder is an instance of"
  );
});

test("root_responder.ignoreTouchHandle() : Should ignore TEXTAREA, INPUT, A, and SELECT elements", function (assert) {
 var wasMobileSafari = browser.isMobileSafari;
 browser.isMobileSafari = true;
 const K = function() {};

 ["A", "INPUT", "TEXTAREA", "SELECT"].forEach(function (tag) {
   assert.ok(responder.ignoreTouchHandle({
     target: { tagName: tag },
     allowDefault: K
   }), "should pass touch events through to &lt;" + tag + "&gt; elements");
 });

 ["AUDIO", "B", "Q", "BR", "BODY", "BUTTON", "CANVAS", "FORM",
  "IFRAME", "IMG", "OPTION", "P", "PROGRESS", "STRONG",
  "TABLE", "TBODY", "TR", "TH", "TD", "VIDEO"].forEach(function (tag) {
   assert.ok(!responder.ignoreTouchHandle({
     target: { tagName: tag },
     allowDefault: K
   }), "should falseT pass touch events through to &lt;" + tag + "&gt; elements");
 });

 browser.isMobileSafari = wasMobileSafari;
});
