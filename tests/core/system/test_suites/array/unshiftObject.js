// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok equals same CoreTest */

// sc_require('debug/test_suites/array/base');
import { ArraySuite } from './base.js';
import { SC } from '../../../../../core/core.js';

ArraySuite.define(function(T) {
  
  var observer, obj ;
  
  module(T.desc("unshiftObject"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns unshifted object", function (assert) {
    var exp = T.expected(1)[0];
    assert.equal(obj.pushObject(exp), exp, 'should return receiver');
  });
  

  test("[].unshiftObject(X) => [X] + notify", function (assert) {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C].unshiftObject(X) => [X,A,B,C] + notify", function (assert) {
    var after  = T.expected(4),
        before = after.slice(1),
        value  = after[0];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.unshiftObject(value) ;
    T.validateAfter(obj, after, observer, true);
  });
  
});
