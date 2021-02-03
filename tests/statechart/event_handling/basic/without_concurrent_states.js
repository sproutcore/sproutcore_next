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

module("Statechart: No Concurrent States - Send Event Tests", {
  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
        
          initialSubstate: 'c',
          
          eventB: function() {
            this.gotoState('b');
          },
          
          c: State.design({
            eventA: function() { this.gotoState('d'); }
          }),
          
          d: State.design({
            sender: null,
            context: null,
            eventC: function(sender, context) {
              this.set('sender', sender);
              this.set('context', context);
              this.gotoState('f');
            }
          })
          
        }),
        
        b: State.design({
          
          initialSubstate: 'e',
          
          e: State.design(),
          
          f: State.design()
          
        })
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
  }
});

test("send event eventA while in state C", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.sendEvent('eventA');
  
  assert.equal(monitor.get('length'), 2, 'state sequence should be of length 2');
  assert.equal(monitor.matchSequence().begin().exited('c').entered('d').end(), true, 'sequence should be exited[c], entered[d]');
  assert.equal(statechart.stateIsCurrentState('d'), true, 'current state should be d');
});

test("send event eventB while in parent state A", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.sendEvent('eventB');
  
  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin().exited('c', 'a').entered('b', 'e').end(), true, 'sequence should be exited[c, a], entered[b, e]');
  assert.equal(statechart.stateIsCurrentState('e'), true, 'current state should be e');
});

test("send event eventC while in state D", function (assert) {
  var monitor = statechart.get('monitor'),
      stateD = statechart.getState('d');
  
  statechart.gotoState('d');
  
  monitor.reset();
  
  statechart.sendEvent('eventC', statechart, 'foobar');
  
  assert.equal(monitor.get('length'), 4, 'state sequence should be of length 4');
  assert.equal(monitor.matchSequence().begin().exited('d', 'a').entered('b', 'f').end(), true, 'sequence should be exited[d, a], entered[b, f]');
  assert.equal(statechart.stateIsCurrentState('f'), true, 'current state should be f');
  assert.equal(stateD.get('sender'), statechart);
  assert.equal(stateD.get('context'), 'foobar');
});

test("send event eventC while in state C", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.sendEvent('eventC');
  
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0');
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
});

test("send event eventD while in state C", function (assert) {
  var monitor = statechart.get('monitor');
  monitor.reset();
  statechart.sendEvent('eventD');
  
  assert.equal(monitor.get('length'), 0, 'state sequence should be of length 0');
  assert.equal(statechart.stateIsCurrentState('c'), true, 'current state should be c');
});