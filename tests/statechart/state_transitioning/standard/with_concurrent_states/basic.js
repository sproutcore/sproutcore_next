// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../../statechart/statechart.js';


var statechart = null;
var monitor, root, stateA, stateB, stateC, stateD, stateE, stateF;

module("Statechart: With Concurrent States - Goto State Basic Tests", {
  beforeEach: function() {
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        substatesAreConcurrent: true,

        a: State.design({
          initialSubstate: 'c',
          c: State.design(),
          d: State.design()
        }),

        b: State.design({
          initialSubstate: 'e',
          e: State.design(),
          f: State.design()
        })
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
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = monitor = root = stateA = stateB = stateC = stateD = stateE = stateF = null;
  }
});

test("check statechart initialization", function (assert) {
  assert.equal(monitor.get('length'), 5, 'initial state sequence should be of length 5');
  assert.equal(monitor.matchSequence().begin()
                                  .entered(root)
                                  .beginConcurrent()
                                    .beginSequence()
                                      .entered('a', 'c')
                                    .endSequence()
                                    .beginSequence()
                                      .entered('b', 'e')
                                    .endSequence()
                                  .endConcurrent()
                                .end(), 
    true, 'initial sequence should be entered[ROOT, a, c, b, e]');
  assert.equal(monitor.matchSequence().begin()
                                  .entered(root)
                                  .beginConcurrent()
                                    .entered('a', 'b')
                                  .endConcurrent()
                                  .beginConcurrent()
                                    .entered('c', 'e')
                                  .endConcurrent()
                                .end(), 
    false, 'initial sequence should not be entered[ROOT, a, b, c, e]');
  
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  assert.equal(statechart.stateIsCurrentState('d'), false, 'current state should not be d');
  assert.equal(statechart.stateIsCurrentState('f'), false, 'current state should not be f');
  
  assert.equal(stateA.stateIsCurrentSubstate('c'), true, 'state a\'s current substate should be state c');
  assert.equal(stateA.stateIsCurrentSubstate('d'), false, 'state a\'s current substate should not be state d');
  assert.equal(stateB.stateIsCurrentSubstate('e'), true, 'state a\'s current substate should be state e');
  assert.equal(stateB.stateIsCurrentSubstate('f'), false, 'state a\'s current substate should not be state f');
  
  assert.equal(stateA.get('isCurrentState'), false, 'state a should not be current state');
  assert.equal(stateB.get('isCurrentState'), false, 'state b should not be current state');
  assert.equal(stateC.get('isCurrentState'), true, 'state c should be current state');
  assert.equal(stateD.get('isCurrentState'), false, 'state d should not be current state');
  assert.equal(stateE.get('isCurrentState'), true, 'state e should be current state');
  assert.equal(stateF.get('isCurrentState'), false, 'state f should not be current state');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'b', 'e'), 'states root, A, C, B and E should all be entered');
});

test("from state c, go to state d, and from state e, go to state f", function (assert) {
  monitor.reset();
  
  stateC.gotoState('d');
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('c').entered('d').end(), true, 'sequence should be exited[c], enterd[d]');
  
  monitor.reset();
  
  stateE.gotoState('f');
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('e').entered('f').end(), true, 'sequence should be exited[e], enterd[f]');
  
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  
  assert.equal(stateA.stateIsCurrentSubstate('c'), false, 'state a\'s current substate should not be state c');
  assert.equal(stateA.stateIsCurrentSubstate('d'), true, 'state a\'s current substate should be state d');
  assert.equal(stateB.stateIsCurrentSubstate('e'), false, 'state b\'s current substate should not be state e');
  assert.equal(stateB.stateIsCurrentSubstate('f'), true, 'state b\'s current substate should be state f');
  
  assert.equal(stateA.get('isCurrentState'), false, 'state a should not be current state');
  assert.equal(stateB.get('isCurrentState'), false, 'state b should not be current state');
  assert.equal(stateC.get('isCurrentState'), false, 'state c should not be current state');
  assert.equal(stateD.get('isCurrentState'), true, 'state d should be current state');
  assert.equal(stateE.get('isCurrentState'), false, 'state e should not be current state');
  assert.equal(stateF.get('isCurrentState'), true, 'state f should be current state');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'd', 'b', 'f'), 'states root, A, D, B and F should all be entered');
});

test("from state a, go to sibling concurrent state b", function (assert) {
  monitor.reset();
  
  // Expect to get an error to be outputted in the JS console, which is what we want since
  // the pivot state is the root state and it's substates are concurrent
  console.log('expecting to get an error...');
  stateA.gotoState('b');
  
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0');
  assert.equal(statechart.get('currentStateCount'), 2, 'current state count should be 2');
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
  assert.equal(stateA.stateIsCurrentSubstate('c'), true, 'state a\'s current substate should be state c');
  assert.equal(stateA.stateIsCurrentSubstate('d'), false, 'state a\'s current substate should not be state d');
  assert.equal(stateB.stateIsCurrentSubstate('e'), true, 'state a\'s current substate should be state e');
  assert.equal(stateB.stateIsCurrentSubstate('f'), false, 'state a\'s current substate should not be state f');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'b', 'e'), 'states root, A, C, B and E should all be entered');
});