// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC statechart State */

import { SC } from '../../../core/core.js';
import { StatechartManager, State, EmptyState } from '../../../statechart/statechart.js';


var obj1, rootState1, stateA, stateB, stateX, stateY, stateZ;
var obj2, rootState2, stateC, stateD;
var obj3, rootState3, stateE, stateF;
var owner, owner2;
var TestObject, TestState;

module("Statechart: Change Statechart Owner Property Tests", {
  beforeEach: function() {
    owner = SC.Object.create({
      toString: function() { return "owner"; }
    });
    
    owner2 = SC.Object.create({
      toString: function() { return "owner2"; }
    });
    
    TestState = State.extend({
      accessedOwner: null,
      
      reset: function() {
        this.set('accessedOwner', null);
      },
      
      render: function() {
        this.set('accessedOwner', this.get('owner'));
      }
    });
    
    TestObject = SC.Object.extend(StatechartManager, {
      render: function() {
        this.invokeStateMethod('render');
      }
    });
    
    obj1 = TestObject.extend({
      
      initialState: 'stateA',
      
      stateA: TestState.design({
        foo: function() {
          this.gotoState('stateB');
        }
      }),
      
      stateB: TestState.design({
        bar: function() {
          this.gotoState('stateA');
        }
      }),
      
      stateX: TestState.design({
        initialSubstate: 'stateY',
        
        stateY: TestState.design({
          initialSubstate: 'stateZ',
          
          stateZ: TestState.design()
        })
      })

    });
    
    obj1 = obj1.create();
    rootState1 = obj1.get('rootState');
    stateA = obj1.getState('stateA');
    stateB = obj1.getState('stateB');
    stateX = obj1.getState('stateX');
    stateY = obj1.getState('stateY');
    stateZ = obj1.getState('stateZ');  
    
    obj2 = TestObject.extend({
      
      owner: owner,
      
      initialState: 'stateC',
      
      stateC: TestState.design({
        foo: function() {
          this.gotoState('stateD');
        }
      }),
      
      stateD: TestState.design({
        bar: function() {
          this.gotoState('stateC');
        }
      })
      
    });
    
    obj2 = obj2.create();
    rootState2 = obj2.get('rootState');
    stateC = obj2.getState('stateC');
    stateD = obj2.getState('stateD');
    
    obj3 = TestObject.extend({
      
      statechartOwnerKey: 'fooOwner',
      
      fooOwner: owner,
      
      initialState: 'stateE',
      
      stateE: TestState.design({
        foo: function() {
          this.gotoState('stateF');
        }
      }),
      
      stateF: TestState.design({
        bar: function() {
          this.gotoState('stateE');
        }
      })
      
    });
    
    obj3 = obj3.create();
    rootState3 = obj3.get('rootState');
    stateE = obj3.getState('stateE');
    stateF = obj3.getState('stateF');
  },
  
  afterEach: function() {
    obj1 = rootState1 = stateA = stateB = stateX = stateY = stateZ = null;
    obj2 = rootState2 = stateC = stateD = null;
    obj3 = rootState3 = stateE = stateF = null;
    owner = owner2 = null;
    TestObject = TestState = null;
  }
});

test("check obj1 -- basic owner get and set", function (assert) {
  assert.equal(rootState1.get('owner'), obj1, "root state's owner should be obj");
  assert.equal(stateA.get('owner'), obj1, "state A's owner should be obj");
  assert.equal(stateB.get('owner'), obj1, "state B's owner should be obj");
  assert.equal(stateX.get('owner'), obj1, "state X's owner should be obj");
  assert.equal(stateY.get('owner'), obj1, "state Y's owner should be obj");
  assert.equal(stateZ.get('owner'), obj1, "state Z's owner should be obj");
  
  obj1.set('owner', owner);
  
  assert.equal(rootState1.get('owner'), owner, "root state's owner should be owner");
  assert.equal(stateA.get('owner'), owner, "state A's owner should be owner");
  assert.equal(stateB.get('owner'), owner, "state B's owner should be owner");
  assert.equal(stateX.get('owner'), owner, "state X's owner should be owner");
  assert.equal(stateY.get('owner'), owner, "state Y's owner should be owner");
  assert.equal(stateZ.get('owner'), owner, "state Z's owner should be owner");
  
  obj1.set('owner', null);
  
  assert.equal(rootState1.get('owner'), obj1, "root state's owner should be obj");
  assert.equal(stateA.get('owner'), obj1, "state A's owner should be obj");
  assert.equal(stateB.get('owner'), obj1, "state B's owner should be obj");
  assert.equal(stateX.get('owner'), obj1, "state X's owner should be obj");
  assert.equal(stateY.get('owner'), obj1, "state Y's owner should be obj");
  assert.equal(stateZ.get('owner'), obj1, "state Z's owner should be obj");
});

test("check stateA -- access owner via invokeStateMethod", function (assert) {
  assert.ok(stateA.get('isCurrentState'));
  assert.equal(stateA.get('accessedOwner'), null);
  
  obj1.render();
  
  assert.equal(stateA.get('accessedOwner'), obj1);
  
  stateA.reset();
  obj1.set('owner', owner);
  obj1.render();
  
  assert.equal(stateA.get('accessedOwner'), owner);
});

test("check stateZ -- access owner via invokeStateMethod", function (assert) {
  obj1.gotoState(stateZ);
  assert.ok(stateZ.get('isCurrentState'));
  
  assert.equal(stateZ.get('accessedOwner'), null);
  
  obj1.render();
  
  assert.equal(stateZ.get('accessedOwner'), obj1);
  
  stateA.reset();
  obj1.set('owner', owner);
  obj1.render();
  
  assert.equal(stateZ.get('accessedOwner'), owner);
});

test("check obj2 -- statechartOwnerKey", function (assert) {
  assert.equal(rootState2.get('owner'), owner, "root state's owner should be owner");
  assert.equal(stateC.get('owner'), owner, "state C's owner should be owner");
  assert.equal(stateD.get('owner'), owner, "state D's owner should be owner");
  
  obj2.set('owner', null);
  
  assert.equal(rootState2.get('owner'), obj2, "root state's owner should be obj");
  assert.equal(stateC.get('owner'), obj2, "state C's owner should be obj");
  assert.equal(stateD.get('owner'), obj2, "state D's owner should be obj");
});

test("check obj3 -- basic owner get and set", function (assert) {
  assert.equal(obj3.get('statechartOwnerKey'), 'fooOwner', "obj's statechartOwnerKey should be fooOwner");
  assert.equal(obj3.get('fooOwner'), owner, "obj's fooOwner should be owner");
  
  assert.equal(rootState3.get('owner'), owner, "root state's owner should be owner");
  assert.equal(stateE.get('owner'), owner, "state E's owner should be owner");
  assert.equal(stateF.get('owner'), owner, "state F's owner should be owner");
  
  obj3.set('fooOwner', null);
  
  assert.equal(rootState3.get('owner'), obj3, "root state's owner should be obj");
  assert.equal(stateE.get('owner'), obj3, "state E's owner should be obj");
  assert.equal(stateF.get('owner'), obj3, "state F's owner should be obj");
  
  obj3.set('fooOwner', owner2);
  
  assert.equal(rootState3.get('owner'), owner2, "root state's owner2 should be owner2");
  assert.equal(stateE.get('owner'), owner2, "state E's owner2 should be owner2");
  assert.equal(stateF.get('owner'), owner2, "state F's owner2 should be owner2");
  
  assert.ok(obj3.hasObserverFor('fooOwner'));
  assert.equal(rootState3.get('owner'), owner2);
  
  obj3.destroy();
  
  assert.ok(!obj3.hasObserverFor('fooOwner'));
  assert.equal(rootState3.get('owner'), null);
});