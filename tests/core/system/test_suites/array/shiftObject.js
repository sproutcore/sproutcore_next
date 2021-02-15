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
  
  module(T.desc("shiftObject"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].shiftObject() => [] + returns undefined + false notify", function (assert) {
    observer.observe('[]', 'length') ;
    assert.equal(obj.shiftObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, false, false);
  });

  test("[X].shiftObject() => [] + notify", function (assert) {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    assert.equal(obj.shiftObject(), exp, 'should return shifted object') ;
    T.validateAfter(obj, [], observer, true, true);
  });

  test("[A,B,C].shiftObject() => [B,C] + notify", function (assert) {
    var before  = T.expected(3),
        value   = before[0],
        after   = before.slice(1);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    assert.equal(obj.shiftObject(), value, 'should return shifted object') ;
    T.validateAfter(obj, after, observer, true);
  });
  
});
