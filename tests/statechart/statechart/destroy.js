// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

import { SC } from '../../../core/core.js';
import { StatechartManager, State, EmptyState } from '../../../statechart/statechart.js';


var obj, rootState, stateA, stateB;

module("Statechart: Destroy Statechart Tests", {
  beforeEach: function() {
    
    obj = SC.Object.create(StatechartManager, {
      
      initialState: 'stateA',
      
      stateA: State.design(),
      
      stateB: State.design()
      
    });
    
    obj.initStatechart();
    rootState = obj.get('rootState');
    stateA = obj.getState('stateA');
    stateB = obj.getState('stateB');
  },
  
  afterEach: function() {
    obj = rootState = stateA = stateB = null;
  }
});

test("check obj before and after destroy", function (assert) {
  assert.ok(!obj.get('isDestroyed'), "obj should not be destroyed");
  assert.ok(obj.hasObserverFor('owner'), "obj should have observers for property owner");
  assert.ok(obj.hasObserverFor('trace'), "obj should have observers for property trace");
  assert.equal(obj.get('rootState'), rootState, "object should have a root state");
  
  assert.ok(!rootState.get('isDestroyed'), "root state should not be destoryed");
  assert.equal(rootState.getPath('substates.length'), 2, "root state should have two substates");
  assert.equal(rootState.getPath('currentSubstates.length'), 1, "root state should one current substate");
  assert.equal(rootState.get('historyState'), stateA, "root state should have history state of A");
  assert.equal(rootState.get('initialSubstate'), stateA, "root state should have initial substate of A");
  assert.equal(rootState.get('statechart'), obj, "root state's statechart should be obj");
  assert.equal(rootState.get('owner'), obj, "root state's owner should be obj");
  
  assert.ok(!stateA.get('isDestroyed'), "state A should not be destoryed");
  assert.equal(stateA.get('parentState'), rootState, "state A should have a parent state of root state");
  
  assert.ok(!stateB.get('isDestroyed'), "state B should not be destroyed");
  assert.equal(stateB.get('parentState'), rootState, "state B should have a parent state of root state");
  
  obj.destroy();

  assert.ok(obj.get('isDestroyed'), "obj should be destroyed");
  assert.ok(!obj.hasObserverFor('owner'), "obj should not have observers for property owner");
  assert.ok(!obj.hasObserverFor('trace'), "obj should not have observers for property trace");
  assert.equal(obj.get('rootState'), null, "obj should not have a root state");
  
  assert.ok(rootState.get('isDestroyed'), "root state should be destroyed");
  assert.equal(rootState.get('substates'), null, "root state should not have substates");
  assert.equal(rootState.get('currentSubstates'), null, "root state should not have current substates");
  assert.equal(rootState.get('parentState'), null, "root state should not have a parent state");
  assert.equal(rootState.get('historyState'), null, "root state should not have a history state");
  assert.equal(rootState.get('initialSubstate'), null, "root state should not have an initial substate");
  assert.equal(rootState.get('statechart'), null, "root state's statechart should be null");
  assert.equal(rootState.get('owner'), null, "root state's owner should be null");
  
  assert.ok(stateA.get('isDestroyed'), "state A should be destroyed");
  assert.equal(stateA.get('parentState'), null, "state A should not have a parent state");
  
  assert.ok(stateB.get('isDestroyed'), "state B should be destroyed");
  assert.equal(stateB.get('parentState'), null, "state B should not have a parent state");
});