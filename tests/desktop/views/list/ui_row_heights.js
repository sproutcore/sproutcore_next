// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, test, ok, same, equals */

import { SC } from "../../../../core/core.js";
import { SCArray } from "../../../../core/mixins/array.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run } from "../../../../core/system/runloop.js";
import { ListView } from "../../../../desktop/desktop.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";

/*
  These tests evaluate progressive rendering within the clippingFrame on a list with
  custom row heights, outlines, group views or any other non-standard behavior.
*/

// create a fake content array.  Generates a list with whatever length you
// want of objects with a title based on the index.  Cannot mutate.
var ContentArray = SC.Object.extend(SCArray, {

  length: 0,

  objectAt: function(idx) {
    if (idx >= this.get('length')) return undefined;

    var content = this._content, ret ;
    if (!content) content = this._content = [];

    ret = content[idx];
    if (!ret) {
      ret = content[idx] = SC.Object.create({
        title: "ContentItem %@".fmt(idx),
        isDone: (idx % 3)===0,
        unread: (Math.random() > 0.5) ? Math.floor(Math.random() * 100) : 0
      });
    }

    return ret ;
  }
});

var pane = ControlTestPane.design();
pane.add("Custom Row Heights", ListView.design({
  // To avoid turning this into a ScrollView integration test, our strategy is to override clippingFrame to allow
  // us to control it directly, focusing our tests on the "progressive rendering within a given clipping frame" unit.
  clippingFrame: function(key, value) {
    return value || { x: 0, y: 0, width: 100, height: 200 };
  }.property('frame', 'parentView').cacheable(),

  content: ContentArray.create({ length: 100001 }),
  customRowSizeIndexes: IndexSet.create(2,5).add(10000,100),

  // used for testing
  adjustableRows: IndexSet.create(0,5),
  altRowHeight: 10,

  contentIndexRowHeight: function(view, content, index) {
    var ret = this.get('rowHeight');
    if (!this.customRowSizeIndexes.contains(index)) return ret;
    else return this.adjustableRows.contains(index) ? this.get('altRowHeight') : ret * 2;
  },

  contentValueKey: "title",
  contentCheckboxKey: "isDone",
  contentUnreadCountKey: "unread",
  rowHeight: 20
}));
pane.add("Custom Row Heights 2", ListView.design({
  // To avoid turning this into a ScrollView integration test, our strategy is to override clippingFrame to allow
  // us to control it directly, focusing our tests on the "progressive rendering within a given clipping frame" unit.
  clippingFrame: function(key, value) {
    return value || { x: 0, y: 0, width: 100, height: 200 };
  }.property('frame', 'parentView').cacheable(),

  content: ContentArray.create({ length: 100 }),
  customRowSizeIndexes: IndexSet.create(0,1000),

  contentIndexRowHeight: function(view, content, index) {
    if (index % 2 === 0) {
      return 17;
    }
    else {
      return 48;
    }
  },

  contentValueKey: "title",
  contentCheckboxKey: "isDone",
  contentUnreadCountKey: "unread",
  rowHeight: 48

}));

function verifyChildViewsMatch(assert, views, set) {
  var indexes = set.clone();
  views.forEach(function(view) {
    var idx = view.contentIndex ;
    if (indexes.contains(idx)) {
      assert.ok(true, "should find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    } else {
      assert.ok(false, "should NOT find childView for contentIndex %@ (nowShowing=%@)".fmt(idx, set));
    }
    indexes.remove(idx);
  }, this);

  if (indexes.get('length') === 0) {
    assert.ok(true, "all nowShowing indexes should have matching child views");
  } else {
    assert.ok(false, "all nowShowing indexes should have matching child views (indexes not found: %@)".fmt(indexes));
  }
}

module("ListView - ui_row_heights", {
  beforeEach: function () {
    pane.standardSetup().beforeEach();
  },

  afterEach: function () {
    pane.standardSetup().afterEach();
  }
});

// ..........................................................
// BASIC RENDER TESTS
//

test("rendering only incremental portion", function (assert) {
  var listView = pane.view("Custom Row Heights");
  assert.deepEqual(listView.get("nowShowing"), IndexSet.create(0, 10), 'nowShowing should be smaller IndexSet');
  assert.equal(listView.get('childViews').length, listView.get('nowShowing').get('length'), 'should have same number of childViews as nowShowing length');
});

test("changing clippingFrame should update incremental rendering", function (assert) {
  var listView = pane.view('Custom Row Heights'),
      exp;

  assert.deepEqual(listView.get('nowShowing'), IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // MOVE CLIPPING FRAME DOWN ONE LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 61, width: 100, height: 200 });
  });

  // top line should now be clipped out of view
  exp = IndexSet.create(4,9);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);

  // MOVE CLIPPING FRAME DOWN ANOTHER LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 83, width: 100, height: 200 });
  });

  // next line should be clipped out of view
  exp = IndexSet.create(5,9);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);


  // SCROLL UP ONE LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 66, width: 100, height: 200 });
  });

  // top line should no longer be clipped
  exp = IndexSet.create(4,9);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);

});

test("the 'nowShowing' property should be correct when scrolling", function (assert) {
  var listView = pane.view('Custom Row Heights 2'),
      correctSet = IndexSet.create(1, 7);

  // Clip down to point 36 to demonstrate a problem with the older list view
  // contentIndexesInRect code.
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 36, width: 100, height: 200 });
  });
  assert.deepEqual(listView.get("nowShowing"), correctSet, 'nowShowing should %@'.fmt(correctSet));
});

// ..........................................................
// CHANGING ROW HEIGHTS
//

test("manually calling rowSizeDidChangeForIndexes()", function (assert) {
  var listView = pane.view('Custom Row Heights');

  assert.deepEqual(listView.get('nowShowing'), IndexSet.create(0,10), 'precond - nowShowing has incremental range');

  // adjust row height and then invalidate a portion range
  run(function() {
    listView.set('altRowHeight', 80);
    listView.rowSizeDidChangeForIndexes(listView.adjustableRows);
  });

  // nowShowing should adjust
  assert.deepEqual(listView.get('nowShowing'), IndexSet.create(0,4), 'visible range should decrease since row heights for some rows doubled');

  // as well as offset and heights for rows - spot check
  var view = listView.itemViewForContentIndex(3);
  assert.deepEqual(view.get('layout'), { top: 120, left: 0, right: 0, height: 80 });

});

