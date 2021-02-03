// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart = null;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: No Concurrent States - Goto History State Tests", {
  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
        
          initialSubstate: 'c',
          
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
          
          initialSubstate: 'e',
          
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
    statechart.destroy();
  }
});

test("check initial statechart history states", function (assert) {
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('a'), 'root state\'s history state should be state a');
  
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('c'), 'state a\'s history state should be state c');
  assert.equal(statechart.getState('c').get('historyState'), statechart.getState('g'), 'state c\'s history state should be state g');
  assert.equal(statechart.getState('g').get('historyState'), null, 'state g\'s history state should be null');
  
  assert.equal(statechart.getState('h').get('historyState'), null, 'state h\'s history state should be null');
  assert.equal(statechart.getState('d').get('historyState'), null, 'state d\'s history state should be null');

  assert.equal(statechart.getState('b').get('historyState'), null, 'state b\'s history state should be null');
  assert.equal(statechart.getState('e').get('historyState'), null, 'state e\'s history state should be null');
  assert.equal(statechart.getState('f').get('historyState'), null, 'state f\'s history state should be null');
});

test("go to state h and check history states", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  
  statechart.gotoState('h');
  assert.equal(monitor.matchSequence().begin().exited('g').entered('h').end(), true, 'sequence should be exited[f], entered[h]');
  
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('c'), 'state a\'s history state should be state c');
  assert.equal(statechart.getState('c').get('historyState'), statechart.getState('h'), 'state c\'s history state should be state h');
  assert.equal(statechart.getState('h').get('historyState'), null, 'state h\'s history state should be null');
  assert.equal(statechart.getState('g').get('historyState'), null, 'state g\'s history state should be null');
  
  assert.equal(statechart.getState('d').get('historyState'), null, 'state d\'s history state should be null');
  assert.equal(statechart.getState('b').get('historyState'), null, 'state b\'s history state should be null');
});

test("go to state d and check history states", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  
  statechart.gotoState('d');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c').entered('d', 'i').end(), true, 'sequence should be exited[g, c], entered[d, i]');
  
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('d'), 'state a\'s history state should be state d');
  assert.equal(statechart.getState('d').get('historyState'), statechart.getState('i'), 'state d\'s history state should be state i');
  assert.equal(statechart.getState('c').get('historyState'), statechart.getState('g'), 'state c\'s history state should be state g');
  assert.equal(statechart.getState('h').get('historyState'), null, 'state h\'s history state should be null');
  assert.equal(statechart.getState('g').get('historyState'), null, 'state g\'s history state should be null');
  assert.equal(statechart.getState('i').get('historyState'), null, 'state i\'s history state should be null');
  assert.equal(statechart.getState('j').get('historyState'), null, 'state j\'s history state should be null');
  
  assert.equal(statechart.getState('b').get('historyState'), null, 'state b\'s history state should be null');
});

test("go to state b and check history states", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  
  statechart.gotoState('b');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'e', 'k').end(), true, 'sequence should be exited[g, c, a], entered[b, e, k]');
  
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('b'), 'root state\'s history state should be state b');
  assert.equal(statechart.getState('b').get('historyState'), statechart.getState('e'), 'state b\'s history state should be e');
  assert.equal(statechart.getState('e').get('historyState'), statechart.getState('k'), 'state e\'s history state should be k');
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('c'), 'state a\'s history state should be state c');
  assert.equal(statechart.getState('c').get('historyState'), statechart.getState('g'), 'state c\'s history state should be state g');
});

test("go to state j, then state m, then go to state a's history state (non-recursive)", function (assert) {
  var monitor = statechart.get('monitor');
  
  statechart.gotoState('j');
  statechart.gotoState('m');

  monitor.reset();
  statechart.gotoHistoryState('a');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('m', 'f', 'b').entered('a', 'd', 'i').end(), true, 'sequence should be exited[m, f, b], entered[a, d, i]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('i'), true, 'current state should be i');
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('a'), 'root state\'s history state should be state a');
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('d'), 'state a\'s history state should be state d');
  assert.equal(statechart.getState('d').get('historyState'), statechart.getState('i'), 'state d\'s history state should be state i');
  
});

test("go to state j, then state m, then go to state a's history state (recursive)", function (assert) {
  var monitor = statechart.get('monitor');
  
  statechart.gotoState('j');
  statechart.gotoState('m');

  monitor.reset();
  statechart.gotoHistoryState('a', null, true);
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('m', 'f', 'b').entered('a', 'd', 'j').end(), true, 'sequence should be exited[m, f, b], entered[a, d, j]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('j'), true, 'current state should be j');
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('a'), 'root state\'s history state should be state a');
  assert.equal(statechart.getState('a').get('historyState'), statechart.getState('d'), 'state a\'s history state should be state d');
  assert.equal(statechart.getState('d').get('historyState'), statechart.getState('j'), 'state d\'s history state should be state j');
});


test("go to state b's history state (non-recursive)", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();

  statechart.gotoHistoryState('b');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'e', 'k').end(), true, 'sequence should be exited[g, c, a], entered[b, e, k]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('k'), true, 'current state should be k');
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('b'), 'root state\'s history state should be state b');
  assert.equal(statechart.getState('b').get('historyState'), statechart.getState('e'), 'state b\'s history state should be state e');
  assert.equal(statechart.getState('e').get('historyState'), statechart.getState('k'), 'state e\'s history state should be state k');
});

test("go to state b's history state (recursive)", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();

  statechart.gotoHistoryState('b', null, true);
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'e', 'k').end(), true, 'sequence should be exited[g, c, a], entered[b, e, k]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('k'), true, 'current state should be k');
  assert.equal(statechart.get('rootState').get('historyState'), statechart.getState('b'), 'root state\'s history state should be state b');
  assert.equal(statechart.getState('b').get('historyState'), statechart.getState('e'), 'state b\'s history state should be state e');
  assert.equal(statechart.getState('e').get('historyState'), statechart.getState('k'), 'state e\'s history state should be state k');
});