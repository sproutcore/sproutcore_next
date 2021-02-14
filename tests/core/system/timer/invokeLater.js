// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// Object.invokeLater Tests
// ========================================================================
/*globals module test ok isObj equals expects */

import { SC } from '../../../../core/core.js';

module("Object.invokeLater") ;

test("should invoke method string after specified time", function (assert) {
  const cb = assert.async();

  SC.RunLoop.begin() ;
  var fired = false ;
  var o = SC.Object.create({
    func: function() { fired = true; }
  });
  o.invokeLater('func', 200) ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should invoke method instance after specified time", function (assert) {
  const cb = assert.async();
  
  SC.RunLoop.begin() ;
  var fired = false ;
  var o = SC.Object.create({
    func: function() { fired = true; }
  });
  o.invokeLater(o.func, 200) ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should invoke method string immediately if no time passed", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var o = SC.Object.create({
    func: function() { fired = true; }
  });
  o.invokeLater('func') ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should automatically bind with arguments if passed", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var g1 = null, g2 = null, target = null ;

  var o = SC.Object.create({
    func: function(arg1, arg2) {
      g1 = arg1 ; g2 = arg2 ; fired = true ; target = this ;
    }
  });
  o.invokeLater('func', 200, 'ARG1', 'ARG2') ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    assert.equal(g1, 'ARG1', 'arg1') ;
    assert.equal(g2, 'ARG2', 'arg2') ;
    assert.equal(target, o, 'target') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

module("Function.invokeLater") ;

test("should invoke function with target after specified time", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var target = null;
  var o = SC.Object.create() ;
  var func = function() { fired = true; target = this; } ;
  func.invokeLater(o, 200) ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    assert.equal(target, o, 'target') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should invoke object with no target after specified time", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var func = function() { fired = true; } ;
  func.invokeLater(null, 200) ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should invoke function immediately if no time passed", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var o = SC.Object.create() ;
  var func = function() { fired = true; } ;
  func.invokeLater(o) ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});

test("should automatically bind with arguments if passed", function (assert) {
  const cb = assert.async();
  SC.RunLoop.begin() ;
  var fired = false ;
  var g1 = null, g2 = null, target = null ;

  var o = SC.Object.create() ;
  var func = function(arg1, arg2) {
    g1 = arg1 ; g2 = arg2 ; fired = true ; target = this ;
  } ;
  func.invokeLater(o, 200, 'ARG1', 'ARG2') ;
  SC.RunLoop.end() ;

  var tries = 20 ;
  var f = function f() {
    if (!fired && --tries >= 0) {
      setTimeout(f, 100) ;
      return ;
    }
    assert.equal(true, fired, 'did not fire') ;
    assert.equal(g1, 'ARG1', 'arg1') ;
    assert.equal(g2, 'ARG2', 'arg2') ;
    assert.equal(target, o, 'target') ;
    // window.start() ; // starts the test runner
    cb();
  } ;

  // stop() ; // stops the test runner
  setTimeout(f, 300) ;
});
