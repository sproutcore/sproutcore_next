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
  This test evaluates progressive rendering to the clippingFrame in a plain list with no
  custom row heights, outlines, group views or other non-standard behavior.
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
pane.add("basic", ListView.design({
  // To avoid turning this into a ScrollView integration test, our strategy is to override clippingFrame to allow
  // us to control it directly, focusing our tests on the "progressive rendering within a given clipping frame" unit.
  clippingFrame: function(key, value) {
    return value || { x: 0, y: 0, width: 100, height: 300 };
  }.property('frame', 'parentView').cacheable(),

  content: ContentArray.create({ length: 20001 }),
  contentValueKey: "title",
  contentCheckboxKey: "isDone",
  contentUnreadCountKey: "unread",
  rowHeight: 20

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

module("ListView - simple list", pane.standardSetup());

// ..........................................................
// BASIC RENDER TESTS
//

test("rendering only incremental portion", function (assert) {
  var listView = pane.view("basic");
  assert.ok(listView.getPath("nowShowing.length") < listView.get('length'), 'nowShowing should be a subset of content items');
  assert.equal(listView.get('childViews').length, listView.get('nowShowing').get('length'), 'should have same number of childViews as nowShowing length');
});

test("scrolling by small amount should update incremental rendering", function (assert) {
  var listView = pane.view('basic'),
      exp;

  assert.ok(listView.getPath('nowShowing.length') < listView.get('length'), 'precond - nowShowing has incremental range');

  exp = IndexSet.create(0, 15);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should start at just the first 20 items');

  // CLIP DOWN ONE LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 20, width: 100, height: 300 });
  });

  // top line should be clipped out of view
  exp = IndexSet.create(1,15);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);

  // CLIP DOWN ANOTHER LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 42, width: 100, height: 300 });
  });

  // top line should be clipped out of view
  exp = IndexSet.create(2,16);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);

  // CLIP BACK UP ONE LINE
  run(function() {
    listView.set('clippingFrame', { x: 0, y: 21, width: 100, height: 300 });
  });

  // top line should be clipped out of view
  exp = IndexSet.create(1,16);
  assert.deepEqual(listView.get('nowShowing'), exp, 'nowShowing should change to reflect new clippingFrame');

  verifyChildViewsMatch(assert, listView.childViews, exp);

});
