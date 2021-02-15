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
  
  T.module("objectAt");
  
  test("should return object at specified index", function (assert) {
    var expected = T.expected(3), 
        obj      = T.newObject(3), 
        len      = 3,
        idx;
        
    for(idx=0;idx<len;idx++) {
      assert.equal(obj.objectAt(idx), expected[idx], 'obj.objectAt(%@) should match'.fmt(idx));
    }
    
  });
  
  test("should return undefined when requesting objects beyond index", function (assert) {
    var obj = T.newObject(3);
    assert.equal(obj.objectAt(5), undefined, 'should return undefined for obj.objectAt(5) when len = 3');
    assert.equal(T.object.objectAt(0), undefined, 'should return undefined for obj.objectAt(0) when len = 0');
  });
  
});
