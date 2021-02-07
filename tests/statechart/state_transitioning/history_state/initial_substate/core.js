// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */


import { HistoryState, Statechart, State } from '../../../../../statechart/statechart.js';


var statechart, stateA, stateB, stateC;

module("HistoryState Tests", {
  beforeEach: function() {
    statechart = Statechart.create({initialState: 'a', a: State.design()});
    stateA = State.create({ name: 'stateA' });
    stateB = State.create({ name: 'stateB' });
    stateC = State.create({ name: 'stateC' });
  },
  
  afterEach: function() {
    statechart = stateA = stateB = stateC = null;
  }
});

test("Check default history state", function (assert) {
  var historyState = HistoryState.create();
  
  assert.equal(historyState.get('isRecursive'), false);
});

test("Check assigned history state", function (assert) {  
  var historyState = HistoryState.create({
    isRecursive: true,
    statechart: statechart,
    parentState: stateA,
    defaultState: stateB
  });
  
  assert.equal(historyState.get('statechart'), statechart);
  assert.equal(historyState.get('parentState'), stateA);
  assert.equal(historyState.get('defaultState'), stateB);
  assert.equal(historyState.get('isRecursive'), true);
  assert.equal(historyState.get('state'), stateB);
  
  stateA.set('historyState', stateC);
  
  assert.equal(historyState.get('state'), stateC);
  
  stateA.set('historyState', null);
  
  assert.equal(historyState.get('state'), stateB);
});