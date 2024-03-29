// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

// ========================================================================
// View Layout Unit Tests
// ========================================================================

/*globals module test ok same equals */

/* These unit tests verify:  layout(), frame(), styleLayout() and clippingFrame(). */

var parent, child;

/*
  helper method to test the layout of a view.  Applies the passed layout to a
  view, then compares both its frame and layoutStyle properties both before
  and after adding the view to a parent view.  

  You can pass frame rects with some properties missing and they will be
  filled in for you just so you don't have to write so much code.
  
  @param {Object} layout layout hash to test
  @param {Object} no_f expected frame for view with no parent
  @param {Object} no_s expected layoutStyle for view with no parent
  @param {Object} with_f expected frame for view with parent
  @param {Object} with_s expected layoutStyle for view with parent
  @returns {void}
*/
function performLayoutTest(layout, no_f, no_s, with_f, with_s) {
  
  // make sure we add null properties and convert numbers to 'XXpx' to style layout.
  var keys = 'width height top bottom marginLeft marginTop left right zIndex minWidth maxWidth minHeight maxHeight'.w();
  keys.forEach(function(key) {
    if (no_s[key]===undefined) no_s[key] = null;
    if (with_s[key]===undefined) with_s[key] = null;  

    if (typeof no_s[key] === 'number') no_s[key] = no_s[key].toString() + 'px';
    if (typeof with_s[key] === 'number') with_s[key] = no_s[key].toString() + 'px';
  });
  
  // set layout
  child.set('layout', layout) ;

  // test
  keys.forEach(function(key) {
    assert.equal(child.get('layoutStyle')[key], no_s[key], "STYLE false PARENT %@".fmt(key)) ;  
  });
  
  // add parent
  SC.RunLoop.begin();
  parent.appendChild(child);
  SC.RunLoop.end();
  
  // test again
  keys.forEach(function(key) {
    assert.equal(child.get('layoutStyle')[key], with_s[key], "STYLE false PARENT %@".fmt(key)) ;  
  });
}

/**
  Helper setup that creates a parent and child view so that you can do basic
  tests.
*/
var commonSetup = {
  beforeEach: function() {
    
    // create basic parent view
    parent = View.create({
      layout: { top: 0, left: 0, width: 200, height: 200 }
    });
    
    // create child view to test against.
    child = View.create();
  },
  
  afterEach: function() {
    //parent.destroy(); child.destroy();
    parent = child = null ;
  }
};

module('StaticLayout', commonSetup) ;

test("Test that auto as a value for width height is set correctly when"
  +" setting the element style", function (assert) {
  child = View.create({
    useStaticLayout:true,
    render: function(context) {
      // needed for auto
      context.push('<div style="padding: 10px"></div>');
    }
  });

  // parent MUST have a layer.
  parent.createLayer();
  var layer = parent.get('layer');
  document.body.appendChild(layer);
  
  var layout = { top: 0, left: 0, width: 'auto', height: 'auto' };
  var no_f = { x: 0, y: 0, width: 0, height: 0 };
  var with_f = { x: 0, y: 0, width: 20, height: 20 };
  var s = { top: 0, left: 0, width: 'auto', height: 'auto' };
  
  performLayoutTest(layout, no_f, s, with_f, s);
  
  layer.parentNode.removeChild(layer);
});



test("Test that an exception is thrown when calling adjust and setting to auto", function (assert) {
  var error=null;
  console.log('NOTE: The following error concerning width:auto is expected.');
  try{
    parent.adjust('width', 'auto').adjust('height', 'auto');
    parent.get('layoutStyle');
  }catch(e){
    error=true;
  }
  assert.ok(error,'Layout style functions should throw an error if width/height are set to auto but staticLayout is not enabled' + error );
});

test("Test StaticLayout frame support", function (assert) {
  child = View.create({
    useStaticLayout: true
  });
  
  assert.equal(child.get('frame'), null, "View's frame property will be null when useStaticLayout is true and layer is not attached to DOM.");
  
  SC.RunLoop.begin();
  child._doRender();
  child._doAttach(document.body);
  SC.RunLoop.end();
  
  assert.ok(child.get('layout') === View.prototype.layout, "Hit fast path when useStaticLayout && no layout specified");
  assert.ok(SC.typeOf(child.get('frame')) === SC.T_HASH, "View's frame property will be an object when useStaticLayout is true and layer is attached to DOM.");
});

