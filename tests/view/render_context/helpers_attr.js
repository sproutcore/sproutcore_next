// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same same */

import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';


var context = null;



// ..........................................................
// attr
//
module("RenderContext#attr", {
  beforeEach: function() {
    context = RenderContext().setAttr({ foo: 'foo' }) ;
  }
});

test("should add passed name to value", function (assert) {
  context.setAttr('bar', 'bar');
  assert.equal(context._attrs.bar, 'bar', 'verify attr name');
});

test("should replace passed name  value in attrs", function (assert) {
  context.setAttr('foo', 'bar');
  assert.equal(context._attrs.foo, 'bar', 'verify attr name');
});

test("should return receiver", function (assert) {
  assert.equal(context, context.setAttr('foo', 'bar'));
});

test("should create attrs hash if needed", function (assert) {
  context = RenderContext().begin();
  assert.equal(context._attrs, null, 'precondition - has no attrs');

  context.setAttr('foo', 'bar');
  assert.equal(context._attrs.foo, 'bar', 'has styles');
});

test("should assign all attrs if a hash is passed", function (assert) {
  context.setAttr({ foo: 'bar', bar: 'bar' });
  assert.deepEqual(context._attrs, { foo: 'bar', bar: 'bar' }, 'has same styles');
});


