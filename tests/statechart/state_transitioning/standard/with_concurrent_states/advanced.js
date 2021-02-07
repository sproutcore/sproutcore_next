// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC */


import { Async, Statechart, State, EmptyState } from '../../../../../statechart/statechart.js';



var statechart = null;
var monitor, root, stateA, stateB, stateC, stateD, stateE, stateF, stateG;
var stateH, stateI, stateJ, stateK, stateL, stateM, stateN, stateO, stateP;
var stateQ, stateR, stateS, stateZ;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: With Concurrent States - Goto State Advanced Tests", {
  beforeEach: function() {
    
    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',

        a: State.design({
          substatesAreConcurrent: true,
          
          b: State.design({
            initialSubstate: 'd',
            d: State.design(),
            e: State.design()
          }),
          
          c: State.design({
            
            initialSubstate: 'f',
            
            f: State.design({
              substatesAreConcurrent: true,

              h: State.design({
                initialSubstate: 'l',
                l: State.design(),
                m: State.design()
              }),
              
              i: State.design({
                initialSubstate: 'n',
                n: State.design(),
                o: State.design()
              })
            }),
            
            g: State.design({
              substatesAreConcurrent: true,

              j: State.design({
                initialSubstate: 'p',
                p: State.design(),
                q: State.design()
              }),
              
              k: State.design({
                initialSubstate: 'r',
                r: State.design(),
                s: State.design()
              })
            })
          
          })
        }),

        z: State.design()
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
    stateO = statechart.getState('o');
    stateP = statechart.getState('p');
    stateQ = statechart.getState('q');
    stateR = statechart.getState('r');
    stateS = statechart.getState('s');
    stateZ = statechart.getState('z');
  },
  
  afterEach: function() {
    statechart.destroy();
    monitor = root = stateA = stateB = stateC = stateD = stateE = stateF = stateG = null;
    stateH = stateI = stateJ = stateK = stateL = stateM = stateN = stateO = stateP = null;
    stateQ = stateR = stateS = stateZ = null;
  }
});

test("check statechart initialization", function (assert) {
  assert.equal(monitor.get('length'), 10, 'initial state sequence should be of length 10');
  assert.equal(monitor.matchSequence().begin()
                                  .entered(root, 'a')
                                  .beginConcurrent()
                                    .beginSequence()
                                      .entered('b', 'd')
                                    .endSequence()
                                    .beginSequence()
                                      .entered('c', 'f')
                                      .beginConcurrent()
                                        .beginSequence()
                                          .entered('h', 'l')
                                        .endSequence()
                                        .beginSequence()
                                          .entered('i', 'n')
                                        .endSequence()
                                      .endConcurrent()
                                    .endSequence()
                                  .endConcurrent()
                                  .entered()
                                .end(), 
    true, 'initial sequence should be entered[ROOT, a, b, d, c, f, h, l, i, n]');
  
  assert.equal(statechart.get('currentStateCount'), 3, 'current state count should be 3');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('l'), true, 'current state should be l');
  assert.equal(statechart.stateIsCurrentState('n'), true, 'current state should be n');
  
  assert.equal(statechart.stateIsCurrentState('h'), false, 'current state should not be h');
  assert.equal(statechart.stateIsCurrentState('i'), false, 'current state should not be i');
  assert.equal(statechart.stateIsCurrentState('p'), false, 'current state should not be p');
  assert.equal(statechart.stateIsCurrentState('q'), false, 'current state should not be q');
  assert.equal(statechart.stateIsCurrentState('r'), false, 'current state should not be r');
  assert.equal(statechart.stateIsCurrentState('s'), false, 'current state should not be s');
  
  assert.equal(stateA.getPath('currentSubstates.length'), 3, 'state a should have 3 current substates');
  assert.equal(stateA.stateIsCurrentSubstate('d'), true, 'state a\'s current substate should be state d');
  assert.equal(stateA.stateIsCurrentSubstate('l'), true, 'state a\'s current substate should be state l');
  assert.equal(stateA.stateIsCurrentSubstate('n'), true, 'state a\'s current substate should be state n');
  
  assert.equal(stateC.getPath('currentSubstates.length'), 2, 'state a should have 2 current substates');
  assert.equal(stateC.stateIsCurrentSubstate('l'), true, 'state c\'s current substate should be state l');
  assert.equal(stateC.stateIsCurrentSubstate('n'), true, 'state c\'s current substate should be state n');
  
  assert.equal(stateF.getPath('currentSubstates.length'), 2, 'state f should have 2 current substates');
  assert.equal(stateF.stateIsCurrentSubstate('l'), true, 'state f\'s current substate should be state l');
  assert.equal(stateF.stateIsCurrentSubstate('n'), true, 'state f\'s current substate should be state n');
  
  assert.equal(stateG.getPath('currentSubstates.length'), 0, 'state g should have no current substates');  
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'b', 'd', 'c', 'f', 'h', 'i', 'l', 'n'), 'states root, A, B, C, D, F, H, I, L and N should all be entered');
});

test("from state l, go to state g", function (assert) {
  monitor.reset();
  stateL.gotoState('g');
  
  assert.equal(monitor.get('length'), 10, 'initial state sequence should be of length 10');
  assert.equal(monitor.matchSequence().begin()
                  .beginConcurrent()
                    .beginSequence()
                      .exited('l', 'h')
                    .endSequence()
                    .beginSequence()
                      .exited('n', 'i')
                    .endSequence()
                  .endConcurrent()
                  .exited('f')
                  .entered('g')
                  .beginConcurrent()
                    .beginSequence()
                      .entered('j', 'p')
                    .endSequence()
                    .beginSequence()
                      .entered('k', 'r')
                    .endSequence()
                  .endConcurrent()
                .end(), 
         true, 'initial sequence should be exited[l, h, n, i, f], entered[g, j, p, k, r]');
  
  assert.equal(statechart.get('currentStateCount'), 3, 'current state count should be 3');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
  assert.equal(statechart.stateIsCurrentState('l'), false, 'current state should not be l');
  assert.equal(statechart.stateIsCurrentState('n'), false, 'current state should not be n');
  assert.equal(statechart.stateIsCurrentState('p'), true, 'current state should be p');
  assert.equal(statechart.stateIsCurrentState('r'), true, 'current state should be r');
  
  assert.equal(stateA.getPath('currentSubstates.length'), 3, 'state a should have 3 current substates');
  assert.equal(stateA.stateIsCurrentSubstate('d'), true, 'state a\'s current substate should be state d');
  assert.equal(stateA.stateIsCurrentSubstate('p'), true, 'state a\'s current substate should be state p');
  assert.equal(stateA.stateIsCurrentSubstate('r'), true, 'state a\'s current substate should be state r');
  
  assert.equal(stateC.getPath('currentSubstates.length'), 2, 'state a should have 2 current substates');
  assert.equal(stateC.stateIsCurrentSubstate('p'), true, 'state c\'s current substate should be state p');
  assert.equal(stateC.stateIsCurrentSubstate('r'), true, 'state c\'s current substate should be state r');
  
  assert.equal(stateF.getPath('currentSubstates.length'), 0, 'state f should have no current substates');
  
  assert.equal(stateG.getPath('currentSubstates.length'), 2, 'state g should have 2 current substates');
  assert.equal(stateG.stateIsCurrentSubstate('p'), true, 'state g\'s current substate should be state p');
  assert.equal(stateG.stateIsCurrentSubstate('r'), true, 'state g\'s current substate should be state r');
  
  assert.ok(monitor.matchEnteredStates(root, 'a', 'b', 'd', 'c', 'g', 'j', 'k', 'p', 'r'), 'states root, A, B, C, D, G, J, K, P and R should all be entered');
});

test('from state l, go to state z', function() {
  monitor.reset();
  stateL.gotoState('z');
  
  assert.equal(monitor.get('length'), 10, 'initial state sequence should be of length 10');
  assert.equal(monitor.matchSequence()
                .begin()
                .exited('l', 'h', 'n', 'i', 'f', 'c', 'd', 'b', 'a')
                .entered('z')
                .end(), 
         true, 'sequence should be exited[l, h, n, i, f, c, d, b, a], entered[z]');
         
   assert.equal(statechart.get('currentStateCount'), 1, 'current state count should be 1');
   assert.equal(statechart.stateIsCurrentState('z'), true, 'current state should be z');
   assert.equal(statechart.stateIsCurrentState('l'), false, 'current state should not be l');
   assert.equal(statechart.stateIsCurrentState('n'), false, 'current state should not be n');
   assert.equal(statechart.stateIsCurrentState('d'), false, 'current state should not be d');
   
   assert.equal(stateA.getPath('currentSubstates.length'), 0, 'state a should have no current substates');
   assert.equal(stateB.getPath('currentSubstates.length'), 0, 'state b should have no current substates');
   assert.equal(stateC.getPath('currentSubstates.length'), 0, 'state c should have no current substates');
   assert.equal(stateF.getPath('currentSubstates.length'), 0, 'state f should have no current substates');
   assert.equal(stateG.getPath('currentSubstates.length'), 0, 'state g should have no current substates');
   
   assert.ok(monitor.matchEnteredStates(root, 'z'), 'states root and Z should all be entered');
});

test('from state l, go to state z, and then go to state s', function() {
  stateL.gotoState('z');
  
  monitor.reset();
  stateZ.gotoState('s');
  
  assert.equal(monitor.get('length'), 10, 'initial state sequence should be of length 10');
  assert.equal(monitor.matchSequence()
                .begin()
                .exited('z')
                .entered('a', 'c', 'g', 'k', 's', 'j', 'p', 'b', 'd')
                .end(), 
         true, 'sequence should be exited[z], entered[a, c, g, k, s, j, p, b, d]');
         
   assert.equal(statechart.get('currentStateCount'), 3, 'current state count should be 1');
   assert.equal(statechart.stateIsCurrentState('z'), false, 'current state should not be z');
   assert.equal(statechart.stateIsCurrentState('s'), true, 'current state should be s');
   assert.equal(statechart.stateIsCurrentState('p'), true, 'current state should be p');
   assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
   
   assert.equal(stateA.getPath('currentSubstates.length'), 3, 'state a should have 3 current substates');
   assert.equal(stateB.getPath('currentSubstates.length'), 1, 'state b should have 1 current substates');
   assert.equal(stateC.getPath('currentSubstates.length'), 2, 'state c should have 2 current substates');
   assert.equal(stateF.getPath('currentSubstates.length'), 0, 'state f should have no current substates');
   assert.equal(stateG.getPath('currentSubstates.length'), 2, 'state g should have 2 current substates');
   
   assert.ok(monitor.matchEnteredStates(root, 'a', 'b', 'd', 'c', 'g', 'j', 'k', 'p', 's'), 'states root, A, B, C, D, G, J, K, P and S should all be entered');
});