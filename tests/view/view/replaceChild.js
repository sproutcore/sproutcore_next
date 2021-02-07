// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same */
import { View } from '../../../view/view.js';


var parent, child;
module("View#replaceChild", {
	beforeEach: function() {
	  child = View.create();
	  parent = View.create({
	    childViews: [View, View, View]
	  });		
	}
});


test("swaps the old child with the new child", function (assert) {
  var oldChild = parent.childViews[1];

  parent.replaceChild(child, oldChild);
  assert.equal(child.get('parentView'), parent, 'child has new parent');
  assert.ok(!oldChild.get('parentView'), 'old child no longer has parent');
  
  assert.equal(parent.childViews[1], child, 'parent view has new child at loc 1');
  assert.equal(parent.childViews.length, 3, 'parent has same number of children');
});
