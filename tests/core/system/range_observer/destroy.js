// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */
import { SC, GLOBAL } from '../../../../core/core.js';
var source, indexes, observer, obj ; // base array to work with
module("SC.RangeObserver#destroy", {
  beforeEach: function() {
    
    // create array with 5 SC.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return SC.Object.create({ item: x, foo: "bar" }) ;
    }, this); 

    indexes = SC.IndexSet.create(2,2); // select 2..3
    
    observer = SC.Object.create({
      
      callCount: 0, 
      
      rangeDidChange: function() { 
        this.callCount++;
      }
      
    });

    obj = SC.RangeObserver.create(source, indexes, observer, observer.rangeDidChange, "context", true);
    
  }
});

test("returns receiver", function (assert) {
  // for some reason doing assert.equal() causes a stack exception (probably due
  // to a bug in jsDump)
  assert.ok(obj.destroy() === obj, 'should return receiver');
});

// ..........................................................
// OBSERVING
// 

// NOTE: Since we are lazy about observing changes, we want to test both what
// happens if you destroy the observer before any changes have happend and 
// after changes have happened.

test("never observes changes if no changes happend", function (assert) {
  obj.destroy();

  // change property on each object
  var len = source.length, idx;
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'baz');

  // should not fire observer
  assert.equal(observer.callCount, 0, 'range observer should not fire');
});

test("stops observes changes if changes happend before destroy", function (assert) {
  var len = source.length, idx;

  // change property on each object
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'baz');

  obj.destroy();

  // change property on each object again
  for(idx=0;idx<len;idx++) source[idx].set('foo', 'bar');

  // should fire observer only first time through
  assert.equal(observer.callCount, 2, 'range observer should fire only first time through');
});


