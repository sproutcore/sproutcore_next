// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView } from "../../../../desktop/desktop.js";
import { RunLoop } from "../../../../core/system/runloop.js";

var view ;
module("CollectionView#displayProperties", {
  beforeEach: function() {
    view = CollectionView.create({
        isVisibleInWindow: true
    }).createLayer();
  },

  afterEach: function() {
    view.destroy();
  }
});

test("should gain active class if isActive", function (assert) {
  RunLoop.begin();
  view.set('isActive', true);
  RunLoop.end();
  assert.ok(view.$().hasClass('active'), 'should have active class');

  RunLoop.begin();
  view.set('isActive', false);
  RunLoop.end();
  assert.ok(!view.$().hasClass('active'), 'should remove active class');
});
