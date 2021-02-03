// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart = null;
var monitor, root, stateA, stateB, stateC, stateD, stateE, stateF, stateG, stateZ;

module("Statechart: With Concurrent States - Goto State Intermediate Tests", {
  beforeEach: function() {
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',

        a: State.design({
          substatesAreConcurrent: true,
          
          b: State.design({
            initialSubstate: 'd',
            d: State.design(),
            e: State.design()
          }),
          
          c: State.design({
            initialSubstate: 'f',
            f: State.design(),
            g: State.design()
          })
        }),

        z: State.design()
      })
      
    });
    
    statechart.initStatechart();
    
    monitor = statechart.get('monitor');
    root = statechart.get('rootState');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
    stateZ = statechart.getState('z');
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = monitor = root = null;
    stateA = stateB = stateC = stateD = stateE = stateF = stateG = stateZ = null;
  }
});

test("check statechart initialization", function (assert) {  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 5');
  
  assert.equal(monitor.matchSequence().begin()
                                  .entered(root, 'a')
                                  .beginConcurrent()
                                    .beginSequence()
                                      .entered('b', 'd')
                                    .endSequence()
                                    .beginSequence()
                                      .entered('c', 'f')
                                    .endSequence()
                                  .endConcurrent()
                                .end(), 
    true, 'initial sequence should be entered[ROOT, a, b, d, c, f]');
  
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  assert.equal(stateA.stateIsCurrentSubstate('d'), true, 'state a\'s current substate should be state d');
  assert.equal(stateA.stateIsCurrentSubstate('f'), true, 'state a\'s current substate should be state f');
  assert.equal(stateA.stateIsCurrentSubstate('e'), false, 'state a\'s current substate should not be state e');
  assert.equal(stateA.stateIsCurrentSubstate('g'), false, 'state a\'s current substate should not be state g');
  assert.equal(stateB.stateIsCurrentSubstate('d'), true, 'state b\'s current substate should be state d');
  assert.equal(stateB.stateIsCurrentSubstate('e'), false, 'state b\'s current substate should not be state e');
  assert.equal(stateC.stateIsCurrentSubstate('f'), true, 'state c\'s current substate should be state f');
  assert.equal(stateC.stateIsCurrentSubstate('g'), false, 'state c\'s current substate should not be state g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'b', 'c', 'd', 'f'), 'states root, A, B, C, D and F should all be entered');
});

test("from state d, go to state z", function (assert) {   
  monitor.reset();
  stateD.gotoState('z');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('d', 'b', 'f', 'c', 'a').entered('z').end(), true, 'sequence should be exited[d, b, f, c, a], entered[z]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('z'), true, 'current state should be z');
  assert.equal(stateA.getPath('currentSubstates.length'), 0, 'state a should have 0 current substates');
  assert.equal(stateA.stateIsCurrentSubstate('d'), false, 'state a\'s current substate should not be state d');
  assert.equal(stateA.stateIsCurrentSubstate('f'), false, 'state a\'s current substate should not be state f');
  assert.equal(stateA.stateIsCurrentSubstate('e'), false, 'state a\'s current substate should not be state e');
  assert.equal(stateA.stateIsCurrentSubstate('g'), false, 'state a\'s current substate should not be state g');
  
  assert.ok(monitor.matchEnteredStates(root, 'z'), 'states root and Z should all be entered');
});

test("from state a, go to state z and then back to state a", function (assert) { 
  monitor.reset();
  stateA.gotoState('z');

  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  
  assert.equal(monitor.matchSequence().begin()
                                  .beginConcurrent()
                                    .beginSequence()
                                      .exited('d', 'b')
                                    .endSequence()
                                    .beginSequence()
                                      .exited('f', 'c')
                                    .endSequence()
                                  .endConcurrent()
                                  .exited('a')
                                  .entered('z')
                                .end(), 
    true, 'sequence should be exited[d, b, f, c, a], entered[z]');
  
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('z'), true, 'current state should be z');
  
  monitor.reset();
  stateZ.gotoState('a');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  
  assert.equal(monitor.matchSequence().begin()
                                  .exited('z')
                                  .entered('a')
                                  .beginConcurrent()
                                    .beginSequence()
                                      .entered('b', 'd')
                                    .endSequence()
                                    .beginSequence()
                                      .entered('c', 'f')
                                    .endSequence()
                                  .endConcurrent()
                                .end(), 
    true, 'sequence should be exited[z], entered[a, b, d, c, f]');
  
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  assert.equal(stateA.getPath('currentSubstates.length'), 2, 'state a should have 2 current substates');
  assert.equal(stateA.stateIsCurrentSubstate('d'), true, 'state a\'s current substate should be state d');
  assert.equal(stateA.stateIsCurrentSubstate('e'), false, 'state a\'s current substate should not be state e');
  assert.equal(stateA.stateIsCurrentSubstate('f'), true, 'state a\'s current substate should be state f');
  assert.equal(stateA.stateIsCurrentSubstate('g'), false, 'state a\'s current substate should not be state g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'b', 'c', 'd', 'f'), 'states root, A, B, C, D and F should all be entered');
});