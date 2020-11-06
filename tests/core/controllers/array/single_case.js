// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

/*globals assert.throws */

var content, controller, extra;

var TestObject = SC.Object.extend({
  title: "test",
  toString: function() { return "TestObject(%@)".fmt(this.get("title")); }
});


// ..........................................................
// allowsSingleContent
//

module("SC.ArrayController - single_case - SINGLE", {
  beforeEach: function() {
    content = TestObject.create({ title: "FOO" });
    controller = SC.ArrayController.create({
      content: content, allowsSingleContent: true
    });
  },

  afterEach: function() {
    controller.destroy();
  }
});

test("state properties", function() {
  assert.equal(controller.get("hasContent"), true, 'c.hasContent');
  assert.equal(controller.get("canRemoveContent"), true, "c.canRemoveContent");
  assert.equal(controller.get("canReorderContent"), false, "c.canReorderContent");
  assert.equal(controller.get("canAddContent"), false, "c.canAddContent");
});

// addObject should append to end of array + notify observers on Array itself
test("addObject", function() {
  assert.throws(function() {
    controller.addObject(extra);
  }, Error, "controller.addObject should throw exception");
});

test("removeObject - no destroyOnRemoval", function() {
  var callCount = 0;
  controller.set('destroyOnRemoval', false);
  controller.addObserver('[]', function() { callCount++; });

  controller.removeObject(content);

  assert.equal(controller.get('content'), null, 'removeObject(content) should set content to null');
  assert.equal(callCount, 1, 'should notify observer since content did not change');
  assert.equal(controller.get('length'), 0, 'should now have length of 0');
  assert.equal(content.isDestroyed, false, 'content.isDestroyed should be destroyed');
});

test("removeObject - destroyOnRemoval", function() {
  controller.set('destroyOnRemoval', true);
  SC.run(function() { controller.removeObject(content); });
  assert.equal(content.isDestroyed, true, 'content.isDestroyed should be destroyed');
});


test("basic array READ operations", function() {
  assert.equal(controller.get("length"), 1, 'length should be 1');
  assert.equal(controller.objectAt(0), content, "objectAt(0) should return content");
});

test("basic array WRITE operations", function() {
  assert.throws(function() {
    controller.replace(0,1,[extra]);
  }, Error, "calling replace on an enumerable should throw");
});

test("arrangedObjects", function() {
  assert.equal(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});


// ..........................................................
// allowsSingleContent=false
//

module("SC.ArrayController - single_case - allowsSingleContent=false", {
  beforeEach: function() {
    content = TestObject.create({ title: "FOO" });
    controller = SC.ArrayController.create({
      content: content, allowsSingleContent: false
    });
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

// addObject should append to end of array + notify observers on Array itself
test("addObject", function() {
  assert.throws(function() {
    controller.addObject(extra);
  }, Error, "controller.addObject should throw exception");
});

test("removeObject", function() {
  assert.throws(function() {
    controller.removeObject(extra);
  }, Error, "controller.removeObject should throw exception");
});

test("basic array READ operations", function() {
  assert.equal(controller.get("length"), 0, 'length should be empty');
  assert.equal(controller.objectAt(0), undefined, "objectAt() should return undefined");
});

test("basic array WRITE operations", function() {
  assert.throws(function() {
    controller.replace(0,1,[extra]);
  }, Error, "calling replace on an enumerable should throw");
});

test("arrangedObjects", function() {
  assert.equal(controller.get("arrangedObjects"), controller, 'c.arrangedObjects should return receiver');
});

