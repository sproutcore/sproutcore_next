// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart1, statechart2, statechart3, statechart4;

module("Statechart: getState method Tests", {
  beforeEach: function() {
    
    statechart1 = Statechart.create({
      
      rootState: State.design({
        initialSubstate: 'a',
        a: State.design({ value: 'state A' }),
        b: State.design({ value: 'state B' })
      })
      
    });
    
    statechart2 = Statechart.create({
      
      rootState: State.design({
        initialSubstate: 'a',
        a: State.design({
          value: 'state A',
          initialSubstate: 'c',
          c: State.design({ value: 'state C' }),
          d: State.design({ value: 'state D' })
        }),
        
        b: State.design({
          value: 'state B',
          initialSubstate: 'e',
          e: State.design({ value: 'state E' }),
          f: State.design({ value: 'state F' })
        })
      })
      
    });
    
    statechart3 = Statechart.create({
      
      rootState: State.design({
        initialSubstate: 'a',
        a: State.design({ value: 'state A' }),
        b: State.design({
          value: 'state B',
          initialSubstate: 'a',
          a: State.design({ value: 'state B.A' }),
          c: State.design({
            value: 'state C',
            initialSubstate: 'a',
            a: State.design({ value: 'state B.C.A' }),
            d: State.design({ value: 'state D' })
          })
        })
      })
      
    });
    
    statechart4 = Statechart.create({
      
      rootState: State.design({
        initialSubstate: 'a',
        a: State.design({
          value: 'state A',
          initialSubstate: 'x',
          x: State.design({ value: 'state A.X' }),
          y: State.design({ value: 'state A.Y' })
        }),
        
        b: State.design({
          value: 'state B',
          initialSubstate: 'x',
          x: State.design({ value: 'state B.X' }),
          y: State.design({ value: 'state B.Y' })
        })
      })
      
    });
    
    statechart1.initStatechart();
    statechart2.initStatechart();
    statechart3.initStatechart();
    statechart4.initStatechart();
  },
  
  afterEach: function() {
    statechart1.destroy();
    statechart2.destroy();
    statechart3.destroy();
    statechart4.destroy();
    statechart1 = statechart2 = statechart3 = statechart4 = null;
  }
});

test("access statechart1 states", function (assert) {
  var state;
      
  state = statechart1.getState('a');
  assert.equal(SC.none(state), false, 'state a should not be null');
  assert.equal(state.get('value'), 'state A', 'state a should have value "state A"');
  
  state = statechart1.getState('b');
  assert.equal(SC.none(state), false, 'state b should not be null');
  assert.equal(state.get('value'), 'state B', 'state a should have value "state B"');
});

test("access statechart2 states", function (assert) {
  var state;
      
  state = statechart2.getState('a');
  assert.equal(SC.none(state), false, 'state a should not be null');
  assert.equal(state.get('value'), 'state A', 'state a should have value "state A"');
  
  state = statechart2.getState('b');
  assert.equal(SC.none(state), false, 'state b should not be null');
  assert.equal(state.get('value'), 'state B', 'state b should have value "state B"');
  
  state = statechart2.getState('c');
  assert.equal(SC.none(state), false, 'state c should not be null');
  assert.equal(state.get('value'), 'state C', 'state c should have value "state C"');
  
  state = statechart2.getState('d');
  assert.equal(SC.none(state), false, 'state d should not be null');
  assert.equal(state.get('value'), 'state D', 'state d should have value "state D"');
  
  state = statechart2.getState('e');
  assert.equal(SC.none(state), false, 'state e should not be null');
  assert.equal(state.get('value'), 'state E', 'state d should have value "state E"');
  
  state = statechart2.getState('f');
  assert.equal(SC.none(state), false, 'state f should not be null');
  assert.equal(state.get('value'), 'state F', 'state d should have value "state F"');
  
  state = statechart2.getState('a.c');
  assert.equal(SC.none(state), false, 'state a.c should not be null');
  assert.equal(state, statechart2.getState('c'), 'state a.c should be equal to state c');
  assert.equal(state.get('value'), 'state C', 'state a.c should have value "state C"');
  
  state = statechart2.getState('a.d');
  assert.equal(SC.none(state), false, 'state a.d should not be null');
  assert.equal(state, statechart2.getState('d'), 'state a.d should be equal to state d');
  assert.equal(state.get('value'), 'state D', 'state a.d should have value "state D"');
  
  state = statechart2.getState('b.e');
  assert.equal(SC.none(state), false, 'state b.e should not be null');
  assert.equal(state, statechart2.getState('e'), 'state b.e should be equal to state e');
  assert.equal(state.get('value'), 'state E', 'state b.e should have value "state E"');
  
  state = statechart2.getState('b.f');
  assert.equal(SC.none(state), false, 'state b.f should not be null');
  assert.equal(state, statechart2.getState('f'), 'state b.f should be equal to state f');
  assert.equal(state.get('value'), 'state F', 'state b.f should have value "state F"');
});

test("attempt to access all A states in statechart3", function (assert) {
  var state;
      
  state = statechart3.getState('this.a');
  assert.equal(SC.none(state), false, 'state a should not be null');
  assert.equal(state.get('value'), 'state A', 'state a should have value "state A"');
  
  state = statechart3.getState('b.a');
  assert.equal(SC.none(state), false, 'state b.a should not be null');
  assert.equal(state.get('value'), 'state B.A', 'state a should have value "state B.A"');
  
  state = statechart3.getState('b.c.a');
  assert.equal(SC.none(state), false, 'state b.c.a should not be null');
  assert.equal(state.get('value'), 'state B.C.A', 'state a should have value "state B.C.A"');
});

test("access all states in statechart4", function (assert) {
  var state, 
      stateA = statechart4.getState('a'),
      stateB = statechart4.getState('b');
      
  state = statechart4.getState('a');
  assert.equal(SC.none(state), false, 'state a should not be null');
  assert.equal(state.get('value'), 'state A', 'state a should have value "state A"');
  
  state = statechart4.getState('a.x');
  assert.equal(SC.none(state), false, 'state a.x should not be null');
  assert.equal(state.get('value'), 'state A.X', 'state a should have value "state A.X"');
  
  state = statechart4.getState('a.y');
  assert.equal(SC.none(state), false, 'state a.y should not be null');
  assert.equal(state.get('value'), 'state A.Y', 'state a should have value "state A.Y"');
  
  state = statechart4.getState('b');
  assert.equal(SC.none(state), false, 'state a should not be null');
  assert.equal(state.get('value'), 'state B', 'state b should have value "state B"');
  
  state = statechart4.getState('b.x');
  assert.equal(SC.none(state), false, 'state b.x should not be null');
  assert.equal(state.get('value'), 'state B.X', 'state b should have value "state B.X"');
  
  state = statechart4.getState('b.y');
  assert.equal(SC.none(state), false, 'state b.y should not be null');
  assert.equal(state.get('value'), 'state B.Y', 'state a should have value "state B.Y"');
  
  console.log('expecting to get an error message...');
  state = statechart4.getState('x');
  assert.equal(SC.none(state), true, 'state x should be null');
  
  console.log('expecting to get an error message...');
  state = statechart4.getState('y');
  assert.equal(SC.none(state), true, 'state y should be null');
});