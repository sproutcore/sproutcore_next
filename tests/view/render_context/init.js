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

module("RenderContext#init");

test("it should return a new context object with the passed tag name", function (assert) {
  assert.equal(RenderContext('foo').tagName(), 'foo', 'tag name');
});

test("it should use a default tag name of div if not passed", function (assert) {
  assert.equal(RenderContext().tagName(), 'div', 'tag name');
});

test("it should lowercase any tag name passed in", function (assert) {
  assert.equal(RenderContext('DIV').tagName(), 'div', 'lowercase tag name');
});

test("it should have a length of 1 with a null value for the first time, saving space for the opening tag", function (assert) {
  var context = RenderContext();
  assert.equal(context.length, 1, 'context length');
  assert.equal(context.get(0), null, 'first item');
});

test("if script tag is passed, should mark context._selfClosing as false" ,function() {
  var context = RenderContext('script');
  assert.ok(context._selfClosing === false, "selfClosing MUST be no");
  
  context = RenderContext('SCRIPT');
  assert.ok(context._selfClosing === false, "selfClosing MUST be no 2");
});

test("if element is passed, it should save element and not reserve space for string output", function (assert) {
  var elem = document.createElement('div');
  var context = RenderContext(elem);
  assert.equal(context.length, 0, 'no length');
  assert.equal(context._elem, elem, 'element');
  elem = context._elem = null; //cleanup
});

test("offset should should use offset + length of parent for self", function (assert) {
  var context =RenderContext('div');
  context.offset = 2;
  context.length = 3;
  var newContext = RenderContext('div', context);
  assert.equal(newContext.offset, 5, 'has proper offset');
});

