// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { SCArray } from "../../../../core/mixins/array.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run } from "../../../../core/system/runloop.js";
import { ListView, ScrollView } from "../../../../desktop/desktop.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";

/*
  This test evaluates the creation of list item views with alternating rows
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
        title: "ContentItem %@".fmt(idx)
      });
    }

    return ret ;
  }
});

var pane = ControlTestPane.design()
  .add("basic-even", ScrollView.design({
    layout: { left: 0, right: 0, top: 0, height: 180 },
    hasHorizontalScroller: false,
    contentView: ListView.design({
      content: ContentArray.create({ length: 10 }),
      showAlternatingRows: true,
      rowHeight: 20
    })
  }))
  .add("basic-odd", ScrollView.design({
    layout: { left: 0, right: 0, top: 0, height: 180 },
    hasHorizontalScroller: false,
    contentView: ListView.design({
      content: ContentArray.create({ length: 11 }),
      showAlternatingRows: true,
      rowHeight: 20
    })
  }));

function verifyClasses(assert, views) {
  var evens = IndexSet.create(0).addEach([2,4,6,8,10]);
  var odds = IndexSet.create(1).addEach([3,5,7,9]);

  views.forEach(function(item) {
    var cq = item.$();
    var idx = item.get('contentIndex');

    if (evens.contains(idx)) {
      assert.ok(!cq.hasClass('odd'), "item %@ doesn't have 'odd' CSS class".fmt(idx));
      assert.ok(cq.hasClass('even'), "item %@ has 'even' CSS class".fmt(idx));
    }
    else if (odds.contains(idx)) {
      assert.ok(cq.hasClass('odd'), "item %@ has 'odd' CSS class".fmt(idx));
      assert.ok(!cq.hasClass('even'), "item %@ doesn't have 'even' CSS class".fmt(idx));
    }
  });
}

module("ListView - alternating rows", pane.standardSetup());

test("alternating class set on list view", function (assert) {
  var listView = pane.view("basic-even").contentView;
  var cq = listView.$();

  assert.ok(cq.hasClass('alternating'), "ListView instance should have 'alternating' CSS class");
});

test("even/odd classes on ListItemView children - even", function (assert) {
  var items = pane.view("basic-even").contentView.childViews;
  verifyClasses(assert, items);
});

test("even/odd classes on ListItemView children - odd", function (assert) {
  var items = pane.view("basic-odd").contentView.childViews;
  verifyClasses(assert, items);
});

test("even/odd classes with incremental rendering - even", function (assert) {
  var scrollView = pane.view("basic-even"),
      listView = scrollView.contentView,
      items = listView.childViews;

  run(function() {
    scrollView.scrollTo(0,21);
  });

  verifyClasses(assert, items);

  run(function() {
    scrollView.scrollTo(0,0);
  });

  verifyClasses(assert, items);
});

test("even/odd classes with incremental rendering - odd", function (assert) {
  var scrollView = pane.view("basic-odd"),
      listView = scrollView.contentView,
      items = listView.childViews;

  run(function() {
    scrollView.scrollTo(0,21);
  });

  verifyClasses(assert, items);

  run(function() {
    scrollView.scrollTo(0,0);
  });

  verifyClasses(assert, items);
});
