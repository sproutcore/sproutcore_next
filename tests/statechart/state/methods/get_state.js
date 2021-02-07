// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { Statechart, State } from '../../../../statechart/statechart.js';

var sc, root;

module("State: getState method Tests", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      
      initialState: 'a',
    
      a: State.design({
        
        initialSubstate: 'x',
        
        x: State.design(),
        
        y: State.design(),
        
        foo: State.design()
        
      }),
      
      b: State.design({
        
        initialSubstate: 'x',
        
        x: State.design(),
        
        y: State.design(),
        
        bar: State.design()
        
      }),
      
      c: State.design({
        
        initialSubstate: 'x',
        
        x: State.design(),
        
        z: State.design()
        
      })
      
    });
    
    sc.initStatechart();
    root = sc.get('rootState');
  },
  
  afterEach: function() {

  }
  
});

test("get existing, umambiguous states from state Z", function (assert) {
  var state,
      z = root.getSubstate('z');
      
  state = z.getState('z');
  assert.equal(state, z, "should return self for value 'z'");
  
  state = z.getState(z);
  assert.equal(state, z, "should return self for value state Z");
  
  state = z.getState('a');
  assert.equal(state.get('fullPath'), 'a', "should return state for value 'a'");
  assert.equal(z.getState(state).get('fullPath'), 'a', "should return state for state A");
  
  state = z.getState('b');
  assert.equal(state.get('fullPath'), 'b', "should return state for value 'b'");
  
  state = z.getState('c');
  assert.equal(state.get('fullPath'), 'c', "should return state for value 'c'");
  
  state = z.getState('foo');
  assert.equal(state.get('fullPath'), 'a.foo', "should return state for value 'foo'");
  
  state = z.getState('a.foo');
  assert.equal(state.get('fullPath'), 'a.foo', "should return state for value 'a.foo'");
  
  state = z.getState('bar');
  assert.equal(state.get('fullPath'), 'b.bar', "should return state for value 'bar'");
  
  state = z.getState('b.bar');
  assert.equal(state.get('fullPath'), 'b.bar', "should return state for value 'a.bar'");
  
  state = z.getState('a.x');
  assert.equal(state.get('fullPath'), 'a.x', "should return state for value 'a.x'");
  
  state = z.getState('a.y');
  assert.equal(state.get('fullPath'), 'a.y', "should return state for value 'a.y'");
  
  state = z.getState('b.x');
  assert.equal(state.get('fullPath'), 'b.x', "should return state for value 'b.x'");
  
  state = z.getState('b.y');
  assert.equal(state.get('fullPath'), 'b.y', "should return state for value 'b.y'");
  
  state = z.getState('c.x');
  assert.equal(state.get('fullPath'), 'c.x', "should return state for value 'c.x'");
});

test("get state x from sibling states", function (assert) {
  var state,
      foo = root.getSubstate('a.foo'),
      bar = root.getSubstate('b.bar'),
      z = root.getSubstate('c.z');
      
  state = foo.getState('x');
  assert.equal(state.get('fullPath'), 'a.x', "for state foo, should return state a.x for value 'x'");
  
  state = bar.getState('x');
  assert.equal(state.get('fullPath'), 'b.x', "for state bar, should return state b.x for value 'x'");
  
  state = z.getState('x');
  assert.equal(state.get('fullPath'), 'c.x', "for state z, should return state c.x for value 'x'");
});

test("get state x from state a", function (assert) {
  var state,
      a = root.getSubstate('a');
      
  state = a.getState('x');
  assert.equal(state.get('fullPath'), 'a.x', "should return state A.X");
});

test("attempty to get state y from state z", function (assert) {
  var state,
      z = root.getSubstate('c.z');
      
  console.log('expecting to get an error...');
  state = z.getState('y');
  assert.ok(!state, "should not get a state for 'y'");
});