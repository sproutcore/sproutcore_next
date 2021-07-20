// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Binding Tests
// ========================================================================
/*globals module, test, ok, equals */

import { SC, GLOBAL } from '../../../core/core.js';



var FromObject, fromObject, midObject, toObject, binding, Bon1, bon2, first, second, third, binding1, binding2;

module("basic object binding", {

  beforeEach: function () {
    fromObject = SC.Object.create({ value: 'start' });
    midObject = SC.Object.create({ value: 'middle' });
    toObject = SC.Object.create({ value: 'end' });
    binding1 = SC.Binding.from("value", fromObject).to("value", midObject).connect();
    binding2 = SC.Binding.from("value", midObject).to("value", toObject).connect();
    SC.Binding.flushPendingChanges(); // actually sets up up the connection
  },

  afterEach: function () {
    fromObject.destroy();
    midObject.destroy();
    toObject.destroy();
    fromObject = midObject = toObject = binding1 = binding2 = null;
  }
});

test("binding is connected", function (assert) {
  assert.equal(binding1.isConnected, true, "binding1.isConnected");
  assert.equal(binding2.isConnected, true, "binding2.isConnected");
});

test("binding has actually been setup", function (assert) {
  assert.equal(binding1._connectionPending, false, "binding1._connectionPending");
  assert.equal(binding2._connectionPending, false, "binding2._connectionPending");
});

test("binding should have synced on connect", function (assert) {
  assert.equal(toObject.get("value"), "start", "toObject.value should match fromObject.value");
  assert.equal(midObject.get("value"), "start", "midObject.value should match fromObject.value");
});

test("changing fromObject should mark binding as dirty", function (assert) {
  fromObject.set("value", "change");
  assert.ok(SC.Binding._changeQueue.contains(binding1), "the binding should be in the _changeQueue");
  SC.Binding.flushPendingChanges();
  assert.ok(SC.Binding._changeQueue.contains(binding2), "the binding should be in the _changeQueue");
});

test("fromObject change should propogate to toObject only after flush", function (assert) {
  fromObject.set("value", "change");
  assert.equal(midObject.get("value"), "start");
  assert.equal(toObject.get("value"), "start");
  SC.Binding.flushPendingChanges();
  assert.equal(midObject.get("value"), "change");
  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get("value"), "change");
});

test("changing toObject should mark binding as dirty", function (assert) {
  toObject.set("value", "change");
  assert.ok(SC.Binding._changeQueue.contains(binding2), "the binding should be in the _changeQueue");
  SC.Binding.flushPendingChanges();
  assert.ok(SC.Binding._changeQueue.contains(binding1), "the binding should be in the _changeQueue");
});

test("toObject change should propogate to fromObject only after flush", function (assert) {
  toObject.set("value", "change");
  assert.equal(midObject.get("value"), "start");
  assert.equal(fromObject.get("value"), "start");
  SC.Binding.flushPendingChanges();
  assert.equal(midObject.get("value"), "change");
  SC.Binding.flushPendingChanges();
  assert.equal(fromObject.get("value"), "change");
});

test("suspended observing during bindings", function (assert) {

  // setup special binding
  fromObject = SC.Object.create({
    value1: 'value1',
    value2: 'value2'
  });

  toObject = SC.Object.create({
    value1: 'value1',
    value2: 'value2',

    callCount: 0,

    observer: function () {
      assert.equal(this.get('value1'), 'CHANGED', 'value1 when observer fires');
      assert.equal(this.get('value2'), 'CHANGED', 'value2 when observer fires');
      this.callCount++;
    }.observes('value1', 'value2')
  });

  toObject.bind('value1', fromObject, 'value1');
  toObject.bind('value2', fromObject, 'value2');

  // change both value1 + value2, then  flush bindings.  observer should only
  // fire after bindings are done flushing.
  fromObject.set('value1', 'CHANGED').set('value2', 'CHANGED');
  SC.Binding.flushPendingChanges();

  assert.equal(toObject.callCount, 2, 'should call observer twice');
});

test("binding will disconnect", function (assert) {
  binding1.disconnect();
  assert.equal(binding1.isConnected, false, "binding1.isConnected");
});

test("binding disconnection actually works", function (assert) {
  binding1.disconnect();
  fromObject.set('value', 'change');
  SC.Binding.flushPendingChanges();
  assert.equal(midObject.get('value'), 'start');
  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), 'start');

  binding1.connect();
  SC.Binding.flushPendingChanges();
  assert.equal(midObject.get('value'), 'change');
  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), 'change');
});

test("binding destruction actually works", function (assert) {
  binding1.destroy();
  assert.ok(binding1.isDestroyed, "binding marks itself as destroyed.");
  assert.ok(!binding1._fromTarget && !binding1._toTarget, "binding destruction removes binding targets.");
});

module("bindings on classes");

test("should connect when multiple instances of class are created", function (assert) {
  GLOBAL.TestNamespace = {};
  GLOBAL.TestNamespace.stubController = SC.Object.create({
    name: 'How to Be Happy'
  });

  try {
    var myClass = SC.Object.extend({
      fooBinding: SC.Binding.from('TestNamespace.stubController.name')
    });

    var myFirstObj;

    SC.run(function () { myFirstObj = myClass.create(); });
    assert.equal(myFirstObj.get('foo'), "How to Be Happy");

    var mySecondObj;
    SC.run(function () { mySecondObj = myClass.create(); });
    assert.equal(mySecondObj.get('foo'), "How to Be Happy");

    SC.run(function () { myFirstObj.destroy(); });
    assert.ok(myFirstObj.fooBinding.isDestroyed, "destroying an object destroys its class bindings.");

  } finally {
    GLOBAL.TestNamespace = undefined;
  }
});

module("one way binding", {
  beforeEach: function () {
    fromObject = SC.Object.create({ value: 'start' });
    toObject = SC.Object.create({ value: 'end' });
    binding = SC.Binding.from("value", fromObject).to("value", toObject).oneWay().connect();
    SC.Binding.flushPendingChanges(); // actually sets up up the connection
  }

});

test("changing fromObject should mark binding as dirty", function (assert) {
  fromObject.set("value", "change");
  assert.ok(SC.Binding._changeQueue.contains(binding), "the binding should be in the _changeQueue");
});

test("fromObject change should propogate after flush", function (assert) {
  fromObject.set("value", "change");
  assert.equal(toObject.get("value"), "start");
  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get("value"), "change");
});

test("changing toObject should not make binding dirty", function (assert) {
  toObject.set("value", "change");
  assert.ok(!SC.Binding._changeQueue.contains(binding), "the binding should not be in the _changeQueue");
});

test("toObject change should NOT propogate", function (assert) {
  toObject.set("value", "change");
  assert.equal(fromObject.get("value"), "start");
  SC.Binding.flushPendingChanges();
  assert.equal(fromObject.get("value"), "start");
});

module("chained binding", {

  beforeEach: function () {
    first = SC.Object.create({ output: 'first' });

    second = SC.Object.create({
      input: 'second',
      output: 'second',

      inputDidChange: function () {
        this.set("output", this.get("input"));
      }.observes("input")
    });

    third = SC.Object.create({ input: "third" });

    binding1 = SC.Binding.from("output", first).to("input", second).connect();
    binding2 = SC.Binding.from("output", second).to("input", third).connect();
    SC.Binding.flushPendingChanges(); // actually sets up up the connection
  }

});

test("changing first output should propagate to third after flush", function (assert) {
  first.set("output", "change");
  assert.equal("change", first.get("output"), "first.output");
  assert.ok("change" !== third.get("input"), "third.input");

  var didChange = true;
  while (didChange) { didChange = SC.Binding.flushPendingChanges(); }

  // bindings should not have bending changes
  assert.ok(!SC.Binding._changeQueue.contains(binding1), "the binding should not be in the _changeQueue");
  assert.ok(!SC.Binding._changeQueue.contains(binding2), "the binding should not be in the _changeQueue");

  assert.equal("change", first.get("output"), "first.output");
  assert.equal("change", second.get("input"), "second.input");
  assert.equal("change", second.get("output"), "second.output");
  assert.equal("change", third.get("input"), "third.input");
});

module("Custom Binding", {

  beforeEach: function () {
    Bon1 = SC.Object.extend({
      value1: "hi",
      value2: 83,
      array1: []
    });

    bon2 = SC.Object.create({
      val1: "hello",
      val2: 25,
      arr: [1, 2, 3, 4]
    });

    GLOBAL.TestNamespace = {
      bon2: bon2,
      Bon1: Bon1
    };
  },

  afterEach: function () {
    bon2.destroy();
  }
});

test("Binding value1 such that it will receive only single values", function (assert) {
  var bon1 = Bon1.create({
    value1Binding: SC.Binding.single("TestNamespace.bon2.val1"),
    array1Binding: SC.Binding.single("TestNamespace.bon2.arr")
  });
  SC.Binding.flushPendingChanges();
  var a = [23, 31, 12, 21];
  bon2.set("arr", a);
  bon2.set("val1", "changed");
  SC.Binding.flushPendingChanges();
  assert.equal(bon2.get("val1"), bon1.get("value1"));
  assert.equal("@@MULT@@", bon1.get("array1"));
  bon1.destroy();
});

test("Single binding using notEmpty function.", function (assert) {
  var bond = Bon1.create({
    array1Binding: SC.Binding.single("TestNamespace.bon2.arr").notEmpty(null, '(EMPTY)')
  });
  SC.Binding.flushPendingChanges();
  bon2.set("arr", []);
  SC.Binding.flushPendingChanges();
  assert.equal("(EMPTY)", bond.get("array1"));
});

test("Binding with transforms, function to check the type of value", function (assert) {
  var jon = Bon1.create({
    value1Binding: SC.Binding.transform(function (val1) {
      return (SC.typeOf(val1) == SC.T_STRING) ? val1 : "";
    }).from("TestNamespace.bon2.val1")
  });
  SC.Binding.flushPendingChanges();
  bon2.set("val1", "changed");
  SC.Binding.flushPendingChanges();
  assert.equal(jon.get("value1"), bon2.get("val1"));
});

test("Adding transform does not affect parent binding", function (assert) {
  var A,
      a,
      b;

  A = SC.Object.extend({
    isEnabledBindingDefault: SC.Binding.oneWay().bool()
  });

  b = SC.Object.create({
    isEnabled: true
  });

  a = A.create();
  a.bind('isEnabled', b, 'isEnabled').not();

  assert.ok(A.prototype.isEnabledBindingDefault._transforms !== a.bindings[0]._transforms, "transforms array not shared with parent binding");
});

test("two bindings to the same value should sync in the order they are initialized", function (assert) {

  SC.LOG_BINDINGS = true;

  SC.RunLoop.begin();

  GLOBAL.a = SC.Object.create({
    foo: "bar"
  });

  var a = GLOBAL.a;

  GLOBAL.b = SC.Object.create({
    foo: "baz",
    fooBinding: "a.foo",

    C: SC.Object.extend({
      foo: "bee",
      fooBinding: "*owner.foo"
    }),

    init: function init () {
      init.base.apply(this);
      this.set('c', this.C.create({ owner: this }));
    }

  });

  var b = GLOBAL.b;

  SC.LOG_BINDINGS = false;

  SC.RunLoop.end();

  assert.equal(a.get('foo'), "bar", 'a.foo should not change');
  assert.equal(b.get('foo'), "bar", 'a.foo should propogate up to b.foo');
  assert.equal(b.c.get('foo'), "bar", 'a.foo should propogate up to b.c.foo');

  GLOBAL.a = GLOBAL.b = null;

});

var BindableObject;
GLOBAL.SC = {};

module("Binding transforms", {
  // this test assumes SC is in the global namespace, which it isn't anymore.

  beforeEach: function () {
    BindableObject = SC.Object.extend({
      booleanValue: false,
      numericValue: 42,
      stringValue: 'forty-two',
      arrayValue: [4, 2],
      undefinedValue: undefined,
      nullValue: null
    });
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    GLOBAL.SC.testControllerA = BindableObject.create();
    GLOBAL.SC.testControllerB = BindableObject.create();
  },

  afterEach: function () {
    GLOBAL.SC.testControllerA.destroy();
    delete GLOBAL.SC.testControllerA;
    GLOBAL.SC.testControllerB.destroy();
    delete GLOBAL.SC.testControllerB;
  }
});

test('Binding sync when only transformed value has changed', function (assert) {
  var toObject;
  SC.run(function () {
    toObject = SC.Object.create({
      transformedValue: null,
      transformedValueBinding: SC.Binding.oneWay('SC.testControllerA.undefinedValue').transform(function (value, binding) {
        console.log('transform is called');
        if (value === undefined) {
          return 'VALUE IS UNDEFINED';
        } else {
          return value;
        }
      })
    });
  });

  assert.equal(toObject.get('transformedValue'), 'VALUE IS UNDEFINED', 'value is undefined, so bound value should be');
});

test("the integer transform", function (assert) {
  var toObject;

  SC.run(function () {
    toObject = SC.Object.create({
      aNumber: null,
      aNumberBinding: SC.Binding.oneWay('SC.testControllerA.nullValue').integer(10)
    });
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is null, so bound value should should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', '123abc');
  });

  assert.equal(toObject.get('aNumber'), GLOBAL.parseInt('123abc', 10), "Value is String, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', 'abc123');
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is non-parseable String, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', NaN);
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is NaN, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', Infinity);
  });

  assert.equal(toObject.get('aNumber'), Infinity, "Value is Infinity, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', true);
  });

  assert.equal(toObject.get('aNumber'), 1, "Value is Boolean true, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', false);
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is Boolean false, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', {});
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is Object, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', SC.Object.create({}));
  });

  assert.equal(toObject.get('aNumber'), 0, "Value is SC.Object instance, so bound value should be");
});


test("the string transform", function (assert) {
  var toObject;

  SC.run(function () {
    toObject = SC.Object.create({
      aString: null,
      aStringBinding: SC.Binding.oneWay('SC.testControllerA.nullValue').string()
    });
  });

  assert.equal(toObject.get('aString'), '', "Value is null, so bound value should should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', 1);
  });

  assert.equal(toObject.get('aString'), '1', "Value is Number, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', true);
  });

  assert.equal(toObject.get('aString'), 'true', "Value is Boolean true, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', false);
  });

  assert.equal(toObject.get('aString'), 'false', "Value is Boolean false, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', {});
  });

  assert.equal(toObject.get('aString'), {}.toString(), "Value is Object, so bound value should be");

  SC.run(function () {
    GLOBAL.SC.testControllerA.set('nullValue', SC.Object.create({ toString: function () { return 'An SC.Object'; }}));
  });

  assert.equal(toObject.get('aString'), 'An SC.Object', "Value is SC.Object instance, so bound value should be");
});

test("the equalTo transform", function (assert) {
  SC.RunLoop.begin();
  var toObject = SC.Object.create({
    isFortyTwo: null,
    isFortyTwoBinding: SC.Binding.oneWay('SC.testControllerA.numericValue').equalTo(42)
  });
  SC.RunLoop.end();

  assert.equal(toObject.get('isFortyTwo'), true, "Value is equal to 42, so bound value should should be");

  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('numericValue', 45);
  SC.RunLoop.end();

  assert.equal(toObject.get('isFortyTwo'), false, "Value is no longer 42, so bound value should be");
});

module("Binding transform: `and`", {

  beforeEach: function () {
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    GLOBAL.SC.testControllerA = SC.Object.create({ value: false });
    GLOBAL.SC.testControllerB = SC.Object.create({ value: false });
    GLOBAL.SC.testControllerC = SC.Object.create({ value: false });

    toObject = SC.Object.create({
      value: null,
      valueBinding: SC.Binding.and('SC.testControllerA.value', 'SC.testControllerB.value', 'SC.testControllerC.value'),
      localValue1: false,
      localValue2: false,
      localValue3: false,
      boundLocalValue: false,
      boundLocalValueBinding: SC.Binding.and('.localValue1', '.localValue2', '.localValue3')
    });
  },

  afterEach: function () {
    GLOBAL.SC.testControllerA.destroy();
    delete SC.testControllerA;
    GLOBAL.SC.testControllerB.destroy();
    delete SC.testControllerB;
    GLOBAL.SC.testControllerC.destroy();
    delete SC.testControllerC;
  }
});

test("bound value should be true if all sources are true", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', true);
  GLOBAL.SC.testControllerB.set('value', true);
  GLOBAL.SC.testControllerC.set('value', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), true, 'Bound value');

  SC.RunLoop.begin();
  toObject.set('localValue1', true);
  toObject.set('localValue2', true);
  toObject.set('localValue3', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), true, 'Local bound value');
});

test("toObject.value should be false if either source is false", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', true);
  GLOBAL.SC.testControllerB.set('value', false);
  GLOBAL.SC.testControllerC.set('value', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), false, 'Bound value on true/false/true');

  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', true);
  GLOBAL.SC.testControllerB.set('value', true);
  GLOBAL.SC.testControllerC.set('value', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), true, 'Bound value on true/true/true');

  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', false);
  GLOBAL.SC.testControllerB.set('value', true);
  GLOBAL.SC.testControllerC.set('value', false);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), false, 'Bound value on false/true/false');

  SC.RunLoop.begin();
  toObject.set('localValue1', true);
  toObject.set('localValue2', false);
  toObject.set('localValue3', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), false, 'Local bound value on true/false/true');

  SC.RunLoop.begin();
  toObject.set('localValue1', true);
  toObject.set('localValue2', true);
  toObject.set('localValue3', true);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), true, 'Local bound value on true/true/true');

  SC.RunLoop.begin();
  toObject.set('localValue1', false);
  toObject.set('localValue2', true);
  toObject.set('localValue2', false);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), false, 'Local bound value on false/true/false');
});

test("remote paths work when binding is defined on a class", function (assert) {
  // This tests the solution to a bug which was hooking all instances of a class's `and` binding
  // up through the same internal object, which would be destroyed the first time any instance
  // was destroyed.

  var ToObject = SC.Object.extend({
    value: null,
    valueBinding: SC.Binding.and('SC.testControllerA.value', 'SC.testControllerB.value')
  });

  var toObject1, toObject2;
  SC.run(function() {
    toObject1 = ToObject.create();
    toObject2 = ToObject.create();
  });

  assert.ok(!toObject1.get('value') && !toObject2.get('value'), "PRELIM: instances' initial values are correct.");

  SC.run(function() {
    GLOBAL.SC.testControllerA.set('value', true);
    GLOBAL.SC.testControllerB.set('value', true);
  });

  assert.ok(toObject1.get('value') && toObject2.get('value'), "PRELIM: instances' values update correctly.");

  SC.run(function() {
    toObject1.destroy();
    GLOBAL.SC.testControllerB.set('value', false);
  });

  assert.ok(!toObject2.get('value'), "Second instance updates correctly after first instance is destroyed.");

  // Cleanup.
  toObject2.destroy();

});

test("local paths work when binding is defined on a class", function (assert) {
  // This tests the solution to a bug which was hooking all instances of a class's `and` binding
  // up through the same internal object, which would cause multiple instances to cross-polinate.

  var ToObject = SC.Object.extend({
    localValue1: false,
    localValue2: false,
    value: false,
    valueBinding: SC.Binding.and('.localValue1', '.localValue2')
  });
  var toObject1, toObject2;
  SC.run(function() {
    toObject1 = ToObject.create();
    toObject2 = ToObject.create();
  });

  assert.ok(!toObject1.get('value') && !toObject2.get('value'), "PRELIM: instances' initial values are correct.");

  SC.run(function() {
    toObject1.set('localValue1', true).set('localValue2', true);
  });

  assert.ok(toObject1.get('value'), "First instance updates correctly when its own values are changed.");
  assert.ok(!toObject2.get('value'), "Second instance does not update when first instance's values are changed.");

  // Cleanup.
  toObject1.destroy();
  toObject2.destroy();

});

module("OR binding", {

  beforeEach: function () {
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    GLOBAL.SC.testControllerA = SC.Object.create({ value: false });
    GLOBAL.SC.testControllerB = SC.Object.create({ value: null });

    toObject = SC.Object.create({
      value: null,
      valueBinding: SC.Binding.or('SC.testControllerA.value', 'SC.testControllerB.value'),
      localValue1: false,
      localValue2: false,
      boundLocalValue: false,
      boundLocalValueBinding: SC.Binding.or('.localValue1', '.localValue2')
    });
  },

  afterEach: function () {
    GLOBAL.SC.testControllerA.destroy();
    GLOBAL.SC.testControllerB.destroy();
  }

});

test("toObject.value should be first value if first value is truthy", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', 'first value');
  GLOBAL.SC.testControllerB.set('value', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), 'first value', 'Bound value on truthy first value');

  SC.RunLoop.begin();
  toObject.set('localValue1', 'first value');
  toObject.set('localValue2', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), 'first value', 'Locally bound value on truthy first value');

});

test("toObject.value should be second value if first is falsy", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', false);
  GLOBAL.SC.testControllerB.set('value', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), 'second value', 'Bound value on falsy first value');

  SC.RunLoop.begin();
  toObject.set('localValue1', false);
  toObject.set('localValue2', 'second value');
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), 'second value', 'Locally bound value on falsy first value');

});

test("remote paths work when binding is defined on a class", function (assert) {
  // This tests the solution to a bug which was hooking all instances of a class's `or` binding
  // up through the same internal object, which would be destroyed the first time any instance
  // was destroyed.

  var ToObject = SC.Object.extend({
    value: null,
    valueBinding: SC.Binding.or('SC.testControllerA.value', 'SC.testControllerB.value')
  });

  var toObject1, toObject2;
  SC.run(function() {
    toObject1 = ToObject.create();
    toObject2 = ToObject.create();
  });

  assert.ok(!toObject1.get('value') && !toObject2.get('value'), "PRELIM: instances' initial values are correct.");

  SC.run(function() {
    GLOBAL.SC.testControllerB.set('value', true);
  });

  assert.ok(toObject1.get('value') && toObject2.get('value'), "PRELIM: instances' values update correctly.");

  SC.run(function() {
    toObject1.destroy();
    GLOBAL.SC.testControllerB.set('value', false);
  });

  assert.ok(!toObject2.get('value'), "Second instance updates correctly after first instance is destroyed.");

  // Cleanup.
  toObject2.destroy();

});

test("local paths work when binding is defined on a class", function (assert) {
  // This tests the solution to a bug which was hooking all instances of a class's `or` binding
  // up through the same internal object, which would cause multiple instances to cross-polinate.

  var ToObject = SC.Object.extend({
    localValue1: false,
    localValue2: false,
    value: false,
    valueBinding: SC.Binding.or('.localValue1', '.localValue2')
  });
  var toObject1, toObject2;
  SC.run(function() {
    toObject1 = ToObject.create();
    toObject2 = ToObject.create();
  });

  assert.ok(!toObject1.get('value') && !toObject2.get('value'), "PRELIM: instances' initial values are correct.");

  SC.run(function() {
    toObject1.set('localValue1', true);
  });

  assert.ok(toObject1.get('value'), "First instance updates correctly when its own values are changed.");
  assert.ok(!toObject2.get('value'), "Second instance does not update when first instance's values are changed.");

  // Cleanup.
  toObject1.destroy();
  toObject2.destroy();

});

module("Binding transform: `mix`", {

  beforeEach: function () {
    // temporarily set up two source objects in the SC namespace so we can
    // use property paths to access them
    GLOBAL.SC.testControllerA = SC.Object.create({ value: 0 });
    GLOBAL.SC.testControllerB = SC.Object.create({ value: 1 });
    GLOBAL.SC.testControllerC = SC.Object.create({ value: 2 });

    toObject = SC.Object.create({
      value: null,
      valueBinding: SC.Binding.mix('SC.testControllerA.value', 'SC.testControllerB.value', 'SC.testControllerC.value',
                                   function(v1,v2,v3) {
                                     return v1+'-'+v2+'-'+v3;
                                   } ),
      localValue1: 1,
      localValue2: 2,
      localValue3: 3,
      boundLocalValue: false,
      boundLocalValueBinding: SC.Binding.mix('.localValue1', '.localValue2', '.localValue3',
                                             function(v1,v2,v3) {
                                               return v1+'+'+v2+'+'+v3;
                                             } )
    });
  },

  afterEach: function () {
    GLOBAL.SC.testControllerA.destroy();
    delete GLOBAL.SC.testControllerA;
    GLOBAL.SC.testControllerB.destroy();
    delete GLOBAL.SC.testControllerB;
    GLOBAL.SC.testControllerC.destroy();
    delete GLOBAL.SC.testControllerC;
  }
});

test("bound value should be calculated correctly", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.SC.testControllerA.set('value', 0);
  GLOBAL.SC.testControllerB.set('value', 10);
  GLOBAL.SC.testControllerC.set('value', 20);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), '0-10-20', 'Bound value');

  SC.RunLoop.begin();
  toObject.set('localValue1', 0);
  toObject.set('localValue2', 10);
  toObject.set('localValue3', 20);
  SC.RunLoop.end();

  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('boundLocalValue'), '0+10+20', 'Local bound value');
});

module("Binding with '[]'", {
  beforeEach: function () {
    fromObject = SC.Object.create({ value: [] });
    toObject = SC.Object.create({ value: '' });
    binding = SC.Binding.transform(function (v) {
      return v ? v.join(',') : '';
    }).from("value.[]", fromObject).to("value", toObject).connect();
  }
});

test("Binding refreshes after a couple of items have been pushed in the array", function (assert) {
  fromObject.get('value').pushObjects(['foo', 'bar']);
  SC.Binding.flushPendingChanges();
  assert.equal(toObject.get('value'), 'foo,bar');
});


module("propertyNameBinding with longhand", {
  beforeEach: function () {
    GLOBAL.TestNamespace = {
      fromObject: SC.Object.create({
        value: "originalValue"
      }),
      toObject: SC.Object.create({
        valueBinding: SC.Binding.from('TestNamespace.fromObject.value'),
        localValue: "originalLocal",
        relativeBinding: SC.Binding.from('.localValue')
      })
    };
  },
  afterEach: function () {
    GLOBAL.TestNamespace.fromObject.destroy();
    GLOBAL.TestNamespace.toObject.destroy();
    GLOBAL.TestNamespace = null;
  }
});

test("works with full path", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.TestNamespace.fromObject.set('value', "updatedValue");
  SC.RunLoop.end();

  assert.equal(GLOBAL.TestNamespace.toObject.get('value'), "updatedValue");

  SC.RunLoop.begin();
  GLOBAL.TestNamespace.fromObject.set('value', "newerValue");
  SC.RunLoop.end();

  assert.equal(GLOBAL.TestNamespace.toObject.get('value'), "newerValue");
});

test("works with local path", function (assert) {
  SC.RunLoop.begin();
  GLOBAL.TestNamespace.toObject.set('localValue', "updatedValue");
  SC.RunLoop.end();

  assert.equal(GLOBAL.TestNamespace.toObject.get('relative'), "updatedValue");

  SC.RunLoop.begin();
  GLOBAL.TestNamespace.toObject.set('localValue', "newerValue");
  SC.RunLoop.end();

  assert.equal(GLOBAL.TestNamespace.toObject.get('relative'), "newerValue");
});

module("Overriding binding in subclass", {
  beforeEach: function() {
    FromObject = SC.Object.extend({
      localValue1: 'hello',
      localValue2: 'world',
      value: null,
      valueBinding: SC.Binding.oneWay('.localValue1')
    });
  },
  afterEach: function() {
    FromObject = null;
  }
});

test("Bindings override in subclasses.", function (assert) {
  SC.LOG_DUPLICATE_BINDINGS = false; // clean consoles

  SC.RunLoop.begin();
  fromObject = FromObject.create();
  SC.RunLoop.end();

  assert.equal(fromObject.get('value'), 'hello', "PRELIM: Superclass binding gives value of");

  fromObject.destroy();

  SC.RunLoop.begin();
  fromObject = FromObject.create({
    valueBinding: SC.Binding.oneWay('.localValue2')
  });
  SC.RunLoop.end();

  assert.ok(fromObject._bindings.length === 1, "Duplicate bindings are not created.");

  assert.equal(fromObject.get('value'), 'world', "Superclass binding should have been overridden in the subclass, giving value a value of");

  fromObject.destroy();

  SC.LOG_DUPLICATE_BINDINGS = true;
});
