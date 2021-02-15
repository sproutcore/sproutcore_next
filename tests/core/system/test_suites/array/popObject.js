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
  
  module(T.desc("popObject"), {
    beforeEach: function() {
      obj = T.newObject();
      observer = T.observer(obj);
    }
  });

  test("[].popObject() => [] + returns undefined + false notify", function (assert) {
    observer.observe('[]', 'length') ;
    assert.equal(obj.popObject(), undefined, 'should return undefined') ;
    T.validateAfter(obj, [], observer, false, false);
  });

  test("[X].popObject() => [] + notify", function (assert) {
    var exp = T.expected(1)[0];
    
    obj.replace(0,0, [exp]);
    observer.observe('[]', 'length') ;

    assert.equal(obj.popObject(), exp, 'should return popped object') ;
    T.validateAfter(obj, [], observer, true, true);
  });

  test("[A,B,C].popObject() => [A,B] + notify", function (assert) {
    var before  = T.expected(3),
        value   = before[2],
        after   = before.slice(0,2);
        
    obj.replace(0,0,before);
    observer.observe('[]', 'length') ;
    assert.equal(obj.popObject(), value, 'should return popped object') ;
    T.validateAfter(obj, after, observer, true);
  });
  
});
