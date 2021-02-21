// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../../core/core.js';
import { View, ContentValueSupport } from '../../../../view/view.js';

/*global module, test, equals, ok */

// ..........................................................
// contentPropertyDidChange()
//
var view, content;
module('ContentValueSupport#contentPropertyDidChange', {
  beforeEach: function () {
    content = SC.Object.create();
    view = View.create(ContentValueSupport);
  },

  afterEach: function () {
    content = null;
    view.destroy();
  }
});

test("invoked with key = * whenever content changes", function (assert) {
  view.contentPropertyDidChange = function (target, key) {
    assert.ok(target === content, 'should pass content object as target target=%@'.fmt(target));
    assert.equal(key, '*', 'should pass * as key');
  };
  view.set('content', content);
});

test("should not be invoked when arbitrary keys are changed", function (assert) {
  var isTesting = false, count = 0;
  view.contentPropertyDidChange = function (target, key) {
    if (!isTesting) return; //wait until testing should begin...
    count++;
  };

  view.set('content', content);

  isTesting = true;

  content.set('foo', 'foo');
  content.set('bar', 'bar');

  assert.equal(count, 0, "method was not invoked");
});

test("should no longer be invoked when a key is changed on a former content object", function (assert) {
  assert.expect(0);
  var isTesting = false;
  view.contentPropertyDidChange = function (target, key) {
    if (!isTesting) return; //wait until testing should begin...
    assert.ok(false, 'should not invoke contentPropertyDidChange after content is removed');
  };

  view.set('content', content);
  content.set('foo', 'foo');
  view.set('content', null);

  isTesting = true;
  content.set('bar', 'bar');
});

test("should fire even on a content object set when the object is created", function (assert) {
  var callCount = 0;
  var view = View.create(ContentValueSupport, {
    contentPropertyDidChange: function () { callCount++; },
    content: content
  });

  assert.equal(callCount, 1, 'should call contentPropertyDidChange on init to do initial setup');

  content.set('foo', 'foo');
  assert.equal(callCount, 1, 'should not call contentPropertyDidChange when changing content.foo');
});

test("should call updatePropertyFromContent for all properties when content changes", function (assert) {
  var originalContent = SC.Object.create({
    contentFoo: 'foo1',
    contentBar: 'bar1'
  });

  var fooDidChangeCount = 0,
    barDidChangeCount = 0;

  var view = View.create(ContentValueSupport, {
    contentKeys: {
      'contentFooKey': 'foo',
      'contentBarKey': 'bar'
    },
    contentFooKey: 'contentFoo',
    contentBarKey: 'contentBar',

    foo: null,
    bar: null,

    fooDidChange: function () {
      fooDidChangeCount++;
    }.observes('foo'),

    barDidChange: function () {
      barDidChangeCount++;
    }.observes('bar'),

    content: null
  });

  assert.equal(fooDidChangeCount, 0, "foo indicated as changed this many times");
  assert.equal(barDidChangeCount, 0, "bar indicated as changed this many times");

  view.set('content', originalContent);

  assert.equal(fooDidChangeCount, 1, "foo indicated as changed this many times");
  assert.equal(barDidChangeCount, 1, "bar indicated as changed this many times");

  // set new content
  var newContent = SC.Object.create({
    contentFoo: 'foo2',
    contentBar: 'bar2'
  });

  view.set('content', newContent);

  assert.equal(fooDidChangeCount, 2, "foo indicated as changed this many times");
  assert.equal(barDidChangeCount, 2, "bar indicated as changed this many times");

  // Clean up.
  originalContent.destroy();
  newContent.destroy();
});

// ..........................................................
// updatePropertyFromContent()
//
module("ContentValueSupport#updatePropertyFromContent()", {
  beforeEach: function () {
    content = SC.Object.create({ foo: "foo", bar: "bar" });
    view = View.create(ContentValueSupport, { content: content });
  },
  afterEach: function () {
    content = null;
    view.destroy();
  }
});

test("copies value of content[key] to this[prop] if changed key.  Gets key from contentKey property", function (assert) {
  view.contentValueKey = 'foo'; // set key mapping.
  view.updatePropertyFromContent('value', 'foo', 'contentValueKey');
  assert.equal(view.get('value'), 'foo', 'should copy foo from content.foo to value');
});

test("does nothing of changed key does not match contentKey value", function (assert) {
  view.value = "foo";
  view.contentValueKey = "foo";
  view.updatePropertyFromContent('value', 'bar', 'contentValueKey');
  assert.equal(view.get('value'), 'foo', 'should not have changed "value"');
});

test("if contentKey is not passed, assume contentPROPKey", function (assert) {
  view.contentValueKey = "foo";
  view.updatePropertyFromContent("value", "foo");
  assert.equal(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

test("if contentFooKey is not set on receiver, ask displayDelegate", function (assert) {
  view.displayDelegate = SC.Object.create({ contentValueKey: "foo" });
  view.updatePropertyFromContent("value", "foo", "contentValueKey");
  assert.equal(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

test("should be able to get value from a content object that is not Object", function (assert) {
  view.content = { foo: "foo" };
  view.contentValueKey = "foo";
  view.updatePropertyFromContent("value", "foo", "contentValueKey");
  assert.equal(view.get('value'), 'foo', 'should have looked at foo since contentValueKey is set to foo');
});

// ..........................................................
// updateContentWithValueObserver()
//
module("ContentValueSupport#updatePropertyFromContent()", {
  beforeEach: function () {
    content = SC.Object.create({ foo: "foo", bar: "bar" });
    view = View.create(ContentValueSupport, {
      value: "bar",
      content: content,
      contentValueKey: "bar",
      displayDelegate: SC.Object.create({ contentValueKey: "foo" })
    });
  },
  afterEach: function () {
    content = null;
    view.destroy();
  }
});

test("if contentValueKey is set, changing value will be pushed to content", function (assert) {
  view.set('value', 'baz');
  assert.equal(content.get('bar'), 'baz', 'should copy from view.value to content');
});

test("does nothing if content is null", function (assert) {
  view.set('content', null);
  view.set('value', 'baz'); // should be no errors here...
  assert.equal(content.get('bar'), 'bar', 'should not change');
  assert.equal(content.get('foo'), 'foo', 'should not change');
});

test("if contentValueKey is undefined, asks display delegate instead", function (assert) {
  delete view.contentValueKey;
  view.set('value', 'baz');
  assert.equal(content.get('foo'), 'baz', 'should copy from view.value to content');
});

test("if contentValueKey is not set & displayDelegate not set, does nothing", function (assert) {
  delete view.contentValueKey;
  delete view.displayDelegate;
  view.set('value', 'baz');
  assert.equal(content.get('bar'), 'bar', 'should not change');
  assert.equal(content.get('foo'), 'foo', 'should not change');
});

// ..........................................................
// updateContentWithValueObserver()
//
module("ContentValueSupport#contentKeys", {
  beforeEach: function () {
    this.count = 0;
    var self = this;

    this.obj = SC.Object.create(ContentValueSupport, SC.DelegateSupport, {
      contentKeys: {'contentFooKey': 'foo'},
      contentFooKey: 'foo',
      content: SC.Object.create({foo: 'BAR'}),
      contentPropertyDidChange: function (orig, target, key) {
        assert.equal(target, this.content, "content is target");
        self.count++;

        return orig(target, key);
      }.enhance()
    });
  },

  afterEach: function () {
    this.obj.destroy();

    this.obj = null;
  }
});

test("different contentKeys on creation are observed correctly", function (assert) {
  assert.equal(this.count, 1, "Content property setup was called on init");

  this.obj.content.set('foo', 'BAR2');

  assert.equal(this.count, 2, "observer was called again on set");

  assert.equal(this.obj.get('foo'), 'BAR2', "value is updated correctly");

  this.obj.content.set('bar', 'ASDF');

  assert.equal(this.count, 2, "observer was not called again on setting other keys");
});

test("different contentKeys after creation are observed correctly", function (assert) {
  assert.equal(this.count, 1,  "Content property setup was called on init");

  this.obj.beginPropertyChanges();
  this.obj.set({
    contentKeys: {'contentBarKey': 'bar'},
    contentBarKey: 'bar'
  });
  this.obj.endPropertyChanges();

  assert.equal(this.count, 2, "observer was called again when changing contentKeys");

  this.obj.content.set('bar', 'BAR2');

  assert.equal(this.count, 3, "observer was called when changing bar");

  assert.equal(this.obj.get('bar'), 'BAR2', "value is updated correctly");

  this.obj.content.set('asdfasf', 'asdfasd');

  assert.equal(this.count, 3, "observer was not called again on setting other keys");

  this.obj.content.set('foo', 'asdfasd');

  assert.equal(this.count, 3, "observer was not called again on setting old observed keys");
});
