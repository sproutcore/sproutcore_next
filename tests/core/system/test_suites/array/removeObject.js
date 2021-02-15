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
  
  module(T.desc("removeObject"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("should return receiver", function (assert) {
    obj = T.newObject(3);
    assert.equal(obj.removeObject(obj.objectAt(0)), obj, 'should return receiver');
  });
  
  test("[A,B,C].removeObject(B) => [A,C] + notify", function (assert) {

    var before = T.expected(3),
        after  = [before[0], before[2]];
    obj.replace(0,0, before);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(before[1]) ;
    T.validateAfter(obj, after, observer, true);
  });
  
  test("[A,B,C].removeObject(D) => [A,B,C]", function (assert) {
    var exp = T.expected(4),
        extra = exp.pop();
    obj.replace(0,0,exp);
    observer.observe('[]', 'length') ;
    
    obj.removeObject(extra);
    T.validateAfter(obj, exp, observer, false, false);
  });
  
});
