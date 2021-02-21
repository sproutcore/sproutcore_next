// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../../core/core.js';
import { View, InlineEditor, InlineEditable  } from '../../../../view/view.js';

/*global module test equals context ok same */

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

module('InlineEditable.beginEditing');

test("beginEditing calls shouldBegin and acquireEditor and returns true on success", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = true;

  fakeDelegate.acquireEditorAllowed = true;

  fakeEditor.beginEditingAllowed = true;

  assert.ok(view.beginEditing(), "beginEditing succeeded");

  assert.ok(fakeDelegate.shouldBeginCalled, "shouldBegin was called");

  assert.ok(fakeDelegate.acquireEditorCalled, "acquireEditor was called");

  assert.ok(fakeEditor.beginEditingCalled, "beginEditing was called");
});

test("beginEditing should fail when shouldBegin returns false", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = false;

  fakeDelegate.acquireEditorAllowed = true;

  fakeEditor.beginEditingAllowed = true;

  assert.ok(!view.beginEditing(), "beginEditing failed");

  assert.ok(fakeDelegate.shouldBeginCalled, "shouldBegin was called");

  assert.ok(!fakeDelegate.acquireEditorCalled, "acquireEditor was not called");

  assert.ok(!fakeEditor.beginEditingCalled, "beginEditing was not called");
});

test("beginEditing should return false without throwing an error if acquire returns null", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = true;

  fakeDelegate.acquireEditorAllowed = false;

  fakeEditor.beginEditingAllowed = true;

  assert.ok(!view.beginEditing(), "beginEditing failed");

  assert.ok(fakeDelegate.shouldBeginCalled, "shouldBegin was called");

  assert.ok(fakeDelegate.acquireEditorCalled, "acquireEditor was called");

  assert.ok(!fakeEditor.beginEditingCalled, "beginEditing was not called");
});

test("beginEditing should fail if inlineEditor.beginEditing fails", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = true;

  fakeDelegate.acquireEditorAllowed = true;

  fakeEditor.beginEditingAllowed = false;

  assert.ok(!view.beginEditing(), "beginEditing failed");

  assert.ok(fakeDelegate.shouldBeginCalled, "shouldBegin was called");

  assert.ok(fakeDelegate.acquireEditorCalled, "acquireEditor was called");

  assert.ok(fakeEditor.beginEditingCalled, "beginEditing was called");
});

test("delegate methods should be called in order on success", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = true;
  fakeDelegate.acquireEditorAllowed = true;

  fakeEditor.beginEditingAllowed = true;

  SC.run(function() {
    assert.ok(view.beginEditing(), "beginEditing succeeded");
  }, undefined, true);

  assert.ok(fakeDelegate.willBeginCalled, "willBegin was called");

  assert.ok(fakeDelegate.didBeginCalled, "didBegin was called");
});

test("delegate methods should not be called on failure", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = false;
  fakeDelegate.acquireEditorAllowed = true;

  fakeEditor.beginEditingAllowed = true;

  SC.run(function() {
    assert.ok(!view.beginEditing(), "beginEditing failed");
  }, undefined, true);

  assert.ok(!fakeDelegate.willBeginCalled, "willBegin was not called");

  assert.ok(!fakeDelegate.didBeginCalled, "didBegin was not called");
});

test("beginEditing should fail if already editing", function (assert) {
  reset();

  fakeDelegate.shouldBeginAllowed = true;
  fakeDelegate.acquireEditorAllowed = true;

  assert.ok(view.beginEditing(), "first begin succeeded");

  assert.ok(!view.beginEditing(), "second begin failed");
});

})();

