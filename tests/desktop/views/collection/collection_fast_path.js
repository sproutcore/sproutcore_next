// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from "../../../../core/core.js";
import { ControlTestPane } from "../../../view/test_support/control_test_pane.js";
import { CollectionView } from "../../../../desktop/desktop.js";
import { CoreTest } from "../../../../testing/core.js";

// Note that as of 1.10, the CollectionView fast path is turned on by default.

var pane = ControlTestPane.design()
  .add('group-item-test', CollectionView, {
      content: [
        SC.Object.create({ title: 'a' }),
        SC.Object.create({ title: 'b' })
      ]
  });

module("CollectionView fast path", {
  beforeEach: function() {
    pane.standardSetup().beforeEach();
  },

  afterEach: function() {
    pane.standardSetup().afterEach();
  }
});


/**
  There was a bug that if you called itemViewForContentIndex() on a fast-path
  CollectionView BEFORE it was visible, it would throw an exception (because
  this._mapView wasn't initialized properly in fast-path mode).
*/
test("Calling itemViewForContentIndex() before the Collection is visible.", function (assert) {
  var view;
  SC.run(function() {
    view = CollectionView.create({
      content: "a b c d e f".w().map(function(x) {
        return SC.Object.create({ title: x });
      }),
      // STUB: reloadIfNeeded
      reloadIfNeeded: CoreTest.stub('reloadIfNeeded', CollectionView.prototype.reloadIfNeeded)
    });
  });

  try {
    var itemView = view.itemViewForContentIndex(0);
    assert.ok(true, 'Requesting itemViewForContentIndex() should not throw an exception prior to reloadIfNeeded being called.');

    view.reloadIfNeeded.expect(0);
  } catch (ex) {
    assert.ok(false, 'Requesting itemViewForContentIndex() should not throw an exception prior to reloadIfNeeded being called.');
  }

  // The next test just shows how that when isVisibleInWindow changes, causing
  // reloadIfNeeded to be called, then the request would succeed.
  try {
    SC.run(function () {
      view.createLayer();
      view._doAttach(document.body);
    });

    view.reloadIfNeeded.expect(1);
    itemView = view.itemViewForContentIndex(0);
    assert.ok(true, 'Requesting itemViewForContentIndex() should not throw an exception after reloadIfNeeded being called.');
  } catch (ex) {
    assert.ok(false, 'Requesting itemViewForContentIndex() should not throw an exception after reloadIfNeeded being called.');
  }

  view.destroy();
});

test("Changing a pooled item view's group view status.", function (assert) {
  var view = pane.view('group-item-test'),
      childView = view.childViews[0];

  // Test the example view for isGroupView and 'sc-item'.
  assert.ok(!childView.get('isGroupView'), 'Item view should have "isGroupView" property set to false.');
  assert.ok(childView.get('classNames').contains('sc-item'), 'Item view should have "sc-item" class in classNames list.');
  assert.ok(!childView.get('classNames').contains('sc-group-item'), 'Item view should not have "sc-group-item" class in classNames list.');
  assert.ok(childView.$().hasClass('sc-item'), 'Item view should have "sc-item" class on its element.');
  assert.ok(!childView.$().hasClass('sc-group-item'), 'Item view should not have "sc-group-item" class on its element.');

  // Change all childViews to groups.
  view._contentIndexIsGroup = function() { return true; };
  SC.run(function() {
    view.reload();
  });

  assert.ok(childView.get('isGroupView'), 'Group view should have "isGroupView" property set to true.');
  assert.ok(!childView.get('classNames').contains('sc-item'), 'Group view should not have "sc-item" class in classNames list.');
  assert.ok(childView.get('classNames').contains('sc-group-item'), 'Group view should have "sc-group-item" class in classNames list.');
  assert.ok(!childView.$().hasClass('sc-item'), 'Group view should not have "sc-item" class on its element.');
  assert.ok(childView.$().hasClass('sc-group-item'), 'Group view should have "sc-group-item" class on its element.');


});
