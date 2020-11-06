// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

var content, controller;

// ..........................................................
// SINGLE OBSERVABLE OBJECT
//

module("SC.ObjectController - single_case - OBSERVABLE OBJECT", {
  beforeEach: function() {
    content = SC.Object.create({ foo: "foo1", bar: "bar1", foobar: function () { return content ? content.get('foo') + content.get('bar') : null; }.property('foo', 'bar').cacheable() });
    controller = SC.ObjectController.create({ content: content });
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

  assert.equal(content.get("foo"), "EDIT", 'controller.get(foo)');
  assert.equal(content.get("bar"), "EDIT", 'controller.get(bar)');
  assert.equal(content.get("baz"), "EDIT", 'controller.get(bar)');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  content.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var content2 = SC.Object.create({ foo: "foo2", bar: "bar2" });
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  assert.equal(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  content2.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0;
  content.set("foo", "BAR");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
  assert.equal(callCount, 0, 'observer on controller should NOT have fired');
});

test("changing the content from one single to null and back", function() {
  var callCount = 0,
    foobarCallCount = 0;

  controller.addObserver("foo", function() { callCount++; });
  controller.addObserver("baz", function() { foobarCallCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", null);

  assert.equal(controller.get("foo"), undefined, "controller.get(foo) after content change should be empty");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  assert.equal(controller.get("foobar"), undefined, "controller.get(foobar) after content change should be empty");
  assert.equal(foobarCallCount, 1, 'observer on controller should have fired for foobar change');

  callCount = 0;
  content.set("foo", "BAR");
  assert.equal(controller.get("foo"), undefined, "controller.get(foo) after edit of non-content object should not change value");
  assert.equal(callCount, 0, 'observer on controller should NOT have fired');

  callCount = 0 ;
  controller.set("content", content);
  assert.equal(callCount, 1, 'observer on controller should have fired');

  callCount = 0 ;
  content.set("foo", "EDIT");
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 1, 'observer on controller should have fired');

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
// SINGLE NON-OBSERVABLE OBJECT
//

module("SC.ObjectController - single_case - NON-OBSERVABLE OBJECT", {
  beforeEach: function() {
    content = { foo: "foo1", bar: "bar1" };
    controller = SC.ObjectController.create({ content: content });
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

  assert.equal(content.foo, "EDIT", 'content.foo');
  assert.equal(content.bar, "EDIT", 'content.bar');
  assert.equal(content.baz, "EDIT", 'content.baz');
});

test("changing a property on the content", function() {
  var callCount = 0;
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  content.foo = "EDIT";
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");
  assert.equal(callCount, 0, 'observer on controller should not fire because this is not observable');
});

test("changing the content from one to another", function() {
  var callCount = 0 ;
  var content2 = { foo: "foo2", bar: "bar2" };
  controller.addObserver("foo", function() { callCount++; });

  assert.equal(controller.get("foo"), "foo1", "controller.get(foo) before edit should have original value");

  controller.set("content", content2);

  assert.equal(controller.get("foo"), "foo2", "controller.get(foo) after content should contain new content");
  assert.equal(callCount, 1, 'observer on controller should have fired');

  content2.foo = "EDIT";
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit should have updated value");

  content.foo = "BAR";
  assert.equal(controller.get("foo"), "EDIT", "controller.get(foo) after edit of non-content object should not change value");
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

