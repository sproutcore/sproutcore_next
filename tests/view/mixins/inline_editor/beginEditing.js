// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
import { SC } from '../../../../core/core.js';
import { View, InlineEditor, InlineEditable  } from '../../../../view/view.js';

(function() {

var fakeDelegate, fakeEditor, view;

fakeDelegate = {
  acquireEditorCalled: false,
  acquireEditorAllowed: true,
  acquireEditor: function() {
    this.acquireEditorCalled = true;

    return this.acquireEditorAllowed ? fakeEditor : null;
  },

  shouldBeginCalled: false,
  shouldBeginAllowed: true,
  inlineEditorShouldBeginEditing: function() {
    this.shouldBeginCalled = true;

    return this.shouldBeginAllowed;
  },

  willBeginCalled: false,
  inlineEditorWillBeginEditing: function() {
    this.willBeginCalled = true;
  },

  didBeginCalled: false,
  inlineEditorDidBeginEditing: function() {
    assert.ok(this.willBeginCalled, "willBegin was called before didBegin");
    this.didBeginCalled = true;
  },

  inlineEditorShouldDiscardEditing: function() {
    return true;
  }
};

fakeEditor = View.create(InlineEditor, {
  inlineEditorDelegate: fakeDelegate,

  beginEditingCalled: false,
  beginEditingAllowed: true,
  beginEditing: function(original, editable) {
    this.beginEditingCalled = true;

    var ret = original(editable);

    return this.beginEditingAllowed ? ret : false;
  }.enhance()
});

view = View.create(InlineEditable, {
  inlineEditorDelegate: fakeDelegate
});

function reset() {
  if(fakeEditor.isEditing) fakeEditor.discardEditing();

  fakeDelegate.shouldBeginCalled = false;
  fakeDelegate.acquireEditorCalled = false;
  fakeEditor.beginEditingCalled = false;
  fakeDelegate.willBeginCalled = false;
  fakeDelegate.didBeginCalled = false;
};

module("InlineEditor.beginEditing");

test("beginEditing succeeds when passed a target", function (assert) {
  reset();

  assert.ok(fakeEditor.beginEditing(view), "beginEditing succeeded");
});

test("beginEditing fails when not passed a target", function (assert) {
  reset();

  assert.ok(!fakeEditor.beginEditing(), "beginEditing failed");
});

test("beginEditing calls willBegin and didBegin in order", function (assert) {
  reset();

  SC.run(function() {
    assert.ok(fakeEditor.beginEditing(view), "beginEditing succeeded");
  }, undefined, true);

  assert.ok(fakeDelegate.willBeginCalled, "willBegin was called");

  assert.ok(fakeDelegate.didBeginCalled, "didBegin was called");
});

test("beginEditing does not call delegate methods on failure", function (assert) {
  reset();

  SC.run(function() {
    assert.ok(!fakeEditor.beginEditing(), "beginEditing failed");
  }, undefined, true);

  assert.ok(!fakeDelegate.willBeginCalled, "willBegin was not called");

  assert.ok(!fakeDelegate.didBeginCalled, "didBegin was not called");
});

})();


