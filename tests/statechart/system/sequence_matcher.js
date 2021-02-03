// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '../../../core/core.js';
import { StatechartManager, State, StatechartMonitor } from '../../../statechart/statechart.js';

var obj, monitor, rootState, a, b, c, d, e, m, n, o, p, x, y;

module("Statechart: Destroy Statechart Tests", {
  beforeEach : function() {
    
    obj = SC.Object.create(StatechartManager, {
      
      initialState: 'A',
      A: State.design(),
      B: State.design(),
      C: State.design(),
      D: State.design(),
      E: State.design(),
      M: State.design(),
      N: State.design(),
      O: State.design(),
      P: State.design(),
      X: State.design(),
      Y: State.design()
      
    });
    
    obj.initStatechart();
    rootState = obj.get('rootState');
    a = obj.getState('A');
    b = obj.getState('B');
    c = obj.getState('C');
    d = obj.getState('D');
    e = obj.getState('E');
    m = obj.getState('M');
    n = obj.getState('N');
    o = obj.getState('O');
    p = obj.getState('P');
    x = obj.getState('X');
    y = obj.getState('Y');
    
    monitor = StatechartMonitor.create({ statechart: obj });
  },
  
  afterEach: function() {
    obj = monitor = rootState = null;
    a = b = c = d = e = m = n = o = p = x = y = null;
  }
});

test("match against sequence entered A", function(assert) {
  monitor.pushEnteredState(a);
  
  var matcher = monitor.matchSequence();
  
  assert.ok(matcher.begin().entered(a).end(), "should match entered A");
  assert.ok(matcher.begin().entered('A').end(), "should match entered 'A'");
  assert.ok(!matcher.begin().entered(b).end(), "should not match entered B");
  assert.ok(!matcher.begin().exited(a).end(), "should not match exited A");
  assert.ok(!matcher.begin().exited(b).end(), "should not match exited B");
  assert.ok(!matcher.begin().entered(a, b).end(), "should not match entered [A, B]");
  assert.ok(!matcher.begin().entered(a).entered(b).end(), "should not match entered A, entered B");
});

test("match against sequence exited A", function(assert) {
  monitor.pushExitedState(a);
  
  var matcher = monitor.matchSequence();
  
  assert.ok(matcher.begin().exited(a).end(), "should match exited A");
  assert.ok(matcher.begin().exited('A').end(), "should match exited 'A'");
  assert.ok(!matcher.begin().exited(b).end(), "should not match exited B");
  assert.ok(!matcher.begin().entered(a).end(), "should not match entered A");
  assert.ok(!matcher.begin().entered(b).end(), "should not match entered B");
  assert.ok(!matcher.begin().exited(a, b).end(), "should not match exited [A, B]");
  assert.ok(!matcher.begin().exited(a).exited(b).end(), "should not match exited A, exited B");
});

test("match against sequence entered A, entered B", function (assert) {
  monitor.pushEnteredState(a);
  monitor.pushEnteredState(b);
  
  var matcher = monitor.matchSequence();
  
  assert.ok(matcher.begin().entered(a, b).end(), "should match entered [A, B]");
  assert.ok(matcher.begin().entered('A', 'B').end(), "should match entered ['A', 'B']");
  assert.ok(matcher.begin().entered(a).entered(b).end(), "should match entered A, entered B");
  assert.ok(!matcher.begin().entered(a).end(), "should not match entered A");
  assert.ok(!matcher.begin().entered(b).end(), "should not match entered B");
  assert.ok(!matcher.begin().entered(b, a).end(), "should not match entered [B, A]");
  assert.ok(!matcher.begin().entered('B', 'A').end(), "should match entered ['B', 'A']");
  assert.ok(!matcher.begin().entered(b).entered(a).end(), "should not matched entered B, entered A");
  assert.ok(!matcher.begin().entered(a, c).end(), "should not match entered [A, C]");
  assert.ok(!matcher.begin().entered('A', 'C').end(), "should not match entered [A, C]");
  assert.ok(!matcher.begin().entered(a).entered(c).end(), "should not match entered A, entered C");
  assert.ok(!matcher.begin().entered(a, b, c).end(), "should not match entered [A, B, C]");
});

test("match against sequence exited A, exited B", function (assert) {
  monitor.pushExitedState(a);
  monitor.pushExitedState(b);
  
  var matcher = monitor.matchSequence();
  
  assert.ok(matcher.begin().exited(a, b).end(), "should match exited [A, B]");
  assert.ok(matcher.begin().exited('A', 'B').end(), "should match exited ['A', 'B']");
  assert.ok(matcher.begin().exited(a).exited(b).end(), "should match exited A, entered B");
  assert.ok(!matcher.begin().exited(a).end(), "should not match exited A");
  assert.ok(!matcher.begin().exited(b).end(), "should not match exited B");
  assert.ok(!matcher.begin().exited(b, a).end(), "should not match exited [B, A]");
  assert.ok(!matcher.begin().exited('B', 'A').end(), "should not match exited ['B', 'A']");
  assert.ok(!matcher.begin().exited(b).exited(a).end(), "should not matched exited B, exited A");
  assert.ok(!matcher.begin().exited(a, c).end(), "should not match exited [A, C]");
  assert.ok(!matcher.begin().exited('A', 'C').end(), "should not match exited ['A', 'C']");
  assert.ok(!matcher.begin().exited(a).exited(c).end(), "should not match exited A, exited C");
});

test("match against sequence exited A, entered B", function (assert) {
  monitor.pushExitedState(a);
  monitor.pushEnteredState(b);
  
  var matcher = monitor.matchSequence();
  
  assert.ok(matcher.begin().exited(a).entered(b).end(), "should match exited A, entered B");
  assert.ok(matcher.begin().exited('A').entered('B').end(), "should match exited 'A', entered 'B'");
  assert.ok(!matcher.begin().entered(a).exited(a).end(), "should not match entered A, exited B");
  assert.ok(!matcher.begin().entered('A').exited('B').end(), "should not match entered 'A', exited 'B'");
  assert.ok(!matcher.begin().exited(a).entered(c).end(), "should not match exited A, entered C");
  assert.ok(!matcher.begin().exited(a).entered(b, c).end(), "should not match exited A, entered [B, C]");
  assert.ok(!matcher.begin().exited(a).entered(b).entered(c).end(), "should not match exited A, entered B, entered C");
  assert.ok(!matcher.begin().exited(a).entered(b).exited(c).end(), "should not match exited A, entered B, exited C");
});

test("match against sequence seq(enter A), seq(enter B)", function (assert) {
  monitor.pushEnteredState(a);
  monitor.pushEnteredState(b);
  
  var matcher = monitor.matchSequence();
  
  matcher.begin()
    .beginSequence()
      .entered(a)
    .endSequence()
    .beginSequence()
      .entered(b)
    .endSequence()
  .end();
  
  assert.ok(matcher.get('match'), "should match seq(entered A), seq(entered B)");
  
  matcher.begin()
    .beginSequence()
      .entered(a)
      .entered(b)
    .endSequence()
  .end();
  
  assert.ok(matcher.get('match'), "should match seq(entered A, entered B)");
  
  matcher.begin()
    .beginSequence()
      .entered(a)
      .entered(b)
    .endSequence()
  .end();
  
  assert.ok(matcher.get('match'), "should match seq(entered A, entered B)");
  
  matcher.begin()
    .beginSequence()
      .entered(a, b)
    .endSequence()
  .end();
  
  assert.ok(matcher.get('match'), "should match seq(entered [A, B]");
  
  matcher.begin()
    .beginSequence()
      .entered(a)
    .endSequence()
  .end();
  
  assert.ok(!matcher.get('match'), "should not match seq(entered A)");
  
  matcher.begin()
    .beginSequence()
      .entered(a)
    .endSequence()
    .beginSequence()
      .entered(c)
    .endSequence()
  .end();
  
  assert.ok(!matcher.get('match'), "should not match seq(entered A), seq(entered C)");
  
  matcher.begin()
    .beginSequence()
      .entered(a)
    .endSequence()
    .beginSequence()
      .entered(b)
    .endSequence()
    .beginSequence()
      .entered(c)
    .endSequence()
  .end();
  
  assert.ok(!matcher.get('match'), "should not match seq(entered A), seq(entered B), seq(entered C)");
});

test("match against sequence con(entered A)", function (assert) {
  monitor.pushEnteredState(a);
  
  var matcher = monitor.matchSequence();
  
  matcher.begin()
     .beginConcurrent()
       .entered(a)
     .endConcurrent()
   .end();
   
   assert.ok(matcher.get('match'), "should match con(entered A)");
   
   matcher.begin()
    .beginConcurrent()
      .beginSequence()
        .entered(a)
      .endSequence()
    .endConcurrent()
  .end();

  assert.ok(matcher.get('match'), "should match con(seq(entered A))");
   
  matcher.begin()
    .beginConcurrent()
      .entered(b)
    .endConcurrent()
  .end();
   
  assert.ok(!matcher.get('match'), "should match con(entered B)");
   
  matcher.begin()
    .beginConcurrent()
      .exited(a)
    .endConcurrent()
  .end();
   
  assert.ok(!matcher.get('match'), "should match con(exited B)");
  
  matcher.begin()
    .beginConcurrent()
      .entered(a)
      .entered(b)
    .endConcurrent()
  .end();
  
  assert.ok(!matcher.get('match'), "should not match con(entered A, entered B)");
  
  matcher.begin()
    .beginConcurrent()
      .entered(b)
      .entered(a)
    .endConcurrent()
  .end();
  
  assert.ok(!matcher.get('match'), "should not match con(entered B, entered A)");
});

test("match against sequence con(entered A entered B)", function (assert) {
  monitor.pushEnteredState(a);
  monitor.pushEnteredState(b);
  
  var matcher = monitor.matchSequence();
  
  matcher.begin()
    .beginConcurrent()
      .entered(a)
      .entered(b)
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(entered A, entered B)");
  
  matcher.begin()
    .beginConcurrent()
      .entered(b)
      .entered(a)
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(entered B, entered A)");
  
  matcher.begin()
    .beginConcurrent()
      .beginSequence()
        .entered(a)
      .endSequence()
      .entered(b)
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(seq(entered A), entered B)");
  
  matcher.begin()
    .beginConcurrent()
      .beginSequence()
        .entered(a)
      .endSequence()
      .beginSequence()
        .entered(b)
      .endSequence()
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(seq(entered A), seq(entered B))");
  
  matcher.begin()
    .beginConcurrent()
      .entered(a, b)
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(entered [A, B])");
  
  matcher.begin()
    .beginConcurrent()
      .beginSequence()
        .entered(a)
        .entered(b)
      .endSequence()
    .endConcurrent()
  .end();
   
  assert.ok(matcher.get('match'), "should match con(entered [A, B])");
  
  matcher.begin()
    .beginConcurrent()
      .entered(a)
    .endConcurrent()
  .end();
   
  assert.ok(!matcher.get('match'), "should not match con(entered A])");
  
  matcher.begin()
    .beginConcurrent()
      .entered(a)
      .entered(c)
    .endConcurrent()
  .end();
   
  assert.ok(!matcher.get('match'), "should not match con(entered A, entered C)");
  
  matcher.begin()
    .beginConcurrent()
      .entered(a)
      .entered(b)
      .entered(c)
    .endConcurrent()
  .end();
   
  assert.ok(!matcher.get('match'), "should not match con(entered A, entered B, entered C)");
   
});

test("match against sequence con(entered A entered B)", function (assert) {
  monitor.pushEnteredState(a);
  monitor.pushEnteredState(b);
  monitor.pushEnteredState(x);
  monitor.pushEnteredState(m);
  monitor.pushEnteredState(n);
  monitor.pushEnteredState(y);
  monitor.pushEnteredState(o);
  monitor.pushEnteredState(p);
  monitor.pushEnteredState(c);
  
  var matcher = monitor.matchSequence();
  
  matcher.begin()
    .entered(a)
    .entered(b)
    .beginConcurrent()
      .beginSequence()
        .entered(x, m, n)
      .endSequence()
      .beginSequence()
        .entered(y, o, p)
      .endSequence()
    .endConcurrent()
    .entered(c)
  .end();
  
  assert.ok(matcher.get('match'), 
    "should match entered A, entered B, con(seq(entered [X, M, N]), seq(entered [Y, O, P])) entered C)");
    
  matcher.begin()
    .entered(a)
    .entered(b)
    .beginConcurrent()
      .beginSequence()
        .entered(y, o, p)
      .endSequence()
      .beginSequence()
        .entered(x, m, n)
      .endSequence()
    .endConcurrent()
    .entered(c)
  .end();

  assert.ok(matcher.get('match'), 
    "should match entered A, entered B, con(seq(entered [Y, O, P]), seq(entered [X, M, N])) entered C)");
    
  matcher.begin()
    .entered(a)
    .entered(b)
    .beginConcurrent()
      .beginSequence()
        .entered(x, m)
      .endSequence()
      .beginSequence()
        .entered(y, o, p)
      .endSequence()
    .endConcurrent()
    .entered(c)
  .end();

  assert.ok(!matcher.get('match'), 
    "should not match entered A, entered B, con(seq(entered [X, M]), seq(entered [Y, O, P])) entered C)");
    
  matcher.begin()
    .entered(a)
    .entered(b)
    .beginConcurrent()
      .beginSequence()
        .entered(x, m, n)
      .endSequence()
      .beginSequence()
        .entered(y, o)
      .endSequence()
    .endConcurrent()
    .entered(c)
  .end();

  assert.ok(!matcher.get('match'), 
    "should not match entered A, entered B, con(seq(entered [X, M]), seq(entered [Y, O])) entered C)");
    
  matcher.begin()
    .entered(a)
    .entered(b)
    .beginConcurrent()
      .beginSequence()
        .entered(x, m, n)
      .endSequence()
      .beginSequence()
        .entered(y, o, p)
      .endSequence()
      .entered(e)
    .endConcurrent()
    .entered(c)
  .end();

  assert.ok(!matcher.get('match'), 
    "should not match entered A, entered B, con(seq(entered [X, M, N]), seq(entered [Y, O, P]), entered E) entered C)");
  
});