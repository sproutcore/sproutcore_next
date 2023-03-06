// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { CollectionView } from "../../../../desktop/desktop.js";
import { CollectionViewDelegate } from "../../../../desktop/desktop.js";
import { SC } from "../../../../core/core.js";

var view, sel, beforeLen, afterLen, content ;

module("CollectionView.deleteSelection", {
  beforeEach: function() {

    content = "1 2 3 4 5 6 7 8 9 10".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

    sel  = SC.SelectionSet.create().add(content,4,2);

    view = CollectionView.create({
      content: content,
      selection: sel,
      canDeleteContent: true
    });

    beforeLen = content.get('length');
    afterLen  = beforeLen - sel.get('length');
  }
});

// ..........................................................
// BASIC OPERATIONS
//

test("canDeleteContent", function (assert) {

  view.set('canDeleteContent', false);
  assert.equal(view.deleteSelection(), false, 'should return false if not allowed');
  assert.equal(content.get('length'), beforeLen, 'content.length should not change');
  assert.equal(view.get('selection').get('length'), 2, 'should not change selection');

  view.set('canDeleteContent', true);
  assert.equal(view.deleteSelection(), true, 'should return true if allowed');
  assert.equal(content.get('length'), afterLen, 'content.length should change');
  assert.equal(view.get('selection').indexSetForSource(content).get('min'), 3, 'should select an adjacent item');
});

test("empty selection case", function (assert) {
  view.select(null); // clear selection
  view.set('canDeleteContent', true);
  assert.equal(view.get('selection').get('length'), 0, 'precond - should have empty selection');

  assert.equal(view.deleteSelection(), false, 'should return false if not allowed');
  assert.equal(content.get('length'), beforeLen, 'content.length should not change');
});

test("delegate.collectionViewShouldDeleteIndexes", function (assert) {
  view.set('canDeleteContent', true);
  view.delegate = SC.Object.create(CollectionViewDelegate, {

    v: null,

    collectionViewShouldDeleteIndexes: function() { return this.v; }
  });

  // delegate returns false
  assert.equal(view.deleteSelection(), false, 'should return false if not allowed');
  assert.equal(content.get('length'), beforeLen, 'content.length should not change');
  assert.equal(view.get('selection').get('length'), 2, 'should not change selection');

  // delegate returns partial
  view.delegate.v = SC.IndexSet.create(4,1);
  assert.equal(view.get('selectionDelegate'), view.delegate, 'selection delegate should be delegate object');
  assert.equal(view.deleteSelection(), true, 'should return true if allowed');
  assert.equal(content.get('length'), afterLen+1, 'content.length should change');
  assert.equal(view.get('selection').get('length'), 1, 'non-deleted parts should remain selected %@'.fmt(view.get('selection')));
});

// ..........................................................
// EDGE CASES
//

// Add special edge cases here
