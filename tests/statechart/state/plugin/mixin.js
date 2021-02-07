// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC TestState */

import { SC, GLOBAL } from '../../../../core/core.js';
import { StatechartManager, State, EmptyState } from '../../../../statechart/statechart.js';


GLOBAL.TestState = null;
var obj, MixinA, MixinB, stateA, stateB, stateC;

module("State.plugin: Mixin Tests", {
  beforeEach: function() {
    
    MixinA = {
      isMixinA: true
    };
    
    MixinB = {
      isMixinB: true
    };

    TestState = State.extend({
      isTestState: true
    });

    obj = SC.Object.create(StatechartManager, {
      
      initialState: 'stateA',
      
      stateA: State.plugin('TestState'),
      
      stateB: State.plugin('TestState', MixinA),
      
      stateC: State.plugin('TestState', MixinA, MixinB)
      
    });
    
    stateA = obj.getState('stateA');
    stateB = obj.getState('stateB');
    stateC = obj.getState('stateC');

  },
  
  afterEach: function() {
    obj = TestState = MixinA = MixinB = null;
    stateA = stateB = stateC = null;
  }

});

test("check plugin state A", function (assert) {
  assert.ok(SC.kindOf(stateA, TestState));
  assert.ok(stateA.get('isTestState'));
  assert.ok(!stateA.get('isMixinA'));
  assert.ok(!stateA.get('isMixinB'));
});

test("check plugin state B", function (assert) {
  assert.ok(SC.kindOf(stateB, TestState));
  assert.ok(stateB.get('isTestState'));
  assert.ok(stateB.get('isMixinA'));
  assert.ok(!stateB.get('isMixinB'));
});

test("check plugin state C", function (assert) {
  assert.ok(SC.kindOf(stateC, TestState));
  assert.ok(stateC.get('isTestState'));
  assert.ok(stateC.get('isMixinA'));
  assert.ok(stateC.get('isMixinB'));
});