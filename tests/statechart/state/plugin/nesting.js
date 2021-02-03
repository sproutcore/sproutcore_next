// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC externalState1 externalState2 */

import { SC, GLOBAL } from '/core/core.js';
import { Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart = null;
GLOBAL.externalState1 = null;
GLOBAL.externalState2 = null;

module("State.plugin: Nest States Tests", {
  beforeEach: function() {
    
    externalState1 = State.extend({
      
      message: 'external state 1'
      
    });
    
    externalState2 = State.extend({
      
      initialSubstate: 'd',
      
      message: 'external state 2',
      
      d: State.design(),
      
      e: State.plugin('externalState1')
      
    });
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.plugin('externalState1'),
        
        b: State.plugin('externalState2'),
        
        c: State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
    externalState1 = null;
    externalState2 = null;
  }
});

test("check statechart states", function (assert) {
  var stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateC = statechart.getState('c'),
      stateD = statechart.getState('d'),
      stateE = statechart.getState('e');

  assert.equal(SC.kindOf(stateA, externalState1), true, 'state a should be kind of externalState1');
  assert.equal(SC.kindOf(stateB, externalState2), true, 'state b should be kind of externalState2');
  assert.equal(SC.kindOf(stateE, externalState1), true, 'state e should be kind of externalState1');
  assert.equal(SC.kindOf(stateC, externalState1), false, 'state c should not be kind of externalState1');
  assert.equal(SC.kindOf(stateD, externalState1), false, 'state d should not be kind of externalState1');
  
  assert.equal(stateA !== stateE, true, 'state a should not be equal to state e');
});

test("check statechart initialization", function (assert) {
  var monitor = statechart.get('monitor');
  var root = statechart.get('rootState');
  
  assert.equal(monitor.get('length'), 2, 'initial state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().entered(root, 'a').end(), true, 'initial sequence should be entered[ROOT, a]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('a'), true, 'current state should be a');
});

test("go to state e", function (assert) {
  var monitor = statechart.get('monitor');
      
  monitor.reset();
  statechart.gotoState('e');
  
  assert.equal(monitor.get('length'), 3, 'initial state sequence should be of length 3');
  assert.equal(monitor.matchSequence().begin().exited('a').entered('b', 'e').end(), true, 'initial sequence should be exited[a], entered[b, e]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
});