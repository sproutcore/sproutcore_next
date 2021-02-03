// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC externalState1 externalState2 */

import { SC } from '/core/core.js';
import { Async, Statechart, State, StateRouteHandlerContext } from '/statechart/statechart.js';


var state, params, context;

module("StateRouteHandlerContext: retry Method Tests", {
  
  beforeEach: function() { 
  
    params = { };
    
    state = SC.Object.create({

      info: {},

      handler: function(params) {
        this.info.handler = {
          params: params
        };
      }

    });
    
    context = StateRouteHandlerContext.create({
      
      state: state,
      
      params: params
      
    });
    
  },
  
  afterEach: function() { 
    params = state = context = null;
  }

});

test("Invoke retry with context's handler property assigned a function value", function (assert) {

  context.set('handler', state.handler);
  context.retry();
  
  var info = state.info;
  
  assert.ok(info.handler, "state's handler method was invoked");
  assert.equal(info.handler.params, params, "state's handler was provided params");

});

test("Invoke retry with context's handler property assigned a string value", function (assert) {

  context.set('handler', 'handler');
  context.retry();
  
  var info = state.info;
  
  assert.ok(info.handler, "state's handler method was invoked");
  assert.equal(info.handler.params, params, "state's handler was provided params");

});