// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */

import { SC } from '../../../core/core.js'; 
import { RenderContext } from '../../../view/view.js';


var context = null;

// ..........................................................
// id()
// 
module("RenderContext#id", {
  beforeEach: function() {
    context = RenderContext().id('foo') ;
  }
});

test("id() returns the current id for the tag", function (assert) {
  assert.equal(context.id(), 'foo', 'get id');
});

test("id(bar) alters the current id", function (assert) {
  assert.equal(context.id("bar"), context, "Returns receiver");
  assert.equal(context.id(), 'bar', 'changed to bar');
});
