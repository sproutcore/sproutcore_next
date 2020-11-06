// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

var content, controller;

// ..........................................................
// NULL ARRAY
// 

module("SC.ObjectController - empty_case - NULL", {
  beforeEach: function() {
    content = null;
    controller = SC.ObjectController.create({ content: content });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any value should return undefined", function() {
  assert.equal(controller.get("foo"), undefined, 'controller.get(foo)');
  assert.equal(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function() {
  assert.equal(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  assert.equal(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  assert.equal(controller.get("foo"), undefined, 'controller.get(foo)');
  assert.equal(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("hasContent", function() {
  assert.equal(controller.get("hasContent"), false, 'hasContent should be false');
});


// ..........................................................
// EMPTY ARRAY
// 

module("SC.ObjectController - empty_case - EMPTY ARRAY", {
  beforeEach: function() {
    content = null;
    controller = SC.ObjectController.create({ content: content });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any value should return undefined", function() {
  assert.equal(controller.get("foo"), undefined, 'controller.get(foo)');
  assert.equal(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function() {
  assert.equal(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  assert.equal(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  assert.equal(controller.get("foo"), undefined, 'controller.get(foo)');
  assert.equal(controller.get("bar"), undefined, 'controller.get(bar)');
});


test("hasContent", function() {
  assert.equal(controller.get("hasContent"), false, 'hasContent should be false');
});

test("allowsMultipleContent should have no effect", function() {
  controller = SC.ObjectController.create({ 
    content: content,
    allowsMultipleContent: true
  });
  
  assert.equal(controller.get("length"), undefined, "controller.get(length)");
  assert.equal(controller.get('hasContent'), false, 'controller.hasContent');
});
