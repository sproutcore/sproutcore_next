// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC, GLOBAL } from '../../../../../core/core.js';
import { Statechart, State, HistoryState } from '../../../../../statechart/statechart.js';


GLOBAL.statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("HistoryState - Without Concurrent States Tests", {
  beforeEach: function() {
   
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
      
        initialSubstate: 'a',
        
        a: State.design({
          
          initialSubstate: HistoryState.extend({
            defaultState: 'c'
          }),
          
          c: State.design({
            initialSubstate: 'g',
            
            g: State.design(),
            h: State.design()
          }),
          
          d: State.design({
            initialSubstate: 'i',
            
            i: State.design(),
            j: State.design()
          })
          
        }),
        
        b: State.design({
          
          initialSubstate: HistoryState.extend({
            isRecursive: true,
            defaultState: 'e'
          }),
          
          e: State.design({
            initialSubstate: 'k',
            
            k: State.design(),
            l: State.design()
          }),
          
          f: State.design({
            initialSubstate: 'm',
            
            m: State.design(),
            n: State.design()
          })
          
        })
      
      })
      
    });
    
    statechart.initStatechart();
    
  },  
  
  afterEach: function() {
    //statechart = null;
  }
});

test("check initial substate after statechart init", function (assert) {
  var monitor = statechart.get('monitor'),
      root = statechart.get('rootState'),
      a = statechart.getState('a'),
      b = statechart.getState('b'),
      c = statechart.getState('c'),
      d = statechart.getState('d'),
      e = statechart.getState('e'),
      f = statechart.getState('f'),
      g = statechart.getState('g'),
      h = statechart.getState('h'),
      i = statechart.getState('i'),
      j = statechart.getState('j'),
      k = statechart.getState('k'),
      l = statechart.getState('l'),
      m = statechart.getState('m'),
      n = statechart.getState('n'),
      aInitSubstate = a.get('initialSubstate'),
      bInitSubstate = b.get('initialSubstate');
  
  assert.equal(monitor.get('length'), 4, 'initial state sequence should be of length 3');
  assert.equal(monitor.matchSequence().begin().entered(root, a, c, g).end(), true, 'initial sequence should be entered[root, a, c, g]');
      
  assert.equal(root.get('initialSubstate'), a, "root state's initial substate should be state a");
  assert.equal(c.get('initialSubstate'), g, "c state's initial substate should be state g");
  assert.equal(d.get('initialSubstate'), i, "d state's initial substate should be state i");
  assert.equal(e.get('initialSubstate'), k, "e state's initial substate should be state k");
  assert.equal(f.get('initialSubstate'), m, "f state's initial substate should be state m");

  assert.equal(SC.kindOf(aInitSubstate, HistoryState), true, "a state's initial substate should be of type HistoryState");
  assert.equal(aInitSubstate.get('isRecursive'), false, "a's initial substate should not be recursive");
  assert.equal(aInitSubstate.get('defaultState'), c, "a's initial substate should have default state c");
  assert.equal(aInitSubstate.get('statechart'), statechart, "a's initial substate should have an assigned statechart");
  assert.equal(aInitSubstate.get('parentState'), a, "a's initial substate should have parent state a");
  assert.equal(aInitSubstate.get('state'), c, "a's initial substate state should be state c");

  assert.equal(SC.kindOf(bInitSubstate, HistoryState), true, "b state's initial substate should be of type HistoryState");
  assert.equal(bInitSubstate.get('isRecursive'), true, "b's initial substate should be recursive");
  assert.equal(bInitSubstate.get('defaultState'), e, "b's initial substate should have default state e");
  assert.equal(bInitSubstate.get('statechart'), statechart, "b's initial substate should have an assigned statechart");
  assert.equal(bInitSubstate.get('parentState'), b, "b's initial substate should have parent state b");
  assert.equal(bInitSubstate.get('state'), e, "b's initial substate state should be state e");
  
  assert.equal(a.get('historyState'), c);
  assert.equal(b.get('historyState'), null);
});

test("check state sequence after going to state b", function (assert) {
  var monitor = statechart.get('monitor'),
      root = statechart.get('rootState'),
      b = statechart.getState('b'),
      e = statechart.getState('e');

  monitor.reset();
  
  statechart.gotoState('b');
  
  assert.equal(b.get('historyState'), e);  
  assert.equal(b.getPath('initialSubstate.state'), e);
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence()
                  .begin()
                  .exited('g', 'c', 'a')
                  .entered('b', 'e', 'k')
                  .end(), true,
        'sequence should be exited[g, c, a], entered[b, e, k]');
});

test("check state sequence with state a's historyState assigned", function (assert) {
  var monitor = statechart.get('monitor'),
      root = statechart.get('rootState'),
      a = statechart.getState('a'),
      b = statechart.getState('b'),
      c = statechart.getState('c'),
      d = statechart.getState('d'),
      e = statechart.getState('e'),
      f = statechart.getState('f'),
      g = statechart.getState('g'),
      h = statechart.getState('h'),
      i = statechart.getState('i'),
      j = statechart.getState('j'),
      k = statechart.getState('k'),
      l = statechart.getState('l'),
      m = statechart.getState('m'),
      n = statechart.getState('n');
  
  statechart.gotoState('j');
  
  assert.equal(a.get('historyState'), d);
  assert.equal(d.get('historyState'), j);
  
  assert.equal(a.getPath('initialSubstate.state'), d);
  
  statechart.gotoState('b');
  
  monitor.reset();
  
  statechart.gotoState('a');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence()
                  .begin()
                  .exited(k, e, b)
                  .entered(a, d, i)
                  .end(), true,
        'sequence should be exited[k, e, b], entered[a, d, i]');
  
});

test("check state sequence with state b's historyState assigned", function (assert) {
  var monitor = statechart.get('monitor'),
      root = statechart.get('rootState'),
      b = statechart.getState('b'),
      f = statechart.getState('f'),
      n = statechart.getState('n');
  
  statechart.gotoState('n');
  
  assert.equal(b.get('historyState'), f);
  assert.equal(f.get('historyState'), n);
  
  assert.equal(b.getPath('initialSubstate.state'), f);
  
  statechart.gotoState('a');
  
  monitor.reset();
  
  statechart.gotoState('b');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence()
                  .begin()
                  .exited('g', 'c', 'a')
                  .entered('b', 'f', 'n')
                  .end(), true,
        'sequence should be exited[g, c, a], entered[b, f, n]');
});