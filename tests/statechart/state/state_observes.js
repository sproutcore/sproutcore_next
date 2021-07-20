// ==========================================================================
// State Unit Test
// ==========================================================================
/*globals SC obj1 obj2 obj3 */

import { SC, GLOBAL } from '../../../core/core.js';
import { Statechart, State } from '../../../statechart/statechart.js';


GLOBAL.obj1 = null;
GLOBAL.obj2 = null;
GLOBAL.obj3 = null;
var statechart1, statechart2, TestState;
var stateA, stateB, stateC, stateD;

module("Statechart: stateObserves Tests", {
	
  beforeEach: function() {

    obj1 = SC.Object.create({
      foo: 'abc'
    });
    
    obj2 = SC.Object.create({
      bar: 'xyz'
    });
    
    obj3 = SC.Object.create({
      mah: 123
    });
    
    TestState = State.extend({
      
      notifyStateObserveHandlerInvoked: function(handler, target, key) {
        this['%@Invoked'.fmt(handler)] = {
          target: target,
          key: key
        };
      }
      
    });

    statechart1 = Statechart.create({
		
		  autoInitStatechart: true,
		  
		  initialState: 'stateA',
		
      stateA: TestState.design({
        
        testProp: null,
        
        testProp2: obj3,
        
        testPropChanged: function(target, key) {
          this.notifyStateObserveHandlerInvoked('testPropChanged', target, key);
        }.stateObserves('testProp'),
        
        testProp2Changed: function(target, key) {
          this.notifyStateObserveHandlerInvoked('testProp2Changed', target, key);
        }.stateObserves('.testProp2.mah'),
        
    	  fooChanged: function(target, key) {
          this.notifyStateObserveHandlerInvoked('fooChanged', target, key);
    		}.stateObserves('obj1.foo'),
    		
    		barChanged: function(target, key) {
    		  this.notifyStateObserveHandlerInvoked('barChanged', target, key);
    		}.stateObserves('obj2.bar')
        
      }),
      
      stateB: TestState.design()
		
    });
    
    stateA = statechart1.getState('stateA');
    stateB = statechart1.getState('stateB');
    
    statechart2 = Statechart.create({
      
      autoInitStatechart: true,
      
      initialState: 'stateC',
      
      stateC: TestState.design({
      
        mahChanged: function(target, key) {
          this.notifyStateObserveHandlerInvoked('mahChanged', target, key);
        }.stateObserves('obj1.foo', 'obj2.bar')
        
      }),
      
      stateD: TestState.design()
      
    });
    
    stateC = statechart2.getState('stateC');
    stateD = statechart2.getState('stateD');

  },
  
  afterEach: function() {
    window.obj1 = undefined;
    window.obj2 = undefined;
    window.obj3 = undefined;
    statechart1 = statechart2 = null;
    stateA = stateB = stateC = stateD = null;
    TestState = null;
  }

});

test("check state observe handlers when obj1's foo is changed", function (assert) {
  assert.ok(!stateA.fooChangedInvoked, "state A's fooChanged should not be invoked");
  assert.ok(!stateA.barChangedInvoked, "state A's barChanged should not be invoked");
  assert.ok(!stateC.mahChangedInvoked, "state C's mahChanged should not be invoked");
  assert.ok(obj1.hasObserverFor('foo'), "obj1 should have observers for property foo");
  
  obj1.set('foo', 100);
  
  assert.ok(stateA.fooChangedInvoked, "state A's fooChanged should be invoked");
  assert.equal(stateA.fooChangedInvoked.target, obj1, "target should be obj1");
  assert.equal(stateA.fooChangedInvoked.key, 'foo', "key should be foo");
  
  assert.ok(!stateA.barChangedInvoked, "state A's barChanged should not be invoked");
  
  assert.ok(stateC.mahChangedInvoked, "state C's mahChanged should be invoked");
  assert.equal(stateC.mahChangedInvoked.target, obj1, "target should be obj1");
  assert.equal(stateC.mahChangedInvoked.key, 'foo', "key should be foo");
});

test("check state observe handlers when obj2's bar is changed", function (assert) {
  assert.ok(!stateA.fooChangedInvoked, "state A's fooChanged should not be invoked");
  assert.ok(!stateA.barChangedInvoked, "state A's barChanged should not be invoked");
  assert.ok(!stateC.mahChangedInvoked, "state C's mahChanged should not be invoked");
  assert.ok(obj2.hasObserverFor('bar'), "obj2 should have observers for property bar");
  
  obj2.notifyPropertyChange('bar');
  
  assert.ok(!stateA.fooChangedInvoked, "state A's fooChanged should not be invoked");
  
  assert.ok(stateA.barChangedInvoked, "state A's barChanged should be invoked");
  assert.equal(stateA.barChangedInvoked.target, obj2, "target should be obj2");
  assert.equal(stateA.barChangedInvoked.key, 'bar', "key should be bar");
  
  assert.ok(stateC.mahChangedInvoked, "state C's mahChanged should be invoked");
  assert.equal(stateC.mahChangedInvoked.target, obj2, "target should be obj1");
  assert.equal(stateC.mahChangedInvoked.key, 'bar', "key should be bar");
});

test("check state observe handlers when state A's testProp is changed", function (assert) {
  assert.ok(!stateA.testPropChangedInvoked, "state A's testPropChanged should not be invoked");
  assert.ok(stateA.hasObserverFor('testProp'), "state A should have observers for property testProp");
  
  stateA.notifyPropertyChange('testProp');
  
  assert.ok(stateA.testPropChangedInvoked, "state A's testPropChanged should be invoked");
  assert.equal(stateA.testPropChangedInvoked.target, stateA, "target should be stateA");
  assert.equal(stateA.testPropChangedInvoked.key, 'testProp', "key should be testProp");
});

test("check state observe handlers when state A's testProp2.mah is changed", function (assert) {
  assert.ok(!stateA.testProp2ChangedInvoked, "state A's testProp2Changed should not be invoked");
  assert.ok(!stateA.hasObserverFor('testProp2'), "state A should have observers for property testProp2");
  assert.ok(stateA.get('testProp2').hasObserverFor('mah'), "state A's testProp2 should have observers for property mah");
  
  stateA.notifyPropertyChange('testProp2');
  
  assert.ok(!stateA.testProp2ChangedInvoked, "state A's testProp2Changed should not be invoked");
  
  stateA.get('testProp2').notifyPropertyChange('mah');
  
  assert.ok(stateA.testProp2ChangedInvoked, "state A's testProp2Changed should be invoked");
  assert.equal(stateA.testProp2ChangedInvoked.target, obj3, "target should be obj3");
  assert.equal(stateA.testProp2ChangedInvoked.key, 'mah', "key should be mah");
});

test("change current states and check state observe handlers when objs' property change", function (assert) {
  assert.ok(!stateA.fooChangedInvoked, "state A's fooChanged should not be invoked");
  assert.ok(!stateA.barChangedInvoked, "state A's barChanged should not be invoked");
  assert.ok(!stateA.testPropChangedInvoked, "state A's testPropChanged should not be invoked");
  assert.ok(!stateA.testProp2ChangedInvoked, "state A's testProp2Changed should not be invoked");
  assert.ok(!stateC.mahChangedInvoked, "state C's mahChanged should not be invoked");
  
  statechart1.gotoState('stateB');
  statechart2.gotoState('stateD');
  
  assert.ok(!obj1.hasObserverFor('foo'), "obj1 should not have observers for property foo");
  assert.ok(!obj2.hasObserverFor('bar'), "obj2 should not have observers for property bar");
  assert.ok(!stateA.hasObserverFor('testProp'), "state A should not have observers for property testProp");
  assert.ok(!stateA.get('testProp2').hasObserverFor('mah'), "state A's testProp2 should not have observers for property mah");
  
  obj1.notifyPropertyChange('foo');
  obj2.notifyPropertyChange('bar');
  stateA.notifyPropertyChange('testProp');
  stateA.get('testProp2').notifyPropertyChange('mah');
  
  assert.ok(!stateA.fooChangedInvoked, "state A's fooChanged should not be invoked");
  assert.ok(!stateA.barChangedInvoked, "state A's barChanged should not be invoked");
  assert.ok(!stateA.testPropChangedInvoked, "state A's testPropChanged should not be invoked");
  assert.ok(!stateA.testProp2ChangedInvoked, "state A's testProp2Changed should not be invoked");
  assert.ok(!stateC.mahChangedInvoked, "state C's mahChanged should not be invoked");
  
  statechart1.gotoState('stateA');
  statechart2.gotoState('stateC');
  
  assert.ok(obj1.hasObserverFor('foo'), "obj1 should have observers for property foo");
  assert.ok(obj2.hasObserverFor('bar'), "obj2 should have observers for property bar");
  assert.ok(stateA.hasObserverFor('testProp'), "state A should have observers for property testProp");
  assert.ok(stateA.get('testProp2').hasObserverFor('mah'), "state A's testProp2 should not have observers for property mah");
  
  obj1.notifyPropertyChange('foo');
  obj2.notifyPropertyChange('bar');
  stateA.notifyPropertyChange('testProp');
  stateA.get('testProp2').notifyPropertyChange('mah');
  
  assert.ok(stateA.fooChangedInvoked, "state A's fooChanged should be invoked");
  assert.ok(stateA.barChangedInvoked, "state A's barChanged should be invoked");
  assert.ok(stateA.testPropChangedInvoked, "state A's testPropChanged should be invoked");
  assert.ok(stateA.testProp2ChangedInvoked, "state A's testProp2Changed should be invoked");
  assert.ok(stateC.mahChangedInvoked, "state C's mahChanged should be invoked");
});

test("destroy statecharts and check that objs have not observers", function (assert) {
  assert.ok(obj1.hasObserverFor('foo'), "obj1 should have observers for property foo");
  assert.ok(obj2.hasObserverFor('bar'), "obj2 should have observers for property bar");
  assert.ok(stateA.hasObserverFor('testProp'), "state A should have observers for property testProp");
  assert.ok(stateA.get('testProp2').hasObserverFor('mah'), "state A's testProp2 should have observers for property mah");
  
  statechart1.destroy();
  statechart2.destroy();
  
  assert.ok(!obj1.hasObserverFor('foo'), "obj1 should not have observers for property foo");
  assert.ok(!obj2.hasObserverFor('bar'), "obj2 should not have observers for property bar");
  assert.ok(!stateA.hasObserverFor('testProp'), "state A should not have observers for property testProp");
  assert.ok(!stateA.get('testProp2').hasObserverFor('mah'), "state A's testProp2 should not have observers for property mah");
});

