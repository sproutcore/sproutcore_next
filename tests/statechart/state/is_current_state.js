// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '../../../../core/core.js';
import { Statechart, State } from '../../../../statechart/statechart.js';

var statechart = null;

module("Statechart: State - isCurrentState Property Tests", {
  beforeEach: function() {

    statechart = Statechart.create({
      
      monitorIsActive: true,
      
      rootState: State.design({
        
        initialSubstate: 'a',
        
        a: State.design(),
        
        b: State.design()
        
      })
      
    });
    
    statechart.initStatechart();
  },
  
  afterEach: function() {
    statechart.destroy();
    statechart = null;
  }
});

test("check binding to isCurrentState", function (assert) {
  var a = statechart.getState('a');

  var o = SC.Object.create({
    value: null,
    valueBinding: SC.Binding.oneWay().from('isCurrentState', a)
  });
  
  SC.run();
  assert.equal(a.get('isCurrentState'), true);
  assert.equal(o.get('value'), true);
  
  SC.run(function() { statechart.gotoState('b'); });
  assert.equal(a.get('isCurrentState'), false);
  assert.equal(o.get('value'), false);
  
  SC.run(function() { statechart.gotoState('a'); });
  assert.equal(a.get('isCurrentState'), true);
  assert.equal(o.get('value'), true);
  
  SC.run(function() { statechart.gotoState('b'); });
  assert.equal(a.get('isCurrentState'), false);
  assert.equal(o.get('value'), false);

});