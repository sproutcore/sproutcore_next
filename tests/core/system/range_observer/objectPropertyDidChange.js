// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same notest */
import { SC, GLOBAL } from '../../../../core/core.js';
var source, indexes, observer, obj ; // base array to work with
module("SC.RangeObserver#objectPropertyDidChange", {
  beforeEach: function() {
    
    // create array with 5 SC.Object's in them
    source = [1,2,3,4,5].map(function(x) {
      return SC.Object.create({ item: x, foo: "bar" }) ;
    }, this); 
    
    indexes = SC.IndexSet.create(2,2); // select 2..3
    
    observer = SC.Object.create({

      verify: false ,
      
      callCount: 0, 
      
      object: false,
      
      key: false,

      indexes: false,
      
      context: false,
      
      setupVerify: function(object, key, indexes, context) {
        this.verify = true ;  
        this.object = (object === undefined) ? false : object ;
        this.key = (key === undefined) ? false : key ;
        this.indexes = (indexes === undefined) ? false :indexes ;
        this.context = (context === undefined) ? false : context ;
        return this ;
      },
      
      // whenever this is called, verify proper params are passed
      changeObserver: function(inSource, inObject, inKey, inIndexes, inContext) { 
        this.callCount++;
        if (this.verify) {
          assert.ok(source === inSource, 'source should match source array');
          
          if (this.object || this.object === null) {
            assert.equal(inObject, this.object, 'passed object should match');  
          }

          if (this.key !== false) {
            assert.equal(inKey, this.key, 'passed key should match');
          }
          
          if (this.indexes) {
            assert.ok(inIndexes && inIndexes.isIndexSet, 'passed indexes should be an index set (actual: %@)'.fmt(inIndexes));
            if (this.indexes.isIndexSet) {
              assert.ok(this.indexes.isEqual(inIndexes), 'passed indexes should match %@ (actual: %@)'.fmt(this.indexes, inIndexes));
            }
          } else if (this.indexes === null) {
            assert.equal(inIndexes, null, 'passed indexes should be null');
          }

          if (this.context !== false) {
            assert.equal(inContext, this.context, 'passed context should match');
          }

        }
      }
      
    });

  }
});

test("changing property on object that does not appear in range", function (assert) {
  obj = SC.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[4].set('foo', 'baz');
  assert.equal(observer.callCount, 0, 'should not invoke observer callback') ;
});

test("changing property on object that appears one time in range", function (assert) {
  observer.setupVerify(source[2], 'foo', SC.IndexSet.create(2));
  
  obj = SC.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].set('foo', 'baz');
  assert.equal(observer.callCount, 1, 'should not invoke observer callback') ;
}) ;

test("changing property on object that appears more than one time in range", function (assert) {
  source[3] = source[2]; // copy item.  don't use KVO because we're testing it
  observer.setupVerify(source[2], 'foo', SC.IndexSet.create(2,2));
  
  obj = SC.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].set('foo', 'baz');
  assert.equal(observer.callCount, 1, 'should not invoke observer callback') ;
});

test("changing all properties on object that apepars one time in range", function (assert) {
  observer.setupVerify(source[2], '*', SC.IndexSet.create(2));
  
  obj = SC.RangeObserver.create(source, indexes, observer, observer.changeObserver, null, true);
  source[2].allPropertiesDidChange();
  assert.equal(observer.callCount, 1, 'should not invoke observer callback') ;
});

test("notifications with context", function (assert) {
  observer.setupVerify(source[2], 'foo', SC.IndexSet.create(2), 'context');
  
  obj = SC.RangeObserver.create(source, indexes, observer, observer.changeObserver, 'context', true);
  source[2].set('foo', 'baz');
  assert.equal(observer.callCount, 1, 'should not invoke observer callback') ;
});


