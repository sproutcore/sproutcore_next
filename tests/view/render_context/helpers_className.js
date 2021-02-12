// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';

/*global module test equals context ok same */

var context = null;

// ..........................................................
// classes()
//
module("RenderContext#classes", {
  beforeEach: function() {
    context = RenderContext() ;
  }
});

test("returns empty array if no current class names", function (assert) {
  assert.deepEqual(context.classes(), [], 'classes') ;
});

test("addClass(array) updates class names", function (assert) {
  var cl = 'bar baz'.w();
  assert.equal(context.addClass(cl), context, "returns receiver");
  assert.deepEqual(context.classes(), cl, 'class names');
});

test("returns classes if set", function (assert) {
  context.addClass('bar');
  assert.deepEqual(context.classes(), ['bar'], 'classNames');
});

test("clone on retrieval if addClass(array) set", function (assert) {
  var cl = 'foo bar'.w();
  context.addClass(cl);

  var result = context.classes();
  assert.ok(result !== cl, "class name is falseT same instance");
  assert.deepEqual(result, cl, "but arrays are equivalent");

  assert.equal(result, context.classes(), "2nd retrieval is same instance");
});

test("extracts class names from element on first retrieval", function (assert) {
  var elem = document.createElement('div');
  $(elem).attr('class', 'foo bar');
  context = RenderContext(elem);

  var result = context.classes();
  assert.deepEqual(result, ['foo', 'bar'], 'extracted class names');
});

// ..........................................................
// hasClass()
//
module("RenderContext#hasClass", {
  beforeEach: function() {
    context = RenderContext().addClass('foo bar'.w()) ;
  }
});

test("should return true if context classNames has class name", function (assert) {
  assert.equal(true, context.hasClass('foo'), 'should have foo');
});

test("should return false if context classNames does not have class name", function (assert) {
  assert.equal(false, context.hasClass('imaginary'), "should not have imaginary");
});

test("should return false if context has no classNames", function (assert) {
  context = context.begin('div');
  assert.ok(context.classes().length === 0, 'precondition - context has no classNames');
  assert.equal(false, context.hasClass('foo'), 'should not have foo');
});

// ..........................................................
// addClass()
//
module("RenderContext#addClass", {
  beforeEach: function() {
    context = RenderContext().addClass('foo') ;
  }
});

test("should return receiver", function (assert) {
  assert.equal(context.addClass('foo'), context, "receiver");
});

test("should add class name to existing classNames array on currentTag", function (assert) {
  context.addClass('bar');
  assert.deepEqual(context.classes(), ['foo', 'bar'], 'has classes');
  assert.equal(context._classesDidChange, true, "note did change");
});

test("should only add class name once - does nothing if name already in array", function (assert) {
  assert.deepEqual(context.classes(), ['foo'], 'precondition - has foo classname');
  context._classesDidChange = false; // reset  to pretend once not modified

  context.addClass('foo');
  assert.deepEqual(context.classes(), ['foo'], 'no change');
  assert.equal(context._classesDidChange, false, "note did not change");
});

// ..........................................................
// removeClass()
//
module("RenderContext#removeClass", {
  beforeEach: function() {
    context = RenderContext().addClass(['foo', 'bar']) ;
  }
});

test("should remove class if already in classNames array", function (assert) {
  assert.ok(context.classes().indexOf('foo')>=0, "precondition - has foo");

  context.removeClass('foo');
  assert.ok(context.classes().indexOf('foo')<0, "does not have foo");
});

test('should return receiver', function() {
  assert.equal(context.removeClass('foo'), context, 'receiver');
});

test("should do nothing if class name not in array", function (assert) {
  context._classesDidChange = false; // reset to pretend not modified
  context.removeClass('imaginary');
  assert.deepEqual(context.classes(), 'foo bar'.w(), 'did not change');
  assert.equal(context._classesDidChange, false, "note did not change");
});

test("should do nothing if there are no class names", function (assert) {
  context = context.begin();
  assert.deepEqual(context.classes(), [], 'precondition - no class names');
  context._classesDidChange = false; // reset to pretend not modified

  context.removeClass('foo');
  assert.deepEqual(context.classes(), [], 'still no class names -- and no errors');
  assert.equal(context._classesDidChange, false, "note did not change");
});

// ..........................................................
// setClass
//
module("RenderContext#setClass", {
  beforeEach: function() {
    context = RenderContext().addClass('foo') ;
  }
});

test("should add named class if shouldAdd is true", function (assert) {
  assert.ok(!context.hasClass("bar"), "precondition - does not have class bar");
  context.setClass("bar", true);
  assert.ok(context.hasClass("bar"), "now has bar");
});

test("should remove named class if shouldAdd is false", function (assert) {
  assert.ok(context.hasClass("foo"), "precondition - has class foo");
  context.setClass("foo", false);
  assert.ok(!context.hasClass("foo"), "should not have foo ");
});

test("should return receiver", function (assert) {
  assert.equal(context, context.setClass("bar", true), "returns receiver");
});

test("should add/remove all classes if a hash of class names is passed", function (assert) {
  assert.ok(context.hasClass("foo"), "precondition - has class foo");
  assert.ok(!context.hasClass("bar"), "precondition - does not have class bar");

  context.setClass({ foo: false, bar: true });

  assert.ok(context.hasClass("bar"), "now has bar");
  assert.ok(!context.hasClass("foo"), "should not have foo ");
});
