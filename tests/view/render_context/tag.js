// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context */
import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';

var context = null;

module("RenderContext#tag", {
  beforeEach: function() {
    context = RenderContext() ;
  }
});

test("should emit a self closing tag.  like calling begin().end()", function (assert) {
  context.tag("input");
  assert.equal(RenderContext.escapeHTML(context.get(1)), RenderContext.escapeHTML("<input />"));
});

test("should respect passed opts when emitting", function (assert) {
  context.tag("foo") ;
  assert.equal(context.length, 3);
  assert.equal(RenderContext.escapeHTML(context.get(1)), RenderContext.escapeHTML("<foo>"));
  assert.equal(RenderContext.escapeHTML(context.get(2)), RenderContext.escapeHTML('<'+'/foo>'));
});

test("should falseT emit self closing tag if tag is script", function (assert) {
  context.tag("script");
  assert.equal(RenderContext.escapeHTML(context.get(1)), RenderContext.escapeHTML('<script>'));
  assert.equal(RenderContext.escapeHTML(context.get(2)), RenderContext.escapeHTML('<'+'/script>'));
});

test("should falseT emit self closing tag if tag is div", function (assert) {
  context.tag("div");
  assert.equal(RenderContext.escapeHTML(context.get(1)), RenderContext.escapeHTML('<div>'));
  assert.equal(RenderContext.escapeHTML(context.get(2)), RenderContext.escapeHTML('<'+'/div>'));
});

test("should falseT emit self closing tag if no tag is passed", function (assert) {
  context.tag();
  assert.equal(RenderContext.escapeHTML(context.get(1)), RenderContext.escapeHTML('<div>'));
  assert.equal(RenderContext.escapeHTML(context.get(2)), RenderContext.escapeHTML('<'+'/div>'));
});
