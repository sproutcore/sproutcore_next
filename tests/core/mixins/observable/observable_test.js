// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Observable Tests
// ========================================================================
/*globals module, test, ok, equals, expect, Namespace */
import { SC, GLOBAL } from '../../../../core/core.js';

var object, ObjectC, ObjectD, objectA, objectB;

// ..........................................................
// GET()
//

module("object.get()", {

  beforeEach: function() {
    object = SC.Object.create({

      normal: 'value',
      numberVal: 24,
      toggleVal: true,

      computed: function() { return 'value'; }.property(),

      method: function() { return "value"; },

      nullProperty: null,

      unknownProperty: function(key, value) {
        this.lastUnknownProperty = key ;
        return "unknown" ;
      }

    });
  }

});

test("should get normal properties", function (assert) {
  assert.equal(object.get('normal'), 'value') ;
});

test("should call computed properties and return their result", function (assert) {
  assert.equal(object.get("computed"), "value") ;
});

test("should return the function for a non-computed property", function (assert) {
  var value = object.get("method") ;
  assert.equal(SC.typeOf(value), SC.T_FUNCTION) ;
});

test("should return null when property value is null", function (assert) {
  assert.equal(object.get("nullProperty"), null) ;
});

test("should call unknownProperty when value is undefined", function (assert) {
  assert.equal(object.get("unknown"), "unknown") ;
  assert.equal(object.lastUnknownProperty, "unknown") ;
});

// ..........................................................
// SC.GET()
//
module("SC.get()", {
  beforeEach: function() {
    objectA = SC.Object.create({

      normal: 'value',
      numberVal: 24,
      toggleVal: true,

      computed: function() { return 'value'; }.property(),

      method: function() { return "value"; },

      nullProperty: null,

      unknownProperty: function(key, value) {
        this.lastUnknownProperty = key ;
        return "unknown" ;
      }

    });

    objectB = {
      normal: 'value',

      nullProperty: null
    };
  }
});

test("should get normal properties on SC.Observable", function (assert) {
  assert.equal(SC.get(objectA, 'normal'), 'value') ;
});

test("should call computed properties on SC.Observable and return their result", function (assert) {
  assert.equal(SC.get(objectA, "computed"), "value") ;
});

test("should return the function for a non-computed property on SC.Observable", function (assert) {
  var value = SC.get(objectA, "method") ;
  assert.equal(SC.typeOf(value), SC.T_FUNCTION) ;
});

test("should return null when property value is null on SC.Observable", function (assert) {
  assert.equal(SC.get(objectA, "nullProperty"), null) ;
});

test("should call unknownProperty when value is undefined on SC.Observable", function (assert) {
  assert.equal(SC.get(objectA, "unknown"), "unknown") ;
  assert.equal(objectA.lastUnknownProperty, "unknown") ;
});

test("should get normal properties on standard objects", function (assert) {
  assert.equal(SC.get(objectB, 'normal'), 'value');
});

test("should return null when property is null on standard objects", function (assert) {
  assert.equal(SC.get(objectB, 'nullProperty'), null);
});

test("should return undefined if the provided object is null", function (assert) {
  assert.equal(SC.get(null, 'key'), undefined);
});

test("should return undefined if the provided object is undefined", function (assert) {
  assert.equal(SC.get(undefined, 'key'), undefined);
});

test("should work when object is SC (used in SC.objectForPropertyPath)", function (assert) {
  assert.equal(SC.objectForPropertyPath('RunLoop', SC), SC.RunLoop);
  assert.equal(SC.get('RunLoop'), SC.RunLoop);
  assert.equal(SC.get(SC, 'RunLoop'), SC.RunLoop);
});

module("SC.getPath()");

test("should return a property at a given path relative to the global", function (assert) {
  GLOBAL.Foo = SC.Object.create({
    Bar: SC.Object.create({
      Baz: function() { return "blargh"; }.property()
    })
  });

  try {
    assert.equal(SC.getPath('Foo.Bar.Baz'), "blargh");
  } finally {
    GLOBAL.Foo = undefined;
  }
});

test("should return a property at a given path relative to the passed object", function (assert) {
  var foo = SC.Object.create({
    bar: SC.Object.create({
      baz: function() { return "blargh"; }.property()
    })
  });

  assert.equal(SC.getPath(foo, 'bar.baz'), "blargh");
});

test("should return a property at a given path relative to the global - JavaScript hash", function (assert) {
  GLOBAL.Foo = {
    Bar: {
      Baz: "blargh"
    }
  };

  try {
    assert.equal(SC.getPath('Foo.Bar.Baz'), "blargh");
  } finally {
    GLOBAL.Foo = undefined;
  }
});

test("should return a property at a given path relative to the passed object - JavaScript hash", function (assert) {
  var foo = {
    bar: {
      baz: "blargh"
    }
  };

  assert.equal(SC.getPath(foo, 'bar.baz'), "blargh");
});

// ..........................................................
// SET()
//

module("object.set()", {

  beforeEach: function() {
    object = SC.Object.create({

      // normal property
      normal: 'value',

      // computed property
      _computed: "computed",
      computed: function(key, value) {
        if (value !== undefined) {
          this._computed = value ;
        }
        return this._computed ;
      }.property(),

      // method, but not a property
      _method: "method",
      method: function(key, value) {
        if (value !== undefined) {
          this._method = value ;
        }
        return this._method ;
      },

      // null property
      nullProperty: null,

      // unknown property
      _unknown: 'unknown',
      unknownProperty: function(key, value) {
        if (value !== undefined) {
          this._unknown = value ;
        }
        return this._unknown ;
      }

    });
  }

});

test("should change normal properties and return this", function (assert) {
  var ret = object.set("normal", "changed") ;
  assert.equal(object.normal, "changed") ;
  assert.equal(ret, object) ;
});

test("should call computed properties passing value and return this", function (assert) {
  var ret = object.set("computed", "changed") ;
  assert.equal(object._computed, "changed") ;
  assert.equal(SC.typeOf(object.computed), SC.T_FUNCTION) ;
  assert.equal(ret, object) ;
});

test("should replace the function for a non-computed property and return this", function (assert) {
  var ret = object.set("method", "changed") ;
  assert.equal(object._method, "method") ; // make sure this was NOT run
  assert.ok(SC.typeOf(object.method) !== SC.T_FUNCTION) ;
  assert.equal(ret, object) ;
});

test("should replace prover when property value is null", function (assert) {
  var ret = object.set("nullProperty", "changed") ;
  assert.equal(object.nullProperty, "changed") ;
  assert.equal(object._unknown, "unknown"); // verify unknownProperty not called.
  assert.equal(ret, object) ;
});

test("should call unknownProperty with value when property is undefined", function (assert) {
  var ret = object.set("unknown", "changed") ;
  assert.equal(object._unknown, "changed") ;
  assert.equal(ret, object) ;
});

// ..........................................................
// COMPUTED PROPERTIES
//

module("Computed properties", {
  beforeEach: function() {
    object = SC.Object.create({

      // REGULAR

      computedCalls: [],
      computed: function(key, value) {
        this.computedCalls.push(value);
        return 'computed';
      }.property(),

      computedCachedCalls: [],
      computedCached: function(key, value) {
        this.computedCachedCalls.push(value);
        return 'computedCached';
      }.property().cacheable(),


      // DEPENDENT KEYS

      changer: 'foo',

      dependentCalls: [],
      dependent: function(key, value) {
        this.dependentCalls.push(value);
        return 'dependent';
      }.property('changer'),

      dependentCachedCalls: [],
      dependentCached: function(key, value) {
        this.dependentCachedCalls.push(value);
        return 'dependentCached';
      }.property('changer').cacheable(),

      // every time it is recomputed, increments call
      incCallCount: 0,
      inc: function() {
        return this.incCallCount++;
      }.property('changer').cacheable(),

      // depends on cached property which depends on another property...
      nestedIncCallCount: 0,
      nestedInc: function(key, value) {
        return this.nestedIncCallCount++;
      }.property('inc').cacheable(),

      // two computed properties that depend on a third property
      state: 'on',
      isOn: function(key, value) {
        if (value !== undefined) this.set('state', 'on');
        return this.get('state') === 'on';
      }.property('state'),

      isOff: function(key, value) {
        if (value !== undefined) this.set('state', 'off');
        return this.get('state') === 'off';
      }.property('state')

    }) ;
  },

  afterEach: function () {
    GLOBAL.DepObj = null;
  }
});

test("getting values should call function return value", function (assert) {

  // get each property twice. Verify return.
  var keys = 'computed computedCached dependent dependentCached'.w();

  keys.forEach(function(key) {
    assert.equal(object.get(key), key, 'Try #1: object.get(%@) should run function'.fmt(key));
    assert.equal(object.get(key), key, 'Try #2: object.get(%@) should run function'.fmt(key));
  });

  // verify each call count.  cached should only be called once
  'computedCalls dependentCalls'.w().forEach(function(key) {
    assert.equal(object[key].length, 2, 'non-cached property %@ should be called 2x'.fmt(key));
  });

  'computedCachedCalls dependentCachedCalls'.w().forEach(function(key) {
    assert.equal(object[key].length, 1, 'non-cached property %@ should be called 1x'.fmt(key));
  });

});

test("setting values should call function return value", function (assert) {

  // get each property twice. Verify return.
  var keys = 'computed dependent computedCached dependentCached'.w();
  var values = 'value1 value2'.w();

  keys.forEach(function(key) {

    assert.equal(object.set(key, values[0]), object, 'Try #1: object.set(%@, %@) should run function'.fmt(key, values[0]));

    assert.equal(object.set(key, values[1]), object, 'Try #2: object.set(%@, %@) should run function'.fmt(key, values[1]));
    assert.equal(object.set(key, values[1]), object, 'Try #3: object.set(%@, %@) should not run function since it is setting same value as before'.fmt(key, values[1]));

  });


  // verify each call count.  cached should only be called once
  keys.forEach(function(key) {
    var calls = object[key + 'Calls'], idx;
    assert.equal(calls.length, 2, 'set(%@) should be called 2x'.fmt(key));
    for(idx=0;idx<2;idx++) {
      assert.equal(calls[idx], values[idx], 'call #%@ to set(%@) should have passed value %@'.fmt(idx+1, key, values[idx]));
    }
  });

});

test("notify change should clear cache", function (assert) {

  // call get several times to collect call count
  object.get('computedCached'); // should run func
  object.get('computedCached'); // should not run func

  object.propertyWillChange('computedCached')
    .propertyDidChange('computedCached');

  object.get('computedCached'); // should run again
  assert.equal(object.computedCachedCalls.length, 2, 'should have invoked method 2x');
});

test("change dependent should clear cache", function (assert) {

  // call get several times to collect call count
  var ret1 = object.get('inc'); // should run func
  assert.equal(object.get('inc'), ret1, 'multiple calls should not run cached prop');

  object.set('changer', 'bar');

  assert.equal(object.get('inc'), ret1+1, 'should increment after dependent key changes'); // should run again
});

test("just notifying change of dependent should clear cache", function (assert) {

  // call get several times to collect call count
  var ret1 = object.get('inc'); // should run func
  assert.equal(object.get('inc'), ret1, 'multiple calls should not run cached prop');

  object.notifyPropertyChange('changer');

  assert.equal(object.get('inc'), ret1+1, 'should increment after dependent key changes'); // should run again
});

test("changing dependent should clear nested cache", function (assert) {

  // call get several times to collect call count
  var ret1 = object.get('nestedInc'); // should run func
  assert.equal(object.get('nestedInc'), ret1, 'multiple calls should not run cached prop');

  object.set('changer', 'bar');

  assert.equal(object.get('nestedInc'), ret1+1, 'should increment after dependent key changes'); // should run again

});

test("just notifying change of dependent should clear nested cache", function (assert) {

  // call get several times to collect call count
  var ret1 = object.get('nestedInc'); // should run func
  assert.equal(object.get('nestedInc'), ret1, 'multiple calls should not run cached prop');

  object.notifyPropertyChange('changer');

  assert.equal(object.get('nestedInc'), ret1+1, 'should increment after dependent key changes'); // should run again

});


// This verifies a specific bug encountered where observers for computed
// properties would fire before their prop caches were cleared.
test("change dependent should clear cache when observers of dependent are called", function (assert) {

  // call get several times to collect call count
  var ret1 = object.get('inc'); // should run func
  assert.equal(object.get('inc'), ret1, 'multiple calls should not run cached prop');

  // add observer to verify change...
  object.addObserver('inc', this, function() {
    assert.equal(object.get('inc'), ret1+1, 'should increment after dependent key changes'); // should run again
  });

  // now run
  object.set('changer', 'bar');

});

test("allPropertiesDidChange should clear cache", function (assert) {
  // note: test this with a computed method that returns a different value
  // each time to ensure clean function.
  var ret1 = object.get('inc');
  assert.equal(object.get('inc'), ret1, 'should not change after first call');

  // flush all props
  object.allPropertiesDidChange();
  assert.equal(object.get('inc'), ret1+1, 'should increment after change');
});

test('setting one of two computed properties that depend on a third property should clear the kvo cache', function() {
  // we have to call set twice to fill up the cache
  object.set('isOff', true);
  object.set('isOn', true);

  // setting isOff to true should clear the kvo cache
  object.set('isOff', true);
  assert.equal(object.get('isOff'), true, 'object.isOff should be true');
  assert.equal(object.get('isOn'), false, 'object.isOn should be false');
});

test("dependent keys should be able to be specified as property paths", function (assert) {
  var depObj = SC.Object.create({
    menu: SC.Object.create({
      price: 5
    }),

    menuPrice: function() {
      return this.getPath('menu.price');
    }.property('menu.price').cacheable()
  });

  assert.equal(depObj.get('menuPrice'), 5, "precond - initial value returns 5");

  depObj.setPath('menu.price', 6);

  assert.equal(depObj.get('menuPrice'), 6, "cache is properly invalidated after nested property changes");
});

test("nested dependent keys should propagate after they update", function (assert) {
  GLOBAL.DepObj = SC.Object.create({
    restaurant: SC.Object.create({
      menu: SC.Object.create({
        price: 5
      })
    }),

    price: function() {
      return this.getPath('restaurant.menu.price');
    }.property('restaurant.menu.price')
  });
  
  var bindObj = SC.Object.create({
    priceBinding: "DepObj.price"
  });

  SC.run();

  assert.equal(bindObj.get('price'), 5, "precond - binding propagates");

  GLOBAL.DepObj.setPath('restaurant.menu.price', 10);

  SC.run();

  assert.equal(bindObj.get('price'), 10, "binding propagates after a nested dependent keys updates");

  GLOBAL.DepObj.setPath('restaurant.menu', SC.Object.create({
    price: 15
  }));

  SC.run();

  assert.equal(bindObj.get('price'), 15, "binding propagates after a middle dependent keys updates");
});

test("cacheable nested dependent keys should clear after their dependencies update", function (assert) {
  GLOBAL.DepObj = SC.Object.create({
    restaurant: SC.Object.create({
      menu: SC.Object.create({
        price: 5
      })
    }),

    price: function() {
      return this.getPath('restaurant.menu.price');
    }.property('restaurant.menu.price').cacheable()
  });

  SC.run();

  assert.equal(GLOBAL.DepObj.get('price'), 5, "precond - computed property is correct");

  GLOBAL.DepObj.setPath('restaurant.menu.price', 10);

  assert.equal(GLOBAL.DepObj.get('price'), 10, "cacheable computed properties are invalidated even if no run loop occurred");
  GLOBAL.DepObj.setPath('restaurant.menu.price', 20);

  assert.equal(GLOBAL.DepObj.get('price'), 20, "cacheable computed properties are invalidated after a second get before a run loop");

  SC.run();

  assert.equal(GLOBAL.DepObj.get('price'), 20, "precond - computed properties remain correct after a run loop");

  GLOBAL.DepObj.setPath('restaurant.menu', SC.Object.create({
    price: 15
  }));

  assert.equal(GLOBAL.DepObj.get('price'), 15, "cacheable computed properties are invalidated after a middle property changes");

  GLOBAL.DepObj.setPath('restaurant.menu', SC.Object.create({
    price: 25
  }));

  assert.equal(GLOBAL.DepObj.get('price'), 25, "cacheable computed properties are invalidated after a middle property changes again, before a run loop");
});



// ..........................................................
// OBSERVABLE OBJECTS
//

module("Observable objects & object properties ", {

  beforeEach: function() {
    GLOBAL.NormalArray = [1,2,3,4,5];

    object = SC.Object.create({

      normal: 'value',
      abnormal: 'zeroValue',
      abnormal2: 'zeroValue',
      abnormal3: 'zeroValue',
      numberVal: 24,
      toggleVal: true,
      observedProperty: 'beingWatched',
      testRemove: 'observerToBeRemoved',
      normalArray: [1,2,3,4,5],

      automaticallyNotifiesObserversFor : function(key) {
        return false;
      },

      getEach: function() {
        var keys = ['normal','abnormal'];
        var ret = [];
        for(var idx=0; idx<keys.length;idx++) {
          ret[ret.length] = this.getPath(keys[idx]);
        }
        return ret ;
      },

      newObserver:function(){
        this.abnormal = 'changedValueObserved';
      },

      testObserver:function(){
        this.abnormal = 'removedObserver';
      }.observes('normal'),

      testArrayObserver:function(){
        this.abnormal = 'notifiedObserver';
      }.observes('*normalArray.[]'),

      testArrayObserver2:function(){
        this.abnormal2 = 'notifiedObserver';
      }.observes('normalArray.[]'),

      testArrayObserver3:function(){
        this.abnormal3 = 'notifiedObserver';
      }.observes('NormalArray.[]')

    });
  },

  afterEach: function() {
    GLOBAL.NormalArray = null;
  }

});

test('incrementProperty and decrementProperty',function(){
  var newValue = object.incrementProperty('numberVal');
  assert.equal(25,newValue,'numerical value incremented');
  object.numberVal = 24;
  newValue = object.decrementProperty('numberVal');
  assert.equal(23,newValue,'numerical value decremented');
  object.numberVal = 25;
  newValue = object.incrementProperty('numberVal', 5);
  assert.equal(30,newValue,'numerical value incremented by specified increment');
  object.numberVal = 25;
  newValue = object.decrementProperty('numberVal',5);
  assert.equal(20,newValue,'numerical value decremented by specified increment');
});

test('toggle function, should be boolean',function(){
  assert.equal(object.toggleProperty('toggleVal',true,false),object.get('toggleVal'));
  assert.equal(object.toggleProperty('toggleVal',true,false),object.get('toggleVal'));
  assert.equal(object.toggleProperty('toggleVal',undefined,undefined),object.get('toggleVal'));
});

test('should not notify the observers of a property automatically',function(){
  object.set('normal', 'doNotNotifyObserver');
  assert.equal(object.abnormal,'zeroValue')  ;
});

test('should notify array observer when object\'s array changes',function(){
  object.normalArray.replace(0,0,6);
  assert.equal(object.abnormal, 'notifiedObserver', 'testArrayObserver should be notified');
  assert.equal(object.abnormal2, 'notifiedObserver', 'testArrayObserver2 should be notified');
  assert.equal(object.abnormal3, 'zeroValue', 'testArrayObserver3 should not be notified');
});

test('should notify array observer when NormalArray array changes',function(){
  GLOBAL.NormalArray.replace(0,0,6);
  assert.equal(object.abnormal, 'zeroValue', 'testArrayObserver should not be notified');
  assert.equal(object.abnormal2, 'zeroValue', 'testArrayObserver2 should not be notified');
  assert.equal(object.abnormal3, 'notifiedObserver', 'testArrayObserver3 should be notified');
});


module("object.addObserver()", {
  beforeEach: function() {

    ObjectC = SC.Object.create({

      ObjectE:SC.Object.create({
        propertyVal:"chainedProperty"
      }),

      normal: 'value',
      normal1: 'zeroValue',
      normal2: 'dependentValue',
      incrementor: 10,

      action: function() {
        this.normal1= 'newZeroValue';
      },

      observeOnceAction: function() {
        this.incrementor= this.incrementor+1;
      },

      chainedObserver:function(){
        this.normal2 = 'chainedPropertyObserved' ;
      }

    });
  }
});

test("should register an observer for a property", function (assert) {
  ObjectC.addObserver('normal', ObjectC, 'action');
  ObjectC.set('normal','newValue');
  assert.equal(ObjectC.normal1, 'newZeroValue');
});

test("should register an observer for a property - Special case of chained property", function (assert) {
  ObjectC.addObserver('ObjectE.propertyVal',ObjectC,'chainedObserver');
  ObjectC.ObjectE.set('propertyVal',"chainedPropertyValue");
  assert.equal('chainedPropertyObserved',ObjectC.normal2);
  ObjectC.normal2 = 'dependentValue';
  ObjectC.set('ObjectE','');
  assert.equal('chainedPropertyObserved',ObjectC.normal2);
});

test("passing a context", function (assert) {
  var target = {
    callback: function(target, key, nullVariable, context, revision) {
      target.context = context;
    }
  };

  ObjectC.context = null;
  ObjectC.addObserver('normal', target, 'callback', 'context');
  ObjectC.set('normal','newValue');

  assert.equal(ObjectC.context, 'context');
});

module("object.removeObserver()", {
  beforeEach: function() {
    ObjectD = SC.Object.create({

      ObjectF:SC.Object.create({
        propertyVal:"chainedProperty"
      }),

      normal: 'value',
      normal1: 'zeroValue',
      normal2: 'dependentValue',
      ArrayKeys: ['normal','normal1'],

      addAction: function() {
        this.normal1 = 'newZeroValue';
      },
      removeAction: function() {
        this.normal2 = 'newDependentValue';
      },
      removeChainedObserver:function(){
        this.normal2 = 'chainedPropertyObserved' ;
      },

      observableValue: "hello world",

      observer1: function() {
        // Just an observer
        console.log("observer!");
      },
      observer2: function() {
        console.log("observer2!");
        this.removeObserver('observableValue', null, 'observer1');
        this.removeObserver('observableValue', null, 'observer2');
        this.hasObserverFor('observableValue');   // Tickle 'getMembers()'
        this.removeObserver('observableValue', null, 'observer3');
      },
      observer3: function() {
        // Just an observer
        console.log("observer3!");
      }
    });

  }
});

test("should unregister an observer for a property", function (assert) {
  ObjectD.addObserver('normal', ObjectD, 'addAction');
  ObjectD.set('normal','newValue');
  assert.equal(ObjectD.normal1, 'newZeroValue');

  ObjectD.set('normal1','zeroValue');

  ObjectD.removeObserver('normal', ObjectD, 'addAction');
  ObjectD.set('normal','newValue');
  assert.equal(ObjectD.normal1, 'zeroValue');
});


test("should unregister an observer for a property - special case when key has a '.' in it.", function (assert) {
  ObjectD.addObserver('ObjectF.propertyVal',ObjectD,'removeChainedObserver');
  ObjectD.ObjectF.set('propertyVal',"chainedPropertyValue");
  ObjectD.removeObserver('ObjectF.propertyVal',ObjectD,'removeChainedObserver');
  ObjectD.normal2 = 'dependentValue';
  ObjectD.ObjectF.set('propertyVal',"removedPropertyValue");
  assert.equal('dependentValue',ObjectD.normal2);
  ObjectD.set('ObjectF','');
  assert.equal('dependentValue',ObjectD.normal2);
});


test("removing an observer inside of an observer shouldn’t cause any problems", function (assert) {
  // The observable system should be protected against clients removing
  // observers in the middle of observer notification.
  var encounteredError = false;
  try {
    ObjectD.addObserver('observableValue', null, 'observer1');
    ObjectD.addObserver('observableValue', null, 'observer2');
    ObjectD.addObserver('observableValue', null, 'observer3');
    SC.run(function() { ObjectD.set('observableValue', "hi world"); });
  }
  catch(e) {
    encounteredError = true;
  }
  assert.equal(encounteredError, false);
});


module("object.hasObserverFor", {
  beforeEach: function() {
    objectA = SC.Object.create({
      internalObject: SC.Object.create({
        chainedKey: 'value',
        deepInternalObject: SC.Object.create({
          deepChainedKey: 'value'
        }),
      }),
      key: 'value',
      observingMethod: function() {
        // nothin to see here
      }.observes('key', '.objectF.chainedKey'),
      nonObservingMethod: function () {
        // nothin to see here
      },
      counter: 0
    });
    objectB = SC.Object.create({
      observingMethod: function() {
        // nothin to see here
      }
    });
  }
});

test('hasObserverFor correctly identifies local observers.', function() {
  objectA.addObserver('key', 'observingMethod');
  assert.ok(objectA.hasObserverFor('key'), "Object has an observer for 'key'.");
  assert.ok(objectA.hasObserverFor('key', 'observingMethod'), "Object's observingMethod is the observer for 'key'.");
});

test('hasObserverFor correctly identifies remote observers.', function() {
  objectA.addObserver('key', objectA, 'observingMethod');
  assert.ok(objectA.hasObserverFor('key'), "Object has an observer for 'key'.");
  assert.ok(objectA.hasObserverFor('key', objectA, 'observingMethod'), "Second object's observingMethod is the observer for 'key'.");
});

test('hasObserverFor correctly identifies chained observers.', function() {
  objectA.addObserver('.internalObject.chainedKey', 'observingMethod');

  // Test general support for chain.
  assert.ok(objectA.hasObserverFor('.internalObject.chainedKey'), "Object has an observer for '.internalObject.chainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectA.hasObserverFor('.internalObject.nonChainedKey'), "Object does not have an observer for '.internalObject.nonChainedKey'.");
  assert.ok(!objectA.hasObserverFor('*internalObject.chainedKey'), "Object does not have an observer for '*internalObject.chainedKey'.");

  // Test support for chain with target/method.
  assert.ok(objectA.hasObserverFor('.internalObject.chainedKey', 'observingMethod'), "Object's observingMethod is the observer for '.internalObject.chainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectB.hasObserverFor('.internalObject.chainedKey', 'observingMethod'), "Wrong object's observingMethod is not the observer for '.internalObject.chainedKey'.");
  assert.ok(!objectA.hasObserverFor('.internalObject.chainedKey', 'nonObservingMethod'), "Object's nonObservingMethod is not the observer for '.internalObject.chainedKey'.");

  objectA.addObserver('.internalObject.deepInternalObject.deepChainedKey', 'observingMethod');

  // Test general support for deeper chain.
  assert.ok(objectA.hasObserverFor('.internalObject.deepInternalObject.deepChainedKey'), "Object has an observer for '.internalObject.deepInternalObject.deepChainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectA.hasObserverFor('.internalObject.deepInternalObject.nonDeepChainedKey'), "Object does not have an observer for '.internalObject*deepInternalObject.nonDeepChainedKey'.");
  assert.ok(!objectA.hasObserverFor('.internalObject*deepInternalObject.deepChainedKey'), "Object does not have an observer for '.internalObject*deepInternalObject.deepChainedKey'.");

  // Test support for deeper chain with target/method.
  assert.ok(objectA.hasObserverFor('.internalObject.deepInternalObject.deepChainedKey', 'observingMethod'), "Object's observingMethod is the observer for '.internalObject.deepInternalObject.deepChainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectB.hasObserverFor('.internalObject.deepInternalObject.deepChainedKey', 'observingMethod'), "Wrong object's observingMethod is not the observer for '.internalObject.deepInternalObject.deepChainedKey'.");
  assert.ok(!objectA.hasObserverFor('.internalObject.deepInternalObject.deepChainedKey', 'nonObservingMethod'), "Object's nonObservingMethod is not the observer for '.internalObject.deepInternalObject.deepChainedKey'.");
});

test('hasObserverFor correctly identifies greedy chain observers.', function() {
  objectA.addObserver('.internalObject*deepInternalObject.deepChainedKey', 'observingMethod');

  // Test general support for chain.
  assert.ok(objectA.hasObserverFor('.internalObject*deepInternalObject.deepChainedKey'), "Object has an observer for '.internalObject*deepInternalObject.deepChainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectA.hasObserverFor('.internalObject*deepInternalObject.nonDeepChainedKey'), "Object does not have an observer for '.internalObject*deepInternalObject.nonDeepChainedKey'.");
  assert.ok(!objectA.hasObserverFor('*internalObject.deepInternalObject.deepChainedKey'), "Object does not have an observer for '*internalObject.deepInternalObject.deepChainedKey'.");

  // Test support for chain with target/method.
  assert.ok(objectA.hasObserverFor('.internalObject*deepInternalObject.deepChainedKey', 'observingMethod'), "Object's observingMethod is the observer for '.internalObject*deepInternalObject.deepChainedKey'.");

  // Ensure we're not getting false positives.
  assert.ok(!objectB.hasObserverFor('.internalObject*deepInternalObject.deepChainedKey', 'observingMethod'), "Wrong object's observingMethod is not the observer for '.internalObject*deepInternalObject.deepChainedKey'.");
  assert.ok(!objectA.hasObserverFor('.internalObject*deepInternalObject.deepChainedKey', 'nonObservingMethod'), "Object's nonObservingMethod is not the observer for '.internalObject*deepInternalObject.deepChainedKey'.");
});


module("Bind function ", {

  beforeEach: function() {
    objectA = SC.Object.create({
      name: "Sproutcore",
      location: "Timbaktu"
    });

    objectB = SC.Object.create({
      normal: "value",
      computed:function() {
        this.normal = 'newValue';
      }
    }) ;

    GLOBAL.Namespace = {
      objectA: objectA,
      objectB: objectB
    } ;
  }
});

test("should bind property with method parameter as undefined", function (assert) {
  // creating binding
  objectA.bind("name", "Namespace.objectB.normal",undefined) ;
  SC.Binding.flushPendingChanges() ; // actually sets up up the binding

  // now make a change to see if the binding triggers.
  objectB.set("normal", "changedValue") ;

  // support new-style bindings if available
  SC.Binding.flushPendingChanges();
  assert.equal("changedValue", objectA.get("name"), "objectA.name is binded");
});

// ..........................................................
// SPECIAL CASES
//

test("changing chained observer object to null should not raise exception", function(assert) {

  var obj = SC.Object.create({
    foo: SC.Object.create({
      bar: SC.Object.create({ bat: "BAT" })
    })
  });

  var callCount = 0;
  obj.foo.addObserver('bar.bat', obj, function(target, key, value) {
    assert.equal(target, null, 'new target value should be null');
    assert.equal(key, 'bat', 'key should be bat');
    callCount++;
  });

  SC.run(function() {
    obj.foo.set('bar', null);
  });

  assert.equal(callCount, 1, 'changing bar should trigger observer');
  assert.expect(3);
});

module("addObservesHandler and removeObservesHandler functions", {

  beforeEach: function() {
    GLOBAL.TestNS = SC.Object.create({
      value: 0
    });

    objectA = SC.Object.create({

      value: 0,
      arrayValue: [],

      handler1NotifiedCount: 0,
      handler2NotifiedCount: 0,
      arrayHandlerNotifiedCount: 0,

      handler1: function() {
        this.handler1NotifiedCount++;
      },

      handler2: function() {
        this.handler2NotifiedCount++;
      },

      arrayHandler: function() {
        this.arrayHandlerNotifiedCount++;
      }

    });
  },

  afterEach: function() {
    objectA = null;
    GLOBAL.TestNS = null;
  }

});

test("add and remove observer handler1", function (assert) {
  objectA.addObservesHandler(objectA.handler1, 'value');
  objectA.set('value', 100);
  assert.equal(objectA.handler1NotifiedCount, 1, "observes handler1 should be notified");

  objectA.removeObservesHandler(objectA.handler1, 'value');
  objectA.set('value', 200);
  assert.equal(objectA.handler1NotifiedCount, 1, "observes handler1 should not be notified");
});

test("add and remove observer handler2", function (assert) {
  objectA.addObservesHandler(objectA.handler2, 'TestNS.value');
  GLOBAL.TestNS.set('value', 1000);
  assert.equal(objectA.handler2NotifiedCount, 1, "observes handler2 should be notified");

  objectA.removeObservesHandler(objectA.handler2, 'TestNS.value');
  GLOBAL.TestNS.set('value', 2000);
  assert.equal(objectA.handler2NotifiedCount, 1, "observes handler1 should not be notified");
});

test("add and remove observer array handler without chain observes", function (assert) {
  objectA.addObservesHandler(objectA.arrayHandler, 'arrayValue.[]');
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.ok(objectA.arrayHandlerNotifiedCount > 0, "observes array handler should be notified aftering pushing object to array");

  objectA.arrayHandlerNotifiedCount = 0;

  objectA.removeObservesHandler(objectA.arrayHandler, 'arrayValue.[]');
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.equal(objectA.arrayHandlerNotifiedCount, 0, "observes array handler should not be notified after removing observes handler");

  objectA.addObservesHandler(objectA.arrayHandler, 'arrayValue.[]');
  objectA.set('arrayValue', []);
  assert.equal(objectA.arrayHandlerNotifiedCount, 0, "observes array handler should not be notified after assigning new array");
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.equal(objectA.arrayHandlerNotifiedCount, 0, "observes array handler should not be notified after pushing object to new array");
});

test("add and remove observer array handler with chain observes", function (assert) {
  objectA.addObservesHandler(objectA.arrayHandler, '*arrayValue.[]');
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.ok(objectA.arrayHandlerNotifiedCount > 0, "observes array handler should be notified aftering pushing object to array");

  objectA.arrayHandlerNotifiedCount = 0;

  objectA.removeObservesHandler(objectA.arrayHandler, '*arrayValue.[]');
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.equal(objectA.arrayHandlerNotifiedCount, 0, "observes array handler should not be notified of push after removing observes handler");
  objectA.set('arrayValue', []);
  assert.equal(objectA.arrayHandlerNotifiedCount, 0, "observes array handler should not be notified of new array after removing observes handler");

  objectA.addObservesHandler(objectA.arrayHandler, '*arrayValue.[]');
  objectA.set('arrayValue', []);
  assert.ok(objectA.arrayHandlerNotifiedCount > 0, "observes array handler should be notified after assigning new array");
  objectA.arrayValue.pushObject(SC.Object.create());
  assert.ok(objectA.arrayHandlerNotifiedCount > 0, "observes array handler should be notified after pushing object to new array");
});


module("Cleaning up observables", {

  beforeEach: function() {
    GLOBAL.TestNS = SC.Object.create({
      value1: 'a',
      value2: 'b'
    });

    SC.run(function() {
      object = SC.Object.create({

        myValue1Binding: 'TestNS.value1',

        value2DidChange: function() {

        }.observes('TestNS.value2')

      });
    });
  },

  afterEach: function() {
    object = GLOBAL.TestNS = null;
  }

});

/**
  This test highlights a problem with destroying Observable objects.  Previously
  bindings and observers on the object resulted in the object being retained in
  the ObserverSets of other objects, preventing them from being freed.  The
  addition of destroyObservable to SC.Observable fixes this.
*/
test("destroying an observable should remove binding objects and clear observer queues", function (assert) {
  var observerSet1, observerSet2,
    targetGuid1, targetGuid2;

  targetGuid1 = SC.guidFor(object);
  targetGuid2 = SC.guidFor(object.bindings[0]);
  observerSet1 = GLOBAL.TestNS._kvo_observers_value1;
  observerSet2 = GLOBAL.TestNS._kvo_observers_value2;
  assert.equal(observerSet1.members.length, 1, "The length of the members array on TestNS._kvo_observers_value1 should be");
  assert.equal(observerSet2.members.length, 1, "The length of the members array on TestNS._kvo_observers_value2 should be");
  assert.ok(!SC.none(observerSet1._members[targetGuid2]), "The object should be retained in TestNS._kvo_observers_value1.");
  assert.ok(!SC.none(observerSet2._members[targetGuid1]), "The object should be retained in TestNS._kvo_observers_value2.");
  object.destroy();
  assert.equal(observerSet1.members.length, 0, "The length of the members array on TestNS._kvo_observers_value1 should be");
  assert.equal(observerSet2.members.length, 0, "The length of the members array on TestNS._kvo_observers_value2 should be");
  assert.ok(SC.none(observerSet1._members[targetGuid2]), "The object should not be retained in TestNS._kvo_observers_value1.");
  assert.ok(SC.none(observerSet2._members[targetGuid1]), "The object should not be retained in TestNS._kvo_observers_value2.");
});
