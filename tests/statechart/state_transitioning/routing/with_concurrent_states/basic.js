// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Statechart, StatechartDelegate, State, StateRouteHandlerContext } from '/statechart/statechart.js';


var statechart, del, monitor, stateFoo, stateBar, stateA, stateB, stateC, stateX, stateY, TestState;

module("Statechart: Concurrent States - Trigger Routing on States Basic Tests", {

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

    TestState = State.extend({

      enterState: function(context) {
        this.info = {};
        this.info.enterState = {
          state: this,
          context: context
        };
      }

    });

    statechart = Statechart.create({

      monitorIsActive: true,

      delegate: del,

      statesAreConcurrent: true,

      foo: State.design({

        initialSubstate: 'a',

        a: TestState.design({

          representRoute: 'dog'

        }),

        b: TestState.design({

          representRoute: 'cat'

        }),

        c: TestState.design({

          representRoute: ''

        })

      }),

      bar: State.design({

        initialSubstate: 'x',

        x: TestState.design({

          representRoute: 'pig'

        }),

        y: TestState.design({

          representRoute: 'cow',

          enterStateByRoute: function(context) {
            this.info = {};
            this.info.enterStateByRoute = {
              context: context
            };
          }

        })

      })

    });

    statechart.initStatechart();

    monitor = statechart.get('monitor');
    stateFoo = statechart.getState('foo');
    stateBar = statechart.getState('bar');
    stateA = statechart.getState('a');
    stateB = statechart.getState('b');
    stateC = statechart.getState('c');
    stateX = statechart.getState('x');
    stateY = statechart.getState('y');
  },

  afterEach: function() {
    statechart = del = monitor = TestState = stateFoo = stateBar = stateA = stateB = stateC = stateX = stateY = null;
  }

});

test("check statechart initialization", function (assert) {
  assert.equal(del.get('location'), null, "del.location should be null");

  var handlers = del.handlers;

  assert.ok(handlers['dog'], "delegate should have a route 'dog'");
  assert.equal(handlers['dog'].statechart, statechart, "route 'dog' should be bound to statechart");
  assert.equal(handlers['dog'].state, stateA, "route 'dog' should be bound to state A");
  assert.equal(handlers['dog'].handler, stateA.routeTriggered, "route 'dog' should be bound to handler stateA.routeTriggered");

  assert.ok(handlers['cat'], "delegate should have a route 'cat'");
  assert.equal(handlers['cat'].statechart, statechart, "route 'cat' should be bound to statechart");
  assert.equal(handlers['cat'].state, stateB, "route 'cat' should be bound to state B");
  assert.equal(handlers['cat'].handler, stateB.routeTriggered, "route 'cat' should be bound to handler stateB.routeTriggered");

  assert.ok(handlers[''], "delegate should have a route ''");
  assert.equal(handlers[''].statechart, statechart, "route '' should be bound to statechart");
  assert.equal(handlers[''].state, stateC, "route '' should be bound to state C");
  assert.equal(handlers[''].handler, stateC.routeTriggered, "route '' should be bound to handler stateC.routeTriggered");

  assert.ok(handlers['pig'], "delegate should have a route 'pig'");
  assert.equal(handlers['pig'].statechart, statechart, "route 'pig' should be bound to statechart");
  assert.equal(handlers['pig'].state, stateX, "route 'pig' should be bound to state X");
  assert.equal(handlers['pig'].handler, stateX.routeTriggered, "route 'pig' should be bound to handler stateX.routeTriggered");

  assert.ok(handlers['cow'], "delegate should have a route 'cow'");
  assert.equal(handlers['cow'].statechart, statechart, "route 'cow' should be bound to statechart");
  assert.equal(handlers['cow'].state, stateY, "route 'cow' should be bound to state Y");
  assert.equal(handlers['cow'].handler, stateY.routeTriggered, "route 'cow' should be bound to handler stateY.routeTriggered");
});

test("trigger state B's route", function (assert) {
  var params = {};

  monitor.reset();

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");
  assert.ok(stateX.get('isCurrentState'), "state X should be a current state");
  assert.ok(!stateY.get('isCurrentState'), "state Y should not be a current state");

  del.set('location', 'cat');

  stateB.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('a').entered('b').end();
  assert.ok(seq, 'sequence should be exited[a], entered[b]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state");
  assert.ok(stateB.get('isCurrentState'), "state B should be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");
  assert.ok(stateX.get('isCurrentState'), "state X should be a current state");
  assert.ok(!stateY.get('isCurrentState'), "state Y should not be a current state");

  var info = stateB.info;

  assert.ok(info.enterState, "state B's enterState should have been invoked");

  var context = info.enterState.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state B's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateB);
  assert.equal(context.get('location'), 'cat');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateB.routeTriggered);
});

test("trigger state C's route", function (assert) {
  var params = {};

  monitor.reset();

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");
  assert.ok(stateX.get('isCurrentState'), "state X should be a current state");
  assert.ok(!stateY.get('isCurrentState'), "state Y should not be a current state");

  del.set('location', '');

  stateC.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('a').entered('c').end();
  assert.ok(seq, 'sequence should be exited[a], entered[c]');

  assert.ok(!stateA.get('isCurrentState'), "state A should not be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");
  assert.ok(stateC.get('isCurrentState'), "state C should be a current state");
  assert.ok(stateX.get('isCurrentState'), "state X should be a current state");
  assert.ok(!stateY.get('isCurrentState'), "state Y should not be a current state");

  var info = stateC.info;

  assert.ok(info.enterState, "state C's enterState should have been invoked");

  var context = info.enterState.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state C's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateC);
  assert.equal(context.get('location'), '');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateC.routeTriggered);
});

test("trigger state Y's route", function (assert) {
  var params = {};

  monitor.reset();

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");
  assert.ok(stateX.get('isCurrentState'), "state X should be a current state");
  assert.ok(!stateY.get('isCurrentState'), "state Y should not be a current state");

  del.set('location', 'cow');

  stateY.routeTriggered(params);

  var seq = monitor.matchSequence().begin().exited('x').entered('y').end();
  assert.ok(seq, 'sequence should be exited[x], entered[y]');

  assert.ok(stateA.get('isCurrentState'), "state A should be a current state");
  assert.ok(!stateB.get('isCurrentState'), "state B should not be a current state");
  assert.ok(!stateC.get('isCurrentState'), "state C should not be a current state");
  assert.ok(!stateX.get('isCurrentState'), "state X should not be a current state");
  assert.ok(stateY.get('isCurrentState'), "state Y should be a current state");

  var info = stateY.info;

  assert.ok(!info.enterState, "state Y's enterState should not have been invoked");
  assert.ok(info.enterStateByRoute, "state Y's enterStateByRoute should have been invoked");

  var context = info.enterStateByRoute.context;

  assert.ok(SC.kindOf(context, StateRouteHandlerContext), "state X's enterState method should have been provided a state route handler context object");
  assert.equal(context.get('state'), stateY);
  assert.equal(context.get('location'), 'cow');
  assert.equal(context.get('params'), params);
  assert.equal(context.get('handler'), stateX.routeTriggered);
});
