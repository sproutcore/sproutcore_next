// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

var src, content, controller;

// ..........................................................
// SINGLE OBSERVABLE OBJECT IN SET
// 

module("SC.ObjectController - single_enumerable_case - OBSERVABLE OBJECT", {
  beforeEach: function() {
    src        = SC.Object.create({ foo: "foo1", bar: "bar1" });
    content    = SC.Set.create().add(src); // use generic enumerable
    controller = SC.ObjectController.create({ 
      content: content,
      allowsMultipleContent: false 
    });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  assert.equal(controller.get("foo"), "foo1", 'controller.get(foo)');
  assert.equal(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  assert.equal(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  assert.equal(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  assert.equal(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  assert.equal(src.get("foo"), "EDIT", 'src.get(foo)');
  assert.equal(src.get("bar"), "EDIT", 'src.get(bar)');
  assert.equal(src.get("baz"), "EDIT", 'src.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  src.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var src2 = SC.Object.create({ foo: "foo2", bar: "bar2" });
  var content2 = [src2]; // use another type of enumerable
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  assert.equal(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  src2.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  assert.equal(callCount, 0, 'observer on controller should NOT have fired');
});

test("hasContent", function() {
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

// ..........................................................
// SINGLE OBSERVABLE OBJECT WITH ALLOWS MULTIPLE true
// 

module("SC.ObjectController - single_enumerable_case - ALLOWS MULTIPLE", {
  beforeEach: function() {
    src        = SC.Object.create({ foo: "foo1", bar: "bar1" });
    content    = SC.Set.create().add(src); // use generic enumerable
    controller = SC.ObjectController.create({ 
      content: content,
      allowsMultipleContent: true 
    });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  assert.equal(controller.get("foo"), "foo1", 'controller.get(foo)');
  assert.equal(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  assert.equal(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  assert.equal(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  assert.equal(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  assert.equal(src.get("foo"), "EDIT", 'src.get(foo)');
  assert.equal(src.get("bar"), "EDIT", 'src.get(bar)');
  assert.equal(src.get("baz"), "EDIT", 'src.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  src.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var src2 = SC.Object.create({ foo: "foo2", bar: "bar2" });
  var content2 = [src2]; // use another type of enumerable
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  assert.equal(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  src2.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  assert.equal(callCount, 0, 'observer on controller should NOT have fired');
});

test("hasContent", function() {
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

// ..........................................................
// SINGLE OBSERVABLE OBJECT IN COLLECTION, ADDED AFTER CONTROLLER CONTENT SET
// 

module("SC.ObjectController - single_enumerable_case after content set - ALLOWS MULTIPLE", {
  beforeEach: function() {
    src        = SC.Object.create({ foo: "foo1", bar: "bar1" });
    content    = SC.Set.create(); // use generic enumerable
    controller = SC.ObjectController.create({ 
      content: content,
      allowsMultipleContent: true 
    });
    content.add(src)
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("getting any unknown value should pass through to object", function() {
  assert.equal(controller.get("foo"), "foo1", 'controller.get(foo)');
  assert.equal(controller.get("bar"), "bar1", 'controller.get(bar)');
});

test("setting any unknown value should pass through", function() {
  assert.equal(controller.set("foo", "EDIT"), controller, 'controller.set(foo, EDIT) should return self');  
  assert.equal(controller.set("bar", "EDIT"), controller, 'controller.set(bar, EDIT) should return self');
  assert.equal(controller.set("baz", "EDIT"), controller, 'controller.set(baz, EDIT) should return self');
  
  assert.equal(src.get("foo"), "EDIT", 'src.get(foo)');
  assert.equal(src.get("bar"), "EDIT", 'src.get(bar)');
  assert.equal(src.get("baz"), "EDIT", 'src.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  src.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var src2 = SC.Object.create({ foo: "foo2", bar: "bar2" });
  var content2 = [src2]; // use another type of enumerable
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  assert.equal(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  src2.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
  
  callCount = 0;
  content.set("foo", "BAR");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  assert.equal(callCount, 0, 'observer on controller should NOT have fired');
});

test("hasContent", function() {
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

