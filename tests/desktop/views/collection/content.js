// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { CollectionView } from "../../../../desktop/desktop.js";
import { CoreTest } from "../../../../testing/core.js";
import { SC } from "../../../../core/core.js";

var view, content1, content2 ;

module("CollectionView.content", {
  beforeEach: function() {

    // stub in collection view to verify that proper method are called
    view = CollectionView.create({

      // ..........................................................
      // STUB: contentPropertyDidChange
      //
      contentPropertyDidChange: CoreTest.stub('contentPropertyDidChange'),

      // ..........................................................
      // STUB: computeLayout
      //
      computeLayout: CoreTest.stub('computeLayout', CollectionView.prototype.computeLayout),

      // ..........................................................
      // STUB: RELOAD
      //
      reload: CoreTest.stub("reload", {

        // detect if we would reload everything.
        shouldReloadAll: function() {
          var history = this.history,
              loc = history.length,
              args;

          while(--loc >= 0) {
            args = history[loc];
            if (args <= 1) return true ;
            if (args[1] === null) return true ;
            if (args[0].get('nowShowing').contains(args[1])) return true ;
          }
          return false ;
        },

        // join all reload indexes passed excluding null or undefined
        indexes: function() {
          var history = this.history,
              loc = history.length,
              ret = SC.IndexSet.create(),
              args;

          while(--loc >= 0) {
            args = history[loc];
            if (args[1] && args[1].isIndexSet) ret.add(args[1]);
          }

          return ret ;
        },

        // need to save the passed indexes set as a clone because it may be
        // reused later...
        action: function(indexes) {
          var history = this.reload.history;  // note "this" is view
          if (indexes) {
            history[history.length-1][1] = indexes.clone();
          }

          // simulate calling computeLayout() to match original impl.
          this.computeLayout();

          return this ;
        },

        expect: function(indexes, callCount) {

          if (indexes === true) {
            assert.equal(this.shouldReloadAll(), true, 'reload() should reload all');
          } else if (indexes !== false) {
            var expected = this.indexes();
            var passed = indexes.isEqual(expected);
            assert.ok(passed, "expected reload(%@), actual: reload(%@)".fmt(indexes, expected));
          }

          if (callCount !== undefined) {
            assert.equal(this.callCount, callCount, 'reload() should have been called X times');
          }

          this.reset();
        }

      }),

      expectLength: function(len) {
        assert.equal(view.get('length'), len, 'view.length after change');


        var nowShowing = view.get('nowShowing'),
            expected = SC.IndexSet.create(0,len);
        assert.ok(expected.isEqual(nowShowing), 'nowShowing expected: %@, actual: %@'.fmt(expected, nowShowing));
      },

      // reset stubs
      reset: function() {
        this.reload.reset();
        this.contentPropertyDidChange.reset();
        this.computeLayout.reset();
      }

    });

    content1 = "a b c d e f".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

    content2 = "d e f x y z".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

  }
});

// ..........................................................
// BASIC EDITS
//

test("setting content for first time", function (assert) {
  assert.equal(view.get('content'), null, 'precond - view.content should be null');

  SC.run(function () {
    view.set('content', content1);
  });
  view.reload.expect(true, 2); // should reload everything
  view.contentPropertyDidChange.expect(0); // should not call
  view.computeLayout.expect(true);
  view.expectLength(content1.get('length'));
});

test("changing content with different size", function (assert) {

  SC.run(function () {
    view.set('content', "a b".w());
  });
  view.reset();

  SC.run(function () {
    view.set('content', content2);
  });
  view.reload.expect(true, 2); // call twice?
  view.contentPropertyDidChange.expect(0); // should not call
  view.computeLayout.expect(true);
  view.expectLength(content2.get('length'));
});

test("changing content with same size", function (assert) {

  SC.run(function () {
    view.set('content', "a b".w());
  });
  view.reset();

  SC.run(function () {
    view.set('content', content2);
  });
  view.reload.expect(true);
  view.contentPropertyDidChange.expect(0); // should not call
  view.computeLayout.expect(true);
  view.expectLength(content2.get('length'));
});

test("changing the content of a single item should reload that item", function (assert) {

  SC.run(function () {
    view.set('content', content1);
  });
  view.reset(); // don't care about this fire

  SC.run(function () {
    content1.replace(1,1, ["X"]);
  });
  view.reload.expect(SC.IndexSet.create(1));
  view.contentPropertyDidChange.expect(0); // should not call
  view.computeLayout.expect(true);
  view.expectLength(content1.get('length'));
});

test("changing the content of several items should reload each item", function (assert) {

  SC.run(function () {
    view.set('content', content1);
  });
  view.reset(); // don't care about this fire

  SC.run(function () {
    content1.replace(1,1, ["X"]);
    content1.replace(3,1, ["X"]);
  });
  view.reload.expect(SC.IndexSet.create(1).add(3));
  view.contentPropertyDidChange.expect(0); // should not call
  view.computeLayout.expect(true);
  view.expectLength(content1.get('length'));
});

test("adding to end of content should reload new items", function (assert) {

  SC.run(function () {
    view.set('content', content1);
  });
  view.reset(); // don't care about this fire

  SC.run(function () {
    content1.pushObject("X");
    content1.pushObject("Y");
  });

  view.reload.expect(SC.IndexSet.create(content1.get('length')-2, 2));
  view.contentPropertyDidChange.expect(0); // should not call
  view.expectLength(content1.get('length'));
  view.computeLayout.expect(true);
});

test("removing from end of content should reload removed items", function (assert) {

  SC.run(function () {
    view.set('content', content1);
  });
  view.reset(); // don't care about this fire

  SC.run(function () {
    content1.popObject();
    content1.popObject();
  });

  view.reload.expect(SC.IndexSet.create(content1.get('length'), 2));
  view.contentPropertyDidChange.expect(0); // should not call
  view.expectLength(content1.get('length'));
  view.computeLayout.expect(true);
});

test("inserting into middle should reload all following items", function (assert) {
  SC.run(function () {
    view.set('content', content1);
  });
  view.reset(); // don't care about this fire

  SC.run(function () {
    content1.insertAt(3, 'FOO');
  });

  view.reload.expect(SC.IndexSet.create(3, content1.get('length')-3));
  view.contentPropertyDidChange.expect(0); // should not call
  view.expectLength(content1.get('length'));
  view.computeLayout.expect(true);
});

// ..........................................................
// EDITING PROPERTIES
//

test("editing properties", function (assert) {
  SC.run(function () {
    view.set('content', content1);
  });
  view.reset();
  view.contentPropertyDidChange.reset();

  var obj = content1.objectAt(3);
  assert.ok(obj !== null, 'precond -has object to edit');

  obj.set('title', 'FOO');
  view.reload.expect(false, 0);
  view.contentPropertyDidChange.expect(0);
  view.computeLayout.expect(false);
});
