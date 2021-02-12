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

module("RenderContext#element", {
  beforeEach: function() {
    context = RenderContext() ;
  },
  
  afterEach: function() {
    context = null;
  }
});

test("converts context to a DOM element and returns root element if there is one", function (assert) {
  context.id('foo');
  var elem = context.element();
  assert.ok(elem, 'elem not null');
  assert.equal(elem.tagName.toString().toLowerCase(), 'div', 'is div');
  assert.equal(elem.id.toString(), 'foo', 'is id=foo');
  elem = null ;
});

test("returns null if context does not generate valid element", function (assert) {
  context = RenderContext(null);
  var elem = context.element();
  assert.equal(elem, null, 'should be null');
  elem = null;
});

test("returns first element if context renders multiple element", function (assert) {
  context.tag('div').tag('span');
  var elem = context.element();
  assert.ok(elem, 'elem not null');
  assert.equal(elem.tagName.toString().toLowerCase(), 'div', 'is div');
  elem = null;
});
