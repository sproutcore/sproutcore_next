// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

import { SC } from '../../../core/core.js';
import { View, viewManager } from '../../../view/view.js';

module("View#init");

test("registers view in the global views hash using layerId for event targeted", function (assert) {
  var v = View.create();
  assert.equal(viewManager.views[v.get('layerId')], v, 'registers view');
});

test("adds displayDidChange observer on all display properties (when rendered)", function (assert) {
  var didChange = false;
  var v = View.create({
    // override just to make sure the registration works...
    displayDidChange: function () { didChange = true; },

    displayProperties: 'foo bar'.w(),

    foo: 'foo',
    bar: 'bar'
  });

  v.set('foo', 'baz');
  assert.ok(!didChange, '!didChange on set(foo) before view is rendered');
  didChange = false;

  v.set('bar', 'baz');
  assert.ok(!didChange, '!didChange on set(bar) before view is rendered');

  // Render the view.
  v._doRender();

  v.set('foo', 'buz');
  assert.ok(didChange, 'didChange on set(foo) after view is rendered');
  didChange = false;

  v.set('bar', 'buz');
  assert.ok(didChange, 'didChange on set(bar) after view is rendered');
});

test("invokes createChildViews()", function (assert) {
  var didInvoke = false;
  var v = View.create({
    // override just for test
    createChildViews: function () { didInvoke = true; }
  });
  assert.ok(didInvoke, 'did invoke createChildViews()');
});

test("does falseT create layer", function (assert) {
  var v = View.create();
  assert.equal(v.get('layer'), null, 'did not create layer');
});


