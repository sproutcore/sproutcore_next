// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { SC } from '/core/core.js';
import { Statechart, State, StatechartDelegate, StateRouteHandlerContext } from '/statechart/statechart.js';


var sc, root, stateA, stateB, stateC, stateD, stateE, stateF;

module("State: findFirstRelativeCurrentState method Tests (without concurrent states)", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      initialState: 'a',
    
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
      
    });
    
    sc.initStatechart();
    
    root = sc.get('rootState');
    stateA = sc.getState('a');
    stateB = sc.getState('b');
    stateC = sc.getState('c');
    stateD = sc.getState('d');
    stateE = sc.getState('e');
    stateF = sc.getState('f');
  },
  
  afterEach: function() {
    sc = root = stateA = stateB = stateC = stateD = stateE = stateF = null;
  }
  
});

test("check when current state is state C", function (assert) {
  assert.equal(root.findFirstRelativeCurrentState(), stateC, "root state should return state C");
  assert.equal(stateA.findFirstRelativeCurrentState(), stateC, "state A should return state C");
  assert.equal(stateB.findFirstRelativeCurrentState(), stateC, "state B should return state C");
  assert.equal(stateC.findFirstRelativeCurrentState(), stateC, "state C should return state C");
  assert.equal(stateD.findFirstRelativeCurrentState(), stateC, "state D should return state C");
  assert.equal(stateE.findFirstRelativeCurrentState(), stateC, "state E should return state C");
  assert.equal(stateF.findFirstRelativeCurrentState(), stateC, "state F should return state C");
});

test("check when current state is state F", function (assert) {
  sc.gotoState(stateF);
  
  assert.equal(root.findFirstRelativeCurrentState(), stateF, "root state should return state F");
  assert.equal(stateA.findFirstRelativeCurrentState(), stateF, "state A should return state F");
  assert.equal(stateB.findFirstRelativeCurrentState(), stateF, "state B should return state F");
  assert.equal(stateC.findFirstRelativeCurrentState(), stateF, "state C should return state F");
  assert.equal(stateD.findFirstRelativeCurrentState(), stateF, "state D should return state F");
  assert.equal(stateE.findFirstRelativeCurrentState(), stateF, "state E should return state F");
  assert.equal(stateF.findFirstRelativeCurrentState(), stateF, "state F should return state F");
});