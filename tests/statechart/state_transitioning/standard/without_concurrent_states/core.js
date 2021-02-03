// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart = null;
var root, stateA, stateB, stateC, stateD, stateE, stateF, stateG, stateH; 
var stateI, stateJ, stateK, stateL, stateM, stateN, monitor;
var allState;

module("Statechart: No Concurrent States - Goto State Tests", {
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
    
    monitor = statechart.get('monitor');
    root = statechart.get('rootState');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
    stateE = statechart.getState('e');
    stateF = statechart.getState('f');
    stateG = statechart.getState('g');
    stateH = statechart.getState('h');
    stateI = statechart.getState('i');
    stateJ = statechart.getState('j');
    stateK = statechart.getState('k');
    stateL = statechart.getState('l');
    stateM = statechart.getState('m');
    stateN = statechart.getState('n');
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = monitor = root = null;
    stateA = stateB = stateC = stateD = stateE = stateF = stateG = stateH = stateI = stateJ = null;
    stateK = stateL = stateM = stateN = null;
  }
});

test("check statechart state objects", function (assert) {
  assert.equal(SC.none(stateG), false, 'statechart should return a state object for state with name "g"');
  assert.equal(stateG.get('name'), 'g', 'state g should have name "g"');
  assert.equal(stateG.get('isCurrentState'), true, 'state G should be current state');
  assert.equal(stateG.stateIsCurrentSubstate('g'), true, 'state g should have current substate g');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'statechart should have current state g');
  assert.equal(statechart.stateIsCurrentState(stateG), true, 'statechart should have current state g');
  
  assert.equal(SC.none(stateM), false, 'statechart should return a state object for state with name "m"');
  assert.equal(stateM.get('name'), 'm', 'state m should have name "m"');
  assert.equal(stateM.get('isCurrentState'), false, 'state m should not be current state');
  assert.equal(stateG.stateIsCurrentSubstate('m'), false, 'state m should not have current substate m');
  assert.equal(statechart.stateIsCurrentState('m'), false, 'statechart should not have current state m');
  assert.equal(statechart.stateIsCurrentState(stateM), false, 'statechart should not have current state m');
  
  assert.equal(SC.none(stateA), false, 'statechart should return a state object for state with name "a"');
  assert.equal(stateA.get('isCurrentState'), false, 'state m should not be current state');
  assert.equal(stateA.stateIsCurrentSubstate('a'), false, 'state a should not have current substate g');
  assert.equal(stateA.stateIsCurrentSubstate('c'), false, 'state a should not have current substate c');
  assert.equal(stateA.stateIsCurrentSubstate('g'), true, 'state a should have current substate g');
  assert.equal(stateA.stateIsCurrentSubstate(stateG), true, 'state a should have current substate g');
  assert.equal(stateA.stateIsCurrentSubstate(stateM), false, 'state a should not have current substate m');
  
  var stateX = statechart.getState('x');
  assert.equal(SC.none(stateX), true, 'statechart should not have a state with name "x"');
});

test("check statechart initialization", function (assert) {
  assert.equal(monitor.get('length'), 4, 'initial state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin().entered(root, 'a', 'c', 'g').end(), true, 'initial sequence should be entered[ROOT, a, c, g]');
  assert.equal(monitor.matchSequence().begin().entered(root, 'a', 'c', 'h').end(), false, 'initial sequence should not be entered[ROOT, a, c, h]');
  
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'g'), 'states root, A, C and G should all be entered');
});

test("go to state h", function (assert) {
  monitor.reset();
  statechart.gotoState('h');
  
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('g').entered('h').end(), true, 'sequence should be exited[g], entered[h]');
  assert.equal(monitor.matchSequence().begin().exited('h').entered('g').end(), false, 'sequence should not be exited[h], entered[g]');
  
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('h'), true, 'current state should be h');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'h'), 'states root, A, C and H should all be entered');
});

test("go to states: h, d", function (assert) {
  statechart.gotoState('h');
  
  monitor.reset();
  statechart.gotoState('d');
  
  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin().exited('h', 'c').entered('d', 'i').end(), true, 'sequence should be exited[h, c], entered[d, i]');
  assert.equal(monitor.matchSequence().begin().exited('h', 'c').entered('d', 'f').end(), false, 'sequence should not be exited[h, c], entered[d, f]');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c').entered('d', 'i').end(), false, 'sequence should not be exited[g, c], entered[d, f]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('i'), true, 'current state should be i');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'd', 'i'), 'states root, A, D and I should all be entered');
});

test("go to states: h, d, h", function (assert) {
  statechart.gotoState('h');
  statechart.gotoState('d');
  
  monitor.reset();
  statechart.gotoState('h');
  
  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin().exited('i', 'd').entered('c', 'h').end(), true, 'sequence should be exited[i, d], entered[c, h]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('h'), true, 'current state should be h');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'h'), 'states root, A, C and H should all be entered');
});

test("go to state b", function (assert) {
  monitor.reset();
  statechart.gotoState('b');
  
  assert.equal(monitor.get('length'), 6, 'state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'e', 'k').end(), true, 'sequence should be exited[g, c, a], entered[b, e, k]');
  assert.equal(monitor.matchSequence().begin().exited('g', 'a', 'c').entered('b', 'e', 'k').end(), false, 'sequence should not be exited[g, a, c], entered[b, e, k]');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'k', 'e').end(), false, 'sequence should not be exited[g, c, a], entered[b, k, e]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('k'), true, 'current state should be k');
  
  assert.ok(monitor.matchEnteredStates(root, 'b', 'e', 'k'), 'states root, B, E and K should all be entered');
});

test("go to state f", function (assert) {
  monitor.reset();
  statechart.gotoState('f');
  
  assert.equal(monitor.get('length'), 6, 'state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'm').end(), true, 'sequence should be exited[g, c, a], entered[b, f, m]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('m'), true, 'current state should be m');
  
  assert.ok(monitor.matchEnteredStates(root, 'b', 'f', 'm'), 'states root, B, F and M should all be entered');
});

test("go to state n", function (assert) {
  monitor.reset();
  statechart.gotoState('n');
  
  assert.equal(monitor.get('length'), 6, 'state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'n').end(), true, 'sequence should be exited[g, c, a], entered[b, f, n]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('n'), true, 'current state should be n');
  
  assert.ok(monitor.matchEnteredStates(root, 'b', 'f', 'n'), 'states root, B, F and N should all be entered');
});

test("re-enter state g", function (assert) {
  monitor.reset();
  statechart.gotoState('g');
  
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('g').entered('g').end(), true, 'sequence should be exited[g], entered[g]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  monitor.reset();
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0 after monitor reset');
  
  var state = statechart.getState('g');
  state.reenter();
  
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('g').entered('g').end(), true, 'sequence should be exited[g], entered[g]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'g'), 'states root, A, C and G should all be entered');
}); 

test("go to g state's ancestor state a", function (assert) {
  monitor.reset();
  statechart.gotoState('a');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('a', 'c', 'g').end(), true, 'sequence should be exited[g, c, a], entered[a, c, g]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'g'), 'states root, A, C and G should all be entered');
});

test("go to state b and then go to root state", function (assert) {
  statechart.gotoState('b');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('k'), true, 'current state should be k');
  
  monitor.reset();
  statechart.gotoState(statechart.get('rootState'));
  
  var root = statechart.get('rootState');
  assert.equal(monitor.get('length'), 8, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('k', 'e', 'b', root).entered(root, 'a', 'c', 'g').end(), 
        true, 'sequence should be exited[k, e, b, ROOT], entered[ROOT, a, c, g]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('g'), true, 'current state should be g');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'c', 'g'), 'states root, A, C and G should all be entered');
});

test("from state g, go to state m calling state g\'s gotoState", function (assert) {
  assert.equal(stateG.get('isCurrentState'), true, 'state g should be current state');
  assert.equal(stateM.get('isCurrentState'), false, 'state m should not be current state');
  
  monitor.reset();
  stateG.gotoState('m');
  
  assert.equal(monitor.get('length'), 6, 'initial state sequence should be of length 6');
  assert.equal(monitor.matchSequence().begin().exited('g', 'c', 'a').entered('b', 'f', 'm').end(), 
        true, 'sequence should be exited[g, c, a], entered[b, f, m]');
  assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
  assert.equal(statechart.stateIsCurrentState('m'), true, 'current state should be m');
  
  assert.equal(stateG.get('isCurrentState'), false, 'state g should not be current state');
  assert.equal(stateM.get('isCurrentState'), true, 'state m should be current state');
  
  assert.ok(monitor.matchEnteredStates(root, 'b', 'f', 'm'), 'states root, B, F and M should all be entered');
});

test("from state g, go to state h using 'parentState' syntax", function (assert) {
  monitor.reset();
  stateG.gotoState('h');
  
  assert.equal(monitor.matchSequence().begin().exited('g').entered('h').end(), 
    true, 'sequence should be exited[g], entered[h]');
});