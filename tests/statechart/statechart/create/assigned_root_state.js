// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart */

import { SC } from '../../../../core/core.js';
import { StatechartManager, State, EmptyState } from '../../../../statechart/statechart.js';


var obj1, rootState1, stateA, stateB;
var obj2;

module("Statechart: Create Statechart with Assigned Root State Tests", {
  beforeEach: function() {
    obj1 = SC.Object.extend(StatechartManager, {
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
          foo: function() {
            this.gotoState('b');
          }
        }),
        
        b: State.design({
          bar: function() {
            this.gotoState('a');
          }
        })
        
      })
    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('a');
    stateB = obj1.getState('b');
    
    obj2 = SC.Object.extend(StatechartManager, {
      autoInitStatechart: false,
      rootState: State.design()
    });
    
    obj2 = obj2.create();
  },
  
  afterEach: function() {
    obj1 = rootState1 = stateA = stateB = null;
    obj2 = null;
  }
});

test("check obj1", function (assert) {
  assert.ok(obj1.get('isStatechart'), "obj should be statechart");
  assert.ok(obj1.get('statechartIsInitialized'), "obj should be an initialized statechart");
  assert.ok(SC.kindOf(rootState1, State), "root state should be kind of State");
  assert.equal(obj1.get('initialState'), null, "obj initialState should be null");
  
  assert.ok(stateA.get('isCurrentState'), "state A should be current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be current state");
  
  assert.equal(rootState1.get('owner'), obj1, "root state's owner should be obj");
  assert.equal(stateA.get('owner'), obj1, "state A's owner should be obj");
  assert.equal(stateB.get('owner'), obj1, "state B's owner should be obj");
  
  obj1.sendEvent('foo');
  
  assert.ok(!stateA.get('isCurrentState'), "state A should not be current state");
  assert.ok(stateB.get('isCurrentState'), "state B should be current state");
});

test("check obj2", function (assert) {
  assert.ok(obj2.get('isStatechart'), "obj should be statechart");
  assert.ok(!obj2.get('statechartIsInitialized'), "obj not should be an initialized statechart");
  
  obj2.initStatechart();
  
  assert.ok(obj2.get('statechartIsInitialized'), "obj should be an initialized statechart");
});