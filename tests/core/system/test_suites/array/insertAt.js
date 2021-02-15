// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

// sc_require('debug/test_suites/array/base');
import { SC } from '../../../../../core/core.js';
import { ArraySuite } from './base.js';

ArraySuite.define(function(T) {

  var observer, obj ;

  module(T.desc("insertAt"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].insertAt(0, X) => [X] + notify", function (assert) {

    var after = T.expected(1);

    observer.observe('[]') ;
    obj.insertAt(0, after) ;
    T.validateAfter(obj, after, observer);
  });

  test("[].insertAt(200,X) => throw exception", function (assert) {
    var didThrow = false ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      assert.equal(e.message, "Index '200' is out of range 0-0", 'should throw an exception');
      didThrow = true ;
    }
    assert.ok(didThrow, 'should raise exception');
  });

  test("[A].insertAt(0, X) => [X,A] + notify", function (assert) {
    var exp = T.expected(2),
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [replace, before[0]];

    obj.replace(0,0,before);
    observer.observe('[]');

    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A].insertAt(1, X) => [A,X] + notify", function (assert) {
    var exp = T.expected(2),
        before  = exp.slice(0,1),
        replace = exp[1],
        after   = [before[0], replace];

    obj.replace(0,0,before);
    observer.observe('[]');

    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A].insertAt(200,X) => throw exception", function (assert) {
    obj.replace(0,0, T.expected(1)); // add an item

    var didThrow = false ;
    try {
      obj.insertAt(200, T.expected(1));
    } catch (e) {
      assert.equal(e.message, "Index '200' is out of range 0-1", 'should throw an exception');
      didThrow = true ;
    }
    assert.ok(didThrow, 'should raise exception');
  });

  test("[A,B,C].insertAt(0,X) => [X,A,B,C] + notify", function (assert) {
    var exp = T.expected(4),
        before  = exp.slice(1),
        replace = exp[0],
        after   = [replace, before[0], before[1], before[2]];

    obj.replace(0,0,before);
    observer.observe('[]');

    obj.insertAt(0, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A,B,C].insertAt(1,X) => [A,X,B,C] + notify", function (assert) {
    var exp = T.expected(4),
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], replace, before[1], before[2]];

    obj.replace(0,0,before);
    observer.observe('[]');

    obj.insertAt(1, replace);
    T.validateAfter(obj, after, observer);
  });

  test("[A,B,C].insertAt(3,X) => [A,B,C,X] + notify", function (assert) {
    var exp = T.expected(4),
        before  = exp.slice(1),
        replace = exp[0],
        after   = [before[0], before[1], before[2], replace];

    obj.replace(0,0,before);
    observer.observe('[]');

    obj.insertAt(3, replace);
    T.validateAfter(obj, after, observer);
  });

});
