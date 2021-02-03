// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async, Statechart, State, EmptyState } from '/statechart/statechart.js';


var statechart1 = null;
var statechart2 = null;
var statechart3 = null;
var statechart4 = null;
var TestState = null;

module("Ki.Statechart: No Concurrent States - Advanced Event Handling Tests", {
  beforeEach: function() {
    
    TestState = State.extend({
      event: null,
      sender: null,
      context: null,
      handler: null,
      
      _handledEvent: function(handler, event, sender, context) {
        this.set('handler', handler);
        this.set('event', event);
        this.set('sender', sender);
        this.set('context', context);
      },
      
      reset: function() {
        this.set('handler', null);
        this.set('event', null);
        this.set('sender', null);
        this.set('context', null);
      }
    });

    statechart1 = Statechart.create({
      
      rootState: TestState.design({
      
        foo: function(sender, context) {
          this._handledEvent('foo', null, sender, context);
        },
        
        eventHandlerA: function(event, sender, context) {
          this._handledEvent('eventHandlerA', event, sender, context);
        }.handleEvents('plus', 'minus', 'mulitply', 'divide'),
        
        eventHandlerB: function(event, sender, context) {
          this._handledEvent('eventHandlerB', event, sender, context);
        }.handleEvents(/num\d/),
        
        unknownEvent: function(event, sender, context) {
          this._handledEvent('unknownEvent', event, sender, context);
        }
        
      })
      
    });
    
    statechart2 = Statechart.create({
      
      rootState: TestState.design({
        
        foo: function(sender, context) {
          this._handledEvent('foo', null, sender, context);
        }
        
      })
      
    });
    
    statechart3 = Statechart.create({
      
      rootState: TestState.design({
        
        eventHandlerA: function(event, sender, context) {
          this._handledEvent('eventHandlerA', event, sender, context);
        }.handleEvents(/num\d/, 'decimal'),
        
        eventHandlerB: function(event, sender, context) {
          this._handledEvent('eventHandlerB', event, sender, context);
        }.handleEvents(/foo/, /bar/)
        
      })
      
    });
    
    statechart4 = Statechart.create({
      
      rootState: TestState.design({
        
        initialSubstate: 'a',
        
        foo: function(sender, context) {
          this._handledEvent('foo', null, sender, context);
        },
        
        eventHandlerRoot: function(event, sender, context) {
          this._handledEvent('eventHandlerRoot', event, sender, context);
        }.handleEvents('yes', 'no'),
        
        unknownEvent: function(event, sender, context) {
          this._handledEvent('unknownEvent', event, sender, context);
        },
        
        a: TestState.design({
          
          initialSubstate: 'b',
          
          bar: function(sender, context) {
            this._handledEvent('bar', null, sender, context);
          },
          
          eventHandlerA: function(event, sender, context) {
            this._handledEvent('eventHandlerA', event, sender, context);
          }.handleEvents('frozen', 'canuck'),
          
          b: TestState.design({
            
            cat: function(sender, context) {
              this._handledEvent('cat', null, sender, context);
            },
            
            eventHandlerB: function(event, sender, context) {
              this._handledEvent('eventHandlerB', event, sender, context);
            }.handleEvents(/apple/, /orange/)
            
          })
          
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
    statechart1 = null;
    statechart2 = null;
    statechart3 = null;
    statechart4 = null;
  }
});

test("check statechart1 event handling", function (assert) {
  var state = statechart1.get('rootState'),
      sender = SC.Object.create(),
      context = SC.Object.create();
  
  state.reset();
  statechart1.sendEvent('foo', sender, context);
  assert.equal(state.get('handler'), 'foo', 'event handler should be foo');
  assert.equal(state.get('event'), null, 'event should be null');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
  
  state.reset();
  statechart1.sendEvent('plus', sender, context);
  assert.equal(state.get('handler'), 'eventHandlerA', 'event handler should be eventHandlerA');
  assert.equal(state.get('event'), 'plus', 'event should be plus');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
  
  state.reset();
  statechart1.sendEvent('divide', sender, context);
  assert.equal(state.get('handler'), 'eventHandlerA', 'event handler should be eventHandlerA');
  assert.equal(state.get('event'), 'divide', 'event should be divide');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
  
  state.reset();
  statechart1.sendEvent('num1', sender, context);
  assert.equal(state.get('handler'), 'eventHandlerB', 'event handler should be eventHandlerB');
  assert.equal(state.get('event'), 'num1', 'event should be num1');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
  
  state.reset();
  statechart1.sendEvent('bar', sender, context);
  assert.equal(state.get('handler'), 'unknownEvent', 'event handler should be unknownEvent');
  assert.equal(state.get('event'), 'bar', 'event should be bar');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
});

test("check statechart2 event handling", function (assert) {
  var state = statechart2.get('rootState'),
      sender = SC.Object.create(),
      context = SC.Object.create();
  
  state.reset();
  statechart2.sendEvent('foo', sender, context);
  assert.equal(state.get('handler'), 'foo', 'event handler should be foo');
  assert.equal(state.get('event'), null, 'event should be null');
  assert.equal(state.get('sender'), sender, 'sender should be sender object');
  assert.equal(state.get('context'), context, 'context should be context object');
  
  state.reset();
  statechart2.sendEvent('bar', sender, context);
  assert.equal(state.get('handler'), null, 'event handler should be null');
  assert.equal(state.get('event'), null, 'event should be null');
  assert.equal(state.get('sender'), null, 'sender should be sender null');
  assert.equal(state.get('context'), null, 'context should be context null');
});

test("check statechart3 event handling", function (assert) {
  var state = statechart3.get('rootState');
  
  state.reset();
  statechart3.sendEvent('num2');
  assert.equal(state.get('handler'), 'eventHandlerA', 'event handler should be eventHandlerA');
  assert.equal(state.get('event'), 'num2', 'event should be num2');
  
  state.reset();
  statechart3.sendEvent('decimal');
  assert.equal(state.get('handler'), 'eventHandlerA', 'event handler should be eventHandlerA');
  assert.equal(state.get('event'), 'decimal', 'event should be decimal');
  
  state.reset();
  statechart3.sendEvent('foo');
  assert.equal(state.get('handler'), 'eventHandlerB', 'event handler should be eventHandlerB');
  assert.equal(state.get('event'), 'foo', 'event should be foo');
  
  state.reset();
  statechart3.sendEvent('bar');
  assert.equal(state.get('handler'), 'eventHandlerB', 'event handler should be eventHandlerB');
  assert.equal(state.get('event'), 'bar', 'event should be bar');
});

test("check statechart4 event handling", function (assert) {
  var root = statechart4.get('rootState'),
      stateA = statechart4.getState('a'),
      stateB = statechart4.getState('b');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('foo');
  assert.equal(root.get('handler'), 'foo', 'root state event handler should be foo');
  assert.equal(root.get('event'), null, 'root state event should be null');
  assert.equal(stateA.get('handler'), null, 'state A event handler should be null');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), null, 'state B event handler should be null');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('yes');
  assert.equal(root.get('handler'), 'eventHandlerRoot', 'root state event handler should be eventHandlerRoot');
  assert.equal(root.get('event'), 'yes', 'root state event should be yes');
  assert.equal(stateA.get('handler'), null, 'state A event handler should be null');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), null, 'state B event handler should be null');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('xyz');
  assert.equal(root.get('handler'), 'unknownEvent', 'root state event handler should be unknownEvent');
  assert.equal(root.get('event'), 'xyz', 'root state event should be xyz');
  assert.equal(stateA.get('handler'), null, 'state A event handler should be null');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), null, 'state B event handler should be null');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('bar');
  assert.equal(root.get('handler'), null, 'root state event handler should be null');
  assert.equal(root.get('event'), null, 'root state event should be null');
  assert.equal(stateA.get('handler'), 'bar', 'state A event handler should be bar');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), null, 'state B event handler should be null');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('canuck');
  assert.equal(root.get('handler'), null, 'root state event handler should be null');
  assert.equal(root.get('event'), null, 'root state event should be null');
  assert.equal(stateA.get('handler'), 'eventHandlerA', 'state A event handler should be eventHandlerA');
  assert.equal(stateA.get('event'), 'canuck', 'state A event should be canuck');
  assert.equal(stateB.get('handler'), null, 'state B event handler should be null');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('cat');
  assert.equal(root.get('handler'), null, 'root state event handler should be null');
  assert.equal(root.get('event'), null, 'root state event should be null');
  assert.equal(stateA.get('handler'), null, 'state A event handler should be null');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), 'cat', 'state B event handler should be cat');
  assert.equal(stateB.get('event'), null, 'state B event should be null');
  
  root.reset(); stateA.reset(); stateB.reset();
  statechart4.sendEvent('orange');
  assert.equal(root.get('handler'), null, 'root state event handler should be null');
  assert.equal(root.get('event'), null, 'root state event should be null');
  assert.equal(stateA.get('handler'), null, 'state A event handler should be null');
  assert.equal(stateA.get('event'), null, 'state A event should be null');
  assert.equal(stateB.get('handler'), 'eventHandlerB', 'state B event handler should be eventHandlerB');
  assert.equal(stateB.get('event'), 'orange', 'state B event should be orange');
});