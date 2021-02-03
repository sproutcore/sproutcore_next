// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { SC } from '/core/core.js';
import { Statechart, State } from '/statechart/statechart.js';


var sc, root, foo, bar;

module("State: addSubstate method Tests", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      
      stateWillTryToHandleEvent: function stateWillTryToHandleEvent(state, event, handler) {
        stateWillTryToHandleEvent.base.apply(this, arguments);
        this.stateWillTryToHandleEventInfo = {
          state: state,
          event: event,
          handler: handler
        };
      },

      stateDidTryToHandleEvent: function stateDidTryToHandleEvent (state, event, handler, handled) {
        stateDidTryToHandleEvent.base.apply(this, arguments);
        this.stateDidTryToHandleEventInfo = {
          state: state,
          event: event,
          handler: handler,
          handled: handled
        };
      },
      
      initialState: 'foo',
      
      foo: State.design({
        
        eventHandlerReturnValue: true,
        
        _notifyHandledEvent: function(handler, event, arg1, arg2) {
          this.handledEventInfo = {
            handler: handler,
            event: event,
            arg1: arg1,
            arg2: arg2
          };
        },
        
        eventHandler1: function(arg1, arg2) {
          this._notifyHandledEvent('eventHandler1', 'eventHandler1', arg1, arg2);
          return this.get('eventHandlerReturnValue');
        },
        
        eventHandler2: function(event, arg1, arg2) {
          this._notifyHandledEvent('eventHandler2', event, arg1, arg2);
          return this.get('eventHandlerReturnValue');
        }.handleEvents('test1'),
        
        eventHandler3: function(event, arg1, arg2) {
          this._notifyHandledEvent('eventHandler3', event, arg1, arg2);
          return this.get('eventHandlerReturnValue');
        }.handleEvents(/^digit[0-9]$/),
        
        unknownEvent: function(event, arg1, arg2) {
          this._notifyHandledEvent('unknownEvent', event, arg1, arg2);
          return this.get('eventHandlerReturnValue');
        }
        
      })
      
    });
    
    sc.initStatechart();
    foo = sc.getState('foo');
  },
  
  afterEach: function() {
    sc = foo = null;
  }
  
});

test("try to invoke state foo's eventHandler1 event handler", function (assert) {
  
  var ret = foo.tryToHandleEvent('eventHandler1', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, true, 'foo.tryToHandleEvent should return true');
  assert.ok(info, 'foo.handledEventInfo should not be null');
  assert.equal(info.handler, 'eventHandler1', 'foo.eventHandler1 should have been invoked');
  assert.equal(info.arg1, 100, 'foo.eventHandler1 should handle event 100');
  assert.equal(info.arg2, 200, 'foo.eventHandler1 should handle event 200');

  info = sc.stateWillTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateWillTryToHandleEvent should have been invoked');
  assert.equal(info.state, foo, 'sc.stateWillTryToHandleEvent should have been passed state foo');
  assert.equal(info.event, 'eventHandler1', 'sc.stateWillTryToHandleEvent should have been passed event eventHandler1');
  assert.equal(info.handler, 'eventHandler1', 'sc.stateWillTryToHandleEvent should have been passed handler eventHandler1');
  
  info = sc.stateDidTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateDidTryToHandleEventInfo should have been invoked');
  assert.equal(info.state, foo, 'sc.stateDidTryToHandleEventInfo should have been passed state foo');
  assert.equal(info.event, 'eventHandler1', 'sc.stateDidTryToHandleEventInfo should have been passed event eventHandler1');
  assert.equal(info.handler, 'eventHandler1', 'sc.stateDidTryToHandleEventInfo should have been passed handler eventHandler1');
  assert.equal(info.handled, true, 'sc.stateDidTryToHandleEventInfo should have been passed handled true');
  
});

test("try to invoke state foo's eventHandler2 event handler", function (assert) {
  
  var ret = foo.tryToHandleEvent('test1', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, true, 'foo.tryToHandleEvent should return true');
  assert.ok(info, 'foo.handledEventInfo should not be null');
  assert.equal(info.handler, 'eventHandler2', 'foo.eventHandler2 should have been invoked');
  assert.equal(info.event, 'test1', 'foo.eventHandler2 should handle event test1');
  assert.equal(info.arg1, 100, 'foo.eventHandler2 should handle event 100');
  assert.equal(info.arg2, 200, 'foo.eventHandler2 should handle event 200');

  info = sc.stateWillTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateWillTryToHandleEvent should have been invoked');
  assert.equal(info.state, foo, 'sc.stateWillTryToHandleEvent should have been passed state foo');
  assert.equal(info.event, 'test1', 'sc.stateWillTryToHandleEvent should have been passed event test1');
  assert.equal(info.handler, 'eventHandler2', 'sc.stateWillTryToHandleEvent should have been passed handler eventHandler2');
  
  info = sc.stateDidTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateDidTryToHandleEventInfo should have been invoked');
  assert.equal(info.state, foo, 'sc.stateDidTryToHandleEventInfo should have been passed state foo');
  assert.equal(info.event, 'test1', 'sc.stateDidTryToHandleEventInfo should have been passed event test1');
  assert.equal(info.handler, 'eventHandler2', 'sc.stateDidTryToHandleEventInfo should have been passed handler eventHandler2');
  assert.equal(info.handled, true, 'sc.stateDidTryToHandleEventInfo should have been passed handled true');
  
});

test("try to invoke state foo's eventHandler3 event handler", function (assert) {
  
  var ret = foo.tryToHandleEvent('digit3', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, true, 'foo.tryToHandleEvent should return true');
  assert.ok(info, 'foo.handledEventInfo should not be null');
  assert.equal(info.handler, 'eventHandler3', 'foo.eventHandler3 should have been invoked');
  assert.equal(info.event, 'digit3', 'foo.eventHandler3 should handle event test1');
  assert.equal(info.arg1, 100, 'foo.eventHandler3 should handle event 100');
  assert.equal(info.arg2, 200, 'foo.eventHandler3 should handle event 200');

  info = sc.stateWillTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateWillTryToHandleEvent should have been invoked');
  assert.equal(info.state, foo, 'sc.stateWillTryToHandleEvent should have been passed state foo');
  assert.equal(info.event, 'digit3', 'sc.stateWillTryToHandleEvent should have been passed event digit3');
  assert.equal(info.handler, 'eventHandler3', 'sc.stateWillTryToHandleEvent should have been passed handler eventHandler3');
  
  info = sc.stateDidTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateDidTryToHandleEventInfo should have been invoked');
  assert.equal(info.state, foo, 'sc.stateDidTryToHandleEventInfo should have been passed state foo');
  assert.equal(info.event, 'digit3', 'sc.stateDidTryToHandleEventInfo should have been passed event digit3');
  assert.equal(info.handler, 'eventHandler3', 'sc.stateDidTryToHandleEventInfo should have been passed handler eventHandler3');
  assert.equal(info.handled, true, 'sc.stateDidTryToHandleEventInfo should have been passed handled true');
  
});

test("try to invoke state foo's unknownEvent event handler", function (assert) {
  
  var ret = foo.tryToHandleEvent('test', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, true, 'foo.tryToHandleEvent should return true');
  assert.ok(info, 'foo.handledEventInfo should not be null');
  assert.equal(info.handler, 'unknownEvent', 'foo.unknownEvent should have been invoked');
  assert.equal(info.event, 'test', 'foo.unknownEvent should handle event test');
  assert.equal(info.arg1, 100, 'foo.unknownEvent should handle event 100');
  assert.equal(info.arg2, 200, 'foo.unknownEvent should handle event 200');

  info = sc.stateWillTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateWillTryToHandleEvent should have been invoked');
  assert.equal(info.state, foo, 'sc.stateWillTryToHandleEvent should have been passed state foo');
  assert.equal(info.event, 'test', 'sc.stateWillTryToHandleEvent should have been passed event test');
  assert.equal(info.handler, 'unknownEvent', 'sc.stateWillTryToHandleEvent should have been passed handler unknownEvent');
  
  info = sc.stateDidTryToHandleEventInfo;
  
  assert.ok(info, 'sc.stateDidTryToHandleEventInfo should have been invoked');
  assert.equal(info.state, foo, 'sc.stateDidTryToHandleEventInfo should have been passed state foo');
  assert.equal(info.event, 'test', 'sc.stateDidTryToHandleEventInfo should have been passed event test');
  assert.equal(info.handler, 'unknownEvent', 'sc.stateDidTryToHandleEventInfo should have been passed handler unknownEvent');
  assert.equal(info.handled, true, 'sc.stateDidTryToHandleEventInfo should have been passed handled true');
  
});

test("try not to invoke any of state foo's event handlers", function (assert) {
  
  foo.unknownEvent = undefined;
  
  var ret = foo.tryToHandleEvent('test', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false');
  assert.ok(!info, 'foo.handledEventInfo should be null');

  info = sc.stateWillTryToHandleEventInfo;
  assert.ok(!info, 'sc.stateWillTryToHandleEvent should not have been invoked');

  info = sc.stateDidTryToHandleEventInfo;
  assert.ok(!info, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
  
});

test("try to invoke state foo's eventHandler1 but tryToHandleEvent returns false", function (assert) {
  foo.eventHandlerReturnValue = false;
  
  var ret = foo.tryToHandleEvent('eventHandler1', 100, 200);
  
  var info = foo.handledEventInfo;
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false');
  assert.ok(info, 'foo.handledEventInfo should be null');
  assert.equal(info.handler, 'eventHandler1', 'foo.eventHandler1 should have been invoked');
  assert.equal(info.event, 'eventHandler1', 'foo.eventHandler1 should handle event test');
  assert.equal(info.arg1, 100, 'foo.eventHandler1 should handle event 100');
  assert.equal(info.arg2, 200, 'foo.eventHandler1 should handle event 200');

  info = sc.stateWillTryToHandleEventInfo;
  assert.ok(info, 'sc.stateWillTryToHandleEvent should not have been invoked');
  assert.equal(info.state, foo, 'sc.stateWillTryToHandleEvent should have been passed state foo');
  assert.equal(info.event, 'eventHandler1', 'sc.stateWillTryToHandleEvent should have been passed event test');
  assert.equal(info.handler, 'eventHandler1', 'sc.stateWillTryToHandleEvent should have been passed handler eventHandler1');

  info = sc.stateDidTryToHandleEventInfo;
  assert.ok(info, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
  assert.equal(info.state, foo, 'sc.stateDidTryToHandleEventInfo should have been passed state foo');
  assert.equal(info.event, 'eventHandler1', 'sc.stateDidTryToHandleEventInfo should have been passed event test');
  assert.equal(info.handler, 'eventHandler1', 'sc.stateDidTryToHandleEventInfo should have been passed handler eventHandler1');
  assert.equal(info.handled, false, 'sc.stateDidTryToHandleEventInfo should have been passed handled false');
});

test("try to invoke all of state foo's handlers but tryToHandleEvent returns false", function (assert) {
  var ret, info;
  
  foo.eventHandlerReturnValue = false;
  
  ret = foo.tryToHandleEvent('eventHandler1');
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false');
  info = foo.handledEventInfo;
  assert.ok(info, 'foo.handledEventInfo should be null');
  assert.equal(info.handler, 'eventHandler1', 'foo.eventHandler1 should have been invoked');
  assert.ok(sc.stateWillTryToHandleEventInfo, 'sc.stateWillTryToHandleEvent should not have been invoked');
  assert.ok(sc.stateDidTryToHandleEventInfo, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
  
  ret = foo.tryToHandleEvent('test1');
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false for event test1');
  info = foo.handledEventInfo;
  assert.ok(info, 'foo.handledEventInfo should be null');
  assert.equal(info.handler, 'eventHandler2', 'foo.eventHandler2 should have been invoked');
  assert.ok(sc.stateWillTryToHandleEventInfo, 'sc.stateWillTryToHandleEvent should not have been invoked');
  assert.ok(sc.stateDidTryToHandleEventInfo, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
  
  ret = foo.tryToHandleEvent('digit3');
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false for event digit3');
  info = foo.handledEventInfo;
  assert.ok(info, 'foo.handledEventInfo should be null');
  assert.equal(info.handler, 'eventHandler3', 'foo.eventHandler3 should have been invoked');
  assert.ok(sc.stateWillTryToHandleEventInfo, 'sc.stateWillTryToHandleEvent should not have been invoked');
  assert.ok(sc.stateDidTryToHandleEventInfo, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
  
  ret = foo.tryToHandleEvent('blah');
  
  assert.equal(ret, false, 'foo.tryToHandleEvent should return false for event blah');
  info = foo.handledEventInfo;
  assert.ok(info, 'foo.handledEventInfo should be null');
  assert.equal(info.handler, 'unknownEvent', 'foo.unknownEvent should have been invoked');
  assert.ok(sc.stateWillTryToHandleEventInfo, 'sc.stateWillTryToHandleEvent should not have been invoked');
  assert.ok(sc.stateDidTryToHandleEventInfo, 'sc.stateDidTryToHandleEventInfo should not have been invoked');
});