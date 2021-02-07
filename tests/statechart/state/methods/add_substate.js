// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '../../../../core/core.js';
import { Statechart, State, EmptyState } from '../../../../statechart/statechart.js';

var sc, root, stateA, stateB, stateX, stateY;

module("State: addSubstate method Tests", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      
      trace: true,
      
      initialState: 'a',
    
      a: State.design(),
      
      b: State.design({
        
        substatesAreConcurrent: true,
        
        x: State.design(),
        
        y: State.design()
        
      })
      
    });
    
    sc.initStatechart();
    root = sc.get('rootState');
    stateA = sc.getState('a');
    stateB = sc.getState('b');
    stateX = sc.getState('x');
    stateY = sc.getState('y');
  },
  
  afterEach: function() {
    sc = root = stateA = stateB = stateX = stateY = null;
  }
  
});

test("add a substate to the statechart's root state", function (assert) {
  assert.ok(!root.getSubstate('z'), "root state should not have a state z");
  
  var state = root.addSubstate('z');
  
  assert.ok(SC.kindOf(state, State) && state.isObject, "addState should return a state object");
  assert.equal(root.getSubstate('z'), state, "root state should have a state z after adding state");
  assert.ok(state.get('stateIsInitialized'), "state z should be initialized");
  assert.ok(!state.get('isEnteredState'), "state z should not be entered");
  assert.ok(!state.get('isCurrentState'), "state z should not be current");
  
  sc.gotoState('z');
  
  assert.ok(state.get('isEnteredState'), "state z should be entered after transitioning to it");
  assert.ok(state.get('isCurrentState'), "state z should be current after transitioning to it");
});

test("add a substate to state A", function (assert) {
  assert.ok(!stateA.getSubstate('z'), "state A should not have a state z");
  assert.ok(!stateA.get('initialSubstate'), "state A should not have an initial substate");

  var state = stateA.addSubstate('z');
  
  assert.ok(SC.kindOf(state, State) && state.isObject, "addState should return a state object");
  assert.equal(stateA.getSubstate('z'), state, "state A should have a state z after adding state");
  assert.ok(SC.kindOf(stateA.get('initialSubstate'), EmptyState), "state A's initial substate should be an empty state after adding state");
  assert.ok(!state.get('isEnteredState'), "state z should not be entered");
  assert.ok(!state.get('isCurrentState'), "state z should not be current");
  assert.ok(stateA.get('isCurrentState'), "state A should be current");
  assert.ok(stateA.get('isEnteredState'), "state A should be entered");
  
  console.log('reentering state A');
  stateA.set('initialSubstate', state);
  stateA.reenter();
  
  assert.ok(state.get('isEnteredState'), "state z should be entered after reentering state A");
  assert.ok(state.get('isCurrentState'), "state z should be current after reentering state A");
  assert.ok(stateA.get('isEnteredState'), "state A should be entered after reentering");
  assert.ok(!stateA.get('isCurrentState'), "state A should not be current after reentering");
});

test("add a substate to state B", function (assert) {
  assert.ok(!stateB.getSubstate('z'), "state B should not have a state z");
  sc.gotoState('b');

  var state = stateB.addSubstate('z');
  
  assert.ok(SC.kindOf(state, State) && state.isObject, "addState should return a state object");
  assert.equal(stateB.getSubstate('z'), state, "state B should have a state z after adding state");
  assert.ok(!state.get('isEnteredState'), "state z should not be entered");
  assert.ok(!state.get('isCurrentState'), "state z should not be current");
  assert.ok(!stateB.get('isCurrentState'), "state B should be current");
  assert.ok(!stateB.get('initialSubstate'), "state B's initial substate should not be set");
  assert.ok(stateB.get('isEnteredState'), "state B should be entered");
  assert.equal(stateB.getPath('currentSubstates.length'), 2, "state B should have 2 current substates");
  
  stateB.reenter();
  
  assert.ok(state.get('isEnteredState'), "state z should be entered after reentering state B");
  assert.ok(state.get('isCurrentState'), "state z should be current after reentering state B");
  assert.ok(stateB.get('isEnteredState'), "state B should be entered");
  assert.equal(stateB.getPath('currentSubstates.length'), 3, "state B should have 3 current substates");
});