// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';

/*global module test equals context ok */

var context = null;

module("RenderContext#begin", {
  beforeEach: function() {
    context = RenderContext();
  }
});

test("should return a new context with parent context as prevObject", function (assert) {
  var c2 = context.begin();
  assert.ok(c2 !== context, "new context");
  assert.equal(c2.prevObject, context, 'previous context');
});

test("should set offset for new context equal to length of previous context", function (assert) {
  context.push("line1");
  var expected = context.length ;
  var c2 = context.begin();
  assert.equal(c2.offset, expected, "offset");
});

test("should copy same strings array to new child context", function (assert) {
  context.push("line1");
  var c2 =context.begin();
  assert.equal(c2.strings, context.strings);
});

test("should start new context with length of 1 (reserving a space for opening tag)", function (assert) {
  context.push("line1");
  var c2 = context.begin() ;
  assert.equal(c2.length, 1, 'has empty line');
  assert.equal(c2.strings.length, 3, "parent empty line + parent line + empty line");
});

test("should assign passed tag name to new context", function (assert) {
  var c2 = context.begin('foo');
  assert.equal(c2.tagName(), 'foo', 'tag name');
});
