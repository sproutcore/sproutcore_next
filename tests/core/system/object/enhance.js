// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

module("Function#enhance");

test("reopening and enhancing", function (assert) {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string + this.get('exclaim');
    },
    exclaim: "!"
  });

  Klass.reopen({
    loudly: function(original, string) {
      return original(string.toUpperCase());
    }.enhance()
  });

  var obj = Klass.create();
  assert.equal(obj.loudly("foo"), "FOO!");
});

test("subclassing and then enhancing the parent", function (assert) {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string + this.get('exclaim'); // foo!
    },
    exclaim: "!"
  });

  var obj = Klass.create();
  assert.equal(obj.loudly("foo"), "foo!");

  Klass.reopen({
    loudly: function(original, string) {
      return original(string.toUpperCase()); // FOO!
    }.enhance()
  });

  obj = Klass.create();
  assert.equal(obj.loudly("foo"), "FOO!");

  let SubKlass = Klass.extend({
    loudly: function loudly(string) {
      return "ZOMG " + loudly.base.apply(this, arguments); // ZOMG FOO!
    }
  });

  obj = SubKlass.create();
  assert.equal(obj.loudly("foo"), "ZOMG FOO!");

  Klass.reopen({
    loudly: function(original, string) {
      return "OHAI: " + original(string); // OHAI: FOO!
    }.enhance()
  });

  obj = Klass.create();
  assert.equal(obj.loudly("foo"), "OHAI: FOO!");
  obj = SubKlass.create();
  assert.equal(obj.loudly("foo"), "ZOMG OHAI: FOO!");
});

test("calling sc_super inside a reopened class", function (assert) {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string + this.get('exclaim');
    },
    exclaim: "!"
  });

  Klass.reopen({
    loudly: function(original, string) {
      return original(string.toUpperCase());
    }.enhance()
  });

  let SubKlass = Klass.extend({});

  SubKlass.reopen({
    loudly: function loudly(string) {
      return "ZOMG " + loudly.base.apply(this, arguments);
    }
  });

  SubKlass.reopen({
    loudly: function(original, string) {
      return "OHAI: " + original(string);
    }.enhance()
  });

  Klass.reopen({
    loudly: function(original, string) {
      return "HAHA " + original(string);
    }.enhance()
  });

  var obj = SubKlass.create();
  assert.equal(obj.loudly("foo"), "OHAI: ZOMG HAHA FOO!");
});

test("calling sc_super inside a reopened class, reverse", function (assert) {
  var Klass = SC.Object.extend();

  var object = Klass.create({
    loudly: function loudly (string) {
      return loudly.base.apply(this, arguments) + "!";
    }
  });

  Klass.reopen({
    loudly: function(string) {
      return string.toUpperCase();
    }
  });

  assert.equal(object.loudly("foo"), "FOO!");
});

test("sc_super to a non-method", function (assert) {
  var Klass = SC.Object.extend({
    wot: function wot () {
      return wot.base.apply(this);
    }
  });

  var object = Klass.create(), error;

  try {
    object.wot();
  } catch(e) {
    error = e;
  }

  assert.ok(error, "sc_super throws an error if there is no superclass method");
});

test("sc_super works in enhanced methods", function (assert) {
  var Klass = SC.Object.extend({
    loudly: function(string) {
      return string.toUpperCase();
    }
  });

  var SubKlass = Klass.extend({
    loudly: function(string) {}
  });

  SubKlass.reopen({
    loudly: function loudly (original, string) {
      return loudly.base.apply(this, arguments);
    }.enhance()
  });

  var object = SubKlass.create({});

  assert.equal("TOM DAAALE IS A FOO", object.loudly("Tom DAAALE is a foo"), "sc_super should work in enhanced methods");
});

// When creating a new instance of a class or extending a class, SproutCore
// keeps a record of the object that calls to sc_super should be looked up
// on.
//
// Calls to sc_super are dynamic, which means that you can modify a class or
// superclass of an object at runtime, and sc_super will correctly pick up
// those changes. This is especially important for calls to reopen and
// enhance.
test("__sc_super__ semantics", function (assert) {
  var rootObject = SC.Object.create({});
  assert.ok(rootObject.__sc_super__ === SC.Object.prototype, "SproutCore remembers that new SC.Objects should super to SC.Object.prototype");

  var basicObject = new SC.Object();
  assert.ok(basicObject.__sc_super__ === SC.Object.prototype, "SproutCore remembers that SC.Objects created by new SC.Object should super to SC.Object.prototype");

  var Klass = SC.Object.extend({});
  assert.ok(Klass.__sc_super__ === SC.Object.prototype, "SproutCore remembers the original begetted prototype for subclasses");

  var object = Klass.create({});
  assert.ok(object.__sc_super__ === Klass.prototype, "SproutCore remembers the original prototype for new instances");

  var basicSubclassObject = new Klass();
  assert.ok(basicSubclassObject.__sc_super__ === Klass.prototype, "SproutCore remembers the original prototype for new instances created with new");

  var SubKlass = Klass.extend({});
  assert.ok(SubKlass.__sc_super__ === Klass.prototype, "SproutCore remembers the original begetted prototype for custom subclasses");

  SubKlass.reopen({});
  assert.ok(SubKlass.__sc_super__ === Klass.prototype, "Reopen doesn't break prototype recordkeeping");
});

test("enhance still works if there is no base method to enhance", function (assert) {
  var enhancer = {
    weirdName: function(original) {
      original();

      return true;
    }.enhance()
  };

  var enhanced = SC.Object.create(enhancer);

  assert.ok(enhanced.weirdName(), "enhanced function runs with no errors");
});

/**
  There was a bug that defining a subclass prior to reopening the parent class
  and adding a computed property, binding or observer to the parent, caused the
  subclass not to register the property, binding or observer correctly.
*/
test("reopening a class that has been subclassed, updates the subclasses properties, bindings and observers", function (assert) {
  var propertyChanged = 0, observerCalled = 0;
  GLOBAL.MyBindable = SC.Object.create({ a: 1, b: 2 });
  var MyClass = SC.Object.extend({ property: function() { }.property() });

  // Define a subclass prior to the reopen().
  var MySubclass = MyClass.extend({ anotherProperty: function() { return "My Own Property"; }.property(), c: 3 });

  // Reopen and add a computed property, binding and observer to the parent class
  MyClass.reopen({
    anotherProperty: function() {
      return "Another Property";
    }.property(),
    yetAnotherProperty: function() {
      return "Yet Another Property";
    }.property('property'),
    a: 1,
    aBinding: SC.Binding.oneWay("MyBindable.a"),
    bObserver: function() {
      observerCalled++;
    }.observes('MyBindable.b'),
    c: 4
  });

  // Define another subclass after the reopen().
  var MyOtherSubclass = MyClass.extend({ stillOneOtherProperty: function() { }.property() });

  // Create instances of each for comparison.
  var myClass = MyClass.create();
  myClass.addObserver('yetAnotherProperty', function() {
    propertyChanged++;
  });

  var mySubclass = MySubclass.create();
  mySubclass.addObserver('yetAnotherProperty', function() {
    propertyChanged++;
  });

  var myOtherSubclass = MyOtherSubclass.create();
  myOtherSubclass.addObserver('yetAnotherProperty', function() {
    propertyChanged++;
  });

  SC.run(function() {
    myClass.set('property', "foo");
    mySubclass.set('property', "foo");
    myOtherSubclass.set('property', "foo");
    MyBindable.set('a', 2);
    MyBindable.set('b', 3);
  });

  assert.equal(propertyChanged, 3, "property invalidated thrice");
  assert.equal(observerCalled, 3, "fires observer thrice");
  assert.equal(myClass.get('a'), 2, "myClass bound value should be 2");
  assert.equal(mySubclass.get('a'), 2, "mySubclass bound value should be 2");
  assert.equal(myOtherSubclass.get('a'), 2, "myOtherSubclass bound value should be 2");
  assert.equal(mySubclass.get('c'), 3, "mySubclass overridden property should still be set");
  assert.equal(mySubclass.get('anotherProperty'), "My Own Property", "mySubclass overridden computed property should still exist");
});
