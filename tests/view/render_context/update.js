// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */
import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';
import { browser } from '../../../event/event.js';

var context = null, elem = null;

module("RenderContext#update", {
  beforeEach: function() {
    elem = document.createElement('div');
    context = RenderContext(elem) ;
  },

  afterEach: function() {
    elem = context = null; // avoid memory leaks
  }
});

test("should replace innerHTML of DIV if strings were pushed", function (assert) {
  elem.innerHTML = "initial";
  context.push("changed").update();
  assert.equal(elem.innerHTML, "changed", "innerHTML did change");
});

test("should falseT replace innerHTML of DIV if no strings were pushed", function (assert) {
  elem.innerHTML = "initial";
  context.update();
  assert.equal(elem.innerHTML, "initial", "innerHTML did falseT change");
});

test("returns receiver if no prevObject", function (assert) {
  assert.equal(context.update(), context, "return value");
});

test("returns previous context if there is one", function (assert) {
  var c2 = context.begin(elem);
  assert.equal(c2.update(), context, "returns prev context");
});

test("clears internal _elem to avoid memory leaks on update", function (assert) {
  assert.ok(!!context._elem, 'precondition - has element')  ;
  context.update();
  assert.ok(!context._elem, "no longer an element");
});

// ..........................................................
// Attribute Editing
//
module("RenderContext#update - attrs", {
  beforeEach: function() {
    elem = document.createElement('div');
    $(elem).attr("foo", "initial");
    context = RenderContext(elem);
  },

  afterEach: function() {
    elem = context = null ;
  }
});

test("does not change attributes if attrs were not actually changed", function (assert) {
  context.update();
  assert.equal(elem.getAttribute("foo"), "initial", "attribute");
});

test("updates attribute if attrs changed", function (assert) {
  context.setAttr('foo', 'changed');
  context.update();
  assert.equal(elem.getAttribute("foo"), "changed", "attribute");
});

test("adds attribute if new", function (assert) {
  context.setAttr('bar', 'baz');
  context.update();
  assert.equal(elem.getAttribute("bar"), "baz", "attribute");
});

test("removes attribute if value is null", function (assert) {
  context.setAttr('foo', null);
  context.update();
  assert.equal(elem.getAttribute("foo"), null, "attribute");
});

// ..........................................................
// ID
//
module("RenderContext#update - id", {
  beforeEach: function() {
    elem = document.createElement('div');
    $(elem).attr("id", "foo");
    context = RenderContext(elem);
  },

  afterEach: function() {
    elem = context = null ;
  }
});

test("does not change id if retrieved but not edited", function (assert) {
  context.id();
  context.update();
  assert.equal(elem.getAttribute("id"), "foo", "id");
});

test("replaces id if edited", function (assert) {
  context.id('bar');
  context.update();
  assert.equal(elem.getAttribute("id"), "bar", "id");
});

test("set id overrides attr", function (assert) {
  context.setAttr("id", "bar");
  context.id('baz');
  context.update();
  assert.equal(elem.getAttribute("id"), "baz", "should use id");
});

// ..........................................................
// Class Name Editing
//
module("RenderContext#update - className", {
  beforeEach: function() {
    elem = document.createElement('div');
    $(elem).attr("class", "foo bar");
    context = RenderContext(elem);
  },

  afterEach: function() {
    elem = context = null ;
  }
});

test("does not change class names if retrieved but not edited", function (assert) {
  context.classes();
  context.update();
  assert.equal($(elem).attr("class"), "foo bar", "class");
});


// ..........................................................
// Style Editing
//
module("RenderContext#update - style", {
  beforeEach: function() {
    elem = document.createElement('div');
    $(elem).attr("style", "color: red;");
    context = RenderContext(elem);
  },

  afterEach: function() {
    elem = context = null ;
  }
});

test("does not change styles if retrieved but not edited", function (assert) {
  context.styles();
  context.update();
  var style = $(elem).attr("style").trim();
  if (!style.match(/;$/)) style += ';' ;

  assert.equal(style.toLowerCase(), "color: red;", "style");
});

test("replaces style name if styles edited", function (assert) {
  context.setStyle({ color: "black" });
  context.update();

  // Browsers return single attribute styles differently, sometimes with a trailing ';'
  // sometimes, without one. Normalize it here.
  var style = $(elem).attr("style").trim();
  if (!style.match(/;\s{0,1}$/)) style += ';' ;

  assert.equal(style.toLowerCase(), "color: black;", "attribute");
});


test("set styles override style attr", function (assert) {
  context.setAttr("style", "color: green");
  context.setStyle({ color: "black" });
  context.update();

  // Browsers return single attribute styles differently, sometimes with a trailing ';'
  // sometimes, without one. Normalize it here.
  var style = $(elem).attr("style").trim();
  if (!style.match(/;$/)) style += ';' ;

  assert.equal(style.toLowerCase(), "color: black;", "attribute");
});


// TEST OMITTED BECAUSE OF VERY OLD BROWSER FEATURE TESTS
// test("set styles handle custom browser attributes", function (assert) {
//   context.resetStyles();
//   context.setStyle({ columnCount: '3', mozColumnCount: '3', webkitColumnCount: '3', oColumnCount: '3', msColumnCount: '3' });
//   context.update();

//   // Browsers return single attribute styles differently, sometimes with a trailing ';'
//   // sometimes, without one. Normalize it here.
//   var style = $(elem).attr("style").trim();
//   if (!style.match(/;$/)) style += ';' ;

//   // Older Gecko completely ignores css attributes that it doesn't understand.
//   if(browser.engine === SC.ENGINE.gecko) assert.equal(style, "-moz-column-count: 3;");
//   else if (browser.engine === SC.ENGINE.trident) assert.equal(style, "-ms-column-count: 3;");
//   else if (browser.engine === SC.ENGINE.webkit) assert.equal(style, "-webkit-column-count: 3;");
// });
