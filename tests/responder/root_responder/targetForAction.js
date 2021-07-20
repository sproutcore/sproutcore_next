// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody Dummy */

import { SC } from '../../../core/core.js'; 
import { browser } from '../../../event/event.js';
import { RootResponder, ResponderContext } from '../../../responder/responder.js';
import { Pane, MainPane, View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';


var r, r2, sender, pane, pane2, barView, fooView, defaultResponder;
var keyPane, mainPane, globalResponder, globalResponderContext, actionSender, actionContext;

var CommonSetup = {
  beforeEach: function() {

    actionSender = null; // use for sendAction tests
    actionContext = null;
    var action = function (sender, context) {
      actionSender = sender;
      actionContext = context;
    };

    sender = SC.Object.create();

    // default responder for each pane
    defaultResponder = SC.Object.create({
      defaultAction: action
    });

    // global default responder set on RootResponder
    globalResponder = SC.Object.create({
      globalAction: action
    });

    // global default responder as a responder context
    // set on RootResponder
    globalResponderContext = SC.Object.create(ResponderContext, {
      globalAction: action
    });

    // explicit pane
    pane = Pane.create({
      acceptsKeyPane: true,
      defaultResponder: defaultResponder,
      childViews: [View.extend({
        bar: action,  // implement bar action
        childViews: [View.extend({
          foo: action // implement foo action
        })]
      })],

      paneAction: action

    });

    pane2 = Pane.create({
      acceptsKeyPane: true,
      defaultResponder: defaultResponder,
      childViews: [View.extend({
        bar: action,  // implement bar action
        childViews: [View.extend({
          foo: action // implement foo action
        })]
      })],

      paneAction: action,

      keyAction: action,
      mainAction: action,
      globalAction: action
    });

    keyPane = Pane.create({
      acceptsKeyPane: true,
      keyAction: action
    });
    keyPane.firstResponder = keyPane ;

    mainPane = Pane.create({
      acceptsKeyPane: true,
      mainAction: action
    });
    mainPane.firstResponder = mainPane ;

    r = RootResponder.create({
      mainPane: mainPane,
      keyPane:  keyPane,
      defaultResponder: globalResponder
    });

    r2 = RootResponder.create({
      mainPane: mainPane,
      keyPane: keyPane,
      defaultResponder: globalResponderContext
    });

    barView = pane.childViews[0];
    assert.ok(barView.bar, 'barView should implement bar');

    fooView = barView.childViews[0];
    assert.ok(fooView.foo, 'fooView should implement foo');

    // setup dummy namespace
    window.Dummy = {
      object: SC.Object.create({ foo: action }),
      hash: { foo: action }
    };

  },

  afterEach: function() {
    r = r2 = sender = pane = window.Dummy = barView = fooView = null;
    defaultResponder = keyPane = mainPane = globalResponder = null;
    globalResponderContext = null;
  }
};

// ..........................................................
// targetForAction()
//
module("RootResponder#targetForAction", CommonSetup);


test("pass property path string as target", function (assert) {
  var result = r.targetForAction('foo', 'Dummy.object');

  assert.equal(result, Dummy.object, 'should find DummyNamespace.object if it implements the action');

  assert.equal(r.targetForAction("foo", "Dummy.hash"), Dummy.hash, 'should return if object found at path and it has function, even if it does not use respondsTo');

  assert.equal(r.targetForAction('bar', 'Dummy.object'), null, 'should return null if found DummyNamepace.object but does not implement action');

  assert.equal(r.targetForAction('foo', 'Dummy.imaginary.item'), null, 'should return null if property path could not resolve');
});

test("pass real object as target", function (assert) {
  assert.equal(r.targetForAction('foo', Dummy.object), Dummy.object, 'returns target if respondsTo() action');
  assert.equal(r.targetForAction('foo', Dummy.hash), Dummy.hash, 'returns target if targets does not implement respondsTo() but does have action');
  assert.equal(r.targetForAction('bar', Dummy.object), null, 'returns null of target does not implement action name');
});

test("no target, explicit pane, nested firstResponder", function (assert) {

  pane.set('firstResponder', fooView) ;
  assert.equal(r.targetForAction('foo', null, null, pane), fooView,
    'should return firstResponder if implementation action');

  assert.equal(r.targetForAction('bar', null, null, pane), barView,
    'should return parent of firstResponder');

  assert.equal(r.targetForAction('paneAction', null, null, pane), pane,
    'should return pane action');

  assert.equal(r.targetForAction('defaultAction', null, null, pane),
    defaultResponder, 'should return defaultResponder');

  assert.equal(r.targetForAction('imaginaryAction', null, null, pane), null,
    'should return null for not-found action');
});


test("no target, explicit pane, top-level firstResponder", function (assert) {

  pane.set('firstResponder', barView) ; // fooView is child...

  assert.equal(r.targetForAction('foo', null, null, pane), null,
    'should falseT return child of firstResponder');

  assert.equal(r.targetForAction('bar', null, null, pane), barView,
    'should return firstResponder');

  assert.equal(r.targetForAction('paneAction', null, null, pane), pane,
    'should return pane action');

  assert.equal(r.targetForAction('defaultAction', null, null, pane),
    defaultResponder, 'should return defaultResponder');

  assert.equal(r.targetForAction('imaginaryAction', null, null, pane), null,
    'should return null for not-found action');
});

test("no target, explicit pane, pane is first responder", function (assert) {

  pane.set('firstResponder', pane) ;

  assert.equal(r.targetForAction('foo', null, null, pane), null,
    'should falseT return child view');

  assert.equal(r.targetForAction('bar', null, null, pane), null,
    'should falseT return child view');

  assert.equal(r.targetForAction('paneAction', null, null, pane), pane,
    'should return pane action');

  assert.equal(r.targetForAction('defaultAction', null, null, pane),
    defaultResponder, 'should return defaultResponder');

  assert.equal(r.targetForAction('imaginaryAction', null, null, pane), null,
    'should return null for not-found action');
});

test("no target, explicit pane, no first responder", function (assert) {

  pane.set('firstResponder', null) ;

  assert.equal(r.targetForAction('foo', null, null, pane), null,
    'should falseT return child view');

  assert.equal(r.targetForAction('bar', null, null, pane), null,
    'should falseT return child view');

  assert.equal(r.targetForAction('paneAction', null, null, pane), pane,
    'should return pane');

  assert.equal(r.targetForAction('defaultAction', null, null, pane),
    defaultResponder, 'should return defaultResponder');

  assert.equal(r.targetForAction('imaginaryAction', null, null, pane), null,
    'should return null for not-found action');

});

test("no target, explicit pane, does not implement action", function (assert) {
  assert.equal(r.targetForAction('keyAction', null, null, pane), keyPane,
    'should return keyPane');

  assert.equal(r.targetForAction('mainAction', null, null, pane), mainPane,
    'should return mainPane');

  assert.equal(r.targetForAction('globalAction', null, null, pane), globalResponder,
    'should return global defaultResponder');

  assert.equal(r2.targetForAction('globalAction', null, null, pane), globalResponderContext,
    'should return global defaultResponder');
});

test("no target, explicit pane, does implement action", function (assert) {
  assert.equal(r.targetForAction('keyAction', null, null, pane2), pane2,
    'should return pane');

  assert.equal(r.targetForAction('mainAction', null, null, pane2), pane2,
    'should return pane');

  assert.equal(r.targetForAction('globalAction', null, null, pane2), pane2,
    'should return pane');

  assert.equal(r2.targetForAction('globalAction', null, null, pane2), pane2,
    'should return pane');
});

test("no target, no explicit pane", function (assert) {
  assert.equal(r.targetForAction('keyAction'), keyPane, 'should find keyPane');
  assert.equal(r.targetForAction('mainAction'), mainPane, 'should find mainPane');
  assert.equal(r.targetForAction('globalAction'), globalResponder,
    'should find global defaultResponder');
  assert.equal(r.targetForAction('imaginaryAction'), null, 'should return null for not-found action');
  assert.equal(r2.targetForAction('globalAction'), globalResponderContext,
    'should find global defaultResponder');
});

// ..........................................................
// sendAction()
//
module("RootResponder#sendAction", CommonSetup) ;

test("if context given, passes context to action + target", function (assert) {
  var context = {};

  // pane.firstResponder = defaultResponder;
  r.sendAction('defaultAction', defaultResponder, sender, pane, context);
  assert.equal(actionSender, sender, 'action did invoke');
  assert.equal(actionContext, context, 'context was passed');

  actionSender = null;
  r.sendAction('imaginaryAction', null, sender, pane);
  assert.equal(actionSender, null, 'action did not invoke');
});

test("if pane passed, invokes action on pane if found", function (assert) {
  pane.firstResponder = pane;
  r.sendAction('paneAction', null, sender, pane);
  assert.equal(actionSender, sender, 'action did invoke');

  actionSender = null;
  r.sendAction('imaginaryAction', null, sender, pane);
  assert.equal(actionSender, null, 'action did not invoke');
});

test("searches panes if none passed, invokes action if found", function (assert) {
  r.sendAction('keyAction', null, sender);
  assert.equal(actionSender, sender, 'action did invoke');

  actionSender = null;
  r.sendAction('imaginaryAction', null, sender);
  assert.equal(actionSender, null, 'action did not invoke');
});

test("searches target if passed, invokes action if found", function (assert) {
  r.sendAction('foo', fooView, sender);
  assert.equal(actionSender, sender, 'action did invoke');

  actionSender = null;
  r.sendAction('imaginaryAction', fooView, sender);
  assert.equal(actionSender, null, 'action did not invoke');
});

