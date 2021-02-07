// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */


import { Statechart, State } from '../../../../statechart/statechart.js';

var sc, root;

module("State: getSubstate method Tests", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      
      initialState: 'foo',
    
      foo: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
          initialSubstate: 'a1',
          a1: State.design(),
          z: State.design()
        }),
        
        b: State.design({
          initialSubstate: 'b1',
          b1: State.design(),
          z: State.design()
        })
        
      }),
      
      bar: State.design({
        
        initialSubstate: 'x',
        
        x: State.design({
          initialSubstate: 'x1',
          x1: State.design(),
          z: State.design()
        }),
        
        y: State.design({
          initialSubstate: 'y1',
          y1: State.design(),
          z: State.design()
        })
        
      }),
      
      x: State.design({
        
        initialSubstate: 'a',
        
        a: State.design({
          initialSubstate: 'a1',
          a1: State.design(),
          z: State.design()
        }),
        
        b: State.design({
          initialSubstate: 'b1',
          b1: State.design(),
          z: State.design()
        })
        
      })
      
    });
    
    sc.initStatechart();
    root = sc.get('rootState');
  },
  
  afterEach: function() {
    sc = root = null;
  }
  
});

test("get immediate substates from root state", function (assert) {
  var state;
  
  state = root.getSubstate('foo');
  assert.equal(state.get('fullPath'), 'foo', "should return state foo for 'foo'");
  
  state = root.getSubstate('this.foo');
  assert.equal(state.get('fullPath'), 'foo', "should return state foo for 'this.foo'");
  
  state = root.getSubstate('bar');
  assert.equal(state.get('fullPath'), 'bar', "should return state bar for 'bar'");
  
  state = root.getSubstate('this.bar');
  assert.equal(state.get('fullPath'), 'bar', "should return state bar for 'this.bar'");
  
  console.log('expecting error message...');
  state = root.getSubstate('x');
  assert.ok(!state, "should not return state for 'x'");
  
  state = root.getSubstate('this.x');
  assert.equal(state.get('fullPath'), 'x', "should return state x for 'this.x'");
});

test("get immediate substates from foo state", function (assert) {
  var foo = root.getSubstate('foo'), 
      state;
  
  state = foo.getSubstate('a');
  assert.equal(state.get('fullPath'), 'foo.a', "should return state A for 'a'");
  
  state = foo.getSubstate('this.a');
  assert.equal(state.get('fullPath'), 'foo.a', "should return state A for 'this.a'");
  
  state = foo.getSubstate('b');
  assert.equal(state.get('fullPath'), 'foo.b', "should return state bar for 'b'");
  
  state = foo.getSubstate('this.b');
  assert.equal(state.get('fullPath'), 'foo.b', "should return state bar for 'this.b'");
  
  state = foo.getSubstate('mah');
  assert.ok(!state, "should not return state for 'mah'");
  
  state = foo.getSubstate('foo');
  assert.ok(!state, "should not return state for 'foo'");
});

test("get immediate substates from bar state", function (assert) {
  var bar = root.getSubstate('bar'), 
      state;
  
  state = bar.getSubstate('x');
  assert.equal(state.get('name'), 'x', "should return state X for 'x'");
  
  state = bar.getSubstate('this.x');
  assert.equal(state.get('name'), 'x', "should return state X for 'this.x'");
  
  state = bar.getSubstate('y');
  assert.equal(state.get('name'), 'y', "should return state Y for 'y'");
  
  state = bar.getSubstate('this.y');
  assert.equal(state.get('name'), 'y', "should return state Y for 'this.y'");
  
  state = bar.getSubstate('mah');
  assert.ok(!state, "should not return state for 'mah'");
  
  state = bar.getSubstate('bar');
  assert.ok(!state, "should not return state for 'bar'");
});

test("get substates from root using full paths", function (assert) {
  var state;
  
  state = root.getSubstate('foo.a');
  assert.equal(state.get('name'), 'a', "should return state A for 'foo.a'");
  
  state = root.getSubstate('foo.b');
  assert.equal(state.get('name'), 'b', "should return state B for 'foo.b'");
  
  state = root.getSubstate('foo.mah');
  assert.ok(!state, "should not return state for 'foo.mah'");
  
  state = root.getSubstate('foo.a.a1');
  assert.equal(state.get('name'), 'a1', "should return state A1 for 'foo.a.a1'");
  
  state = root.getSubstate('foo.a.z');
  assert.equal(state.get('fullPath'), 'foo.a.z', "should return first Z state for 'foo.a.z'");
  
  state = root.getSubstate('foo.b.b1');
  assert.equal(state.get('name'), 'b1', "should return state B1 for 'foo.b.b1'");
  
  state = root.getSubstate('foo.b.z');
  assert.equal(state.get('fullPath'), 'foo.b.z', "should return second Z state for 'foo.b.z'");
  
  state = root.getSubstate('bar.x');
  assert.equal(state.get('name'), 'x', "should return state X for 'bar.x'");
  
  state = root.getSubstate('bar.y');
  assert.equal(state.get('name'), 'y', "should return state Y for 'bar.y'");
  
  state = root.getSubstate('bar.mah');
  assert.ok(!state, "should not return state for 'bar.mah'");
  
  state = root.getSubstate('bar.x.x1');
  assert.equal(state.get('name'), 'x1', "should return state X1 for 'foo.x.x1'");
  
  state = root.getSubstate('bar.x.z');
  assert.equal(state.get('fullPath'), 'bar.x.z', "should return third Z state for 'bar.x.z'");
  
  state = root.getSubstate('bar.y.y1');
  assert.equal(state.get('name'), 'y1', "should return state Y1 for 'foo.y.y1'");
  
  state = root.getSubstate('bar.y.z');
  assert.equal(state.get('fullPath'), 'bar.y.z', "should return forth Z state for 'bar.y.z'");
  
  state = root.getSubstate('x.a');
  assert.equal(state.get('fullPath'), 'x.a', "should return state A for 'x.a'");
  
  state = root.getSubstate('x.b');
  assert.equal(state.get('fullPath'), 'x.b', "should return state B for 'x.b'");
  
  state = root.getSubstate('x.a.a1');
  assert.equal(state.get('fullPath'), 'x.a.a1', "should return state A1 for 'x.a.a1'");
  
  state = root.getSubstate('x.a.z');
  assert.equal(state.get('fullPath'), 'x.a.z', "should return state Z for 'x.a.z'");
  
  state = root.getSubstate('x.b.b1');
  assert.equal(state.get('fullPath'), 'x.b.b1', "should return state B1 for 'x.b.b1'");
  
  state = root.getSubstate('x.b.z');
  assert.equal(state.get('fullPath'), 'x.b.z', "should return state Z for 'x.b.z'");
});

test("get substates from foo state using full paths", function (assert) {
  var foo = root.getSubstate('foo'),
      state;
  
  state = foo.getSubstate('a.a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state A1 for 'a.a1'");
  
  state = foo.getSubstate('this.a.a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state A1 for 'this.a.a1'");
  
  state = foo.getSubstate('a.z');
  assert.equal(state.get('fullPath'), 'foo.a.z', "should return state A1 for 'a.z'");
  
  state = foo.getSubstate('this.a.z');
  assert.equal(state.get('fullPath'), 'foo.a.z', "should return state A1 for 'a.z'");
  
  state = foo.getSubstate('mah.z');
  assert.ok(!state, "should not return state for 'mah.z'");
  
  state = foo.getSubstate('foo.a');
  assert.ok(!state, "should not return state for 'foo.a'");
});

test("get umambiguous substates from foo state using state names", function (assert) {
  var state,
      foo = root.getSubstate('foo');
      
  state = foo.getSubstate('a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state A1 for 'a1'");
  
  state = foo.getSubstate('b1');
  assert.equal(state.get('fullPath'), 'foo.b.b1', "should return state A1 for 'b1'");
});

test("get umambiguous substates from foo state using state names", function (assert) {
  var state,
      foo = root.getSubstate('foo');
      
  state = foo.getSubstate('a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state A1 for 'a1'");
  
  state = foo.getSubstate('b1');
  assert.equal(state.get('fullPath'), 'foo.b.b1', "should return state A1 for 'b1'");
});

test("get z substates from foo state", function (assert) {
  var state,
      foo = root.getSubstate('foo'),
      callbackState, callbackKeys;
  
  console.log('expecting a console error message...');
  state = foo.getSubstate('z');
  assert.ok(!state, "should return null for 'z'");
  
  state = foo.getSubstate('a~z');
  assert.equal(state.get('fullPath'), 'foo.a.z', "should return state for 'a~z'");
  
  state = foo.getSubstate('b~z');
  assert.equal(state.get('fullPath'), 'foo.b.z', "should return state for 'b~z'");
  
  state = root.getSubstate('foo.a~z');
  assert.equal(state.get('fullPath'), 'foo.a.z', "should return state for 'foo.a~z'");
  
  state = root.getSubstate('foo.b~z');
  assert.equal(state.get('fullPath'), 'foo.b.z', "should return state for 'foo.b~z'");
});

test("get z substate from y state", function (assert) {
  var state,
      foo = root.getSubstate('y');
  
  state = root.getSubstate('y.z');
  assert.equal(state.get('fullPath'), 'bar.y.z', "should return state for 'y.z'");
});

test("get a1 substates from root state", function (assert) {
  var state;
  
  console.log('expecting a console error message...');
  state = root.getSubstate('a1');
  assert.ok(!state, "should return null for 'a1'");
  
  state = root.getSubstate('foo~a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state for 'foo~a1'");
  
  state = root.getSubstate('foo~a.a1');
  assert.equal(state.get('fullPath'), 'foo.a.a1', "should return state for 'foo~a.a1'");
  
  state = root.getSubstate('x~a1');
  assert.equal(state.get('fullPath'), 'x.a.a1', "should return state for 'x~a1'");
  
  state = root.getSubstate('x~a.a1');
  assert.equal(state.get('fullPath'), 'x.a.a1', "should return state for 'x~a.a1'");
});

test("get non-existing substate 'abc' with using callback", function (assert) {
  var result, cbState, cbValue, cbKeys; 
  
  result = root.getSubstate('abc', function(state, value, keys) {
    cbState = state;
    cbValue = value;
    cbKeys = keys;
  });
  
  assert.ok(!result, "should not return result for 'abc'");
  assert.equal(cbState, root, "callback state arg should be root state");
  assert.equal(cbValue, 'abc', "callback value arg should be 'abc'");
  assert.ok(!cbKeys, "callback keys arg should be none");
});

test("get ambiguous substate 'x' substate with using callback", function (assert) {
  var result, cbState, cbValue, cbKeys; 
  
  result = root.getSubstate('x', function(state, value, keys) {
    cbState = state;
    cbValue = value;
    cbKeys = keys;
  });
  console.log(cbKeys);
  assert.ok(!result, "should not return result for 'x'");
  assert.equal(cbState, root, "callback state arg should be root state");
  assert.equal(cbValue, 'x', "callback value arg should be 'x'");
  assert.equal(cbKeys.length, 2, "callback keys arg should be array with length 2");
  assert.ok(cbKeys.indexOf('x') >= 0, "callback keys arg should contain value 'x'");
  assert.ok(cbKeys.indexOf('bar.x') >= 0, "callback keys arg should contain value 'bar.x'");
});