// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

import { SC } from '/core/core.js';
import { StatechartManager, State, EmptyState } from '/statechart/statechart.js';


var TestState;
var obj1, rootState1, stateA, stateB;
var obj2, rootState2, stateC, stateD;

module("Statechart: invokeStateMethod method Tests", {
  beforeEach: function() {
    TestState = State.extend({
      testInvokedCount: 0,
      arg1: undefined,
      arg2: undefined,
      returnValue: undefined,
      
      testInvoked: function() {
        return this.get('testInvokedCount') > 0;
      }.property('testInvokedCount'),
      
      test: function(arg1, arg2) {
        this.set('testInvokedCount', this.get('testInvokedCount') + 1);
        this.set('arg1', arg1);
        this.set('arg2', arg2);
        if (this.get('returnValue') !== undefined) {
          return this.get('returnValue');
        } 
      }
    });
    
    obj1 = SC.Object.extend(StatechartManager, {
      
      initialState: 'stateA',
      
      rootStateExample: TestState.design({
        testX: function(arg1, arg2) {
          this.set('testInvokedCount', this.get('testInvokedCount') + 1);
          this.set('arg1', arg1);
          this.set('arg2', arg2);
          if (this.get('returnValue') !== undefined) {
            return this.get('returnValue');
          } 
        }
      }),
      
      stateA: TestState.design(),
      
      stateB: TestState.design()
      
    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('stateA');
    stateB = obj1.getState('stateB');
    
    obj2 = SC.Object.extend(StatechartManager, {
      
      statesAreConcurrent: true,
      
      rootStateExample: TestState.design({
        testX: function(arg1, arg2) {
          this.set('testInvokedCount', this.get('testInvokedCount') + 1);
          this.set('arg1', arg1);
          this.set('arg2', arg2);
          if (this.get('returnValue') !== undefined) {
            return this.get('returnValue');
          } 
        }
      }),
      
      stateC: TestState.design(),
      
      stateD: TestState.design()
      
    });
    
    obj2 = obj2.create();
    rootState2 = obj2.get('rootState');
    stateC = obj2.getState('stateC');
    stateD = obj2.getState('stateD');
  },
  
  afterEach: function() {
    TestState = obj1 = rootState1 = stateA = stateB = null;
    obj2 = rootState2 = stateC = stateD = null;
  }
});

test("check obj1 - invoke method test1", function (assert) {
  var result = obj1.invokeStateMethod('test1');
  assert.ok(!rootState1.get('testInvoked'), "root state test method should not have been invoked");
  assert.ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, no args, no return value", function (assert) {
  var result = obj1.invokeStateMethod('test');
  assert.equal(stateA.get('testInvokedCount'), 1, "state A's test method should have been invoked once");
  assert.equal(stateA.get('arg1'), undefined, "state A's arg1 method should be undefined");
  assert.equal(stateA.get('arg2'), undefined, "state A's arg2 method should be undefined");
  assert.equal(result, undefined, "returned result should be undefined");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, one args, no return value", function (assert) {
  var result = obj1.invokeStateMethod('test', "frozen");
  assert.ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.equal(stateA.get('arg1'), "frozen", "state A's arg1 method should be 'frozen'");
  assert.equal(stateA.get('arg2'), undefined, "state A's arg2 method should be undefined");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, two args, no return value", function (assert) {
  var result = obj1.invokeStateMethod('test', 'frozen', 'canuck');
  assert.ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.equal(stateA.get('arg1'), "frozen", "state A's arg1 method should be 'frozen'");
  assert.equal(stateA.get('arg2'), "canuck", "state A's arg2 method should be undefined");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, no args, return value", function (assert) {
  stateA.set('returnValue', 100);
  var result = obj1.invokeStateMethod('test');
  assert.ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.equal(result, 100, "returned result should be 100");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state B, two args, return value", function (assert) {
  stateB.set('returnValue', 100);
  obj1.gotoState(stateB);
  assert.ok(stateB.get('isCurrentState'), "state B should be curren state");
  var result = obj1.invokeStateMethod('test', 'frozen', 'canuck');
  assert.ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  assert.equal(stateB.get('testInvokedCount'), 1, "state B's test method should have been invoked once");
  assert.equal(stateB.get('arg1'), 'frozen', "state B's arg1 method should be 'frozen'");
  assert.equal(stateB.get('arg2'), 'canuck', "state B's arg2 method should be 'canuck'");
  assert.equal(result, 100, "returned result should be 100");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1 - invoke method test, current state A, use callback", function (assert) {
  var callbackState, callbackResult;
  obj1.invokeStateMethod('test', function(state, result) {
    callbackState = state;
    callbackResult = result;
  });
  assert.ok(stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
  assert.equal(callbackState, stateA, "state should be state A");
  assert.equal(callbackResult, undefined, "result should be undefined");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1- invoke method test, current state B, use callback", function (assert) {
  var callbackState, callbackResult;
  obj1.gotoState(stateB);
  stateB.set('returnValue', 100);
  obj1.invokeStateMethod('test', function(state, result) {
    callbackState = state;
    callbackResult = result;
  });
  assert.ok(!stateA.get('testInvoked'), "state A's test method should not have been invoked");
  assert.ok(stateB.get('testInvoked'), "state B's test method should have been invoked");
  assert.equal(callbackState, stateB, "state should be state B");
  assert.equal(callbackResult, 100, "result should be 100");
  assert.ok(!rootState1.get('testInvoked'), "root state's test method should not have been invoked");
});

test("check obj1 - invoke method testX", function (assert) {
  rootState1.set('returnValue', 100);
  var result = obj1.invokeStateMethod('testX');
  assert.equal(rootState1.get('testInvokedCount'), 1, "root state's testX method should not have been invoked once");
  assert.equal(result, 100, "result should have value 100");
  assert.ok(!stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj2 - invoke method test1", function (assert) {
  var result = obj2.invokeStateMethod('test1');
  assert.ok(!rootState2.get('testInvoked'), "root state test method should not have been invoked");
  assert.ok(!stateC.get('testInvoked'), "state A's test method should not have been invoked");
  assert.ok(!stateD.get('testInvoked'), "state B's test method should not have been invoked");
});

test("check obj2 - invoke test, no args, no return value", function (assert) {
  var result = obj2.invokeStateMethod('test');
  assert.equal(stateC.get('testInvokedCount'), 1, "state C's test method should have been invoked once");
  assert.equal(stateD.get('testInvokedCount'), 1, "state D's test method should have been invoked once");
  assert.ok(!rootState1.get('testInvoked'), "root state test method should not have been invoked");
  assert.equal(stateC.get('arg1'), undefined, "state C's arg1 method should be undefined");
  assert.equal(stateC.get('arg2'), undefined, "state C's arg2 method should be undefined");
  assert.equal(stateD.get('arg1'), undefined, "state D's arg1 method should be undefined");
  assert.equal(stateD.get('arg2'), undefined, "state D's arg2 method should be undefined");
  assert.equal(result, undefined, "returned result should be undefined");
});

test("check obj2 - invoke test, two args, return value, callback", function (assert) {
  var numCallbacks = 0,
      callbackInfo = {};
  stateC.set('returnValue', 100);
  stateD.set('returnValue', 200);
  var result = obj2.invokeStateMethod('test', 'frozen', 'canuck', function(state, result) {
    numCallbacks += 1;
    callbackInfo['state' + numCallbacks] = state;
    callbackInfo['result' + numCallbacks] = result;
  });
  
  assert.ok(!rootState1.get('testInvoked'), "root state test method should not have been invoked");
  assert.equal(stateC.get('testInvokedCount'), 1, "state C's test method should have been invoked once");
  assert.equal(stateD.get('testInvokedCount'), 1, "state D's test method should have been invoked once");
  
  assert.equal(stateC.get('arg1'), 'frozen', "state C's arg1 method should be 'frozen'");
  assert.equal(stateC.get('arg2'), 'canuck', "state C's arg2 method should be 'canuck'");
  
  assert.equal(stateD.get('arg1'), 'frozen', "state D's arg1 method should be 'frozen'");
  assert.equal(stateD.get('arg2'), 'canuck', "state D's arg2 method should be 'canuck'");
  
  assert.equal(numCallbacks, 2, "callback should have been invoked twice");
  assert.equal(callbackInfo['state1'], stateC, "first callback state arg should be state C");
  assert.equal(callbackInfo['result1'], 100, "first callback result arg should be 100");
  assert.equal(callbackInfo['state2'], stateD, "second callback state arg should be state D");
  assert.equal(callbackInfo['result2'], 200, "second callback result arg should be 200");
  
  assert.equal(result, undefined, "returned result should be undefined");
});

test("check obj2 - invoke method testX", function (assert) {
  rootState2.set('returnValue', 100);
  var result = obj2.invokeStateMethod('testX');
  assert.equal(rootState2.get('testInvokedCount'), 1, "root state's testX method should not have been invoked once");
  assert.equal(result, 100, "result should have value 100");
  assert.ok(!stateA.get('testInvoked'), "state A's test method should have been invoked");
  assert.ok(!stateB.get('testInvoked'), "state B's test method should not have been invoked");
});