// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';
import { htmlbody, clearHtmlbody } from '../../../testing/testing.js';

module("CoreView - Class Name Bindings");

test("should apply bound class names to the element", function (assert) {
  var view = View.create({
    classNameBindings: ['priority', 'isUrgent', 'isClassified:classified', 'canIgnore'],

    priority: 'high',
    isUrgent: true,
    isClassified: true,
    canIgnore: false
  });

  view.createLayer();
  assert.ok(view.$().hasClass('high'), "adds string values as class name");
  assert.ok(view.$().hasClass('is-urgent'), "adds true Boolean values by dasherizing");
  assert.ok(view.$().hasClass('classified'), "supports customizing class name for Boolean values");
  assert.ok(!view.$().hasClass('can-ignore'), "does not add false Boolean values as class");
});

test("should add, remove, or change class names if changed after element is created", function (assert) {
  var view = View.create({
    classNameBindings: ['priority', 'isUrgent', 'isClassified:classified', 'canIgnore'],

    priority: 'high',
    isUrgent: true,
    isClassified: true,
    canIgnore: false
  });

  view.createLayer();

  view.set('priority', 'orange');
  view.set('isUrgent', false);
  view.set('isClassified', false);
  view.set('canIgnore', true);

  assert.ok(view.$().hasClass('orange'), "updates string values");
  assert.ok(!view.$().hasClass('high'), "removes old string value");

  assert.ok(!view.$().hasClass('is-urgent'), "removes dasherized class when changed from true to false");
  assert.ok(!view.$().hasClass('classified'), "removes customized class name when changed from true to false");
  assert.ok(view.$().hasClass('can-ignore'), "adds dasherized class when changed from false to true");
});

test("should preserve class names applied via classNameBindings when view layer is updated",
function(){
  var view = View.create({
    classNameBindings: ['isUrgent', 'isClassified:classified'],
    isClassified: true,
    isUrgent: false
  });
  view.createLayer();
  assert.ok(!view.$().hasClass('can-ignore'), "does not add false Boolean values as class");
  assert.ok(view.$().hasClass('classified'), "supports customizing class name for Boolean values");
  view.set('isClassified', false);
  view.set('isUrgent', true);
  assert.ok(view.$().hasClass('is-urgent'), "adds dasherized class when changed from false to true");
  assert.ok(!view.$().hasClass('classified'), "removes customized class name when changed from true to false");
  view.set('layerNeedsUpdate', true);
  view.updateLayer();
  assert.ok(view.$().hasClass('is-urgent'), "still has class when view display property is updated");
  assert.ok(!view.$().hasClass('classified'), "still does not have customized class when view display property is updated");
});
