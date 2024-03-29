// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */
import { SC } from '../../../../../core/core.js';
// sc_require('debug/test_suites/array/base');
import { ArraySuite } from './base.js';

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("replace"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });
  
  test("[].replace(0,0,'X') => ['X'] + notify", function (assert) {

    var exp = T.expected(1);
    
    observer.observe('[]', 'length') ;
    obj.replace(0,0,exp) ;

    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C,D].replace(1,2,X) => [A,X,D] + notify", function (assert) {
    
    var exp = T.expected(5), 
        before = exp.slice(0,4),
        replace = exp.slice(4),
        after = [before[0], replace[0], before[3]];
        
    obj.replace(0,0, before) ; // precond
    observer.observe('[]', 'length') ;

    obj.replace(1,2,replace) ;

    T.validateAfter(obj, after, observer, true);
  });

  test("[A,B,C,D].replace(1,2,[X,Y]) => [A,X,Y,D] + notify", function (assert) {
    
    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(6),
        before  = exp.slice(0, 4),
        replace = exp.slice(4),
        after   = [before[0], replace[0], replace[1], before[3]]; 
        
    obj.replace(0,0, before) ;
    observer.observe('[]', 'length') ;

    obj.replace(1,2, replace) ;

    T.validateAfter(obj, after, observer, false);
  });
  
  test("[A,B].replace(1,0,[X,Y]) => [A,X,Y,B] + notify", function (assert) {

    // setup the before, after, and replace arrays.  Use generated objects
    var exp  = T.expected(4),
        before  = exp.slice(0, 2),
        replace = exp.slice(2),
        after   = [before[0], replace[0], replace[1], before[1]] ;

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(1,0, replace) ;
    
    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B,C,D].replace(2,2) => [A,B] + notify", function (assert) {

    // setup the before, after, and replace arrays.  Use generated objects
    var before  = T.expected(4),
        after   = [before[0], before[1]];

    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
  
    obj.replace(2,2) ;
    
    T.validateAfter(obj, after, observer, true);
  });

  test("[].replace(0, 0, 'X') will call notify `[]` changed only once", function (assert) {
    var exp = T.expected(1),
        callCount = 0;

    obj.addObserver('[]', function () {
      callCount++;
    });

    obj.replace(0, 0, exp);
    assert.equal(callCount, 1, "expects the key '[]' to be notified only once");
  });
  
});
