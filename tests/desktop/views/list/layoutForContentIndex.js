// ==========================================================================
// Project:   SproutCore
// Copyright: ©2014 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, same, ok, equals*/

import { SC } from "../../../../core/core.js";
import { ListView } from "../../../../desktop/desktop.js";
import { LAYOUT_HORIZONTAL } from "../../../../view/view.js";


var content, view;

module("ListView.layoutForContentIndex", {
  beforeEach: function () {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function (x) {
      return SC.Object.create({ value: x });
    }, this);

    view = ListView.create({
      content: content,
      rowSize: 50
    });
  },

  afterEach: function () {
    view.destroy();
    content = view = null;
  }
});

test("Expected layout objects for each content index in vertical mode.", function (assert) {
  for (var i = 0, len = content.length; i < len; i++) {
    assert.deepEqual(view.layoutForContentIndex(i), { left: 0, right: 0, height: 50, top: i * 50 }, "The layout object at index %@ should be".fmt(i));
  }
});

test("Expected layout objects for each content index in horizontal mode.", function (assert) {
  view.set('layoutDirection', LAYOUT_HORIZONTAL);

  for (var i = 0, len = content.length; i < len; i++) {
    assert.deepEqual(view.layoutForContentIndex(i), { top: 0, bottom: 0, width: 50, left: i * 50 }, "The layout object at index %@ should be".fmt(i));
  }
});
