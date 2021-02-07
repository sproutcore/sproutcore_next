// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../../../statechart/statechart.js';


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

module("Statechart: Supply Context Parameter gotoHistoryState - Without Concurrent States", {
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
    
    statechart.gotoState('d');
    
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
  assert.equal(stateD.get('enterStateContext'), null);
});

test("pass no context when going to state a's history state using statechart", function (assert) {  
  statechart.gotoState('f');
  statechart.gotoHistoryState('a');
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), null);
  assert.equal(stateA.get('enterStateContext'), null);
  assert.equal(stateB.get('exitStateContext'), null);
  assert.equal(stateF.get('exitStateContext'), null);
});

test("pass no context when going to state a's history state using state", function (assert) {  
  stateD.gotoState('f');
  stateF.gotoHistoryState('a');
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), null, "state D's enterState method should not be passed a context value");
  assert.equal(stateA.get('enterStateContext'), null, "state A's enterState method should not be passed a context value");
  assert.equal(stateB.get('exitStateContext'), null, "state B's enterState method should not be passed a context value");
  assert.equal(stateF.get('exitStateContext'), null, "state F's enterState method should not be passed a context value");
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', context)", function (assert) {  
  statechart.gotoState('f');
  statechart.gotoHistoryState('a', context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using state - gotoHistoryState('f', context)", function (assert) {  
  statechart.gotoState('f');
  stateF.gotoHistoryState('a', context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', stateF, context)", function (assert) {  
  statechart.gotoState('f');
  statechart.gotoHistoryState('a', stateF, context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', true, context)", function (assert) {  
  statechart.gotoState('f');
  statechart.gotoHistoryState('a', true, context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using statechart - gotoHistoryState('f', stateF, true, context)", function (assert) {  
  statechart.gotoState('f');
  statechart.gotoHistoryState('a', stateF, true, context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});

test("pass context when going to state a's history state using state - gotoHistoryState('f', true, context)", function (assert) {  
  statechart.gotoState('f');
  stateF.gotoHistoryState('a', true, context);
  assert.equal(stateD.get('isCurrentState'), true);
  assert.equal(stateD.get('enterStateContext'), context, 'state d should have context upon entering');
  assert.equal(stateA.get('enterStateContext'), context, 'state a should have context upon entering');
  assert.equal(stateB.get('exitStateContext'), context, 'state b should have context upon exiting');
  assert.equal(stateF.get('exitStateContext'), context, 'state f should have context upon exiting');
});