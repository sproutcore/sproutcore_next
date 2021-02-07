// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../../statechart/statechart.js';


var statechart,
    TestState,
    context,
    monitor,
    root,
    stateA,
    stateB,
    stateC,
    stateD,
    stateE,
    stateF;

module("Statechart: Supply Context Parameter to gotoState - Without Concurrent States", {
  beforeEach: function() {
    
    TestState = State.extend({
      enterStateContext: null,
      exitStateContext: null,
      
      enterState: function(context) {
        this.set('enterStateContext', context);
      },
      
      exitState: function(context) {
        this.set('exitStateContext', context);
      }
    });
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: TestState.design({
        
        initialSubstate: 'a',
        
        a: TestState.design({
          initialSubstate: 'c',
          c: TestState.design(),
          d: TestState.design()
        }),
        
        b: TestState.design({
          initialSubstate: 'e',
          e: TestState.design(),
          f: TestState.design()
        })
      })
      
    });
    
    statechart.initStatechart();
    
    context = { foo: 100 };
    
    monitor = statechart.get('monitor');
    root = statechart.get('rootState');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
  },
  
  afterEach: function() {
    statechart = TestState = monitor = context = null;
    root = stateA = stateB = stateC = stateD = stateE = stateF;
  }
});

test("check statechart initialization", function (assert) {
  assert.equal(root.get('enterStateContext'), null);
  assert.equal(stateA.get('enterStateContext'), null);
  assert.equal(stateC.get('enterStateContext'), null);
});

test("pass no context when going to state f using statechart", function (assert) {  
  statechart.gotoState('f');
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), null);
  assert.equal(stateA.get('exitStateContext'), null);
  assert.equal(stateB.get('enterStateContext'), null);
  assert.equal(stateF.get('enterStateContext'), null);
});

test("pass no context when going to state f using state", function (assert) {  
  stateC.gotoState('f');
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), null);
  assert.equal(stateA.get('exitStateContext'), null);
  assert.equal(stateB.get('enterStateContext'), null);
  assert.equal(stateF.get('enterStateContext'), null);
});

test("pass context when going to state f using statechart - gotoState('f', context)", function (assert) {  
  statechart.gotoState('f', context);
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), context, 'state c should have context upon exiting');
  assert.equal(stateA.get('exitStateContext'), context, 'state a should have context upon exiting');
  assert.equal(stateB.get('enterStateContext'), context, 'state b should have context upon entering');
  assert.equal(stateF.get('enterStateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using state - gotoState('f', context)", function (assert) {  
  stateC.gotoState('f', context);
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), context, 'state c should have context upon exiting');
  assert.equal(stateA.get('exitStateContext'), context, 'state a should have context upon exiting');
  assert.equal(stateB.get('enterStateContext'), context, 'state b should have context upon entering');
  assert.equal(stateF.get('enterStateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoState('f', stateC, context) ", function (assert) {  
  statechart.gotoState('f', stateC, context);
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), context, 'state c should have context upon exiting');
  assert.equal(stateA.get('exitStateContext'), context, 'state a should have context upon exiting');
  assert.equal(stateB.get('enterStateContext'), context, 'state b should have context upon entering');
  assert.equal(stateF.get('enterStateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoState('f', false, context) ", function (assert) {  
  statechart.gotoState('f', false, context);
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), context, 'state c should have context upon exiting');
  assert.equal(stateA.get('exitStateContext'), context, 'state a should have context upon exiting');
  assert.equal(stateB.get('enterStateContext'), context, 'state b should have context upon entering');
  assert.equal(stateF.get('enterStateContext'), context, 'state f should have context upon entering');
});

test("pass context when going to state f using statechart - gotoState('f', stateC, false, context) ", function (assert) {  
  statechart.gotoState('f', stateC, false, context);
  assert.equal(stateF.get('isCurrentState'), true);
  assert.equal(stateC.get('exitStateContext'), context, 'state c should have context upon exiting');
  assert.equal(stateA.get('exitStateContext'), context, 'state a should have context upon exiting');
  assert.equal(stateB.get('enterStateContext'), context, 'state b should have context upon entering');
  assert.equal(stateF.get('enterStateContext'), context, 'state f should have context upon entering');
});