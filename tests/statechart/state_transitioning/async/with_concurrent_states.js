// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../statechart/statechart.js';


var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: With Concurrent States - Goto State Asynchronous Tests", {
  beforeEach: function() {
    
    var StateMixin = {
      
      counter: 0,
      
      foo: function() {
        this.set('counter', this.get('counter') + 1);
        this.resumeGotoState();
      },
      
      enterState: function() {
        return this.performAsync('foo');
      },
      
      exitState: function() {
        return this.performAsync(function() { this.foo(); });
      }
    };
  
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design(),
        
        b: State.design({
          
          substatesAreConcurrent: true,
          
          c: State.design(StateMixin),
          
          d: State.design(StateMixin)
          
        })
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("go to state b", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateC = statechart.getState('c'),
      stateD = statechart.getState('d');
  
  monitor.reset();
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  stateA.gotoState('b');
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence().begin()
                  .exited('a')
                  .entered('b')
                  .beginConcurrent()
                    .entered('c', 'd')
                  .endConcurrent()
                .end(), 
          true, 'sequence should be exited[a], entered[b, c, d]');
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  assert.equal(stateC.get('isCurrentState'), true, 'current state should be c');
  assert.equal(stateD.get('isCurrentState'), true, 'current state should be d');
  assert.equal(stateC.get('counter'), 1, "state c should have counter equal to 1");
  assert.equal(stateD.get('counter'), 1, "state d should have counter equal to 1");
});

test("go to state b, then back to state a", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateC = statechart.getState('c'),
      stateD = statechart.getState('d');
  
  stateA.gotoState('b');
  
  monitor.reset();
  
  stateC.gotoState('a');
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence()
                .begin()
                .exited('c', 'd', 'b')
                .entered('a')
                .end(), 
          true, 'sequence should be exited[c, d, b], entered[a]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(stateA.get('isCurrentState'), true, 'current state should not be a');
  assert.equal(stateC.get('isCurrentState'), false, 'current state should not be c');
  assert.equal(stateD.get('isCurrentState'), false, 'current state should not be d');
  assert.equal(stateC.get('counter'), 2, "state c should have counter equal to 2");
  assert.equal(stateD.get('counter'), 2, "state d should have counter equal to 2");
});