// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView } from "../../../../desktop/desktop.js";
import { SC } from "../../../../core/core.js";
import { run } from "../../../../core/system/runloop.js";
import { View } from "../../../../view/view.js";
import { CoreTest } from "../../../../testing/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";

var view, content ;

module("CollectionView#reload (unattached)", {
  beforeEach: function () {
    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ value: x });
    });

    view = CollectionView.create({
      content: content
    });
  },

  afterEach: function () {
    view.destroy();
    view = content = null;
  }
});


test("should only reload when isVisibleInWindow", function (assert) {
  var len = view.getPath('childViews.length');

  run(function() {
    view.reload();
  });

  assert.equal(view.getPath('childViews.length'), len, 'view.childViews.length should not change while offscreen');

  run(function() {
    view.createLayer();
    view._doAttach(document.body);
  });

  assert.equal(view.getPath('childViews.length'), content.get('length'), 'view.childViews.length should change when moved onscreen if reload is pending');
});


module("CollectionView.reload (attached)", {
  beforeEach: function () {
    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ value: x });
    });

    view = CollectionView.create({
      content: content,
      exampleView: View.extend({
        isReusable: false
      }),

      // STUB: reload
      reload: CoreTest.stub('reload', CollectionView.prototype.reload)
    });

    run(function() {
      view.createLayer();
      view._doAttach(document.body);
    });
  },

  afterEach: function () {
    view.destroy();
    view = content = null;
  }
});

/*
  Verifies that the item views for the passed collection view match exactly the
  content array passed.  If shouldShowAllContent is also true then verifies
  that the nowShowing range is showing the entire content range.

  @param {CollectionView} view the view to test
  @param {Array} content the content array
  @param {Boolean} shouldShowAllContent
  @param {String} testName optional test name
  @returns {void}
*/
function verifyItemViews(view, content, shouldShowAllContent, testName) {
  var nowShowing = view.get('nowShowing'),
      childViews = view.get('childViews');

  if (testName === undefined) testName = '';

  if (shouldShowAllContent) {
    assert.ok(nowShowing.isEqual(IndexSet.create(0, content.get('length'))), '%@ nowShowing (%@) should equal (0..%@)'.fmt(testName, nowShowing, content.get('length')-1));
  }

  assert.equal(childViews.get('length'), nowShowing.get('length'), '%@ view.childViews.length should match nowShowing.length'.fmt(testName));

  var iter= 0;
  nowShowing.forEach(function(idx) {
    var itemView = view.itemViewForContentIndex(idx),
        item     = content.objectAt(idx);

    if (itemView) {
      assert.equal(itemView.get('content'), item, '%@ childViews[%@].content should equal content[%@]'.fmt(testName, iter,idx));
    }
    iter++;
  });
}

// ..........................................................
// BASIC TESTS
//

test("should automatically reload if content is set when collection view is first created", function (assert) {
  assert.ok(view.get('content'), 'precond - should have content');

  verifyItemViews(view, content, true);
});

test("should automatically reload if isEnabled changes", function (assert) {
  assert.ok(view.get('content'), 'precond - should have content');

  view.reload.reset();
  view.set('isEnabled', false);
  view.reload.expect(1);
  view.set('isEnabled', true);
  view.reload.expect(2);
  verifyItemViews(view, content, true);
});

test("reload(null) should generate item views for all items", function (assert) {

  run(function() {
    view.reload();
  });

  verifyItemViews(view, content, true);
});

test("reload(index set) should update item view for items in index only", function (assert) {

  // make sure views are loaded first time
  run(function() {
    view.reload();
  });

  // now get a couple of child views.
  var cv1 = view.childViews[1], cv2 = view.childViews[3];

  // and then reload them
  run(function() { view.reload(IndexSet.create(1).add(3)); });

  assert.ok(cv1 !== view.childViews[1], 'view.childViews[1] should be new instance after view.reload(<1,3>) actual: %@ expected: %@'.fmt(view.childViews[1], cv1));
  assert.ok(cv2 !== view.childViews[3], 'view.childViews[3] should be new instance after view.reload(<1,3>) actual: %@ expected: %@'.fmt(view.childViews[3], cv2));

  // verify integrity
  verifyItemViews(view, content, true);
});

test("adding items to content should reload item views at end", function (assert) {
  run(function() {
    content.pushObject(SC.Object.create());
  });
  verifyItemViews(view, content, true);
});

test("removing items from content should remove item views", function (assert) {
  run(function() {
    content.popObject();
  });
  verifyItemViews(view, content, true);
});

// ..........................................................
// SPECIAL CASES
//

test("remove and readd item", function (assert) {
  // first remove an item.
  var item = content.objectAt(0);
  run(function() { content.removeAt(0); });
  verifyItemViews(view, content, true, 'after content.removeAt(0)');

  // then readd the item
  run(function() { content.insertAt(0, item); });
  verifyItemViews(view, content, true, 'after content.insertAt(0,item)');

  // then add another item
  item = SC.Object.create();
  run(function() { content.pushObject(item); });
  verifyItemViews(view, content, true, 'after content.pushObject(item)');

  // and remove the item
  run(function() { content.popObject(); });
  verifyItemViews(view, content, true, 'after content.popObject(item)');

});

