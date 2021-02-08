// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

/*global module test equals context ok same */

// ..........................................................
// createChildViews()
//
var view, parentDom, childDom, layerId ;
module("View#findLayerInParentLayer", {
  beforeEach: function() {

    layerId = 'foo-123';

    // manually construct a test layer.  next childDom a few layers deep
    childDom = document.createElement('div');
    $(childDom).attr('id', layerId);

    var intermediate = document.createElement('div');
    intermediate.appendChild(childDom);

    parentDom = document.createElement('div');
    parentDom.appendChild(intermediate);
    intermediate = null;


    // setup view w/ layerId
    view = View.create({ layerId: layerId });
  },

  afterEach: function() {
    view.destroy();
    view = parentDom = childDom = layerId = null;
  }
});

test("discovers layer by finding element with matching layerId - when DOM is in document already", function (assert) {
  document.body.appendChild(parentDom);
  assert.equal(view.findLayerInParentLayer(parentDom), childDom, 'should find childDom');
  document.body.removeChild(parentDom); // cleanup or else next test may fail
});

test("discovers layer by finding element with matching layerId - when parent DOM is falseT in document", function (assert) {
  if(parentDom.parentNode) assert.equal(parentDom.parentNode.nodeType, 11, 'precond - falseT in parent doc');
  else assert.equal(parentDom.parentNode, null, 'precond - falseT in parent doc');
  assert.equal(view.findLayerInParentLayer(parentDom), childDom, 'found childDom');
});

