// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../../core/core.js';
import { View, REGULAR_CONTROL_SIZE, Control, MIXED_STATE } from '../../../../view/view.js';

/*global module test equals context ok same */

var view ;
module("Control#displayProperties", {
  beforeEach: function() {
    view = View.create(Control, {
        isVisibleInWindow: true
    }).createLayer();
    view._doAttach(document.body);
  },

  afterEach: function() {
    view.destroy();
  }
});

test("setting isSelected to true adds sel class name", function (assert) {
  SC.RunLoop.begin();
  view.set('isSelected', true);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('sel'), 'should have css class sel');
});

test("setting isSelected to MIXED_STATE add mixed class name, and removes sel class name", function (assert) {
  SC.RunLoop.begin();
  view.set('isSelected', MIXED_STATE);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('mixed'), 'should have css class mixed');
  assert.ok(!view.$().hasClass('sel'), 'should NOT have css class sel');
});

test("setting isSelected to ON removes sel class name", function (assert) {
  SC.RunLoop.begin();
  view.set('isSelected', true);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('sel'), 'precond - should have sel class');

  SC.RunLoop.begin();
  view.set('isSelected', false);
  SC.RunLoop.end();
  assert.ok(!view.$().hasClass('sel'), 'should no longer have sel class');
});

test("setting isEnabled to false adds disabled class", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', false);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('disabled'), 'should have disabled class');

  SC.RunLoop.begin();
  view.set('isEnabled', true);
  SC.RunLoop.end();
  assert.ok(!view.$().hasClass('disabled'), 'should remove disabled class');
});

test("should gain focus class if isFirstResponder", function (assert) {
  SC.RunLoop.begin();
  view.set('isFirstResponder', true);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('focus'), 'should have focus class');

  SC.RunLoop.begin();
  view.set('isFirstResponder', false);
  SC.RunLoop.end();
  assert.ok(!view.$().hasClass('focus'), 'should remove focus class');
});

test("should gain active class if isActive", function (assert) {
  SC.RunLoop.begin();
  view.set('isActive', true);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('active'), 'should have active class');

  SC.RunLoop.begin();
  view.set('isActive', false);
  SC.RunLoop.end();
  assert.ok(!view.$().hasClass('active'), 'should remove active class');
});

test("should get controlSize class on init", function (assert) {
  assert.ok(view.$().hasClass(REGULAR_CONTROL_SIZE), 'should have regular control size class');
});


