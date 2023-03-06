// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global ok, test, equals, module */
import { CollectionView } from "../../../../desktop/desktop.js";
import { CollectionContent } from "../../../../core/mixins/collection_content.js";
import { SC } from "../../../../core/core.js";
import { run } from "../../../../core/system/runloop.js";
import { View } from "../../../../view/view.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { LEAF_NODE } from "../../../../core/system/constants.js";
import { mixin } from "../../../../core/system/base.js";

var view, del, content ;

module("CollectionView.itemViewForContentIndex", {
  beforeEach: function() {
    content = "a b c".w().map(function(x) {
      return SC.Object.create({ title: x });
    });

    del = {
      fixture: {
        isEnabled: true,
        isSelected: true,
        outlineLevel: 3,
        disclosureState: LEAF_NODE
      },

      contentIndexIsEnabled: function() {
        return this.fixture.isEnabled;
      },

      contentIndexIsSelected: function() {
        return this.fixture.isSelected;
      },

      contentIndexOutlineLevel: function() {
        return this.fixture.outlineLevel;
      },

      contentIndexDisclosureState: function() {
        return this.fixture.disclosureState ;
      }
    };

    // NOTE: delegate methods above are added here.
    run(function () {
    view = CollectionView.create(del, {
      content: content,

      layoutForContentIndex: function(contentIndex) {
        return this.fixtureLayout ;
      },

      fixtureLayout: { left: 0, right: 0, top:0, bottom: 0 },

      groupExampleView: View.extend(), // custom for testing

      exampleView: View.extend({
        isReusable: false
      }), // custom for testing

      testAsGroup: false,

      contentIndexIsGroup: function() { return this.testAsGroup; },

      contentGroupIndexes: function() {
        if (this.testAsGroup) {
          return IndexSet.create(0, this.get('length'));
        } else return null ;
      },

      fixtureNowShowing: IndexSet.create(0,3),

      computeNowShowing: function() {
        return this.fixtureNowShowing;
      }

    });
    });

    // add in delegate mixin
    del = mixin({}, CollectionContent, del);

  }
});

function shouldMatchFixture(itemView, fixture) {
  var key;
  for(key in fixture) {
    if (!fixture.hasOwnProperty(key)) continue;
    assert.equal(itemView.get(key), fixture[key], 'itemView.%@ should match delegate value'.fmt(key));
  }
}

test("creating basic item view", function (assert) {
  var itemView = view.itemViewForContentIndex(1);

  // should use exampleView
  assert.ok(itemView, 'should return itemView');
  assert.ok(itemView.kindOf(view.exampleView), 'itemView %@ should be kindOf %@'.fmt(itemView, view.exampleView));

  // set added properties
  assert.equal(itemView.get('content'), content.objectAt(1), 'itemView.content should be set to content item');
  assert.equal(itemView.get('contentIndex'), 1, 'itemView.contentIndex should be set');
  assert.equal(itemView.get('owner'), view, 'itemView.owner should be collection view');
  assert.equal(itemView.get('displayDelegate'), view, 'itemView.displayDelegate should be collection view');
  assert.equal(itemView.get('parentView'), view, 'itemView.parentView should be collection view');

  // test data from delegate
  shouldMatchFixture(itemView, view.fixture);
});

test("isLast property", function (assert) {
  view.isVisibleInWindow = true;

  var itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isLast'), false, 'itemView.isLast should be false');

  itemView = view.itemViewForContentIndex(2);
  assert.equal(itemView.get('isLast'), true, 'itemView.isLast should be true');

  run(function () {
    view.beginPropertyChanges();
    view.get('content').pushObject(SC.Object.create({ title: 'd' }));
    view.set('fixtureNowShowing', IndexSet.create(0, 4));
    view.endPropertyChanges();
  });

  itemView = view.itemViewForContentIndex(3);
  assert.equal(itemView.get('isLast'), true, 'itemView.isLast should be true');

  itemView = view.itemViewForContentIndex(2);
  assert.equal(itemView.get('isLast'), false, 'itemView.isLast for previous last item should be false');
});

test("returning item from cache", function (assert) {

  var itemView1 = view.itemViewForContentIndex(1);
  assert.ok(itemView1, 'precond - first call returns an item view');

  var itemView2 = view.itemViewForContentIndex(1);
  assert.equal(itemView2, itemView1, 'retrieving multiple times should same instance');

  // Test internal case
  var itemView3 = view.itemViewForContentIndex(1, true);
  assert.ok(itemView1 !== itemView3, 'itemViewForContentIndex(1, true) should return new item even if it is already cached actual :%@'.fmt(itemView3));

  var itemView4 = view.itemViewForContentIndex(1, false);
  assert.equal(itemView4, itemView3, 'itemViewForContentIndex(1) [no reload] should return newly cached item after recache');

});

// Tests support for the addition of designModes to Pane and View.  Since
// CollectionView doesn't use child views and thus doesn't call
// View:insertBefore, it needs to pass the designMode down to its item views
// itself.
test("set designMode on item views", function (assert) {
  var itemView,
    updateDesignModeCount = 0;

  view.set('exampleView', View.extend({
    updateDesignMode: function updateDesignMode () {
      updateDesignModeCount++;

      updateDesignMode.base.apply(this, arguments);
    }
  }));

  // Initial designMode before creating the item view.
  view.set('designMode', 'small');
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('designMode'), 'small', "itemView.designMode should be set to match the current value of the collection");
  assert.equal(updateDesignModeCount, 1, "updateDesignMode should have been called once on the itemView");

  // Changes to designMode after creating the item view.
  view.updateDesignMode('small', 'large');
  assert.equal(itemView.get('designMode'), 'large', "itemView.designMode should be set to match the current value of the collection");
  assert.equal(updateDesignModeCount, 2, "updateDesignMode should have been called once more on each itemView");
});

// ..........................................................
// ALTERNATE WAYS TO GET AN EXAMPLE VIEW
//

test("contentExampleViewKey is set and content has property", function (assert) {
  var CustomView = View.extend();
  var obj = content.objectAt(1);
  obj.set('foo', CustomView);
  view.set('contentExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.ok(itemView.kindOf(CustomView), 'itemView should be custom view specified on object. actual: %@'.fmt(itemView));
});

test("contentExampleViewKey is set and content is null", function (assert) {
  view.set('contentExampleViewKey', 'foo');
  run(function () {
  content.replace(1,1,[null]);
  });

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.equal(itemView.get('content'), null, 'itemView content should be null');
  assert.ok(itemView.kindOf(view.exampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.exampleView, itemView));
});

test("contentExampleViewKey is set and content property is empty", function (assert) {
  view.set('contentExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.equal(itemView.get('content'), content.objectAt(1), 'itemView should have content');
  assert.ok(itemView.kindOf(view.exampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.exampleView, itemView));
});

// ..........................................................
// GROUP EXAMPLE VIEW
//

test("delegate says content is group", function (assert) {
  view.testAsGroup = true ;
  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return itemView');
  assert.ok(itemView.kindOf(view.groupExampleView), 'itemView should be groupExampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  assert.ok(itemView.isGroupView, 'itemView.isGroupView should be true');
});

test("contentGroupExampleViewKey is set and content has property", function (assert) {
  view.testAsGroup = true ;

  var CustomView = View.extend();
  var obj = content.objectAt(1);
  obj.set('foo', CustomView);
  view.set('contentGroupExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.ok(itemView.kindOf(CustomView), 'itemView should be custom view specified on object. actual: %@'.fmt(itemView));
  assert.ok(itemView.isGroupView, 'itemView.isGroupView should be true');
});

test("contentGroupExampleViewKey is set and content is null", function (assert) {
  view.testAsGroup = true ;

  view.set('contentGroupExampleViewKey', 'foo');
  run(function () {
  content.replace(1,1,[null]);
  });

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.equal(itemView.get('content'), null, 'itemView content should be null');
  assert.ok(itemView.kindOf(view.groupExampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  assert.ok(itemView.isGroupView, 'itemView.isGroupView should be true');
});

test("contentGroupExampleViewKey is set and content property is empty", function (assert) {
  view.testAsGroup = true ;

  view.set('contentGroupExampleViewKey', 'foo');

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'should return item view');
  assert.equal(itemView.get('content'), content.objectAt(1), 'itemView should have content');
  assert.ok(itemView.kindOf(view.groupExampleView), 'itemView should be exampleView (%@). actual: %@'.fmt(view.groupExampleView, itemView));
  assert.ok(itemView.isGroupView, 'itemView.isGroupView should be true');
});

test("_contentGroupIndexes's cache should be properly invalidated", function (assert) {
  view.testAsGroup = true;

  // force setup of range observers
  view.updateContentRangeObserver();

  assert.ok(view.get('_contentGroupIndexes').isEqual(IndexSet.create(0, 3)), "contentGroupIndexes should have correct initial value");

  run(function () {
  view.get('content').removeAt(2, 1);
  });

  assert.ok(view.get('_contentGroupIndexes').isEqual(IndexSet.create(0, 2)), "contentGroupIndexes should have updated value after deletion");
});


// ..........................................................
// DELEGATE SUPPORT
//

test("consults delegate if set", function (assert) {
  view.fixture = null; //break to make sure this is not used
  view.delegate = del;

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, del.fixture);
});

test("consults content if implements mixin and delegate not set", function (assert) {
  view.fixture = null; //break to make sure this is not used
  view.delegate = null;

  mixin(content, del) ; // add delegate methods to content

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, content.fixture);
});


test("prefers delegate over content if both implement mixin", function (assert) {
  view.fixture = null; //break to make sure this is not used
  view.delegate = del;
  mixin(content, del) ; // add delegate methods to content
  content.fixture = null ; //break

  var itemView = view.itemViewForContentIndex(1);
  assert.ok(itemView, 'returns item view');
  shouldMatchFixture(itemView, del.fixture);
});

// ..........................................................
// SPECIAL CASES
//


test("attempt to retrieve invalid indexes returns null", function (assert) {
  var itemView;

  itemView = view.itemViewForContentIndex(null);
  assert.equal(itemView, null, 'Using index null should not return an item view');

  itemView = view.itemViewForContentIndex(undefined);
  assert.equal(itemView, null, 'Using index undefined should not return an item view');

  itemView = view.itemViewForContentIndex(-1);
  assert.equal(itemView, null, 'Using index -1 should not return an item view');

  itemView = view.itemViewForContentIndex(view.get('length'));
  assert.equal(itemView, null, 'Using index %@ (length of content is %@) should not return an item view'.fmt(view.get('length'), view.get('length')));
});


test("after making an item visible then invisible again", function (assert) {

  view.isVisibleInWindow = true ;

  // STEP 1- setup with some nowShowing
  run(function() {
    view.set('fixtureNowShowing', IndexSet.create(1));
    view.notifyPropertyChange('nowShowing');
  });
  assert.equal(view.get('childViews').length, 1, 'precond - should have a child view');

  var itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('parentView'), view, 'itemView has parent view after some nowShowing');

  // STEP 2- setup with NONE visible
  run(function() {
    view.set('fixtureNowShowing', IndexSet.create());
    view.notifyPropertyChange('nowShowing');
  });
  assert.equal(view.get('childViews').length, 0, 'precond - should have no childview');

  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('parentView'), view, 'itemView has parent view after none visible');


  // STEP 3- go back to nowShowing
  run(function() {
    view.set('fixtureNowShowing', IndexSet.create(1));
    view.notifyPropertyChange('nowShowing');
  });
  assert.equal(view.get('childViews').length, 1, 'precond - should have a child view');

  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('parentView'), view, 'itemView has parent view after back to some nowShowing');

});

// Editable Item Views.

test("canDeleteContent sets isDeletable on the item views so they can visually indicate it", function (assert) {
  var itemView;

  view.set('canDeleteContent', true);
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isDeletable'), true, 'itemView has isDeletable');

  view.isVisibleInWindow = true;
  run(function () {
    view.set('isEditable', false);
  });

  view.set('isEditable', false);
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isDeletable'), false, 'itemView has isDeletable');
});


test("canEditContent sets isEditable on the item views so they can visually indicate it", function (assert) {
  var itemView;

  view.set('canEditContent', true);
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isEditable'), true, 'itemView has isEditable');

  view.isVisibleInWindow = true;
  run(function () {
    view.set('isEditable', false);
  });

  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isEditable'), false, 'itemView has isEditable');
});


test("canReorderContent sets isReorderable on the item views so they can visually indicate it", function (assert) {
  var itemView;

  view.set('canReorderContent', true);
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isReorderable'), true, 'itemView has isReorderable');

  view.isVisibleInWindow = true;
  run(function () {
    view.set('isEditable', false);
  });

  view.set('isEditable', false);
  itemView = view.itemViewForContentIndex(1);
  assert.equal(itemView.get('isReorderable'), false, 'itemView has isReorderable');
});

test("itemViewForContentObject", function (assert) {
  assert.equal(view.itemViewForContentObject(content[0]).getPath('content.title'), 'a', "itemViewForContentObject returns 0th itemView for the 0th content object");

  assert.equal(view.itemViewForContentObject(SC.Object.create()), null, "itemViewForContentObject returns null for a object that is not in in its content");

  var emptyContentCollection;
  run(function() {
    emptyContentCollection = CollectionView.create();
  });

  assert.equal(emptyContentCollection.itemViewForContentObject(content[0]), null, "itemViewForContentObject returns null (without erroring) when it has no content.");

});
