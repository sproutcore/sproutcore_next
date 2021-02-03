// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart */

import { SC } from '/core/core.js';
import { Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart, TestState, root, stateA, stateB, stateC, stateD, stateE, stateF, stateX, stateY, stateZ;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: - Respond to Events Tests", {
  beforeEach: function() {
    
    TestState = State.extend({
      returnValue: null,
      handledEvent: false,
      
      handleEvent: function() {
        this.set('handledEvent', true);
        return this.get('returnValue');
      },
      
      reset: function() {
        this.set('returnValue', null);
        this.set('handledEvent', false);
      }
    });
    
    statechart = Statechart.create({
      
      someFunctionInvoked: false,
      someFunctionReturnValue: null,
      
      someFunction: function() {
        this.set('someFunctionInvoked', true);
        return this.get('someFunctionReturnValue');
      },
      
      rootState: TestState.design({
        
        eventA: function(sender, context) {
          return this.handleEvent();
        },
        
        eventHandler: function(event, sender, context) {
          return this.handleEvent();
        }.handleEvents('eventB'),
        
        initialSubstate: 'a',
        
        a: TestState.design({
          foo: function(sender, context) {
            return this.handleEvent();
          }
        }),
        
        b: TestState.design({
          bar: function(sender, context) { 
            return this.handleEvent();
          },
          
          eventHandler: function(event, sender, context) {
            return this.handleEvent();
          }.handleEvents('frozen', 'canuck')
        }),
        
        c: TestState.design({
          eventHandlerA: function(event, sender, context) {
            return this.handleEvent();
          }.handleEvents('yes'),
          
          eventHandlerB: function(event, sender, context) {
            return this.handleEvent();
          }.handleEvents(/^num/i)
        }),
        
        d: TestState.design({
          unknownEvent: function(event, sender, context) {
            return this.handleEvent();
          }
        }),
        
        e: TestState.design({
          eventHandler: function(event,sender, context) {
            return this.handleEvent();
          }.handleEvents('plus', 'minus'),
          
          initialSubstate: 'f',
          
          f: TestState.design({
            foo: function(sender, context) {
              return this.handleEvent();
            }
          })
        }),
        
        z: TestState.design({
          blue: function(sender, context) {
            return this.handleEvent();
          },
          
          substatesAreConcurrent: true,
          
          x: TestState.design({
            yellow: function(sender, context) {
              return this.handleEvent();
            }
          }),
          
          y: TestState.design({
            orange: function(sender,context) {
              return this.handleEvent();
            }
          })
        })
        
      })
      
    });
    
    statechart.initStatechart();
    root = statechart.get('rootState');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
    stateX = statechart.getState('x');
    stateY = statechart.getState('y');
    stateZ = statechart.getState('z');
  },
  
  afterEach: function() {
    statechart = TestState = root = null;
    stateA = stateB = stateC = stateD = stateE = stateF = stateX = stateY = stateZ = null;
  }
});

test("check state A", function (assert) {
  assert.ok(stateA.respondsToEvent('foo'), 'state A should respond to event foo');
  assert.ok(!stateA.respondsToEvent('foox'), 'state A should not respond to event foox');
  assert.ok(!stateA.respondsToEvent('eventA'), 'state A should not respond to event eventA');
  assert.ok(!stateA.respondsToEvent('eventB'), 'state A should not respond to event eventB');
  
  assert.ok(stateA.get('isCurrentState'), 'state A is current state');
  
  assert.ok(statechart.respondsTo('foo'), 'statechart should respond to foo');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to eventB');
  assert.ok(!statechart.respondsTo('foox'), 'statechart should respond to foox');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should respond to eventC');
});

test("check state B", function (assert) {
  assert.ok(stateB.respondsToEvent('bar'), 'state B should respond to event bar');
  assert.ok(stateB.respondsToEvent('frozen'), 'state B should respond to event frozen');
  assert.ok(stateB.respondsToEvent('canuck'), 'state B should respond to event canuck');
  assert.ok(!stateB.respondsToEvent('canuckx'), 'state B should not respond to event canuckx');
  assert.ok(!stateB.respondsToEvent('barx'), 'state B should not respond to event barx');
  assert.ok(!stateB.respondsToEvent('eventA'), 'state B should not respond to event eventA');
  assert.ok(!stateB.respondsToEvent('eventB'), 'state B should not respond to event eventB');

  assert.ok(!statechart.respondsTo('bar'), 'statechart should not respond to bar');
  assert.ok(!statechart.respondsTo('frozen'), 'statechart should not respond to frozen');
  assert.ok(!statechart.respondsTo('canuck'), 'statechart should not respond to canuck');
  
  statechart.gotoState(stateB);
  assert.ok(stateB.get('isCurrentState'), 'state B is current state');
  
  assert.ok(statechart.respondsTo('bar'), 'statechart should respond to bar');
  assert.ok(statechart.respondsTo('frozen'), 'statechart should respond to frozen');
  assert.ok(statechart.respondsTo('canuck'), 'statechart should respond to canuck');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to eventB');
  assert.ok(!statechart.respondsTo('canuckx'), 'statechart should not respond to canuckx');
  assert.ok(!statechart.respondsTo('barx'), 'statechart should not respond to foox');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to eventC');
});

test("check state C", function (assert) {
  assert.ok(stateC.respondsToEvent('yes'), 'state C should respond to event yes');
  assert.ok(stateC.respondsToEvent('num1'), 'state C should respond to event num1');
  assert.ok(stateC.respondsToEvent('num2'), 'state C should respond to event num2');
  assert.ok(!stateC.respondsToEvent('no'), 'state C should not respond to event no');
  assert.ok(!stateC.respondsToEvent('xnum1'), 'state C should not respond to event xnum1');
  assert.ok(!stateC.respondsToEvent('eventA'), 'state C should not respond to event eventA');
  assert.ok(!stateC.respondsToEvent('eventB'), 'state C should not respond to event eventB');

  assert.ok(!statechart.respondsTo('yes'), 'statechart should not respond to event yes');
  assert.ok(!statechart.respondsTo('num1'), 'statechart should not respond to event num1');
  assert.ok(!statechart.respondsTo('num2'), 'statechart should not respond to event num2');
  
  statechart.gotoState(stateC);
  assert.ok(stateC.get('isCurrentState'), 'state C is current state');
  
  assert.ok(statechart.respondsTo('yes'), 'statechart should respond to event yes');
  assert.ok(statechart.respondsTo('num1'), 'statechart should respond to event num1');
  assert.ok(statechart.respondsTo('num2'), 'statechart should respond to event num2');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to event eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to event eventB');
  assert.ok(!statechart.respondsTo('no'), 'statechart should not respond to event no');
  assert.ok(!statechart.respondsTo('xnum1'), 'statechart should not respond to event xnum1');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to event eventC');
});

test("check state D", function (assert) {
  assert.ok(stateD.respondsToEvent('foo'), 'state D should respond to event foo');
  assert.ok(stateD.respondsToEvent('xyz'), 'state D should respond to event xyz');
  assert.ok(stateD.respondsToEvent('eventA'), 'state D should respond to event eventA');
  assert.ok(stateD.respondsToEvent('eventB'), 'state D should respond to event eventB');
  
  statechart.gotoState(stateD);
  assert.ok(stateD.get('isCurrentState'), 'state D is current state');
  
  assert.ok(statechart.respondsTo('foo'), 'statechart should respond to event foo');
  assert.ok(statechart.respondsTo('xyz'), 'statechart should respond to event xyz');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to event eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to event eventB');
  assert.ok(statechart.respondsTo('eventC'), 'statechart should respond to event eventC');
});

test("check states E and F", function (assert) {
  assert.ok(stateE.respondsToEvent('plus'), 'state E should respond to event plus');
  assert.ok(stateE.respondsToEvent('minus'), 'state E should respond to event minus');
  assert.ok(!stateE.respondsToEvent('eventA'), 'state E should not respond to event eventA');
  assert.ok(!stateE.respondsToEvent('eventB'), 'state E should not respond to event eventB');
  
  assert.ok(stateF.respondsToEvent('foo'), 'state F should respond to event foo');
  assert.ok(!stateF.respondsToEvent('plus'), 'state F should not respond to event plus');
  assert.ok(!stateF.respondsToEvent('minus'), 'state F should not respond to event minus');

  assert.ok(!statechart.respondsTo('plus'), 'statechart should not respond to event plus');
  assert.ok(!statechart.respondsTo('minus'), 'statechart should not respond to event minus');
  
  statechart.gotoState(stateE);
  assert.ok(!stateE.get('isCurrentState'), 'state E is not current state');
  assert.ok(stateF.get('isCurrentState'), 'state F is current state');
  
  assert.ok(statechart.respondsTo('foo'), 'statechart should respond to event foo');
  assert.ok(statechart.respondsTo('plus'), 'statechart should respond to event plus');
  assert.ok(statechart.respondsTo('minus'), 'statechart should respond to event minus');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to event eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to event eventB');
  assert.ok(!statechart.respondsTo('foox'), 'statechart should respond to event foox');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to event eventC');
});

test("check states X, Y and Z", function (assert) {
  assert.ok(stateZ.respondsToEvent('blue'), 'state Z should respond to event blue');
  assert.ok(!stateZ.respondsToEvent('yellow'), 'state Z should not respond to event yellow');
  assert.ok(!stateZ.respondsToEvent('orange'), 'state Z should not respond to event orange');
  
  assert.ok(!stateX.respondsToEvent('blue'), 'state X should not respond to event blue');
  assert.ok(stateX.respondsToEvent('yellow'), 'state X should respond to event yellow');
  assert.ok(!stateX.respondsToEvent('orange'), 'state X should not respond to event orange');
  
  assert.ok(!stateY.respondsToEvent('blue'), 'state Y should not respond to event blue');
  assert.ok(!stateY.respondsToEvent('foo'), 'state Y should respond to event yellow');
  assert.ok(stateY.respondsToEvent('orange'), 'state Y should not respond to event orange');

  assert.ok(!statechart.respondsTo('blue'), 'statechart should not respond to event blue');
  assert.ok(!statechart.respondsTo('yellow'), 'statechart should not respond to event yellow');
  assert.ok(!statechart.respondsTo('orange'), 'statechart should not respond to event orange');
  
  statechart.gotoState(stateZ);
  assert.ok(!stateZ.get('isCurrentState'), 'state Z is not current state');
  assert.ok(stateX.get('isCurrentState'), 'state X is current state');
  assert.ok(stateY.get('isCurrentState'), 'state Y is current state');
  
  assert.ok(statechart.respondsTo('blue'), 'statechart should respond to event blue');
  assert.ok(statechart.respondsTo('yellow'), 'statechart should respond to event yellow');
  assert.ok(statechart.respondsTo('orange'), 'statechart should respond to event orange');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to event eventA');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to event eventB');
  assert.ok(!statechart.respondsTo('bluex'), 'statechart should not respond to event bluex');
  assert.ok(!statechart.respondsTo('yellowx'), 'statechart should not respond to event yellowx');
  assert.ok(!statechart.respondsTo('orangex'), 'statechart should not respond to event orangex');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to event eventC');
});

test("try to perform 'someFunction' on statechart -- current states A", function (assert) {  
  assert.ok(statechart.respondsTo('someFunction'), 'statechart should respond to someFunction');
  assert.ok(!statechart.get('someFunctionInvoked'), 'someFunctionInvoked should be false');
  assert.ok(statechart.tryToPerform('someFunction'), 'statechart should perform someFunction');
  assert.ok(statechart.get('someFunctionInvoked'), 'someFunctionInvoked should be true');
  
  statechart.set('someFunctionInvoked', false);
  statechart.set('someFunctionReturnValue', false);
  
  assert.ok(statechart.respondsTo('someFunction'), 'statechart should respond to someFunction');
  assert.ok(!statechart.tryToPerform('someFunction'), 'statechart should perform someFunction');
  assert.ok(statechart.get('someFunctionInvoked'), 'someFunctionInvoked should be true');
});

test("try to perform 'foo' on statechart -- current state A", function (assert) {
  assert.ok(statechart.tryToPerform('foo'), 'statechart should perform foo');
  assert.ok(stateA.get('handledEvent'), 'state A did handle event foo');
  assert.ok(!root.get('handledEvent'), 'root not did handle event foo');
  
  stateA.reset();
  stateA.set('returnValue', false);
  
  assert.ok(!statechart.tryToPerform('foo'), 'statechart should not perform foo');
  assert.ok(stateA.get('handledEvent'), 'state A did handle event foo');
  assert.ok(!root.get('handledEvent'), 'root did not handle event foo');
});

test("try to perform 'foox' on statechart -- current state A", function (assert) {
  assert.ok(!statechart.tryToPerform('foox'), 'statechart should perform foo');
  assert.ok(!stateA.get('handledEvent'), 'state A did handle event foo');
  assert.ok(!root.get('handledEvent'), 'root not did handle event foo');
});

test("try to perform 'eventA' on statechart -- current state A", function (assert) {
  assert.ok(statechart.tryToPerform('eventA'), 'statechart should perform eventA');
  assert.ok(!stateA.get('handledEvent'), 'state A did not handle event eventA');
  assert.ok(root.get('handledEvent'), 'root did handle event eventA');
  
  root.reset();
  root.set('returnValue', false);
  stateA.reset();
  
  assert.ok(!statechart.tryToPerform('eventA'), 'statechart should not perform eventA');
  assert.ok(!stateA.get('handledEvent'), 'state A did not handle event eventA');
  assert.ok(root.get('handledEvent'), 'root did handle event eventA');
});

test("try to perform 'yes' on statechart -- current state C", function (assert) {
  statechart.gotoState(stateC);
  
  assert.ok(stateC.get('isCurrentState'), 'state C should be current state');
  
  assert.ok(statechart.tryToPerform('yes'), 'statechart should perform yes');
  assert.ok(stateC.get('handledEvent'), 'state C did handle event yes');
  assert.ok(!root.get('handledEvent'), 'root not did handle event yes');
  
  stateC.reset();
  stateC.set('returnValue', false);
  
  assert.ok(!statechart.tryToPerform('yes'), 'statechart should not perform yes');
  assert.ok(stateC.get('handledEvent'), 'state C did handle event yes');
  assert.ok(!root.get('handledEvent'), 'root did not handle event yes');
});

test("try to perform 'num1' on statechart -- current state C", function (assert) {
  statechart.gotoState(stateC);
  
  assert.ok(stateC.get('isCurrentState'), 'state C should be current state');
  
  assert.ok(statechart.tryToPerform('num1'), 'statechart should perform num1');
  assert.ok(stateC.get('handledEvent'), 'state C did handle event num1');
  assert.ok(!root.get('handledEvent'), 'root not did handle event num1');
  
  stateC.reset();
  stateC.set('returnValue', false);
  
  assert.ok(!statechart.tryToPerform('num1'), 'statechart should not perform num1');
  assert.ok(stateC.get('handledEvent'), 'state C did handle event num1');
  assert.ok(!root.get('handledEvent'), 'root did not handle event num1');
});

test("try to perform 'abc' on statechart -- current state D", function (assert) {
  statechart.gotoState(stateD);
  
  assert.ok(stateD.get('isCurrentState'), 'state D should be current state');
  
  assert.ok(statechart.tryToPerform('abc'), 'statechart should perform abc');
  assert.ok(stateD.get('handledEvent'), 'state D did handle event abc');
  assert.ok(!root.get('handledEvent'), 'root not did handle event abc');
  
  stateD.reset();
  stateD.set('returnValue', false);
  
  assert.ok(!statechart.tryToPerform('abc'), 'statechart should not perform abc');
  assert.ok(stateD.get('handledEvent'), 'state D did handle event abc');
  assert.ok(!root.get('handledEvent'), 'root did not handle event abc');
});

test("try to perform 'yellow' on statechart -- current states X and Y", function (assert) {
  statechart.gotoState(stateZ);
  
  assert.ok(stateX.get('isCurrentState'), 'state X should be current state');
  assert.ok(stateY.get('isCurrentState'), 'state Y should be current state');
  
  assert.ok(statechart.tryToPerform('yellow'), 'statechart should perform yellow');
  assert.ok(stateX.get('handledEvent'), 'state X did handle event yellow');
  assert.ok(!stateY.get('handledEvent'), 'state Y did not handle event yellow');
  assert.ok(!stateZ.get('handledEvent'), 'state Z did not handle event yellow');
  assert.ok(!root.get('handledEvent'), 'root not did handle event yellow');
  
  stateX.reset();
  stateX.set('returnValue', false);
  
  assert.ok(!statechart.tryToPerform('yellow'), 'statechart should not perform yellow');
  assert.ok(stateX.get('handledEvent'), 'state X did handle event yellow');
  assert.ok(!stateY.get('handledEvent'), 'state Y did not handle event yellow');
  assert.ok(!stateZ.get('handledEvent'), 'state Z did not handle event yellow');
  assert.ok(!root.get('handledEvent'), 'root not did handle event yellow');
});

test("Check destroyed statechart does not respond to events", function (assert) {
  assert.ok(statechart.respondsTo('foo'), 'statechart should respond to foo before destroyed');
  assert.ok(statechart.respondsTo('eventA'), 'statechart should respond to eventA before destroyed');
  assert.ok(statechart.respondsTo('eventB'), 'statechart should respond to eventB before destroyed');
  assert.ok(!statechart.respondsTo('foox'), 'statechart should not respond to foox before destroyed');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to eventC before destroyed');

  statechart.destroy();

  assert.ok(!statechart.respondsTo('foo'), 'statechart should not respond to foo after destroyed');
  assert.ok(!statechart.respondsTo('eventA'), 'statechart should not respond to eventA after destroyed');
  assert.ok(!statechart.respondsTo('eventB'), 'statechart should not respond to eventB after destroyed');
  assert.ok(!statechart.respondsTo('foox'), 'statechart should not respond to foox after destroyed');
  assert.ok(!statechart.respondsTo('eventC'), 'statechart should not respond to eventC after destroyed');
});
