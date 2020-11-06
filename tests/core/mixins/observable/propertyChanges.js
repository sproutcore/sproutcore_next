// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Observable Tests
// ========================================================================
/*globals module test ok isObj equals expects */
import { SC } from '../../../../core/core.js';
var revMatches = false , ObjectA;

module("object.propertyChanges", {  
  beforeEach: function() {
    ObjectA = SC.Object.create({
      foo  : 'fooValue',
      prop : 'propValue',
            
      action: function() {
        this.prop= 'changedPropValue';
      }.observes('foo'),
      
      newFoo : 'newFooValue',
      newProp: 'newPropValue',
      
      notifyAction: function() {
        this.newProp = 'changedNewPropValue';
      }.observes('newFoo'),
      
      notifyAllAction: function() {
        this.newFoo = 'changedNewFooValue';
      }.observes('prop'),

      starProp: null,
      starObserver: function(target, key, value, rev) {
        revMatches = (rev === target.propertyRevision) ;
        this.starProp = key;
      }
      
    });
    }
});


test("should observe the changes within the nested begin / end property changes", function() {
    
  //start the outer nest
  ObjectA.beginPropertyChanges();
    // Inner nest
    ObjectA.beginPropertyChanges();
        ObjectA.set('foo', 'changeFooValue');
      assert.equal(ObjectA.prop, "propValue") ;
      ObjectA.endPropertyChanges();
    
    //end inner nest
    ObjectA.set('prop', 'changePropValue');
    assert.equal(ObjectA.newFoo, "newFooValue") ;
  //close the outer nest
  ObjectA.endPropertyChanges();
  
  assert.equal(ObjectA.prop, "changedPropValue") ;
  assert.equal(ObjectA.newFoo, "changedNewFooValue") ;
  
});

test("should increment the indicator before begining the changes to the object", function() {
    assert.equal(ObjectA.beginPropertyChanges()._kvo_changeLevel, 1) ;
});

test("should decrement the indicator after ending the changes to the object", function() {
    assert.equal(ObjectA.endPropertyChanges()._kvo_changeLevel, 0) ;
});

test("should observe the changes within the begin and end property changes", function() {
    
  ObjectA.beginPropertyChanges();
    ObjectA.set('foo', 'changeFooValue');
    
  assert.equal(ObjectA.prop, "propValue") ;
    ObjectA.endPropertyChanges();
    
  assert.equal(ObjectA.prop, "changedPropValue") ;
});

test("should indicate that the property of an object has just changed", function() {
  // inidicate that proprty of foo will change to its subscribers
  ObjectA.propertyWillChange('foo') ;
  
  //Value of the prop is unchanged yet as this will be changed when foo changes
  assert.equal(ObjectA.prop, 'propValue' ) ;
  
  //change the value of foo.
  ObjectA.foo = 'changeFooValue';
  
  // Indicate the subscribers of foo that the value has just changed
  ObjectA.propertyDidChange('foo', null) ;
  
  // Values of prop has just changed
  assert.equal(ObjectA.prop,'changedPropValue') ;
});

test("should notify that the property of an object has changed", function() {
  // Notify to its subscriber that the values of 'newFoo' will be changed. In this
  // case the observer is "newProp". Therefore this will call the notifyAction function
  // and value of "newProp" will be changed.
  ObjectA.notifyPropertyChange('newFoo','fooValue');
  
  //value of newProp changed.
  assert.equal(ObjectA.newProp,'changedNewPropValue') ;
});

test("should notify all observers that their property might have changed", function() {
  //When this function is called, all the subscribers are notified that something has
  //Changed. So when allPropertiesDidChange() is called, all the subscribers get invoked. 
  ObjectA.allPropertiesDidChange();
  
  //All the values changed.
  assert.equal(ObjectA.prop,'changedPropValue') ;
  assert.equal(ObjectA.newProp,'changedNewPropValue') ;
  assert.equal(ObjectA.newFoo,'changedNewFooValue') ;
});

test("star observers", function() {
  // setup observer
  ObjectA.addObserver('*', ObjectA, ObjectA.starObserver);
  ObjectA.set('foo', 'bar');
  assert.equal(ObjectA.starProp, 'foo', 'should have fired star observer for foo');
  
  ObjectA.set('bar', 'foo');
  assert.equal(ObjectA.starProp, 'bar', 'should have fired star observer for bar');
});

test("revision passed to observers should match .propertyRevision", function() {
    
  assert.equal(revMatches, true) ;
  
});

test("should invalidate function property cache when notifyPropertyChange is called", function() {
  
  var a = SC.Object.create({
    _b: null,
    b: function(key, value) {
      if (value !== undefined) {
        this._b = value;
        return this;
      }
      return this._b;
    }.property()
  });
  
  a.set('b', 'foo');
  assert.equal(a.get('b'), 'foo', 'should have set the correct value for property b');
  
  a._b = 'bar';
  a.notifyPropertyChange('b');
  a.set('b', 'foo');
  assert.equal(a.get('b'), 'foo', 'should have invalidated the cache so that the newly set value is actually set');
  
});
