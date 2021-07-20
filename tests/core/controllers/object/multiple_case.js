// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

var src, src2, content, controller;

// ..........................................................
// false MULTIPLE CONTENT
// 

module("SC.ObjectController - multiple_case - ALLOWSMULTIPLE = false", {
  beforeEach: function() {
    src        = SC.Object.create({ foo: "foo1", bar: "bar1" });
    src2       = SC.Object.create({ foo: "foo2", bar: "bar1" });
    content    = [src, src2];
    controller = SC.ObjectController.create({ 
      content: content,
      allowsMultipleContent: false 
    });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("hasContent", function (assert) {
  assert.equal(controller.get("hasContent"), false, 'hasContent should be false');
});

test("getting any value should return undefined", function (assert) {
  assert.equal(controller.get("foo"), undefined, 'controller.get(foo)');
  assert.equal(controller.get("bar"), undefined, 'controller.get(bar)');
});

test("setting any unknown value should have no effect", function (assert) {
  assert.equal(controller.set("foo", "FOO"), controller, 'controller.set(foo, FOO) should return self');  
  assert.equal(controller.set("bar", "BAR"), controller, 'controller.set(bar, BAR) should return self');
  assert.equal(src.get("foo"), "foo1", 'src.get(foo)');
  assert.equal(src.get("bar"), "bar1", 'src.get(bar)');
});

// ..........................................................
// MULTIPLE CONTENT
// 

module("SC.ObjectController - multiple_case - ALLOWSMULTIPLE = true", {
  beforeEach: function() {
    src        = SC.Object.create({ foo: "foo1", bar: "bar1" });
    src2       = SC.Object.create({ foo: "foo2", bar: "bar1" });
    content    = [src, src2];
    controller = SC.ObjectController.create({ 
      content: content,
      allowsMultipleContent: true 
    });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any unknown value", function (assert) {
  assert.deepEqual(controller.get("foo"), ["foo1", "foo2"], 'controller.get(foo) should return array with all items');
  assert.deepEqual(controller.get("bar"), "bar1", 'controller.get(bar) should return single property since all items match');
});

test("setting any unknown value should pass through", function (assert) {
  assert.equal(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  assert.equal(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  assert.equal(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  assert.equal(src.get("foo"), "EDIT", 'src.get(foo)');
  assert.equal(src.get("bar"), "EDIT", 'src.get(bar)');
  assert.equal(src.get("baz"), "EDIT", 'src.get(bar)');

  assert.equal(src2.get("foo"), "EDIT", 'src2.get(foo)');
  assert.equal(src2.get("bar"), "EDIT", 'src2.get(bar)');
  assert.equal(src2.get("baz"), "EDIT", 'src2.get(bar)');
});

test("changing a property on a content object", function (assert) {
  var callCount = 0;
  controller.addObserver("bar", function() { callCount++; });

  assert.equal(controller.get("bar"), "bar1", "controller.get(bar) before edit should have original value");

  src.set("bar", "EDIT");
  assert.deepEqual(controller.get("bar"), ["EDIT", "bar1"], "controller.get(bar) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
});

test("hasContent", function (assert) {
  assert.equal(controller.get("hasContent"), true, 'should have content');
  
  var callCount = 0;
  controller.addObserver("hasContent", function() { callCount++; });
  
  controller.set("content", null);
  assert.equal(controller.get("hasContent"), false, "hasContent should == false after setting to null");
  assert.ok(callCount > 0, 'hasContent observer should fire when setting to null');
  
  callCount = 0;
  controller.set("content", content);
  assert.equal(controller.get("hasContent"), true, "hasContent should == true after setting back to content");
  assert.ok(callCount > 0, "hasContent observer should fire");
});

