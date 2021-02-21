// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start Q$ */
import { SC } from '../../../../core/core.js';
import { View, InlineEditable, InlineTextFieldView } from '../../../../view/view.js';

var field, view;

/**
  Track the public functions and properties of the class.  This will serve as an early warning
  when functions that people may depend on disappear between versions to ensure that we don't
  break promised support without proper deprecations.

  tylerkeating: This is probably redundant since each of these functions and properties should
  be individually tested elsewhere.
*/
module("Test the public functions and properties of InlineTextFieldView", {
  beforeEach: function() {
    view = View.create(InlineEditable, {});
    field = InlineTextFieldView.create({});
  },

  afterEach: function() {
    field = null;
  }
});

test("contains all public functions", function (assert) {
  assert.ok(field.respondsTo('beginEditing'), "should respond to beginEditing()");
  assert.ok(field.respondsTo('commitEditing'), "should respond to commitEditing()");
  assert.ok(field.respondsTo('discardEditing'), "should respond to discardEditing()");
  assert.ok(field.respondsTo('blurEditor'), "should respond to blurEditor()");
  assert.ok(field.respondsTo('cancel'), "should respond to cancel()");
});

test("a view with InlineEditable mixin contains all public functions", function (assert) {
  assert.ok(view.respondsTo('beginEditing'), "should respond to beginEditing()");
  assert.ok(view.respondsTo('commitEditing'), "should respond to commitEditing()");
  assert.ok(view.respondsTo('discardEditing'), "should respond to discardEditing()");
});

test("contains all public properties", function (assert) {
  assert.ok(field.get('isEditing') !== undefined, "should have isEditing property");
});
