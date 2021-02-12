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

// ..........................................................
// push()
// 
module("RenderContext#push", {
  beforeEach: function() {
    context = RenderContext();
  },
  
  afterEach: function() {
    context = null;
  }
});

test("it should add the line to the strings and increase the length", function (assert) {
  assert.equal(context.length, 1, "precondition - length=");

  context.push("sample line");
  assert.equal(context.length, 2, "length should increase");
  assert.equal(context.get(1), "sample line", "line should be in strings array");
});

test("it should accept multiple parameters, pushing each one into strings", function (assert) {

  assert.equal(context.length, 1, "precondition - length=");
  
  context.push("line1", "line2", "line3");
  assert.equal(context.length, 4, "should add 3 lines to strings");
  assert.equal(context.get(1), "line1", "1st item");
  assert.equal(context.get(2), "line2", "2nd item");
  assert.equal(context.get(3), "line3", "3rd item");
});

test("it should return receiver", function (assert) {
  assert.equal(context.push("line1"), context, "return value");
});

test("pushing a line onto a subcontext, should update the length in the parent context as well", function (assert) {
  context.push("line1", "line2");
  var len = context.length ;
  
  var c2 = context.begin().push("line3");
  assert.ok(context.length > len, "length should have increased");
});

// ..........................................................
// text()
// 
module("RenderContext#text", {
  beforeEach: function() {
    context = RenderContext();
  },
  
  afterEach: function() {
    context = null;
  }
});

test("should escape passed HTML before pushing", function (assert) {
  context.text("<b>test me!</b>");
  assert.equal(context.get(1),'&lt;b&gt;test me!&lt;/b&gt;', 'escaped');
});


