// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, ok, isObj, equals, expects */
import { SC } from '../../../../core/core.js'; 

var enumerables; // global variables
var DummyEnumerable = SC.Object.extend(SC.Enumerable, {

  content: [],

  length: function () { return this.content.length; }.property(),

  objectAt: function (idx) { return this.content[idx]; },

  nextObject: function (idx) { return this.content[idx]; },

  // add support for reduced properties.
  unknownProperty: function (key, value) {
    var ret = this.reducedProperty(key, value);
    if (ret === undefined) {
      if (value !== undefined) this[key] = value;
      ret = value;
    }
    return ret;
  },

  replace: function (start, removed, added) {
    var ret = this.content.replace(start, removed, added),
      addedLength = added ? added.length : 0;

    this.enumerableContentDidChange(start, addedLength, addedLength - removed);
    return ret;
  },

  unshiftObject: function (object) {
    this.replace(0, 0, [object]);
    return object;
  },

  shiftObject: function () {
    var ret = this.replace(0, 1);
    return ret;
  },

  pushObject: function (object) {
    this.replace(this.content.length - 1, 0, [object]);
    return object;
  },

  popObject: function () {
    var ret = this.replace(this.content.length - 1, 1);
    return ret;
  }

});

var runFunc = function (a, b) { return ['DONE', a, b]; };
var invokeWhileOK = function () { return "OK"; };
var invokeWhileNotOK = function () { return "FAIL"; };
var reduceTestFunc = function (prev, item, idx, e, pname) { return pname || 'TEST'; };

var CommonArray = [
  {
    first: "Charles",
    gender: "male",
    californian: false,
    ready: true,
    visited: "Prague",
    doneTravelling: false,
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 1
  },

  {
    first: "Jenna",
    gender: "female",
    californian: true,
    ready: true,
    visited: "Prague",
    doneTravelling: false,
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 2
  },

  {
    first: "Peter",
    gender: "male",
    californian: false,
    ready: true,
    visited: "Prague",
    doneTravelling: false,
    run: runFunc,
    invokeWhileTest: invokeWhileNotOK,
    balance: 3
  },

  {
    first: "Chris",
    gender: "male",
    californian: false,
    ready: true,
    visited: "Prague",
    doneTravelling: false,
    run: runFunc,
    invokeWhileTest: invokeWhileOK,
    balance: 4
  }
];

module("Real Array & DummyEnumerable", {

  beforeEach: function () {
    enumerables = [SC.$A(CommonArray), DummyEnumerable.create({ content: SC.clone(CommonArray) })];
  },

  afterEach: function () {
    enumerables = null;
    delete Array.prototype["@max(balance)"]; // remove cached value
    delete Array.prototype["@min(balance)"];
  }

});

test("should get enumerator that iterates through objects", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var e = src.enumerator();
    assert.ok(e !== null, 'enumerator must not be null');

    var idx = 0;
    var cur;
    while(cur = e.nextObject()) {
      assert.equal(src.objectAt(idx), cur, "object at index %@".fmt(idx));
      idx++;
    }

    assert.equal(src.get('length'), idx);
  }
});

test("should return firstObject for item with content", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(src.firstObject(), CommonArray[0], 'firstObject should return first object');
  }

  assert.equal([].firstObject(), undefined, 'firstObject() on empty enumerable should return undefined');
});

test("should run forEach() to go through objects", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var idx = 0;

    // save for testing later
    var items = [];
    var indexes = [];
    var arrays = [];
    var targets = [];

    src.forEach(function (item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);
    }, this);

    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(items[idx], src.objectAt(idx));
      assert.equal(indexes[idx], idx);
      assert.equal(arrays[idx], src);

      // use this method because assert.equal() is taking too much time to log out
      // results.  probably an issue with jsDump
      assert.ok(targets[idx] === this, 'target should always be this');
    }
  }
});

test("should map to values while passing proper params", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var idx = 0;

    // save for testing later
    var items = [];
    var indexes = [];
    var arrays = [];
    var targets = [];

    var mapped = src.map(function (item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);

      return index;
    }, this);

    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(src.objectAt(idx), items[idx], "items");
      assert.equal(idx, indexes[idx], "indexes");
      assert.equal(src, arrays[idx], 'arrays');
      assert.equal(SC.guidFor(this), SC.guidFor(targets[idx]), "this");

      assert.equal(idx, mapped[idx], "mapped");
    }
  }
});

test("should filter to items that return for callback", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var idx = 0;

    // save for testing later
    var items = [];
    var indexes = [];
    var arrays = [];
    var targets = [];

    var filtered = src.filter(function (item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);

      return item.gender === "female";
    }, this);

    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(src.objectAt(idx), items[idx], "items");
      assert.equal(idx, indexes[idx], "indexes");
      assert.equal(src, arrays[idx], 'arrays');
      assert.equal(SC.guidFor(this), SC.guidFor(targets[idx]), "this");
    }

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].first, "Jenna");
  }
});

test("should return true if function for every() returns true", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var idx = 0;

    // save for testing later
    var items = [];
    var indexes = [];
    var arrays = [];
    var targets = [];

    var result = src.every(function (item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);

      return true;
    }, this);

    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(src.objectAt(idx), items[idx], "items");
      assert.equal(idx, indexes[idx], "indexes");
      assert.equal(src, arrays[idx], 'arrays');
      assert.equal(SC.guidFor(this), SC.guidFor(targets[idx]), "this");
    }

    assert.equal(result, true);
  }
});

test("should return false if one function for every() returns false", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var result = src.every(function (item, index, array) {
      return item.gender === "male";
    }, this);
    assert.equal(result, false);
  }
});

test("should return false if all functions for some() returns false", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var idx = 0;

    // save for testing later
    var items = [];
    var indexes = [];
    var arrays = [];
    var targets = [];

    var result = src.some(function (item, index, array) {
      items.push(item);
      indexes.push(index);
      arrays.push(array);
      targets.push(this);

      return false;
    }, this);

    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(src.objectAt(idx), items[idx], "items");
      assert.equal(idx, indexes[idx], "indexes");
      assert.equal(src, arrays[idx], 'arrays');
      assert.equal(SC.guidFor(this), SC.guidFor(targets[idx]), "this");
    }

    assert.equal(result, false);
  }
});

test("should return true if one function for some() returns true", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var result = src.some(function (item, index, array) {
      return item.gender !== "male";
    }, this);
    assert.equal(result, true);
  }
});

test("should mapProperty for all items", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var mapped = src.mapProperty("first");
    var idx;
    var len = src.get('length');
    for(idx=0;idx<len;idx++) {
      assert.equal(mapped[idx], src.objectAt(idx).first);
    }
  }
});

test("should filterProperty with match", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var filtered = src.filterProperty("gender", "female");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].first, "Jenna");
  }
});

test("should filterProperty with default bool", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var filtered = src.filterProperty("californian");
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].first, "Jenna");
  }
});

test("should groupBy a given property", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var filtered = src.groupBy("gender");
    assert.equal(filtered.length, 2);
    assert.equal(filtered[1][0].first, "Jenna");
  }
});


test("everyProperty should return true if all properties macth", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.everyProperty('visited', 'Prague');
    assert.equal(true, ret, "visited");
  }
});

test("everyProperty should return true if all properties true", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.everyProperty('ready');
    assert.equal(true, ret, "ready");
  }
});

test("everyProperty should return false if any properties false", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.everyProperty('gender', 'male');
    assert.equal(false, ret, "ready");
  }
});

test("someProperty should return false if all properties not match", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.someProperty('visited', 'Timbuktu');
    assert.equal(false, ret, "visited");
  }
});

test("someProperty should return false if all properties false", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.someProperty('doneTravelling');
    assert.equal(false, ret, "doneTravelling");
  }
});

test("someProperty should return true if any properties true", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.someProperty('first', 'Charles');
    assert.equal(true, ret, "first");
  }
});

test("invokeWhile should call method on member objects until return does not match", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    var ret = src.invokeWhile("OK", "invokeWhileTest", "item2");
    assert.equal("FAIL", ret, "return value");
  }
});

test("get @min(balance) should return the minimum balance", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(1, src.get('@min(balance)'));
  }
});

test("get @max(balance) should return the maximum balance", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(4, src.get('@max(balance)'));
  }
});

test("get @minObject(balance) should return the record with min balance", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(src.objectAt(0), src.get('@minObject(balance)'));
  }
});

test("get @maxObject(balance) should return the record with the max balance", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(src.objectAt(3), src.get('@maxObject(balance)'));
  }
});

test("get @sum(balance) should return the sum of the balances.", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal(1+2+3+4, src.get("@sum(balance)"));
  }
});

test("get @average(balance) should return the average of balances", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    assert.equal((1+2+3+4)/4, src.get("@average(balance)"));
  }
});

test("should invoke custom reducer", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    // install reducer method
    src.reduceTest = reduceTestFunc;
    assert.equal("TEST", src.get("@test"));
    assert.equal("prop", src.get("@test(prop)"));
  }
});

test("Should trigger observer on lastObject property when it changes", function (assert) {

  // Perform tests on each sample enumerable in enumerables.
  for (var i = 0, len = enumerables.length; i < len; i++) {
    var enumerable = enumerables[i],
      enumerableLength = enumerable.get('length'),
      callCount = 0,
      testObject = {
        first: "John",
      };

    // Observe the enumerable for updates to `lastObject`.
    enumerable.addObserver("lastObject", function () {
      callCount++;
    });

    // Inserting an item in the middle doesn't change lastObject.
    enumerable.replace(1, 0, [testObject]);
    assert.equal(callCount, 0, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Removing an item in the middle doesn't change lastObject.
    enumerable.replace(1, 1);
    assert.equal(callCount, 0, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Shifting an item to the front doesn't change lastObject.
    enumerable.shiftObject(testObject);
    assert.equal(callCount, 0, "The lastObject observer should have fired this many times (shiftObject on enumerable %@)".fmt(i + 1));

    // Unshifting an item from the front doesn't change lastObject.
    enumerable.unshiftObject(testObject);
    assert.equal(callCount, 0, "The lastObject observer should have fired this many times (unshiftObject on enumerable %@)".fmt(i + 1));

    // Appending an item to the end changes the lastObject.
    enumerable.pushObject(testObject);
    assert.equal(callCount, 1, "The lastObject observer should have fired this many times (pushObject on enumerable %@)".fmt(i + 1));

    // Popping an item from the end changes the lastObject.
    enumerable.popObject();
    assert.equal(callCount, 2, "The lastObject observer should have fired this many times (popObject on enumerable %@)".fmt(i + 1));

    // Replacing only the last item changes the lastObject.
    enumerable.replace(enumerable.get('length') - 1, 1, [testObject]);
    assert.equal(callCount, 3, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Replacing the last two items with one greater number changes the lastObject.
    enumerable.replace(enumerable.get('length') - 2, 2, [testObject, testObject, testObject]);
    assert.equal(callCount, 4, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Replacing the last two items with same number changes the lastObject.
    enumerable.replace(enumerable.get('length') - 2, 2, [testObject, testObject]);
    assert.equal(callCount, 5, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Replacing the last two items with one fewer number changes the lastObject.
    enumerable.replace(enumerable.get('length') - 2, 2, [testObject]);
    assert.equal(callCount, 6, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));

    // Replacing the last two items with two fewer number changes the lastObject.
    enumerable.replace(enumerable.get('length') - 2, 2);
    assert.equal(callCount, 7, "The lastObject observer should have fired this many times (replace on enumerable %@)".fmt(i + 1));
  }
});

test("should trigger observer on property when firstObject changes", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];

    var callCount = 0;
    src.addObserver("firstObject", function () {
      callCount++;
    });

    src.shiftObject();

    assert.equal(callCount, 1, "callCount");
  }
});

test("should trigger observer of reduced prop when array changes once property retrieved once", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    // get the property...this will install the reducer property...
    src.get("@max(balance)");

    // install observer
    var observedValue = null;
    src.addObserver("@max(balance)", function () {
      observedValue = src.get("@max(balance)");
    });

    //src.addProbe('[]');
    //src.addProbe('@max(balance)');

    // add record to array
    src.pushObject({
      first: "John",
      gender: "male",
      californian: false,
      ready: true,
      visited: "Paris",
      balance: 5
    });

    //SC.NotificationQueue.flush(); // force observers to trigger

    // observed value should now be set because the reduced property observer
    // was triggered when we changed the array contents.
    assert.equal(5, observedValue, "observedValue");
  }
});


test("should trigger observer of reduced prop when array changes - even if you never retrieved the property before", function (assert) {
  var src, ary2 = enumerables;
  for (var idx2=0, len2=ary2.length; idx2<len2; idx2++) {
    src = ary2[idx2];
    // install observer
    var observedValue = null;
    src.addObserver("@max(balance)", function () {
      observedValue = src.get("@max(balance)");
    });

    // add record to array
    src.pushObject({
      first: "John",
      gender: "male",
      californian: false,
      ready: true,
      visited: "Paris",
      balance: 5
    });

    //SC.NotificationQueue.flush(); // force observers to trigger

    // observed value should now be set because the reduced property observer
    // was triggered when we changed the array contents.
    assert.equal(5, observedValue, "observedValue");
  }
});

test("should find the first element matching the criteria", function (assert) {
  var people = enumerables[1];
  var jenna = people.find(function (person) { return person.gender == 'female'; });
  assert.equal(jenna.first, 'Jenna');
});

var source; // global variables

module("Real Array", {

  beforeEach: function () {
    source = SC.$A(CommonArray);
  },

  afterEach: function () {
    source = undefined;

    delete Array.prototype["@max(balance)"]; // remove cached value
    delete Array.prototype["@min(balance)"];
  }

});

/*
  This is a particular problem because reduced properties are registered
  as dependent keys, which are not automatically configured in native
  Arrays (where the SC.Object.init method is not run).

  The fix for this problem was to add an initObservable() method to
  SC.Observable that will configure bindings and dependent keys.  This
  method is called from SC.Object.init() and it is called in
  SC.Observable._notifyPropertyChanges if it has not been called already.

  SC.Enumerable was in turn modified to register reducers as dependent
  keys so that now they will be registered on the Array before any
  property change notifications are sent.
*/
test("should notify observers even if reduced property is cached on prototype", function (assert) {
  // make sure reduced property is cached
  source.get("@max(balance)");

  // now make a clone and observe
  source = SC.$A(CommonArray);

  // get the property...this will install the reducer property...
  source.get("@max(balance)");

  // install observer
  var observedValue = null;
  source.addObserver("@max(balance)", function () {
    observedValue = source.get("@max(balance)");
  });

  //source.addProbe('[]');
  //source.addProbe('@max(balance)');

  // add record to array
  source.pushObject({
    first: "John",
    gender: "male",
    californian: false,
    ready: true,
    visited: "Paris",
    balance: 5
  });

  //SC.NotificationQueue.flush(); // force observers to trigger

  // observed value should now be set because the reduced property observer
  // was triggered when we changed the array contents.
  assert.equal(5, observedValue, "observedValue");
});
