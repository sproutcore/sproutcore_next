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
  acquireEditor: function() {
    return fakeEditor;
  },

  shouldCommitCalled: false,
  shouldCommitAllowed: true,
  inlineEditorShouldCommitEditing: function() {
    this.shouldCommitCalled = true;

    return this.shouldCommitAllowed;
  },

  willCommitCalled: false,
  inlineEditorWillCommitEditing: function() {
    this.willCommitCalled = true;
  },

  didCommitCalled: false,
  inlineEditorDidCommitEditing: function() {
    this.didCommitCalled = true;
    assert.ok(this.willCommitCalled, "willCommit called before didCommit");
    view._endEditing();
  }
};

fakeEditor = View.create(InlineEditor, {
  inlineEditorDelegate: fakeDelegate,

  beginEditing: function(original, editable) {
    return original(editable);
  }.enhance(),

  commitEditingCalled: false,
  commitEditingAllowed: true,
  commitEditing: function(original) {
    this.commitEditingCalled = true;

    var ret = original();

    return this.commitEditingAllowed ? ret : false;
  }.enhance()
});

view = View.create(InlineEditable, {
  inlineEditorDelegate: fakeDelegate
});

function reset() {
  if(fakeEditor.isEditing) fakeEditor.discardEditing();

  fakeDelegate.shouldCommitCalled = false;
  fakeEditor.commitEditingCalled = false;

  fakeDelegate.willCommitCalled = false;
  fakeDelegate.didCommitCalled = false;
}

module('InlineEditable.commitEditing');

test("commitEditing should ask shouldCommit and then call commitEditing", function (assert) {
  reset();

  fakeDelegate.shouldCommitAllowed = true;
  fakeEditor.commitEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(view.commitEditing(), "commitEditing successful");

  assert.ok(fakeEditor.commitEditingCalled, "commitEditing called");

  assert.ok(fakeDelegate.shouldCommitCalled, "shouldCommit called");
});

test("commitEditing should fail if shouldCommit returns false", function (assert) {
  reset();

  fakeDelegate.shouldCommitAllowed = false;
  fakeEditor.commitEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(!view.commitEditing(), "commitEditing failed");

  assert.ok(fakeEditor.commitEditingCalled, "commitEditing called");

  assert.ok(fakeDelegate.shouldCommitCalled, "shouldCommit called");
});

test("commitEditing should cleanup properly on success", function (assert) {
  reset();

  fakeDelegate.shouldCommitAllowed = true;
  fakeEditor.commitEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(view.commitEditing(), "committed editing");

  assert.ok(view.beginEditing(), "cleaned up successfully on commit");
});

test("delegate methods are called in order by commitEditing", function (assert) {
  reset();

  fakeDelegate.shouldCommitAllowed = true;
  fakeEditor.commitEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  SC.run(function() {
    assert.ok(view.commitEditing(), "committed editing");
  }, undefined, true);

  assert.ok(fakeDelegate.willCommitCalled, "willCommit was called");

  assert.ok(fakeDelegate.didCommitCalled, "didCommit was called");
});

test("delegate methods are not called when commitEditing fails", function (assert) {
  reset();

  fakeDelegate.shouldCommitAllowed = false;
  fakeEditor.commitEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  SC.run(function() {
    assert.ok(!view.commitEditing(), "commit failed");
  }, undefined, true);

  assert.ok(!fakeDelegate.willCommitCalled, "willCommit was not called");

  assert.ok(!fakeDelegate.didCommitCalled, "didCommit was not called");
});

})();

