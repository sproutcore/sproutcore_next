// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane } from '../../../view/view.js';

/*global module test equals context ok same Q$ htmlbody */
module("RootResponder#makeKeyPane");

test("returns receiver", function (assert) {
  var p1 = Pane.create(), p2 = Pane.create({ acceptsKeyPane: true });
  var r = RootResponder.create();
  
  assert.equal(r.makeKeyPane(p1), r, 'returns receiver even if pane does not accept key pane');
  assert.equal(r.makeKeyPane(p2), r, 'returns receiver');
});

test("changes keyPane to new pane if pane accepts key focus", function (assert) {
  var p1 = Pane.create({ acceptsKeyPane: false }) ;
  var p2 = Pane.create({ acceptsKeyPane: true });
  var r = RootResponder.create();
  
  r.makeKeyPane(p1);
  assert.ok(r.get('keyPane') !== p1, 'keyPane should not change to view that does not accept key');

  r.makeKeyPane(p2);
  assert.equal(r.get('keyPane'), p2, 'keyPane should change to view that does accept key');
  
});

test("setting nil sets key pane to mainPane if mainPane accepts key focus", function (assert) {
  var main = Pane.create({ acceptsKeyPane: true });
  var key = Pane.create({ acceptsKeyPane: true });
  var r = RootResponder.create({ mainPane: main, keyPane: key });
  
  // try to clear keyPane -- mainPane accepts key
  r.makeKeyPane(null);
  assert.equal(r.get('keyPane'), main, 'keyPane should be main pane');
  
  r.makeKeyPane(key); // reset
  main.acceptsKeyPane = false ;
  r.makeKeyPane(null); // try to clean - mainPane does not accept key
  assert.equal(r.get('keyPane'), null, 'keyPane should be null, not main');
  
  // try another variety.  if keyPane is currently null and we try to set to
  // null do nothing, even if main DOES accept key.
  r.keyPane = null ;
  main.acceptsKeyPane = false;
  r.makeKeyPane(null);
  assert.equal(r.get('keyPane'), null, 'keyPane should remain null');
});

var p1, p2, r, callCount ;
module("RootResponder#makeKeyPane - testing notifications", {
  beforeEach: function() {
    p1 = Pane.create({ acceptsKeyPane: true });    
    p2 = Pane.create({ acceptsKeyPane: true });    
    r = RootResponder.create();
    callCount = 0 ;
  },
  
  afterEach: function() { p1 = p2 = r ; }
});

test("should call willLoseKeyPaneTo on current keyPane", function (assert) {
  r.keyPane = p1; //setup test
  p1.willLoseKeyPaneTo = function(pane) {
    assert.equal(pane, p2, 'should pass new pane');
    callCount++;
  };
  
  r.makeKeyPane(p2);
  assert.equal(callCount, 1, 'should invoke');
});

test("should call willBecomeKeyPaneFrom on new keyPane", function (assert) {
  r.keyPane = p1; //setup test
  p2.willBecomeKeyPaneFrom = function(pane) {
    assert.equal(pane, p1, 'should pass old pane');
    callCount++;
  };
  
  r.makeKeyPane(p2);
  assert.equal(callCount, 1, 'should invoke');
});


test("should call didLoseKeyPaneTo on old keyPane", function (assert) {
  r.keyPane = p1; //setup test
  p1.didLoseKeyPaneTo = function(pane) {
    assert.equal(pane, p2, 'should pass new pane');
    callCount++;
  };
  
  r.makeKeyPane(p2);
  assert.equal(callCount, 1, 'should invoke');
});

test("should call didBecomeKeyPaneFrom on new keyPane", function (assert) {
  r.keyPane = p1; //setup test
  p2.didBecomeKeyPaneFrom = function(pane) {
    assert.equal(pane, p1, 'should pass old pane');
    callCount++;
  };
  
  r.makeKeyPane(p2);
  assert.equal(callCount, 1, 'should invoke');
});

test("should not invoke callbacks if setting keyPane to itself", function (assert) {
  r.keyPane = p1; //setup test
  // instrument ...
  p1.didLoseKeyPaneTo = p1.willLoseKeyPaneTo = p1.willBecomeKeyPaneFrom = p1.didBecomeKeyPaneFrom = function() { callCount++; };
  
  r.makeKeyPane(p1);
  assert.equal(callCount, 0, 'did not invoke any callbacks');
});







