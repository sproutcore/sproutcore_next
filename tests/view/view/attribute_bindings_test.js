// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module test equals context ok same */

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

module("CoreView - Attribute Bindings");

test("should render and update attribute bindings", function (assert) {
  var view = View.create({
    classNameBindings: ['priority', 'isUrgent', 'isClassified:classified', 'canIgnore'],
    attributeBindings: ['type', 'exploded', 'destroyed', 'exists', 'explosions'],

    type: 'reset',
    exploded: true,
    destroyed: true,
    exists: false,
    explosions: 15
  });

  view.createLayer();
  assert.equal(view.$().attr('type'), 'reset', "adds type attribute");
  assert.ok(view.$().attr('exploded'), "adds exploded attribute when true");
  assert.ok(view.$().attr('destroyed'), "adds destroyed attribute when true");
  assert.ok(!view.$().attr('exists'), "does not add exists attribute when false");
  assert.equal(view.$().attr('explosions'), "15", "adds integer attributes");

  view.set('type', 'submit');
  view.set('exploded', false);
  view.set('destroyed', false);
  view.set('exists', true);

  assert.equal(view.$().attr('type'), 'submit', "updates type attribute");
  assert.ok(!view.$().attr('exploded'), "removes exploded attribute when false");
  assert.ok(!view.$().attr('destroyed'), "removes destroyed attribute when false");
  assert.ok(view.$().attr('exists'), "adds exists attribute when true");
});
