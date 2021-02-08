// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// View Convertion Layout Unit Tests
// ========================================================================

import { SC } from '../../../core/core.js';
import { View } from '../../../view/view.js';

/*globals module test ok same equals */

/* These unit tests verify:  convertLayoutToAnchoredLayout(), convertLayoutToCustomLayout() */

var parent, child;

/**
  Helper setup that creates a parent and child view so that you can do basic
  tests.
*/
var commonSetup = {
  beforeEach: function() {
    
    // create basic parent view
    parent = View.create({
      layout: { top: 0, left: 0, width: 500, height: 500 }
    });
    
    // create child view to test against.
    child = View.create();
  },
  
  afterEach: function() {
    parent = child = null ;
  }
};

// ..........................................................
// TEST LAYOUT WITH BASIC LAYOUT CONVERSION
// 

module('BASIC LAYOUT CONVERSION', commonSetup);

test("layout {top, left, width, height}", function (assert) {
  var layout = { top: 10, left: 10, width: 50, height: 50 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  assert.deepEqual(cl, layout, 'conversion is equal');
}) ;

test("layout {top, left, bottom, right}", function (assert) {
  var layout = { top: 10, left: 10, bottom: 10, right: 10 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 10, left: 10, width: 480, height: 480 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {bottom, right, width, height}", function (assert) {
  var layout = { bottom: 10, right: 10, width: 50, height: 50 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 440, left: 440, width: 50, height: 50 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {centerX, centerY, width, height}", function (assert) {
  var layout = { centerX: 10, centerY: 10, width: 50, height: 50 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 235, left: 235, width: 50, height: 50 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;


// ..........................................................
// TEST LAYOUT WITH INVALID LAYOUT VARIATIONS
// 

module('INVALID LAYOUT VARIATIONS', commonSetup);

test("layout {top, left} - assume right/bottom=0", function (assert) {
  var layout = { top: 10, left: 10 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 10, left: 10, width: 490, height: 490 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {height, width} - assume top/left=0", function (assert) {
  var layout = { height: 60, width: 60 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 0, left: 0, width: 60, height: 60 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {right, bottom} - assume top/left=0", function (assert) {
  var layout = { right: 10, bottom: 10 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 0, left: 0, width: 490, height: 490 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {centerX, centerY} - assume width/height=0", function (assert) {
  var layout = { centerX: 10, centerY: 10 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 260, left: 260, width: 0, height: 0 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {top, left, centerX, centerY, height, width} - top/left take presidence", function (assert) {
  var layout = { top: 10, left: 10, centerX: 10, centerY: 10, height: 60, width: 60 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 10, left: 10, width: 60, height: 60 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;

test("layout {bottom, right, centerX, centerY, height, width} - bottom/right take presidence", function (assert) {
  var layout = { bottom: 10, right: 10, centerX: 10, centerY: 10, height: 60, width: 60 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 430, left: 430, width: 60, height: 60 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
  
}) ;

test("layout {top, left, bottom, right, centerX, centerY, height, width} - top/left take presidence", function (assert) {
  var layout = { top: 10, left: 10, bottom: 10, right: 10, centerX: 10, centerY: 10, height: 60, width: 60 };
  var cl = View.convertLayoutToAnchoredLayout(layout, parent.get('frame'));
  
  var testLayout = { top: 10, left: 10, width: 60, height: 60 };
  assert.deepEqual(cl, testLayout, 'conversion is equal');
}) ;


// test("layout {centerX, centerY, width:auto, height:auto}");
/*
test("layout {centerX, centerY, width:auto, height:auto}", function (assert) {
  var error=null;
  var layout = { centerX: 10, centerY: 10, width: 'auto', height: 'auto' };
  child.set('layout', layout) ;
  try{
    child.layoutStyle();
  }catch(e){
    error=e;
  }
  assert.equal(T_ERROR,typeOf(error),'Layout style functions should throw and '+
    'error if centerx/y and width/height are set at the same time ' + error );
}) ;
*/
