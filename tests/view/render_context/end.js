// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok */
import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';

var context = null;

module("RenderContext#end", {
  beforeEach: function() {
    context = RenderContext();
  }
});

test("should replace opening tag with string and add closing tag, leaving middle content in place", function (assert) {
  context.push("line1").end();
  assert.equal(context.get(0), "<div>", "opening tag");
  assert.equal(context.get(1), "line1", "opening tag");
  assert.equal(context.get(2), "</div>", "closing tag");
});

test("should emit any CSS class names included in the tag opts.addClass array", function (assert) {
  context.addClass("foo bar".w()).end();
  assert.ok(context.get(0).match(/class=\"(?:bar|foo)\s*(?:foo|bar)\s*\"/), '<div> has classes foo bar') ;
});

test("should emit id in tag opts.id", function (assert) {
  context.id("foo").end();
  assert.ok(context.get(0).match(/id=\"foo\"/), "<div> has id attr");
});

test("should emit style in tag if opts.styles is defined", function (assert) {
  context.setStyle({ alpha: "beta", foo: "bar" }).end();
  assert.ok(context.get(0).match(/style=\"alpha: beta; foo: bar; \"/), '<div> has style="alpha: beta; foo: bar; "');
});

test("should emit style with custom browser attributes", function (assert) {
  context.setStyle({ mozColumnCount: '3', webkitColumnCount: '3', oColumnCount: '3', msColumnCount: '3' }).end();
  assert.ok(context.get(0).match('<div style="-moz-column-count: 3; -webkit-column-count: 3; -o-column-count: 3; -ms-column-count: 3; " >'),
                            '<div> has style="-moz-column-count: 3; -webkit-column-count: 3, -o-column-count: 3, -ms-column-count: 3; "');
});

test("should write arbitrary attrs has in opts", function (assert) {
  context.setAttr({ foo: "bar", bar: "baz" }).end();
  assert.ok(context.get(0).match(/foo=\"bar\"/), 'has foo="bar"');
  assert.ok(context.get(0).match(/bar=\"baz\"/), 'has bar="baz"');
});

test("addClass should override attrs.class", function (assert) {
  context.addClass("foo".w()).setAttr({ "class": "bar" }).end();
  assert.ok(context.get(0).match(/class=\"foo\"/), 'has class="foo"');
});

test("opts.id should override opts.attrs.id", function (assert) {
  context.id("foo").setAttr({ id: "bar" }).end();
  assert.ok(context.get(0).match(/id=\"foo\"/), 'has id="foo"');
});

test("opts.styles should override opts.attrs.style", function (assert) {
  context.setStyle({ foo: "foo" }).setAttr({ style: "bar: bar" }).end();
  assert.ok(context.get(0).match(/style=\"foo: foo; \"/), 'has style="foo: foo; "');
});

test("should return receiver if receiver has no prevObject", function (assert) {
  assert.ok(!context.prevObject, 'precondition - prevObject is null');
  assert.equal(context.end(), context, 'ends as self');
});

test("should return prevObject if receiver has prevObject", function (assert) {
  var c2 = context.begin();
  assert.equal(c2.end(), context, "should return prevObject");
});

test("emits self closing tag if tag has no content and c._selfClosing !== false", function (assert) {
  var c2 = context.begin('input');
  c2.end();
  assert.equal(c2.get(0), "<input />");
});

test("emits two tags even if tag has no content if opts.selfClosing == false", function (assert) {
  context._selfClosing = false;

  context.end();
  assert.equal(context.length, 2, "has two lines");
  assert.equal(context.get(0), "<div>", "has opening tag");
  assert.equal(context.get(1), "</div>", "has closing tag");
});

test("does falseT emit self closing tag if it has content, even if opts.selfClosing == true (because that would yield invalid HTML)", function (assert) {
  context._selfClosing = true;
  context.push("line").end();
  assert.equal(context.length, 3, "has 3 lines");
  assert.equal(context.get(2), "</div>", "has closing tag");
});

test("it should make sure to clear reused temporary attributes object", function (assert) {

  // generate one tag...
  context.begin('input')
    .id("foo")
    .setStyle({ foo: "bar" })
    .addClass("foo bar".w())
    .push("line")
  .end();

  // generate second tag...will reuse internal temporary attrs object.
  context.begin('input').id("bar").end();
  var str = context.get(context.length-1);
  assert.equal(str, "<input id=\"bar\"  />");
});

test("it should work when nested more than one level deep", function (assert) {
  context.begin().id("foo")
    .begin().id("bar").end()
  .end();

  var str = context.join('');
  assert.ok(str.match(/id="foo"/), 'has foo');
  assert.ok(str.match(/id="bar"/), 'has bar');
});

