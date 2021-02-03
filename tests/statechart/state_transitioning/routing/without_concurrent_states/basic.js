// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Statechart, StatechartDelegate, State, StateRouteHandlerContext } from '/statechart/statechart.js';


var statechart, del, monitor, stateA, stateB, stateC, stateD;

module("Statechart: No Concurrent States - Trigger Routing on States Basic Tests", {
  beforeEach: function() {

    del = SC.Object.create(StatechartDelegate, {

      location: null,

      handlers: {},

      statechartUpdateLocationForState: function(statechart, location, state) {
        this.set('location', location);
      },

      statechartAcquireLocationForState: function(statechart, state) {
        return this.get('location');
      },

      statechartBindStateToRoute: function(statechart, state, route, handler) {
        this.handlers[route] = {
          statechart: statechart,
          state: state,
          handler: handler
        };
      }

    });

    statechart = Statechart.create({

      monitorIsActive: true,

      delegate: del,

      initialState: 'a',

      a: State.design({

        representRoute: 'foo',

        info: {},

        enterState: function(context) {
          this.info.enterState = {
            context: context
          };
        }

      }),

      b: State.design({

        representRoute: 'bar',

        info: {},

        enterState: function(context) {
          this.info.enterState = {
            context: context
          };
        }

      }),

      c: State.design({

        representRoute: 'mah',

        info: {},

        enterStateByRoute: function(context) {
          this.info.enterStateByRoute = {
            context: context
          };
        },

        enterState: function(context) {
          this.info.enterState = {
            context: context
          };
        }

      }),

      d: State.design({

        representRoute: '',

        info: {},

        enterStateByRoute: function(context) {
          this.info.enterStateByRoute = {
            context: context
          };
        },

        enterState: function(context) {
          this.info.enterState = {
            context: context
          };
        }

      })

    });

    statechart.initStatechart();

    monitor = statechart.get('monitor');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateD = statechart.getState('d');
  },

  afterEach: function() {
    statechart = del = monitor = stateA = stateB = stateC = stateD = null;
  }

});

test("check statechart initialization", function (assert) {
  assert.equal(del.get('location'), null, "del.location should be null");

  var handlers = del.handlers;

  assert.ok(handlers['foo'], "delegate should have a route 'foo'");
  assert.equal(handlers['foo'].statechart, statechart, "route 'foo' should be bound to statechart");
  assert.equal(handlers['foo'].state, stateA, "route 'foo' should be bound to state A");
  assert.equal(handlers['foo'].handler, stateA.routeTriggered, "route 'foo' should be bound to handler stateA.routeTriggered");

  assert.ok(handlers['bar'], "delegate should have a route 'bar'");
  assert.equal(handlers['bar'].statechart, statechart, "route 'bar' should be bound to statechart");
  assert.equal(handlers['bar'].state, stateB, "route 'bar' should be bound to state B");
  assert.equal(handlers['bar'].handler, stateB.routeTriggered, "route 'bar' should be bound to handler stateB.routeTriggered");

  assert.ok(handlers['mah'], "delegate should have a route 'mah'");
  assert.equal(handlers['mah'].statechart, statechart, "route 'mah' should be bound to statechart");
  assert.equal(handlers['mah'].state, stateC, "route 'mah' should be bound to state C");
  assert.equal(handlers['mah'].handler, stateC.routeTriggered, "route 'mah' should be bound to handler stateC.routeTriggered");

  assert.ok(handlers[''], "delegate should have a route ''");
  assert.equal(handlers[''].statechart, statechart, "route '' should be bound to statechart");
  assert.equal(handlers[''].state, stateD, "route '' should be bound to state D");
  assert.equal(handlers[''].handler, stateD.routeTriggered, "route '' should be bound to handler stateD.routeTriggered");
});

test("trigger state B's route", function (assert) {
  var params = {};

  monitor.reset();

  del.set('location', 'bar');

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");

  stateB.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('a').entered('b').end();
  assert.ok(seq, 'sequence should be exited[a], entered[b]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state after route triggered");
  assert.ok(stateB.get('isCurrentState'), "state B should be a current state after route triggered");

  var info = stateB.info;

  assert.ok(info.enterState, "state B's enterState should have been invoked");

  var context = info.enterState.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state B's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateB);
  assert.equal(context.get('location'), 'bar');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateB.routeTriggered);
});

test("trigger state C's route", function (assert) {
  var params = {};

  monitor.reset();

  del.set('location', 'mah');

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");

  stateC.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('a').entered('c').end();
  assert.ok(seq, 'sequence should be exited[a], entered[c]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state after route triggered");
  assert.ok(stateC.get('isCurrentState'), "state C should be a current state after route triggered");

  var info = stateC.info;

  assert.ok(!info.enterState, "state C's enterState should not have been invoked");
  assert.ok(info.enterStateByRoute, "state C's enterStateByRoute should have been invoked");

  var context = info.enterStateByRoute.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state C's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateC);
  assert.equal(context.get('location'), 'mah');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateC.routeTriggered);
});

test("trigger state D's route", function (assert) {
  var params = {};

  monitor.reset();

  del.set('location', '');

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateD.get('isCurrentState'), "state D should not be a current state");

  stateD.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('a').entered('d').end();
  assert.ok(seq, 'sequence should be exited[a], entered[d]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state after route triggered");
  assert.ok(stateD.get('isCurrentState'), "state D should be a current state after route triggered");

  var info = stateD.info;

  assert.ok(!info.enterState, "state D's enterState should not have been invoked");
  assert.ok(info.enterStateByRoute, "state D's enterStateByRoute should have been invoked");

  var context = info.enterStateByRoute.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state D's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateD);
  assert.equal(context.get('location'), '');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateD.routeTriggered);
});

test("Go to state C without triggering state's route", function (assert) {
  var context = {};

  monitor.reset();

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");

  statechart.gotoState(stateC, context);

  var seq = monitor.matchSequence().begin().exited('a').entered('c').end();
  assert.ok(seq, 'sequence should be exited[a], entered[c]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state after route triggered");
  assert.ok(stateC.get('isCurrentState'), "state C should be a current state after route triggered");

  var info = stateC.info;

  assert.ok(info.enterState, "state C's enterState should have been invoked");
  assert.ok(!info.enterStateByRoute, "state C's enterStateByRoute should not have been invoked");
  assert.equal(info.enterState.context, context, "state C's enterState should have been passed a context value");
});

test("Go to state D without triggering state's route", function (assert) {
  var context = {};

  monitor.reset();

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateD.get('isCurrentState'), "state D should not be a current state");

  statechart.gotoState(stateD, context);

  var seq = monitor.matchSequence().begin().exited('a').entered('d').end();
  assert.ok(seq, 'sequence should be exited[a], entered[d]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state after route triggered");
  assert.ok(stateD.get('isCurrentState'), "state D should be a current state after route triggered");

  var info = stateD.info;

  assert.ok(info.enterState, "state D's enterState should have been invoked");
  assert.ok(!info.enterStateByRoute, "state D's enterStateByRoute should not have been invoked");
  assert.equal(info.enterState.context, context, "state D's enterState should have been passed a context value");
});
