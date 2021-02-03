// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals Ki */

var statechart = null;
import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: With Concurrent States - Goto History State Tests", {
  beforeEach: function() {
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'x',
        
        x: State.design({
                
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
          
        }),

        z: State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("send event eventA", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateB = statechart.getState('b'),
      stateC = statechart.getState('c'),
      stateD = statechart.getState('d'),
      stateE = statechart.getState('e'),
      stateF = statechart.getState('f'),
      stateZ = statechart.getState('z');

  stateC.gotoState('d');
  stateE.gotoState('f');
  
  assert.equal(stateA.get('historyState'), stateD, 'state a should have state d as its history state');
  assert.equal(stateB.get('historyState'), stateF, 'state b should have state f as its history state');
  assert.equal(stateD.get('isCurrentState'), true, 'state d should be current state');
  assert.equal(stateF.get('isCurrentState'), true, 'state f should be current state');
  assert.equal(stateE.get('isCurrentState'), false, 'state e should not be current state');
  
  monitor.reset();
  
  stateD.gotoState('z');
  assert.equal(stateZ.get('isCurrentState'), true, 'state z should be current state');
  
  stateZ.gotoHistoryState('a');
  
  assert.equal(stateA.get('historyState'), stateD, 'state a should have state d as its history state');
  assert.equal(stateB.get('historyState'), stateE, 'state b should have state e as its history state');
  assert.equal(stateD.get('isCurrentState'), true, 'state d should be current state');
  assert.equal(stateF.get('isCurrentState'), false, 'state f should not be current state');
  assert.equal(stateE.get('isCurrentState'), true, 'state e should be current state');
  
});