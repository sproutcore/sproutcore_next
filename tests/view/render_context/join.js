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

module("RenderContext#join", {
  beforeEach: function() {
    context = RenderContext().push("line1", "line2") ;
  },
  
  afterEach: function() {
    context = null;
  }
});

test("it should return joined lines with no separator string by default", function (assert) {
  assert.equal(context.join(), '<div>line1line2</div>');
});

test("it should return joined lines with separator string if passed", function (assert) {
  assert.equal(context.join(","), "<div>,line1,line2,</div>") ;
});
