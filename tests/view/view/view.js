// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, equals, context, ok, same */

import { View, Theme } from '/view/view.js';

module("View");

test("setting themeName should trigger a theme observer", function (assert) {
  var count = 0;
  var view = View.create({
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  view.set('themeName', 'hello');
  assert.equal(1, count, "theme observers should get called");
});

test("setting themeName should trigger a theme observer when extending", function (assert) {
  var count = 0;
  var CustView = View.extend({
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  CustView.create().set('themeName', 'hello');
  assert.equal(1, count, "theme observers should get called");
});

test("it still works with the backward compatible theme property", function (assert) {
  var count = 0;
  var view = View.create({
    theme: 'sc-base',
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  assert.equal(Theme.find('sc-base'), view.get('theme'));
  view.set('themeName', 'hello');
  assert.equal(1, count, "theme observers should get called");
});

test("it still works with the backward compatible theme property when extending", function (assert) {
  var count = 0;
  var CustView = View.extend({
    theme: 'sc-base',
    themeDidChange: function() {
      count++;
    }.observes('theme')
  });

  var view = CustView.create();
  assert.equal(Theme.find('sc-base'), view.get('theme'));
  view.set('themeName', 'hello');
  assert.equal(1, count, "theme observers should get called");
});

var view;
module("View methods", {
  beforeEach: function () {
    view = View.create({});
  },

  afterEach: function () {
    view.destroy();
    view = null;
  }
});

test("_callOnChildViews", function (assert) {
  var aContext = 'abc',
      callees = [],
      contexts = [],
      childView = View.create({
        childViews: ['grandChildView'],
        calledFunction: function (context) {
          callees.push(this);
          if (context) { contexts.push(context); }
        },

        grandChildView: View.extend({
          calledFunction: function (context) {
            callees.push(this);
            if (context) { contexts.push(context); }
          }
        })
      }),
      grandChildView;

  // Add the child view (and grandchild view).
  view.appendChild(childView);

  // Grab the grandchild view for easy reference.
  grandChildView = childView.get('childViews').objectAt(0);

  // Call the function by default (top-down).
  view._callOnChildViews('calledFunction');
  assert.deepEqual(callees, [childView, grandChildView], "The child view function should be called top-down.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function top-down.
  view._callOnChildViews('calledFunction', true);
  assert.deepEqual(callees, [childView, grandChildView], "The child view function should be called top-down.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function top-down with context.
  view._callOnChildViews('calledFunction', true, aContext);
  assert.deepEqual(callees, [childView, grandChildView], "The child view function should be called top-down.");
  assert.deepEqual(contexts, [aContext, aContext], "The child view function when called should receive the context.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function bottom-up.
  view._callOnChildViews('calledFunction', false);
  assert.deepEqual(callees, [grandChildView, childView], "The child view function should be called bottom-up.");

  // Reset.
  callees.length = 0;
  contexts.length = 0;

  // Call the function bottom-up with context.
  view._callOnChildViews('calledFunction', false, aContext);
  assert.deepEqual(callees, [grandChildView, childView], "The child view function should be called bottom-up.");
  assert.deepEqual(contexts, [aContext, aContext], "The child view function when called should receive the context.");
});
