// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { ListView } from "../../../../desktop/desktop.js";
import { CollectionRowDelegate } from "../../../../desktop/mixins/collection_row_delegate.js";
import { LAYOUT_HORIZONTAL } from "../../../../view/view.js";

var content, delegate;
var Delegate = SC.Object.extend(CollectionRowDelegate, {
  rowHeight: 40,
  customRowHeightIndexes: IndexSet.create(3).add(5,2),
  contentIndexRowHeight: function(view, content, index) {
    return this.get('customRowHeightIndexes').contains(index) ? view.get('customRowSize') : this.get('rowHeight');
  },

  expected: function(view) {
    var ret = [],
      content = view.get('content'),
      loc = view.get('length');

    while(--loc>=0) {
      ret[loc] = this.contentIndexRowHeight(view,content,loc);
    }

    return ret ;
  }
});

module("ListView.rowOffsetForContentIndex", {
  beforeEach: function() {
    content = "1 2 3 4 5 6 7 8 9 0".w().map(function(x) {
      return SC.Object.create({ value: x });
    }, this);

    // set this delegate if you want custom row heights
    delegate = Delegate.create();

  },

  afterEach: function () {
    delegate.destroy();

    content = delegate = null;
  }
});

function verifyRowOffsets(assert, view, rowSize, expected) {
  var loc = view.get('length'), actual, idx, cur=0;

  for(idx=0;idx<loc;idx++) {
    actual = view.rowOffsetForContentIndex(idx);
    assert.equal(actual, cur, "content.rowHeightForContentIndex(%@) should be expected offset".fmt(idx));
    cur += expected ? expected[idx] : rowSize;
  }

  assert.ok(loc>0, 'content should have some length');
  assert.equal(view.rowOffsetForContentIndex(loc), cur, 'content.rowHeightForContentIndex(length) should be rowHeight');

}

// ..........................................................
// BASIC TESTS
//

// @deprecated
test("constant row heights", function (assert) {
  var view = ListView.create({ content: content, rowHeight: 40, customRowHeightIndexes: null });
  verifyRowOffsets(assert, view, 40);
});

test("constant row sizes", function (assert) {
  var view = ListView.create({ content: content, rowSize: 40, customRowSizeIndexes: null });
  verifyRowOffsets(assert, view, 40);
});

// @deprecated
test("constant row heights with rowSpacing", function (assert) {
  var view = ListView.create({ content: content, rowHeight: 40, rowSpacing: 2, customRowHeightIndexes: null });
  verifyRowOffsets(assert, view, 42);
});

test("constant row sizes with rowSpacing", function (assert) {
  var view = ListView.create({ content: content, rowSize: 40, rowSpacing: 2, customRowSizeIndexes: null });
  verifyRowOffsets(assert, view, 42);
});

// @deprecated
test("custom row heights", function (assert) {
  var view = ListView.create({
    content: content,
    rowHeight: 30,
    customRowSize: 50,
    delegate: delegate
  });
  verifyRowOffsets(assert, view, 40, delegate.expected(view));
});

test("custom row sizes", function (assert) {
  var view = ListView.create({
    content: content,
    rowHeight: 30,
    customRowSize: 50,
    delegate: delegate
  });
  verifyRowOffsets(assert, view, 40, delegate.expected(view));
});

test("adding delegate should update calculation", function (assert) {
  var view = ListView.create({
    content: content,
    rowSize: 30,
    customRowSize: 50
  });
  verifyRowOffsets(assert, view, 30);

  view.set('delegate', delegate);
  verifyRowOffsets(assert, view, 40, delegate.expected(view));
});

// @deprecated
test("changing delegate from custom to not custom should update", function (assert) {
  var view = ListView.create({
    content: content,
    rowHeight: 12,
    customRowSize: 50,
    delegate: delegate
  });
  verifyRowOffsets(assert, view, 40, delegate.expected(view));

  delegate.set('customRowHeightIndexes', null);
  verifyRowOffsets(assert, view, 40);
});

test("changing delegate from custom to not custom should update", function (assert) {
  var view = ListView.create({
    content: content,
    rowSize: 12,
    customRowSize: 50,
    delegate: delegate
  });
  verifyRowOffsets(assert, view, 40, delegate.expected(view));

  delegate.set('customRowHeightIndexes', null);
  verifyRowOffsets(assert, view, 40);
});

/* When rowSpacing was implemented, it was defined on the delegate, but only retrieved from the list view itself. */
test("The value of rowSpacing is respected on row delegate", function (assert) {

  var view = ListView.create({
    content: content,
    rowSize: 30,
    customRowSizeIndexes: null,
    delegate: delegate
  });

  delegate.set('rowSpacing', 2);

  verifyRowOffsets(assert, view, 42);
});

// ..........................................................
// SPECIAL CASES
//

test("computed custom row height indexes", function (assert) {

  delegate = Delegate.create({
    indexes: Delegate.prototype.customRowHeightIndexes,
    useIndexes: false,

    customRowHeightIndexes: function() {
      return this.get('useIndexes') ? this.get('indexes') : null;
    }.property('useIndexes').cacheable()
  });

  var view = ListView.create({
    content: content,
    rowHeight: 12,
    customRowSize: 50,
    delegate: delegate
  });
  verifyRowOffsets(assert, view, 40);


  delegate.set('useIndexes', true);
  verifyRowOffsets(assert, view, 40, delegate.expected(view));
});


// ..........................................................
// Layout direction
//

test("Layout direction works horizontally", function (assert) {

  var view = ListView.create({
    layoutDirection: LAYOUT_HORIZONTAL,
    content: content,
    rowSize: 30,
    customRowSizeIndexes: null,
    delegate: delegate
  });

  verifyRowOffsets(assert, view, 40);
});
