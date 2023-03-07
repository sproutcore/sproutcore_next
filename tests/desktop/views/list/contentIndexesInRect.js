// ==========================================================================
// Project:   SproutCore
// Copyright: ©2014 7x7 Software, Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, same, ok, equals*/

import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run } from "../../../../core/system/runloop.js";
import { ListView } from "../../../../desktop/desktop.js";


var content, view;

module("ListView.contentIndexesInRect", {
  beforeEach: function () {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function (x) {
      return SC.Object.create({ value: x });
    }, this);

    run(function() {
      view = ListView.create({
        content: content,
        rowSize: 50
      });
    });
  },

  afterEach: function () {
    view.destroy();
    content = view = null;
  }
});

test("contentIndexesInRect: rowSize of 50; no custom row sizes; no rowSpacing", function (assert) {

  var rect = { x: 0, y: 0, height: 60, width: 100 },
      indexes = view.contentIndexesInRect(rect),
      expectedIndexes = IndexSet.create(0, 2);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1] are within { y: 0, height: 60 }.");

  rect = { x: 0, y: 0, height: 110, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = IndexSet.create(0, 3);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1, 2] are within { y: 0, height: 110 }.");

  rect = { x: 0, y: 60, height: 60, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = IndexSet.create(1, 2);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [1, 2] are within { y: 60, height: 60 }.");

});

test("contentIndexesInRect: rowSize of 50; no custom row sizes; rowSpacing: 50", function (assert) {

  view.set('rowSpacing', 50);

  var rect = { x: 0, y: 0, height: 60, width: 100 },
      indexes = view.contentIndexesInRect(rect),
      expectedIndexes = IndexSet.create(0, 1);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [0] is within { y: 0, height: 60 }.");

  rect = { x: 0, y: 0, height: 110, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = IndexSet.create(0, 2);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [0, 1] are within { y: 0, height: 110 }.");

  rect = { x: 0, y: 60, height: 60, width: 100 };
  indexes = view.contentIndexesInRect(rect);
  expectedIndexes = IndexSet.create(1, 1);

  assert.ok(indexes.isEqual(expectedIndexes), "Content indexes [1] is within { y: 60, height: 60 }.");

});

// test("TODO contentIndexesInRect: custom row sizes");
