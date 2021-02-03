// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart;

// ..........................................................
// CONTENT CHANGING
// 

module("Statechart: No Concurrent States - Transient State Transition Tests", {
  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
        
          initialSubstate: 'b',
                    
          b: State.design({
            eventC: function() { this.gotoState('c'); },
            eventD: function() { this.gotoState('d'); },
            eventE: function() { this.gotoState('e'); },
            eventX: function() { this.gotoState('x'); }
          }),
          
          c: State.design({
            enterState: function() { this.gotoState('z'); }
          }),
          
          d: State.design({
            enterState: function() { this.gotoState('c'); }
          }),
          
          e: State.design({
            enterState: function() { this.gotoState('f'); }
          }),
          
          f: State.design(),
          
          g: State.design({
            
            initialSubstate: 'x',
            
            foo: function() { /* no-op */ },
            
            enterState: function() {
              return this.performAsync('foo');
            },
            
            x: State.design({
              enterState: function() { this.gotoState('h'); }
            })
  
          }),
          
          h: State.design()
          
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

test("enter transient state C", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateC = statechart.getState('c');

  monitor.reset();
  statechart.sendEvent('eventC');
  
  assert.equal(monitor.get('length'), 5, 'state sequence should be of length 5');
  assert.equal(monitor.matchSequence()
          .begin()
            .exited('b')
            .entered('c')
            .exited('c', 'a')
            .entered('z')
          .end(), true, 
        'sequence should be exited[b], entered[c], exited[c, a], entered[z]');
  assert.equal(statechart.stateIsCurrentState('z'), true, 'current state should be z');
  
  assert.equal(stateA.get('historyState'), stateC);
});

test("enter transient state D", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateC = statechart.getState('c');

  monitor.reset();
  statechart.sendEvent('eventD');
  
  assert.equal(monitor.get('length'), 7, 'state sequence should be of length 7');
  assert.equal(monitor.matchSequence()
          .begin()
            .exited('b')
            .entered('d')
            .exited('d')
            .entered('c')
            .exited('c', 'a')
            .entered('z')
          .end(), true, 
        'sequence should be exited[b], entered[d], exited[d], entered[c], exited[c, a], entered[z]');
  assert.equal(statechart.stateIsCurrentState('z'), true, 'current state should be z');
  
  assert.equal(stateA.get('historyState'), stateC);
});

test("enter transient state X", function (assert) {
  var monitor = statechart.get('monitor'),
      stateA = statechart.getState('a'),
      stateH = statechart.getState('h');

  monitor.reset();
  statechart.sendEvent('eventX');
  
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence()
          .begin()
            .exited('b')
            .entered('g')
          .end(), true, 
        'sequence should be exited[b], entered[g]');
  assert.equal(statechart.get('gotoStateActive'), true, 'statechart should be in active goto state');
  assert.equal(statechart.get('gotoStateSuspended'), true, 'statechart should have a suspended, active goto state');
  
  statechart.resumeGotoState();
  
  assert.equal(monitor.get('length'), 6, 'state sequence should be of length 6');
  assert.equal(monitor.matchSequence()
          .begin()
            .exited('b')
            .entered('g', 'x')
            .exited('x', 'g')
            .entered('h')
          .end(), true, 
        'sequence should be exited[b], entered[g, x], exited[x, g], entered[h]');
  assert.equal(statechart.get('gotoStateActive'), false, 'statechart should not be in active goto state');
  assert.equal(statechart.get('gotoStateSuspended'), false, 'statechart should not have a suspended, active goto state');
  
  assert.equal(stateA.get('historyState'), stateH);
});