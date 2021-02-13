// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */


import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane } from '../../../view/view.js';

var responder, menu;

module("RootResponder#makeMenuPane", {
  beforeEach: function() {
    responder = RootResponder.create();
    menu = Pane.create({
      acceptsMenuPane: true
    });
  },
  
  afterEach: function() {
    menu.remove();
    menu = responder = null;
  }
});

test("Returns receiver", function (assert) {
  assert.equal(responder.makeMenuPane(menu), responder, 'returns receiver');
});

test("Sets RootResponder's menuPane", function (assert) {
  assert.equal(responder.get('menuPane'), null, 'precond - menuPane should be null by default');
  responder.makeMenuPane(menu);
  assert.equal(responder.get('menuPane'), menu, 'menuPane should be passed menu');
});

test("menuPane does not affect keyPane", function (assert) {
  var p2 = Pane.create();
  responder.makeKeyPane(p2);
  assert.equal(responder.get('keyPane'), p2, 'precond - pane should be key pane');
  responder.makeMenuPane(menu);
  assert.equal(responder.get('menuPane'), menu, 'menuPane should be set');
  assert.equal(responder.get('keyPane'), p2, 'key pane should not change');
});

test("Pane should not become menu pane if acceptsMenuPane is not true", function (assert) {
  menu.set('acceptsMenuPane', false);
  responder.makeMenuPane(menu);
  assert.equal(responder.get('menuPane'), null, 'menuPane should remain null');
});
