// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView } from "../../../../desktop/desktop.js";
import { CoreTest } from "../../../../testing/core.js";
import { IndexSet } from "../../../../core/system/index_set.js";

var view, content1, content2 ;

module("CollectionView.nowShowing", {
  beforeEach: function() {

    content1 = "a b c".w();

    // stub in collection view to verify that proper method are called
    view = CollectionView.create({

      // updateContentRangeObserver
      updateContentRangeObserver: CoreTest.stub('updateContentRangeObserver'),

      // reload()

      reloadCallCount: 0,
      reloadIndexes: "not called",

      reload: function(indexes) {
        this.reloadIndexes = indexes ? indexes.frozenCopy() : indexes;
        this.reloadCallCount++;
      },

      expectReload: function(indexes, callCount) {
        if (indexes !== false) {
          var pass = (indexes === null) ? (this.reloadIndexes === null) : indexes.isEqual(this.reloadIndexes);
          if (!pass) {
            indexes.isEqual(this.reloadIndexes);
          }
          assert.ok(pass, 'should have called reload(%@), actual reload(%@)'.fmt(indexes, this.reloadIndexes));
        }

        if (callCount !== false) {
          assert.equal(this.reloadCallCount, callCount, 'reload() should be called X times');
        }
      },

      // GENERAL SUPPORT

      observer: CoreTest.stub('nowShowing observer').observes('nowShowing'),

      reset: function() {
        this.updateContentRangeObserver.reset();
        this.reloadCallCount = 0 ;
        this.reloadIndexes = 'not called';
        this.observer.reset();
      },

      nextNowShowing: IndexSet.create(0,3),

      // override to reeturn whatever index set is in nextNowShowing property just
      // for testing.
      computeNowShowing: function() {
        return this.nextNowShowing;
      },

      content: content1

    });

    // some observers will fire on creation because of the content.  just
    // ignore them
    view.reset();

  }
});

// ..........................................................
// GENERAL TESTS
//

test("nowShowing should reflect content on create", function (assert) {

  assert.deepEqual(view.get('nowShowing'), view.nextNowShowing, 'should have now showing value');
});

test("if nowShowing changes but actual value stays the same, should do nothing", function (assert) {

  // trigger any observers
  view.notifyPropertyChange('nowShowing');
  view.observer.expect(1);
  view.expectReload(false, 0);
  view.updateContentRangeObserver.expect(0);
});

test("nowShowing changes to new index set with some overlap", function (assert) {
  view.nextNowShowing = IndexSet.create(2,5);
  view.notifyPropertyChange('nowShowing');
  view.observer.expect(1);

  // expect inverse of intersection
  view.expectReload(IndexSet.create(0,2).add(3,4), 1);

  view.updateContentRangeObserver.expect(1);
});

test("nowShowing changes to new index set with no overlap", function (assert) {
  view.nextNowShowing = IndexSet.create(10,3);
  view.notifyPropertyChange('nowShowing');
  view.observer.expect(1);

  // union of both ranges
  view.expectReload(IndexSet.create(0,3).add(10,3), 1);

  view.updateContentRangeObserver.expect(1);
});

// ..........................................................
// SPECIAL CASES
//

// Add any specific cases you find that break here


