// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { TreeItemContent } from "../../../../core/mixins/tree_item_content.js";
import { TreeItemObserver } from "../../../../core/private/tree_item_observer.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { ListView, ScrollView } from "../../../../desktop/desktop.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";

/*
  This test evaluates a plain list with no custom row heights, outlines,
  group views or any other non-standard behavior.
*/

var TreeItem = SC.Object.extend(TreeItemContent, {

  length: 10,

  title: "TREE ITEM",

  depth: 0,

  treeItemChildren: function() {
    var ret = [], loc = this.get('length'), depth = this.get('depth')+1;
    if (depth>3) loc = loc*3
    while(--loc>=0) ret[loc] = TreeItem.create({ parent: this, unread: loc, depth: depth, treeItemIsExpanded: (depth<2) });
    return ret ;
  }.property().cacheable(),

  treeItemIsExpanded: true,

  treeItemBranchIndexes: function() {
    return this.depth<3 ? IndexSet.create(0, this.get('length')) : null;
  }

});

var root = TreeItem.create({ treeItemIsExpanded: true });
var del = SC.Object.create();

var pane = ControlTestPane.design()
  .add("basic", ScrollView.design({
    layout: { left: 0, right: 0, top: 0, height: 300 },
    hasHorizontalScroller: false,
    contentView: ListView.design({
      content: TreeItemObserver.create({ item: root, delegate: del }),
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      rowHeight: 20

    })
  }));

// module("ListView - outline list", pane.standardSetup());

// test("What should be tested here?");
