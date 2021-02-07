// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module, test, equals, ok */

import { View } from '../../../view/view.js';


var parentView;

/*
 * CoreView.UNRENDERED
 * CoreView.UNATTACHED
 * CoreView.ATTACHED_PARTIAL
 * CoreView.ATTACHED_SHOWING
 * CoreView.ATTACHED_SHOWN
 * CoreView.ATTACHED_HIDING
 * CoreView.ATTACHED_HIDDEN
 * CoreView.ATTACHED_HIDDEN_BY_PARENT
 * CoreView.ATTACHED_BUILDING_IN
 * CoreView.ATTACHED_BUILDING_OUT
 * CoreView.ATTACHED_BUILDING_OUT_BY_PARENT
 */


module("View.prototype.replaceAllChildren", {

  beforeEach: function () {
    parentView = View.create({
      childViews: ['a', 'b', View],

      a: View,
      b: View
    });
  },

  afterEach: function () {
    parentView.destroy();
    parentView = null;
  }

});

test("Replaces all children. UNRENDERED parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()];

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");
});


test("Replaces all children.  UNATTACHED parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()],
    childView, jq;

  // Render the parent view.
  parentView.createLayer();

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  jq = parentView.$();
  for (var i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");

  jq = parentView.$();
  for (i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The new child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }
});


test("Replaces all children.  ATTACHED_SHOWN parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()],
    childView, jq;

  // Render the parent view and attach.
  parentView.createLayer();
  parentView._doAttach(document.body);

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  jq = parentView.$();
  for (var i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");

  jq = parentView.$();
  for (i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The new child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }
});


module("View.prototype.replaceAllChildren", {

  beforeEach: function () {
    parentView = View.create({
      childViews: ['a', 'b', View],

      containerLayer: function () {
        return this.$('._wrapper')[0];
      }.property('layer').cacheable(),

      a: View,
      b: View,

      render: function (context) {
        context = context.begin().addClass('_wrapper');
        this.renderChildViews(context);
        context = context.end();
      }
    });
  },

  afterEach: function () {
    parentView.destroy();
    parentView = null;
  }

});


test("Replaces all children. UNRENDERED parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()];

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");
});


test("Replaces all children.  UNATTACHED parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()],
    childView, jq;

  // Render the parent view.
  parentView.createLayer();

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  jq = parentView.$('._wrapper');
  for (var i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");

  jq = parentView.$('._wrapper');
  for (i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The new child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }
});


test("Replaces all children using containerLayer.  ATTACHED_SHOWN parent view.", function (assert) {
  var childViews = parentView.get('childViews'),
    newChildViews = [View.create(), View.create()],
    childView, jq;

  // Render the parent view and attach.
  parentView.createLayer();
  parentView._doAttach(document.body);

  assert.equal(childViews.get('length'), 3, "There are this many child views originally");

  jq = parentView.$('._wrapper');
  for (var i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }

  // Replace all children.
  parentView.replaceAllChildren(newChildViews);

  childViews = parentView.get('childViews');
  assert.equal(childViews.get('length'), 2, "There are this many child views after replaceAllChildren");

  jq = parentView.$('._wrapper');
  for (i = 0, len = childViews.get('length'); i < len; i++) {
    childView = childViews.objectAt(i);

    assert.ok(jq.find('#' + childView.get('layerId')).get('length') === 1, "The new child view with layer id %@ exists in the parent view's layer".fmt(childView.get('layerId')));
  }
});
