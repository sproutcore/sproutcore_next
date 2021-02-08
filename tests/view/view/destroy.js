// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';

/* global module test equals context ok same */

module("View#destroy");

test('isDestroyed works.', function() {
  var v = View.create();
  assert.ok(!v.get('isDestroyed'), 'undestroyed view\'s isDestroyed property is false.');
  v.destroy();
  assert.ok(v.get('isDestroyed'), 'destroyed view\'s isDestroyed property is true.');
});

test('childViews specified as classes are also destroyed.', function() {
  var v = View.create({ childViews: [ View.extend({ childViews: [ View ] }) ] }),
      v2 = v.childViews[0],
      v3 = v2.childViews[0];

  v.destroy();
  assert.ok(v2.get('isDestroyed'), 'destroying a parent also destroys a child, mwaha.');
  assert.ok(v3.get('isDestroyed'), 'destroying a parent also destroys a grandchild, mwaha.');

  SC.run(function() {
    assert.ok(!v2.get('parentView'), 'destroying a parent removes the parentView reference from the child.');
    assert.ok(!v3.get('parentView'), 'destroying a parent removes the parentView reference from the grandchild.');
  });
});

test('childViews specified as instances are also destroyed.', function() {
  var v2 = View.create(),
      v = View.create({ childViews: [v2] });
  v.destroy();
  assert.ok(v2.get('isDestroyed'), 'destroying a parent also destroys a child, mwaha.');

  SC.run(function() {
    assert.ok(!v2.get('parentView'), 'destroying a parent removes the parentView reference from the child.');
  });
});

/**
  There was a bug introduced when we started destroying Binding objects when
  destroying Objects.

  Because the view was overriding destroy to destroy itself first (clearing out
  parentViews), later when we try to clean up bindings, any bindings to the
  parentView property of a view would not be able to remove observers from the
  parent view instance.
*/
test("Destroying a view, should also destroy its binding objects", function (assert) {
  var v, v2;

  SC.run(function() {
    v = View.create({
      childViews: ['v2'],
      foo: 'baz',
      v2: View.extend({
        barBinding: '.parentView.foo'
      })
    });
  });

  v2 = v.get('v2');

  assert.ok(v.hasObserverFor('foo'), "The view should have an observer on 'foo'");
  assert.ok(v2.hasObserverFor('bar'), "The child view should have an observer on 'bar'");

  v.destroy();

  assert.ok(!v.hasObserverFor('foo'), "The view should no longer have an observer on 'foo'");
  assert.ok(!v2.hasObserverFor('bar'), "The child view should no longer have an observer on 'bar'");
});

test('Resigns firstResponder when destroyed.', function() {
  var pane = Pane.create();
  var v = View.create({ parentView: pane, acceptsFirstResponder: true });
  v.becomeFirstResponder();
  assert.ok(v.get('isFirstResponder'), 'view starts as firstResponder.');
  v.destroy();
  assert.ok(!v.get('isFirstResponder'), 'destroying view resigns firstResponder.');
});
