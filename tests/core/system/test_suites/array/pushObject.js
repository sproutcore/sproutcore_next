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
  
  module(T.desc("pushObject"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("returns pushed object", function (assert) {
    var exp = T.expected(1)[0];
    assert.equal(obj.pushObject(exp), exp, 'should return receiver');
  });
  
  test("[].pushObject(X) => [X] + notify", function (assert) {
    var exp = T.expected(1);
    observer.observe('[]', 'length') ;
    obj.pushObject(exp[0]) ;
    T.validateAfter(obj, exp, observer, true);
  });

  test("[A,B,C].pushObject(X) => [A,B,C,X] + notify", function (assert) {
    var after  = T.expected(4),
        before = after.slice(0,3),
        value  = after[3];
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    obj.pushObject(value) ;
    T.validateAfter(obj, after, observer, true);
  });
  
});
