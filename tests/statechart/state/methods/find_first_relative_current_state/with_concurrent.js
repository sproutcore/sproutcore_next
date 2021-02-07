// ==========================================================================
// SC Unit Test
// ==========================================================================
/*globals SC */



import { Statechart, State, StatechartDelegate, StateRouteHandlerContext } from '../../../../../statechart/statechart.js';


var sc, root, stateFoo, stateBar, stateA, stateB, stateX, stateY, stateA1, stateA2, stateB1, stateB2, stateX1, stateX2, stateY1, stateY2;

module("State: findFirstRelativeCurrentState method Tests (with concurrent states)", {
  
  beforeEach: function() {
    
    sc = Statechart.create({
      
      initialState: 'foo',
    
      foo: State.design({
        
        substatesAreConcurrent: true,
        
        a: State.design({
          initialSubstate: 'a1',
          a1: State.design(),
          a2: State.design()
        }),
        
        b: State.design({
          initialSubstate: 'b1',
          b1: State.design(),
          b2: State.design()
        })
        
      }),
      
      bar: State.design({
        
        substatesAreConcurrent: true,
        
        x: State.design({
          initialSubstate: 'x1',
          x1: State.design(),
          x2: State.design()
        }),
        
        y: State.design({
          initialSubstate: 'y1',
          y1: State.design(),
          y2: State.design()
        })
        
      })
      
    });
    
    sc.initStatechart();
    
    root = sc.get('rootState');
    stateFoo = sc.getState('foo');
    stateBar = sc.getState('bar');
    stateA = sc.getState('a');
    stateB = sc.getState('b');
    stateX = sc.getState('x');
    stateY = sc.getState('y');
    stateA1 = sc.getState('a1');
    stateA2 = sc.getState('a2');
    stateB1 = sc.getState('b1');
    stateB2 = sc.getState('b2');
    stateX1 = sc.getState('x1');
    stateX2 = sc.getState('x2');
    stateY1 = sc.getState('y1');
    stateY2 = sc.getState('y2');
  },
  
  afterEach: function() {
    sc = root = stateFoo = stateBar = null;
    stateA = stateB = stateX = stateY = null;
    stateA1 = stateA2 = stateB1 = stateB2 = null;
    stateX1 = stateX2 = stateY1 = stateY2 = null;
  }
  
});

test("check using state A1 with state foo entered", function (assert) {
  assert.equal(stateA1.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state A2 with state foo entered", function (assert) {
  assert.equal(stateA2.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state A with state foo entered", function (assert) {
  assert.equal(stateA.findFirstRelativeCurrentState(), stateA1, "state should return state A1");
});

test("check using state Foo with state foo entered", function (assert) {
  var result;

  assert.ok(stateFoo.get('isEnteredState'), 'state foo should be entered');
  assert.ok(stateA.get('isEnteredState'), 'state a should be entered');
  assert.ok(stateB.get('isEnteredState'), 'state b should be entered');
  assert.ok(stateA1.get('isCurrentState'), 'state a1 should be entered');
  assert.ok(stateB1.get('isCurrentState'), 'state b1 should be entered');
  
  result = stateFoo.findFirstRelativeCurrentState();
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return either state A1 or B1 without anchor");
  
  assert.equal(stateFoo.findFirstRelativeCurrentState(stateA), stateA1, "state should return A1 with anchor state A");
  assert.equal(stateFoo.findFirstRelativeCurrentState('a'), stateA1, "state should return A1 with anchor state 'a'");
  assert.equal(stateFoo.findFirstRelativeCurrentState(stateA1), stateA1, "state should return A1 with anchor state A1");
  assert.equal(stateFoo.findFirstRelativeCurrentState('a1'), stateA1, "state should return A1 with anchor state 'a1'");
  assert.equal(stateFoo.findFirstRelativeCurrentState('a.a1'), stateA1, "state should return A1 with anchor state 'a.a1'");
  assert.equal(stateFoo.findFirstRelativeCurrentState(stateA2), stateA1, "state should return A1 with anchor state A2");
  assert.equal(stateFoo.findFirstRelativeCurrentState('a2'), stateA1, "state should return A1 with anchor state 'a2'");
  assert.equal(stateFoo.findFirstRelativeCurrentState('a.a2'), stateA1, "state should return A1 with anchor state 'a.a2'");

  assert.equal(stateFoo.findFirstRelativeCurrentState(stateB), stateB1, "state should return B1 with anchor state B");
  assert.equal(stateFoo.findFirstRelativeCurrentState('b'), stateB1, "state should return B1 with anchor state 'b'");
  assert.equal(stateFoo.findFirstRelativeCurrentState(stateB1), stateB1, "state should return B1 with anchor state B1");
  assert.equal(stateFoo.findFirstRelativeCurrentState('b1'), stateB1, "state should return B1 with anchor state 'b1'");
  assert.equal(stateFoo.findFirstRelativeCurrentState('b.b1'), stateB1, "state should return B1 with anchor state 'b.b1'");
  assert.equal(stateFoo.findFirstRelativeCurrentState(stateB2), stateB1, "state should return B1 with anchor state B2");
  assert.equal(stateFoo.findFirstRelativeCurrentState('b2'), stateB1, "state should return B1 with anchor state 'b2'");
  assert.equal(stateFoo.findFirstRelativeCurrentState('b.b2'), stateB1, "state should return B1 with anchor state 'b.b2'");
});

test("check using root state with state foo entered (with concurrent)", function (assert) {
  var result;
  
  result = root.findFirstRelativeCurrentState();
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return either state A1 or B1 without anchor");

  result = root.findFirstRelativeCurrentState(stateFoo); 
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return either state A1 or B1 with anchor state Foo");

  result = root.findFirstRelativeCurrentState(stateBar);
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return either state A1 or B1 with anchor state Bar");
 
  assert.equal(root.findFirstRelativeCurrentState(stateA), stateA1, "state should return state A1 with anchor state A");
  assert.equal(root.findFirstRelativeCurrentState('a'), stateA1, "state should return state A1 with anchor state 'a'");
  assert.equal(root.findFirstRelativeCurrentState('foo.a'), stateA1, "state should return state A1 with anchor state 'foo.a'");
 
  assert.equal(root.findFirstRelativeCurrentState(stateB), stateB1, "state should return state B1 with anchor state B");
  assert.equal(root.findFirstRelativeCurrentState('b'), stateB1, "state should return state B1 with anchor state 'b'");
  assert.equal(root.findFirstRelativeCurrentState('foo.b'), stateB1, "state should return state B1 with anchor state 'foo.b'");

  result = root.findFirstRelativeCurrentState(stateX);
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return state either state A1 or B1 with anchor state X");

  result = root.findFirstRelativeCurrentState(stateY);
  assert.ok([stateA1, stateB1].indexOf(result) >= 0, "state should return state either state A1 or B1 with anchor state Y");
});

test("check using root state with state bar entered", function (assert) {
  var result;
  
  sc.gotoState('bar');
  
  result = root.findFirstRelativeCurrentState();
  assert.ok([stateX1, stateY1].indexOf(result) >= 0, "state should return either state X1 or Y1 without anchor");
  
  result = root.findFirstRelativeCurrentState(stateFoo);
  assert.ok(root.findFirstRelativeCurrentState(stateFoo), "state should return either state X1 or Y1 with anchor state Foo");

  result = root.findFirstRelativeCurrentState(stateBar);
  assert.ok([stateX1, stateY1].indexOf(result) >= 0, "state should return either state X1 or Y1 with anchor state Bar");
 
  assert.equal(root.findFirstRelativeCurrentState(stateX), stateX1, "state should return state X1 with anchor state X");
  assert.equal(root.findFirstRelativeCurrentState('x'), stateX1, "state should return state X1 with anchor state 'x'");
  assert.equal(root.findFirstRelativeCurrentState('bar.x'), stateX1, "state should return state X1 with anchor state 'bar.x'");
 
  assert.equal(root.findFirstRelativeCurrentState(stateY), stateY1, "state should return state Y1 with anchor state Y");
  assert.equal(root.findFirstRelativeCurrentState('y'), stateY1, "state should return state Y1 with anchor state 'y'");
  assert.equal(root.findFirstRelativeCurrentState('bar.y'), stateY1, "state should return state Y1 with anchor state 'bar.y'");
 
  result = root.findFirstRelativeCurrentState(stateA);
  assert.ok([stateX1, stateY1].indexOf(result) >= 0, "state should return either state X1 or Y1 with anchor state A");
  
  result = root.findFirstRelativeCurrentState(stateB);
  assert.ok([stateX1, stateY1].indexOf(result) >= 0, "state should return either state X1 or Y1 with anchor state B");
});