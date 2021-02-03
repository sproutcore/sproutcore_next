// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '../../../../core/core.js';
import { Statechart, State, StatechartDelegate, StateRouteHandlerContext } from '../../../../statechart/statechart.js';

var sc, del, foo;

module("State: routeTriggered method Tests", {
  
  beforeEach: function() {
    
    del = SC.Object.create(StatechartDelegate, {
      
      info: {},
      
      returnValue: true,
      
      statechartShouldStateHandleTriggeredRoute: function(statechart, state, context) {
        this.info.statechartShouldStateHandleTriggeredRoute = {
          statechart: statechart, 
          state: state, 
          context: context
        };
        
        return this.get('returnValue');
      },
      
      statechartStateCancelledHandlingTriggeredRoute: function(statechart, state, context) {
        this.info.statechartStateCancelledHandlingTriggeredRoute = {
          statechart: statechart, 
          state: state, 
          context: context
        };
      }
      
    });
    
    sc = Statechart.create({
      
      initialState: 'foo',
      
      delegate: del,
    
      foo: State.design({
        
        info: {},
        
        location: 'foo/bar',
        
        createStateRouteHandlerContext: function createStateRouteHandlerContext(attr) {
          this.info.createStateRouteHandlerContext = {
            attr: attr
          };
          return createStateRouteHandlerContext.base.apply(this, arguments);
        },
        
        handleTriggeredRoute: function(context) {
          this.info.handleTriggeredRoute = {
            context: context
          };
        }
        
      })
      
    });
    
    sc.initStatechart();
    foo = sc.getState('foo');
  },
  
  afterEach: function() {
    sc = del = foo = null;
  }
  
});

test("invoke routeTriggered where delegate does allow state to handle route", function (assert) {
  var info, context, params = { value: 'test' };
  
  foo.routeTriggered(params);

  info = foo.info.createStateRouteHandlerContext;

  assert.ok(info, "state.createStateRouteHandlerContext should have been invoked");
  assert.ok(info.attr, "state.createStateRouteHandlerContext should be provided attr param");
  
  info = foo.info.handleTriggeredRoute;
  
  assert.ok(info, "state.handleTriggeredRoute should have been invoked");
  
  context = info.context;
  
  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state.handleTriggeredRoute should be provided a state route handler context object");
  assert.equal(context.get('state'), foo, "context.state should be state foo");
  assert.equal(context.get('location'), 'foo/bar', "context.location should be 'foo/bar'");
  assert.equal(context.get('params'), params, "context.params should be value passed to state.routeTriggered method");
  assert.equal(context.get('handler'), foo.routeTriggered, "context.handler should be reference to state.routeTriggered");
  
  info = del.info.statechartShouldStateHandleTriggeredRoute;
  
  assert.ok(info, "del.statechartShouldStateHandleTriggeredRoute should have been invoked");
  assert.equal(info.statechart, sc, "del.statechartShouldStateHandleTriggeredRoute should be provided a statechart");
  assert.equal(info.state, foo, "del.statechartShouldStateHandleTriggeredRoute should be provided a state");
  
  context = info.context;
  
  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state.statechartShouldStateHandleTriggeredRoute should be provided a state route handler context object");
  assert.equal(context.get('state'), foo, "context.state should be state foo");
  assert.equal(context.get('location'), 'foo/bar', "context.location should be 'foo/bar'");
  assert.equal(context.get('params'), params, "context.params should be value passed to state.routeTriggered method");
  assert.equal(context.get('handler'), foo.routeTriggered, "context.handler should be reference to state.routeTriggered");
  
  info = del.info.statechartStateCancelledHandlingTriggeredRoute;
  
  assert.ok(!info, "del.statechartStateCancelledHandlingTriggeredRoute should have been invoked");
});

test("invoke routeTriggered where delegate does not allow state to handle route", function (assert) {
  var info, context, params = { value: 'test' };
  
  del.set('returnValue', false);
  foo.routeTriggered(params);

  info = foo.info.createStateRouteHandlerContext;

  assert.ok(info, "state.createStateRouteHandlerContext should have been invoked");
  assert.ok(info.attr, "state.createStateRouteHandlerContext should be provided attr param");
  
  info = foo.info.handleTriggeredRoute;
  
  assert.ok(!info, "state.handleTriggeredRoute should have been invoked");
  
  info = del.info.statechartShouldStateHandleTriggeredRoute;
  
  assert.ok(info, "del.statechartShouldStateHandleTriggeredRoute should have been invoked");
  assert.equal(info.statechart, sc, "del.statechartShouldStateHandleTriggeredRoute should be provided a statechart");
  assert.equal(info.state, foo, "del.statechartShouldStateHandleTriggeredRoute should be provided a state");
  
  context = info.context;
  
  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state.statechartShouldStateHandleTriggeredRoute should be provided a state route handler context object");
  assert.equal(context.get('state'), foo, "context.state should be state foo");
  assert.equal(context.get('location'), 'foo/bar', "context.location should be 'foo/bar'");
  assert.equal(context.get('params'), params, "context.params should be value passed to state.routeTriggered method");
  assert.equal(context.get('handler'), foo.routeTriggered, "context.handler should be reference to state.routeTriggered");
  
  info = del.info.statechartStateCancelledHandlingTriggeredRoute;
  
  assert.ok(info, "del.statechartStateCancelledHandlingTriggeredRoute should have been invoked");
  assert.equal(info.statechart, sc, "del.statechartStateCancelledHandlingTriggeredRoute should be provided a statechart");
  assert.equal(info.state, foo, "del.statechartStateCancelledHandlingTriggeredRoute should be provided a state");
  
  context = info.context;
  
  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state.statechartStateCancelledHandlingTriggeredRoute should be provided a state route handler context object");
  assert.equal(context.get('state'), foo, "context.state should be state foo");
  assert.equal(context.get('location'), 'foo/bar', "context.location should be 'foo/bar'");
  assert.equal(context.get('params'), params, "context.params should be value passed to state.routeTriggered method");
  assert.equal(context.get('handler'), foo.routeTriggered, "context.handler should be reference to state.routeTriggered");
  
});