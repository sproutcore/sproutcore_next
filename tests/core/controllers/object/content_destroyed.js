// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

var content, newContent, controller, destroyCount;

// ..........................................................
// SINGLE OBSERVABLE OBJECT
//

SC.TestObject = SC.Object.extend();

SC.TestObject.reopen({
  destroy: function() {
    destroyCount = 1;
  }
});

module("SC.ObjectController - content destroyed", {
  beforeEach: function() {
    content = SC.TestObject.create({
      foo: "foo1", bar: "bar1"
    });
    newContent = SC.Object.create({
      foo: "foo2"
    });
    destroyCount = 0;

    controller = SC.ObjectController.create({
      destroyContentOnReplace: true,
      content: content
    });
  },

  afterEach: function() {
    controller.destroy();
  }
});

test("Setting content should call 'destroy' on old content if destroyContentOnReplace has been set", function (assert) {
  controller.set('content', newContent);
  assert.equal(destroyCount, 1, 'destroyCount');
  assert.equal(controller.getPath('content.foo'), 'foo2');
});

test("Setting content should NOT call 'destroy' on old content if destroyContentOnReplace has not been set", function (assert) {
  controller.set('destroyContentOnReplace', false);
  controller.set('content', newContent);
  assert.equal(destroyCount, 0, 'destroyCount');
  assert.equal(controller.getPath('content.foo'), 'foo2');
});

test("Setting content should NOT call 'destroy' if set to the same object", function (assert) {
  controller.set('content', content);
  assert.equal(destroyCount, 0, 'destroyCount');
});
