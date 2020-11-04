// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module test ok assert.equal expects object assert.deepEqual */

import { SC } from "../../core/core.js"; // we take SC.Object from here because of the 
import { T_ARRAY, T_OBJECT } from '../../core/system/constants.js';

var object ;

module("Cloned Objects", {

  beforeEach: function() {
    
    object = SC.Object.create({
    
      name:'Cloned Object',
      value:'value1',
    
      clone: function(object) {
        var ret = object ;
        switch (SC.typeOf(object)) {
      
        case SC.T_ARRAY:
            ret = object.slice() ;
          break ;

        case SC.T_OBJECT:
            ret = {} ;
            for(var key in object) ret[key] = object[key] ;
        }

        return ret ;
      }
    });
  }
});


test("should return a cloned object", function(assert) {
	var objectA = [1,2,3,4,5] ;
	var objectB = "SproutCore" ;
	var objectC = SC.hashFor(objectA);	
	var objectE = 100;
	var a = SC.clone(objectA);
	var b = SC.clone(objectA);
	
  assert.equal(SC.clone(objectB), SC.clone(objectB)) ;
	assert.equal(SC.clone(objectC), SC.clone(objectC)) ;
	assert.equal(SC.clone(objectE), SC.clone(objectE)) ;
	assert.deepEqual(a, b);
});

test("should return cloned object when the object is null", function (assert) {
	var objectD = null;
  	assert.equal(SC.clone(objectD), SC.clone(objectD)) ;
});

test("should return a cloned array ", function(assert) {
	var arrayA  = ['value1','value2'] ;
	var resultArray = object.clone(arrayA);
    assert.equal(resultArray[0], arrayA[0], 'check first array item');
    assert.equal(resultArray[1], arrayA[1], 'check first array item');
});

test("should return a deeply cloned arrays", function(assert) {
  var original  = [{value: 'value1'}, SC.Object.create({value: 'value2'})] ;
  var cloned = SC.clone(original, true);
  original[0].value = 'bogus';
  assert.equal(cloned[0].value, 'value1');
  original[1].set('value', 'bogus');
  assert.equal(cloned[1].get('value'), 'value2');
});

test("should return shallow clones of hashes", function(assert) {
  var original = { foo: 'bar', nested: { key: 'value'}} ;
  var cloned = SC.clone(original) ;
  assert.deepEqual(original, cloned);
  cloned.nested.key = 'another value' ;
  assert.equal(original.nested.key, 'another value') ;
});

test("should return deep clones of hashes", function(assert) {
  var original = { foo: 'bar', nested: { key: 'value'}} ;
  var cloned = SC.clone(original, true) ;
  assert.deepEqual(original, cloned);
  cloned.nested.key = 'another value' ;
  assert.equal(original.nested.key, 'value') ;
});

test("should use copy() if isCopyable", function(assert) {
  var obj = SC.Object.create(SC.Copyable, {
    isCopy: false,
    
    copy: function() {
      return SC.Object.create(SC.Copyable, { isCopy: true });
    }
    
  });
  
  var copy = SC.clone(obj);
  assert.ok(!!copy, 'clone should return a copy');
  assert.equal(copy.isCopy, true, 'copy.isCopy should be true');
});

test("SC.copy should be an alias for SC.clone", function(assert) {
  assert.equal(SC.copy, SC.clone, 'SC.copy should equal SC.clone');
});
