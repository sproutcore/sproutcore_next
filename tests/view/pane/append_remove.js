// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane } from '../../../view/view.js';
import { htmlbody, clearHtmlbody } from '../../../testing/testing.js';
const Q$ = jQuery;

// ..........................................................
// appendTo()
//
module("Pane#appendTo", {
  beforeEach: function(){
    htmlbody('<div id="appendtest"></div>');
  },
  afterEach: function(){
    clearHtmlbody()
  }
});

test("adding to document for first time - appendTo(elem)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  var elem = Q$('body').get(0);
  assert.ok(elem, 'precond - found element to add to');

  // now add
  pane.appendTo(elem);
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, elem, 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("adding to document for first time - appendTo(string)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  // now add
  pane.appendTo("#appendtest");
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, jQuery("#appendtest")[0], 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("adding to document for first time - appendTo(jquery)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  // now add
  pane.appendTo(jQuery("#appendtest"));
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, jQuery("#appendtest")[0], 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("adding to document for first time - prependTo(elem)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  var elem = Q$('body').get(0);
  assert.ok(elem, 'precond - found element to add to');

  // now add
  pane.prependTo(elem);
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, elem, 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("adding to document for first time - prependTo(string)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  // now add
  pane.prependTo("#appendtest");
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, jQuery("#appendtest")[0], 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("adding to document for first time - prependTo(jquery)", function (assert) {
  var pane = Pane.create();
  assert.ok(!pane.get('layer'), 'precond - does not yet have layer');
  assert.ok(!pane.get('isVisibleInWindow'), 'precond - isVisibleInWindow = false');

  // now add
  pane.prependTo(jQuery("#appendtest"));
  var layer = pane.get('layer');
  assert.ok(layer, 'should create layer');
  assert.equal(layer.parentNode, jQuery("#appendtest")[0], 'layer should belong to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});


test("adding a pane twice should have no effect", function (assert) {
  var cnt = 0;
  var pane = Pane.create();
  pane.didAppendToDocument = function() {
    cnt++;
  };
  pane.append();
  pane.append();
  assert.equal(cnt, 1, 'should only append once');

  // Clean up.
  pane.destroy();
});

test("Pane#append correctly returns the receiver.", function (assert) {
  var pane = Pane.create(),
    ret = pane.append();

  assert.equal(pane, ret, 'Pane#append returns the receiver');

  // Clean up.
  pane.destroy();
});


test("adding/remove/adding pane", function (assert) {
  var pane = Pane.create();
  var elem1 = Q$('body').get(0), elem2 = Q$('#appendtest').get(0);
  assert.ok(elem1 && elem2, 'precond - has elem1 && elem2');

  pane.appendTo(elem1);
  var layer = pane.get('layer');
  assert.ok(layer, 'has layer');
  assert.equal(layer.parentNode, elem1, 'layer belongs to parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow is true before remove');
  pane.remove();
  assert.ok(!pane.get('isVisibleInWindow'), 'isVisibleInWindow is false');

  pane.appendTo(elem2);
  layer = pane.get('layer');
  assert.equal(layer.parentNode, elem2, 'layer moved to new parent');
  assert.ok(pane.get('isVisibleInWindow'), 'isVisibleInWindow should  = true');
  assert.ok(pane.rootResponder, 'should have rootResponder');

  // Clean up.
  pane.destroy();
});

test("removeFromParent throws an exception", function (assert) {
  var pane, exceptionCaught = false;

  try {
    pane = Pane.create();
    pane.append();
    pane.removeFromParent();
  } catch(e) {
    exceptionCaught = true;
  } finally {
    pane.remove();
  }

  assert.ok(exceptionCaught, "trying to call removeFromParent on a pane throws an exception");

  // Clean up.
  pane.destroy();
});

// ..........................................................
// remove()
//
module("Pane#remove");

test("removes pane from DOM", function (assert) {
  var pane = Pane.create();
  var elem = Q$('body').get(0);
  var layer;

  pane.appendTo(elem);
  layer = pane.get('layer');
  assert.ok(elem, 'precond - found element to add to');

  pane.remove();
  assert.ok(layer.parentNode !== elem, 'layer no longer belongs to parent');
  assert.ok(!pane.get('isVisibleInWindow'), 'isVisibleInWindow is false');

  // Clean up.
  pane.destroy();
});


// ..........................................................
// SPECIAL CASES
//

// WARNING: this test relies on the yuireset.css being loaded.
test("updates frame and clippingFrame when loading MainPane", function (assert) {

  // needs a fixed layout size to make sure the sizes stay constant
  var pane = MainPane.create();
  var windowWidth = RootResponder.responder.computeWindowSize().width;
  
  // add the pane to the main window.  should resize the frames
  SC.run(function() {
    pane.append();
  });

  // should equal window size
  assert.equal(pane.get('frame').width, windowWidth, 'frame width should have changed');
  assert.equal(pane.get('clippingFrame').width, windowWidth, 'clippingFrame width should have changed');

  // Clean up.
  pane.destroy();
});

