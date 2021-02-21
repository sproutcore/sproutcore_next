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

  shouldDiscardCalled: false,
  shouldDiscardAllowed: true,
  inlineEditorShouldDiscardEditing: function() {
    this.shouldDiscardCalled = true;

    return this.shouldDiscardAllowed;
  },

  willDiscardCalled: false,
  inlineEditorWillDiscardEditing: function() {
    this.willDiscardCalled = true;
  },

  didDiscardCalled: false,
  inlineEditorDidDiscardEditing: function() {
    this.didDiscardCalled = true;
    assert.ok(this.willDiscardCalled, "willDiscard called before didDiscard");

    view._endEditing();
  }
};

fakeEditor = View.create(InlineEditor, {
  inlineEditorDelegate: fakeDelegate,

  beginEditing: function(original, editable) {
    return original(editable);
  }.enhance(),

  discardEditingCalled: false,
  discardEditingAllowed: true,
  discardEditing: function(original) {
    this.discardEditingCalled = true;

    var ret = original();

    return this.discardEditingAllowed ? ret : false;
  }.enhance()
});

view = View.create(InlineEditable, {
  inlineEditorDelegate: fakeDelegate
});

function reset() {
  if(fakeEditor.isEditing) fakeEditor.commitEditing();

  fakeDelegate.shouldDiscardCalled = false;
  fakeEditor.discardEditingCalled = false;

  fakeDelegate.willDiscardCalled = false;
  fakeDelegate.didDiscardCalled = false;
}

module('InlineEditable.discardEditing');

test("discardEditing should ask shouldDiscard and then call discardEditing", function (assert) {
  reset();

  fakeDelegate.shouldDiscardAllowed = true;
  fakeEditor.discardEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(view.discardEditing(), "discardEditing successful");

  assert.ok(fakeEditor.discardEditingCalled, "discardEditing called");

  assert.ok(fakeDelegate.shouldDiscardCalled, "shouldDiscard called");
});

test("discardEditing should fail if shouldDiscard returns false", function (assert) {
  reset();

  fakeDelegate.shouldDiscardAllowed = false;
  fakeEditor.discardEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(!view.discardEditing(), "discardEditing failed");

  assert.ok(fakeEditor.discardEditingCalled, "discardEditing called");

  assert.ok(fakeDelegate.shouldDiscardCalled, "shouldDiscard called");
});

test("discardEditing should cleanup properly on success", function (assert) {
  reset();

  // test when successful
  fakeDelegate.shouldDiscardAllowed = true;
  fakeEditor.discardEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  assert.ok(view.discardEditing(), "discardted editing");

  assert.ok(view.beginEditing(), "cleaned up successfully on discard");
});

test("delegate methods are called in order by discardEditing", function (assert) {
  reset();

  fakeDelegate.shouldDiscardAllowed = true;
  fakeEditor.discardEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  SC.run(function() {
    assert.ok(view.discardEditing(), "discardted editing");
  }, undefined, true);

  assert.ok(fakeDelegate.willDiscardCalled, "willDiscard was called");

  assert.ok(fakeDelegate.didDiscardCalled, "didDiscard was called");
});

test("delegate methods are not called when discardEditing fails", function (assert) {
  reset();

  fakeDelegate.shouldDiscardAllowed = false;
  fakeEditor.discardEditingAllowed = true;

  assert.ok(view.beginEditing(), "began editing");

  SC.run(function() {
    assert.ok(!view.discardEditing(), "discard failed");
  }, undefined, true);

  assert.ok(!fakeDelegate.willDiscardCalled, "willDiscard was not called");

  assert.ok(!fakeDelegate.didDiscardCalled, "didDiscard was not called");
});

})();

