// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

import { SC } from '/core/core.js';
import { StatechartManager, State, EmptyState } from '/statechart/statechart.js';


var obj1, rootState1, stateA, stateB;
var obj2, rootState2, stateC, stateD;
var obj3, rootState3, stateE, rootStateExample;
var obj4;
var owner;

module("Statechart: Create Statechart with Unassigned Root State Tests", {
  beforeEach: function() {
    owner = SC.Object.create();
    
    obj1 = SC.Object.extend(StatechartManager, {
      
      initialState: 'stateA',
      
      stateA: State.design({
        foo: function() {
          this.gotoState('stateB');
        }
      }),
      
      stateB: State.design({
        bar: function() {
          this.gotoState('stateA');
        }
      })
      
    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('stateA');
    stateB = obj1.getState('stateB');  
    
    obj2 = SC.Object.extend(StatechartManager, {
      
      statesAreConcurrent: true,
      
      stateC: State.design({
        foo: function() {
          this.gotoState('stateD');
        }
      }),
      
      stateD: State.design({
        bar: function() {
          this.gotoState('stateC');
        }
      })
      
    });
    
    obj2 = obj2.create();
    rootState2 = obj2.get('rootState');
    stateC = obj2.getState('stateC');
    stateD = obj2.getState('stateD');  
    
    rootStateExample = State.extend({ test: 'foo' });
    
    obj3 = SC.Object.extend(StatechartManager, {
      owner: owner,
      initialState: 'stateE',
      rootStateExample: rootStateExample,
      stateE: State.design()
    });
    
    obj3 = obj3.create();
    rootState3 = obj3.get('rootState');
    stateE = obj3.getState('stateE');
    
    obj4 = SC.Object.extend(StatechartManager, {
      autoInitStatechart: false,
      initialState: 'stateF',
      rootStateExample: rootStateExample,
      stateF: State.design()
    });
    
    obj4 = obj4.create();
  },
  
  afterEach: function() {
    obj1 = rootState1 = stateA = stateB = null;
    obj2 = rootState2 = stateC = stateD = null;
    obj3 = rootState3 = stateE = rootStateExample = null;
    obj4 = null;
  }
});

test("check obj1 statechart", function (assert) {
  assert.ok(obj1.get('isStatechart'), "obj should be a statechart");
  assert.ok(obj1.get('statechartIsInitialized'), "obj should be an initialized statechart");
  assert.ok(SC.kindOf(rootState1, State), "root state should be kind of State");
  assert.ok(!rootState1.get('substateAreConcurrent'), "root state's substates should not be concurrent");
  
  assert.equal(obj1.get('initialState'), stateA, "obj's initialState should be state A");
  assert.equal(rootState1.get('initialSubstate'), stateA, "root state's initialState should be state A");
  assert.equal(stateA, rootState1.getSubstate('stateA'), "obj.stateA and rootState.stateA should be equal");
  assert.equal(stateB, rootState1.getSubstate('stateB'), "obj.stateB and rootState.stateB should be equal");
  
  assert.equal(rootState1.get('owner'), obj1, "root state's owner should be obj");
  assert.equal(stateA.get('owner'), obj1, "state A's owner should be obj");
  assert.equal(stateB.get('owner'), obj1, "state B's owner should be obj");
  
  assert.ok(stateA.get('isCurrentState'), "state A should be current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be current state");
  
  obj1.sendEvent('foo');
  
  assert.ok(!stateA.get('isCurrentState'), "state A should not be current state");
  assert.ok(stateB.get('isCurrentState'), "state B should be current state");
});

test("check obj2 statechart", function (assert) {
  assert.ok(obj2.get('isStatechart'), "obj should be a statechart");
  assert.ok(obj2.get('statechartIsInitialized'), "obj should be an initialized statechart");
  assert.ok(SC.kindOf(rootState2, State), "root state should be kind of State");
  assert.ok(rootState2.get('substatesAreConcurrent'), "root state's substates should be concurrent");
  
  assert.equal(obj2.get('initialState'), null, "obj's initialState should be null");
  assert.equal(rootState2.get('initialSubstate'), null, "root state's initialState should be null");
  assert.equal(stateC, rootState2.getSubstate('stateC'), "obj.stateC and rootState.stateC should be equal");
  assert.equal(stateD, rootState2.getSubstate('stateD'), "obj.stateD and rootState.stateD should be equal");
  
  assert.equal(rootState2.get('owner'), obj2, "root state's owner should be obj");
  assert.equal(stateC.get('owner'), obj2, "state C's owner should be obj");
  assert.equal(stateD.get('owner'), obj2, "state D's owner should be obj");
  
  assert.ok(stateC.get('isCurrentState'), "state C should be current state");
  assert.ok(stateD.get('isCurrentState'), "state D should not be current state");
});

test("check obj3 statechart", function (assert) {
  assert.ok(obj3.get('isStatechart'), "obj should be a statechart");
  assert.ok(obj3.get('statechartIsInitialized'), "obj should be an initialized statechart");
  assert.ok(SC.kindOf(rootState3, rootStateExample), "root state should be kind of rootStateExample");
  assert.ok(!rootState3.get('substatesAreConcurrent'), "root state's substates should be concurrent");
  
  assert.equal(rootState3.get('owner'), owner, "root state's owner should be owner");
  assert.equal(stateE.get('owner'), owner, "state C's owner should be owner");
  
  assert.equal(obj3.get('initialState'), stateE, "obj's initialState should be stateE");
  assert.equal(rootState3.get('initialSubstate'), stateE, "root state's initialState should be stateE");
  assert.equal(stateE, rootState3.getSubstate('stateE'), "obj.stateE and rootState.stateE should be equal");
  
  assert.ok(stateE.get('isCurrentState'), "state E should be current state");
});

test("check obj4 statechart", function (assert) {
  assert.ok(obj4.get('isStatechart'), "obj should be a statechart");
  assert.ok(!obj4.get('statechartIsInitialized'), "obj should not be an initialized statechart");
  assert.equal(obj4.get('rootState'), null, "obj's root state should be null");
  
  obj4.initStatechart();
  
  assert.ok(obj4.get('statechartIsInitialized'), "obj should be an initialized statechart");
  assert.ok(obj4.get('rootState'), "obj's root state should not be null");
  assert.equal(obj4.get('rootState').getSubstate('stateF'), obj4.getState('stateF'), "obj.stateF should be equal to rootState.stateF");
});