// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { ContentDisplay, View, Pane } from '../../../view/view.js';


var view, pane, contentA, contentB;

module('ContentDisplay', {
  beforeEach: function () {
    contentA = SC.Object.create({
      foo: 'foo.A',
      bar: 'bar.A'
    });

    contentB = SC.Object.create({
      foo: 'foo.B',
      bar: 'bar.B'
    });

    pane = Pane.create();
    view = View.create(ContentDisplay, {
      contentDisplayProperties: ['foo', 'bar'],
      content: contentA
    });
    pane.appendChild(view);
    pane.append();
  },

  afterEach: function () {
    pane.destroy();
    contentA.destroy();
    contentB.destroy();
    pane = view = contentA = contentB = null;
  }
});

test('should dirty layer when content changes', function () {
  SC.run(function () {
    view.set('content', contentB);

    assert.ok(view.get('layerNeedsUpdate'), "The view's layerNeedsUpdate should be true.");
  });
});

test('should dirty layer when any of contentDisplayProperties change', function () {
  SC.run(function () {
    contentA.set('foo', 'newFoo');

    assert.ok(view.get('layerNeedsUpdate'), "The view's layerNeedsUpdate should be true.");
  });
});

test('should stop observing old content when content changes', function () {
  assert.ok(contentA.hasObserverFor('*'));
  view.set('content', contentB);

  assert.ok(!contentA.hasObserverFor('*'));
});

test('should begin observing new content when content changes', function () {
  view.set('content', contentB);
  view.set('layerNeedsUpdate', false);
  SC.run(function () {
    contentB.set('bar', 'newBar');

    assert.ok(view.get('layerNeedsUpdate'), "The view's layerNeedsUpdate should be true.");
  });
});

test('should stop observing content when destroyed', function () {
  assert.ok(contentA.hasObserverFor('*'));
  view.destroy();
  assert.ok(!contentA.hasObserverFor('*'));
});
