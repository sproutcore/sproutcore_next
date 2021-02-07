// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../statechart/statechart.js';


var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: No Concurrent States - Goto State Asynchronous Tests", {
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
          
          methodInvoked: null,
          
          enterState: function() {
            return this.performAsync('foo');
          },
          
          exitState: function() {
            return this.performAsync('bar');
          },
          
          foo: function(arg1, arg2) {
            this.set('methodInvoked', 'foo');
          },

          bar: function(arg1, arg2) {
            this.set('methodInvoked', 'bar');
          }
          
        }),
        
        c: State.design(StateMixin, {
          
          initialSubstate: 'd',
          
          d: State.design(StateMixin, {
            
            initialSubstate: 'e',
            
            e: State.design(StateMixin)
            
          })
          
        })
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
  }
});

test("go to state b", function (assert) {
  var stateB = statechart.getState('b'),
      monitor = statechart.get('monitor');
  
  monitor.reset();
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  statechart.gotoState(stateB);
  
  assert.equal(statechart.get('gotoStateActive'), true, "statechart should have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), true, "statechart should have active gotoState suspended");
  
  statechart.resumeGotoState();
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence().begin().exited('a').entered('b').end(), true, 'sequence should be exited[a], entered[b]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('a'), false, 'current state should not be a');
  assert.equal(statechart.stateIsCurrentState('b'), true, 'current state should be b');
  assert.equal(stateB.get('methodInvoked'), 'foo', "state b should have invoked method foo");
});

test("go to state b and then back to state a", function (assert) {
  var stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      monitor = statechart.get('monitor');
  
  statechart.gotoState(stateB);
  statechart.resumeGotoState();
  
  monitor.reset();
  
  statechart.gotoState(stateA);
  
  assert.equal(statechart.get('gotoStateActive'), true, "statechart should have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), true, "statechart should have active gotoState suspended");
  
  statechart.resumeGotoState();
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence().begin().exited('b').entered('a').end(), true, 'sequence should be exited[b], entered[a]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'current state should be a');
  assert.equal(statechart.stateIsCurrentState('b'), false, 'current state should not be b');
  assert.equal(stateB.get('methodInvoked'), 'bar', "state b should have invoked method bar");
});

test("go to state c", function (assert) {
  var stateC = statechart.getState('c'),
      stateD = statechart.getState('d'),
      stateE = statechart.getState('e'),
      monitor = statechart.get('monitor');
  
  monitor.reset();
  
  statechart.gotoState(stateC);
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence().begin().exited('a').entered('c', 'd', 'e').end(), true, 
        'sequence should be exited[a], entered[c, d, e]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('a'), false, 'current state should not be a');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  assert.equal(stateC.get('counter'), 1, 'state c counter should be 1');
  assert.equal(stateD.get('counter'), 1, 'state d counter should be 1');
  assert.equal(stateE.get('counter'), 1, 'state e counter should be 1');
});

test("go to state c and then back to state a", function (assert) {
  var stateA = statechart.getState('a'),
      stateC = statechart.getState('c'),
      stateD = statechart.getState('d'),
      stateE = statechart.getState('e'),
      monitor = statechart.get('monitor');
  
  statechart.gotoState(stateC);
  
  monitor.reset();
  
  statechart.gotoState(stateA);
  
  assert.equal(statechart.get('gotoStateActive'), false, "statechart should not have active gotoState");
  assert.equal(statechart.get('gotoStateSuspended'), false, "statechart should not have active gotoState suspended");
  
  assert.equal(monitor.matchSequence().begin().exited('e', 'd', 'c').entered('a').end(), true, 
        'sequence should be exited[e, d, c], entered[a]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'current state should be a');
  assert.equal(statechart.stateIsCurrentState('e'), false, 'current state should not be e');
  assert.equal(stateC.get('counter'), 2, 'state c counter should be 2');
  assert.equal(stateD.get('counter'), 2, 'state d counter should be 2');
  assert.equal(stateE.get('counter'), 2, 'state e counter should be 2');
});