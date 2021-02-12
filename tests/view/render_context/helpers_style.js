// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same same */
import { SC } from '../../../core/core.js'; 
import { browser } from '../../../event/event.js'; 
import { RenderContext } from '../../../view/view.js';


var context = null;

// ..........................................................
// styles
//
module("RenderContext#styles", {
  beforeEach: function() {
    context = RenderContext() ;
  }
});

test("returns empty hash if no current styles", function (assert) {
  assert.deepEqual(context.styles(), {}, 'styles') ;
});

test("styles(hash) replaces styles", function (assert) {
  var styles = { foo: 'bar' };
  assert.equal(context.setStyle(styles), context, "returns receiver");
  assert.deepEqual(context.styles(), styles, 'Styles');
});

test("clone on next retrieval if styles(foo) set with cloneOnModify=true", function (assert) {
  var styles = { foo: 'bar' };
  context.setStyle(styles);

  var result = context.styles();
  assert.ok(result !== styles, "styles is falseT same instance");
  assert.deepEqual(result, styles, "but styles are equivalent");

  assert.equal(result, context.styles(), "2nd retrieval is same instance");
});

test("extracts styles from element on first retrieval", function (assert) {
  var elem = document.createElement('div');
  $(elem).attr('style', 'color: black; height: 20px; border-top: 1px solid hotpink; -webkit-column-count: 3');
  context = RenderContext(elem);

  var result = context.styles();

  if(browser.isIE){
    assert.deepEqual(result, { color: 'black', height: '20px', borderTop: 'hotpink 1px solid', WebkitColumnCount: '3' }, 'extracted style. This is failing in IE8 because it return styles like cOLOR.');
  }else{
    assert.deepEqual(result, { color: 'black', height: '20px', borderTop: '1px solid hotpink', WebkitColumnCount: '3' }, 'extracted style. This is failing in IE8 because it return styles like cOLOR.');
  }
  assert.equal(context.styles(), result, "should reuse same instance thereafter");
});

// ..........................................................
// addStyle
//
module("RenderContext#addStyle", {
  beforeEach: function() {
    context = RenderContext().setStyle({ foo: 'foo' }) ;
  }
});

test("should add passed style name to value", function (assert) {
  context.addStyle('bar', 'bar');
  assert.equal('bar', context.styles().bar, 'verify style name');
});

test("should replace passed style name  value", function (assert) {
  context.addStyle('foo', 'bar');
  assert.equal('bar', context.styles().foo, 'verify style name');
});

test("should return receiver", function (assert) {
  assert.equal(context, context.addStyle('foo', 'bar'));
});

test("should create styles hash if needed", function (assert) {
  context = RenderContext();
  assert.equal(context._styles, null, 'precondition - has no styles');

  context.addStyle('foo', 'bar');
  assert.equal('bar', context.styles().foo, 'has styles');
});

test("should assign all styles if a hash is passed", function (assert) {
  context.addStyle({ foo: 'bar', bar: 'bar' });
  assert.deepEqual(context.styles(), { foo: 'bar', bar: 'bar' }, 'has same styles');
});

test("addStyle should remove properties that are part of combo properties", function (assert) {
  SC.setSetting('COMBO_STYLES', { foo: 'fooSub'.w() });
  context.setStyle({ foo: 'foo', fooSub: 'bar' });
  assert.equal(context.styles().fooSub, 'bar', 'proper starting values');
  context.addStyle('foo', 'bar');
  assert.equal(context.styles().foo, 'bar', 'foo has new value');
  assert.equal(context.styles().fooSub, undefined, 'fooSub has no value');
});

