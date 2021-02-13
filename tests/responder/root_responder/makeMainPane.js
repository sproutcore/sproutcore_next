// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane } from '../../../view/view.js';

/*global module, test, equals, ok */
module("RootResponder#makeMainPane");

test("returns receiver", function (assert) {
  var p1 = Pane.create();
  var r = RootResponder.create();
  assert.equal(r.makeMainPane(p1), r, 'returns receiver');
});

test("changes mainPane to new pane", function (assert) {
  var p1 = Pane.create(), p2 = Pane.create();
  var r = RootResponder.create();
  
  r.makeMainPane(p1);
  assert.equal(r.get('mainPane'), p1, 'mainPane should be p1');
  assert.ok(p1.get('isMainPane'), 'p1 should know');
  assert.ok(!p2.get('isMainPane'), 'p2 should have no illusions');

  r.makeMainPane(p2);
  assert.equal(r.get('mainPane'), p2, 'mainPane should change to p2');
  assert.ok(p2.get('isMainPane'), 'p2 should know about its promotion');
  assert.ok(!p1.get('isMainPane'), 'p1 should know about its demotion');  
  
});

test("if current mainpane is also keypane, automatically make new main pane key also", function (assert) {
  // acceptsKeyPane is required to allow keyPane to change
  var p1 = Pane.create({ acceptsKeyPane: true });
  var p2 = Pane.create({ acceptsKeyPane: true });

  var r= RootResponder.create({ mainPane: p1, keyPane: p1 });
  r.makeMainPane(p2);
  assert.ok(r.get('keyPane') === p2, 'should change keyPane(%@) p1 = %@ - p2 = %@'.fmt(r.get('keyPane'), p1, p2));
});

test("should call blurMainTo() on current pane, passing new pane", function (assert) {
  var callCount = 0;
  var p2 = Pane.create();
  var p1 = Pane.create({ 
    blurMainTo: function(pane) { 
      callCount++ ;
      assert.equal(pane, p2, 'should pass new pane');
    }
  });
  
  var r= RootResponder.create({ mainPane: p1 });
  r.makeMainPane(p2);
  assert.equal(callCount, 1, 'should invoke callback');
});


test("should call focusMainFrom() on new pane, passing old pane", function (assert) {
  var callCount = 0;
  var p1 = Pane.create();
  var p2 = Pane.create({ 
    focusMainFrom: function(pane) { 
      callCount++ ;
      assert.equal(pane, p1, 'should pass old pane');
    }
  });
  
  var r= RootResponder.create({ mainPane: p1 });
  r.makeMainPane(p2);
  assert.equal(callCount, 1, 'should invoke callback');
});

