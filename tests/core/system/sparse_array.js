// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { ArraySuite } from './test_suites/array.js';

// // ========================================================================
// SC.SparseArray Tests
// ========================================================================
/*globals module test ok isObj equals expects */
var objectA = 23, objectB = 12, objectC = 31, numbers, new_numbers;
module("SC.SparseArray") ;

test("new SparseArray has expected length", function (assert) {
  var ary = SC.SparseArray.array(10000) ;
  assert.equal(10000, ary.get('length'), "length") ;
});

test("fetching the object at index", function (assert) {
	var ary = SC.SparseArray.create(10);
	var arr = ["I'll","be","there","4u"];
	ary = arr;
	assert.equal(2 ,ary.indexOf('there'), "Index of 'there' is");
});

test("Update the sparse array using provideObjectAtIndex", function (assert) {
	var ary = SC.SparseArray.create(2);
	var obj = "not";
	ary.provideObjectAtIndex(0, obj);
	assert.equal(obj, ary._sa_content[0],"Content at 0th index");
	obj = "now";
	ary.provideObjectAtIndex(1, obj);
	assert.equal(obj, ary._sa_content[1],"Content at 1st index");
});

test("objectAt() should get the object at the specified index", function (assert) {
	var spArray = SC.SparseArray.create(4) ;
	var arr = [SC.Object.create({ dummy: true }),"Sproutcore",2,true];
	spArray = arr;
	assert.equal(4,spArray.length,'the length');
	assert.equal(arr[0],spArray.objectAt(0),'first object');
	assert.equal(arr[1],spArray.objectAt(1),'second object');
	assert.equal(arr[2],spArray.objectAt(2),'third object');
	assert.equal(arr[3],spArray.objectAt(3),'fourth object');
});

test("objectAt() beyond the length should return undefined and not attempt to retrieve the index.", function (assert) {
  var delegateObject = {
        count: 0,

        sparseArrayDidRequestIndex: function(sparseArray, idx) {
          this.count++;
          sparseArray.provideObjectAtIndex(idx, "foo");
        }

      },
    sparseArray = SC.SparseArray.create({
      delegate: delegateObject
    });

  assert.equal(sparseArray.objectAt(0), undefined, "There should not be an item beyond the length of the sparse array.");
  assert.equal(delegateObject.count, 0, "The index beyond the length should not be requested on the delegate.");

  // Update the length.
  sparseArray.provideLength(100);
  assert.equal(sparseArray.objectAt(0), 'foo', "There should be an item within the length of the sparse array.");
  assert.equal(delegateObject.count, 1, "The index within the length should be requested on the delegate.");

  assert.equal(sparseArray.objectAt(100), undefined, "There should not be an item beyond the length of the sparse array.");
  assert.equal(delegateObject.count, 1, "The index beyond the length should not be requested on the delegate.");
});

module("SC.replace",{
	beforeEach: function() {
		// create objects...
		numbers= [1,2,3] ;
		new_numbers = [4,5,6];
	}
});

test("element to be added is at idx > length of array ", function (assert) {
	var ary = SC.SparseArray.array(5) ;
	assert.equal(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(7,3,new_numbers,"put the new number at idx>len ");
	assert.equal(6, ary.get('length'), "length") ;
});

test("element to be added is such that amt + idx > length of array ", function (assert) {
	var ary = SC.SparseArray.array(5) ;
	assert.equal(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(4,3,new_numbers,"put the new number at idx < len ");
	assert.equal(6, ary.get('length'), "length") ;
});

test("element to be added is at idx < length of array ", function (assert) {
	var ary = SC.SparseArray.array(5) ;
	assert.equal(5, ary.get('length'), "length") ;
	ary = numbers;
	ary.replace(2,3,new_numbers,"put the new number overlapping existing numbers ");
	assert.equal(5, ary.get('length'), "length") ;
});

// test("should work with @each dependent keys");
// Reduced this test to a warning, because we are not going to support using
// @each with SC.SparseArray at this time.  It likely doesn't work as an observer
// and certainly not as a property chain.
// There is some code that will support this, but it would need to be refactored
// to avoid loading every item in the sparse array in order to add observers
// to them.
// Checkout the team/publickeating/enumerable-property-chains-support branch for the relevant code.

// , function() {
//   var array = SC.SparseArray.create();

//   array.pushObject(SC.Object.create({
//     value: 5
//   }));
//   array.provideLength(1);

//   var obj = SC.Object.create({
//     total: function() {
//       return this.get('content').reduce(function(prev, item) {
//         return prev + item.get('value');
//       }, 0);
//     }.property('content.@each.value').cacheable(),

//     content: array
//   });

//   assert.equal(obj.get('total'), 5, "precond - computes total of all objects");

//   array.pushObject(SC.Object.create({
//     value: 10
//   }));

//   assert.equal(obj.get('total'), 15, "recomputes when a new object is added");

//   array.objectAt(1).set('value', 15);

//   assert.equal(obj.get('total'), 20, "recomputes when value property on child object changes");

// });


test("modifying a range should not require the rest of the array to refetch", function (assert) {
  var del = {
    cnt: 0,

    sparseArrayDidRequestIndex: function(sparseArray, idx) {
      this.cnt++;
      sparseArray.provideObjectAtIndex(idx, "foo");
    },

    sparseArrayDidRequestLength: function(sparseArray) {
      sparseArray.provideLength(100);
    },

    // make editable
    sparseArrayShouldReplace: function() { return true; }

  };

  var ary = SC.SparseArray.create({
    delegate: del
  });

  assert.equal(ary.objectAt(10), 'foo', 'precond - should provide foo');
  assert.equal(del.cnt, 1, 'precond - should invoke sparseArrayDidRequestIndex() one time');

  del.cnt = 0;

  ary.removeAt(5); // delete an item before 10
  assert.equal(ary.objectAt(9), 'foo', 'should provide foo at index after delete');
  assert.equal(del.cnt, 0, 'should NOT invoke sparseArrayRequestIndex() since it was provided already');
});

test("Check that requestIndex works with a rangeWindowSize larger than 1", function (assert) {
	var ary = SC.SparseArray.array(10) ;
	var didRequestRange=false;

	var DummyDelegate = SC.Object.extend({
    content: [], // source array

    sparseArrayDidRequestLength: function(sparseArray) {
      sparseArray.provideLength(this.content.length);
    },

    sparseArrayDidRequestIndex: function(sparseArray, index) {
      sparseArray.provideObjectAtIndex(index, this.content[index]);
    },

    sparseArrayDidRequestIndexOf: function(sparseArray, object) {
      return this.content.indexOf(object);
    },

    sparseArrayShouldReplace: function(sparseArray, idx, amt, objects) {
      this.content.replace(idx, amt, objects) ; // keep internal up-to-date
      return true ; // allow anything
    },
    sparseArrayDidRequestRange: function(sparseArray, range) {
       didRequestRange=true;
     }

  });
  ary.set('delegate', DummyDelegate.create());
	ary.set('rangeWindowSize', 4);
	assert.equal(10, ary.get('length'), "length") ;
	ary.objectAt(7);
	assert.equal(didRequestRange, true, "The range was requested") ;
});


// ..........................................................
// definedIndexes
//

test("definedIndexes", function (assert) {
  var ary = SC.SparseArray.array(10);
  ary.provideObjectAtIndex(5, "foo");

  var expected = SC.IndexSet.create().add(5);
  // rewritten as the deepEqual doesn't seem the right tool to compare indexes...

  // assert.deepEqual(ary.definedIndexes(), expected, 'definedIndexes() should return all defined indexes');
  assert.ok(ary.definedIndexes().isEqual(expected), 'definedIndexes() should return all defined indexes' );

  // assert.deepEqual(ary.definedIndexes(SC.IndexSet.create().add(2, 10)), expected, 'definedIndexes([2..11]) should return indexes within');
  assert.ok(ary.definedIndexes(SC.IndexSet.create().add(2, 10)).contains(expected), 'definedIndexes([2..11]) should return indexes within');

  // this passes, but if it starts misbehaving, we better also change it to use the IndexSet API.
  assert.deepEqual(ary.definedIndexes(SC.IndexSet.create().add(2)), SC.IndexSet.EMPTY, 'definedIndexes([2]) should return empty set (since does not overlap with defined index)');

});

// ..........................................................
// TEST SC.ARRAY COMPLIANCE
//

var DummyDelegate = SC.Object.extend({
  content: [], // source array

  sparseArrayDidRequestLength: function(sparseArray) {
    sparseArray.provideLength(this.content.length);
  },

  sparseArrayDidRequestIndex: function(sparseArray, index) {
    sparseArray.provideObjectAtIndex(index, this.content[index]);
  },

  sparseArrayDidRequestIndexOf: function(sparseArray, object) {
    return this.content.indexOf(object);
  },

  sparseArrayShouldReplace: function(sparseArray, idx, amt, objects) {
    this.content.replace(idx, amt, objects) ; // keep internal up-to-date
    return true ; // allow anything
  }

});

ArraySuite.generate("SC.SparseArray", {
  newObject: function(amt) {
    if (amt === undefined || typeof amt === SC.T_NUMBER) {
      amt = this.expected(amt);
    }

    var del = DummyDelegate.create({ content: amt });
    return SC.SparseArray.create({ delegate: del });
  }
});

test("should notify enumerable property", function (assert) {
    var arr = SC.SparseArray.create();
    var count = 0;
    function counter() {
        count++;
    }

    arr.provideLength(1);
    arr.addObserver('[]', this, counter);
    arr.provideObjectAtIndex(0, 'one');
    assert.equal(count, 1, "observer should have fired once");
});

test("should notify range observers", function (assert) {
    var arr = SC.SparseArray.create();
    var count = 0;
    function counter(arr, objects, key, indexes) {
        count++;
    }

    arr.provideLength(4);
    var is = SC.IndexSet.create(0,1).add(2,1);
    arr.addRangeObserver(is, this, counter);
    arr.provideObjectAtIndex(0, 'one');
    arr.provideObjectAtIndex(1, 'two');
    arr.provideObjectAtIndex(2, 'three');
    arr.provideObjectAtIndex(3, 'four');
    assert.equal(2, count, "observer should have fired twice");
});

test("test updating SparseArray length via delegate", function (assert) {
    var delegate = SC.Object.create({
        arrlen: null,
        sparseArrayDidRequestLength: function(arr) {
            arr.provideLength(this.arrlen);
        }
    });

    var arr = SC.SparseArray.create({delegate: delegate});
    delegate.arrlen = 5;
    assert.equal(arr.get('length'), 5);
    delegate.arrlen = 50;
    arr.provideLength(null);
    assert.equal(arr.get('length'), 50)
});

test("test updating SparseArray length explictly", function (assert) {
    var arr = SC.SparseArray.create();
    arr.provideLength(5);
    assert.equal(arr.get('length'), 5)
    arr.provideLength(50);
    assert.equal(arr.get('length'), 50)
});

