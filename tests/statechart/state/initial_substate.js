// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC externalState1 externalState2 */

import { SC } from '../../../core/core.js';
import { Statechart, State, EmptyState } from '../../../statechart/statechart.js';


let statechart, root, monitor, stateA, stateB, stateC, stateD, stateE, stateF;

module("Statechart: State Initial Substate Tests", {

  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
          initialSubstate: 'c',
          c: State.design(),
          d: State.design()
        }),
        
        b: State.design({
          e: State.design(),
          f: State.design()
        })
        
      })
      
    });
    
    statechart.initStatechart();
    
    root = statechart.get('rootState');
    monitor = statechart.get('monitor');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
  },
  
  afterEach: function() {
    statechart = root = stateA = stateB = stateC = stateD = stateE = stateF = null;
  }
});

test("check initial substates", function (assert) {
  assert.equal(root.get('initialSubstate'), stateA, "root state's initial substate should be state A");
  assert.equal(stateA.get('initialSubstate'), stateC, "state a's initial substate should be state c");
  assert.equal(stateC.get('initialSubstate'), null, "state c's initial substate should be null");
  assert.equal(stateD.get('initialSubstate'), null, "state d's initial substate should be null");
  assert.equal(SC.kindOf(stateB.get('initialSubstate'), EmptyState), true, "state b's initial substate should be an empty state");
  assert.equal(stateE.get('initialSubstate'), null, "state e's initial substate should be null");
  assert.equal(stateF.get('initialSubstate'), null, "state f's initial substate should be null");
});

test("go to state b and confirm current state is an empty state", function (assert) {
  assert.equal(stateC.get('isCurrentState'), true);
  monitor.reset();
  statechart.gotoState(stateB);
  assert.ok(monitor.matchSequence().begin().exited(stateC, stateA).entered(stateB, stateB.get('initialSubstate')).end());
  assert.equal(stateB.getPath('initialSubstate.isCurrentState'), true, "state b\'s initial substate should be the current state");
});