// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

/*globals throws assert.throws*/

var content, controller, extra;

var TestObject = SC.Object.extend({
  title: "test",  
  toString: function() { return "TestObject(%@)".fmt(this.get("title")); }
});


// ..........................................................
// NULL VALUE
// 

module("SC.ArrayController - null_case", {
  beforeEach: function() {
    content = null;
    controller = SC.ArrayController.create({ content: content });
    extra = TestObject.create({ title: "FOO" });
  },
  
  afterEach: function() {
    controller.destroy();
  }
});

test("state properties", function() {
  assert.equal(controller.get("hasContent"), false, 'c.hasContent');
  assert.equal(controller.get("canRemoveContent"), false, "c.canRemoveContent");
  assert.equal(controller.get("canReorderContent"), false, "c.canReorderContent");
  assert.equal(controller.get("canAddContent"), false, "c.canAddContent");
});

test("addObject", function() {
  assert.throws(function() {
    controller.addObject(extra);
  }, Error, "controller.addObject should throw exception");
});

test("removeObject", function() {
  assert.throws(function() {
    controller.removeObject(extra);
  }, Error, "controller.addObject should throw exception");
});

test("basic array operations", function() {
  assert.equal(controller.get("length"), 0, 'length should be empty');
  assert.equal(controller.objectAt(0), undefined, "objectAt() should return undefined");
  
  assert.throws(function() {
    controller.replace(0,1,[extra]);
  }, Error, 'replace() should throw an error since it is not editable');
});

test("arrangedObjects", function() {
  assert.equal(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});
