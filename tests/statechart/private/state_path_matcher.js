// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '../../../core/core.js';
import { StatechartManager, State, StatechartMonitor, StatePathMatcher } from '../../../statechart/statechart.js';

var state1, state2;
module("StatePathMatcher: match Tests", {
  beforeEach: function() {
    state1 = SC.Object.create({
      substates: [
        SC.Object.create({ name: 'a' })
      ]
    });

    state2 = SC.Object.create({
      substates: [
        SC.Object.create({ name: 'b' })
      ]
    });
  },
  
  afterEach: function() {
    state1 = state2 = null;
  }

});

test("test with expresson 'a'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'a' });
  assert.ok(spm.match('a'), "should match 'a'");
  assert.ok(spm.match('b.a'), "should match 'b.a'");

  assert.ok(!spm.match('b'), "should not match 'b'");
  assert.ok(!spm.match('a.b'), "should not match 'a.b'"); 
});

test("test with expresson 'a.b'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'a.b' });
  assert.ok(spm.match('a.b'), "should match 'a.b'");
  assert.ok(spm.match('x.a.b'), "should match 'x.a.b'");

  assert.ok(!spm.match('b'), "should not match 'b'");
  assert.ok(!spm.match('a'), "should not match 'a'");
  assert.ok(!spm.match('b.a'), "should not match 'b.a'");
  assert.ok(!spm.match('a.b.x'), "should not match 'a.b.x'"); 
});

test("test with expresson 'a~b'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'a~b' });
  assert.ok(spm.match('a.b'), "should match 'a.b'");
  assert.ok(spm.match('a.x.b'), "should match 'a.x.b'");
  assert.ok(spm.match('a.x.y.b'), "should match 'a.x.y.b'");
  assert.ok(spm.match('x.a.b'), "should match 'x.a.b'");
  assert.ok(spm.match('x.a.y.b'), "should match 'x.a.y.b'");

  assert.ok(!spm.match('b'), "should not match 'b'");
  assert.ok(!spm.match('a'), "should not match 'a'");
  assert.ok(!spm.match('a.b.x'), "should not match 'a.b.x'"); 
  assert.ok(!spm.match('a.y.b.x'), "should not match 'a.y.b.x'"); 
  assert.ok(!spm.match('y.a.b.x'), "should not match 'y.a.b.x'"); 
});

test("test with expresson 'a.b~c.d'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'a.b~c.d' });
  assert.ok(spm.match('a.b.c.d'), "should match 'a.b.c.d'");
  assert.ok(spm.match('a.b.x.c.d'), "should match 'a.b.x.c.d'");
  assert.ok(spm.match('a.b.x.y.c.d'), "should match 'a.b.x.y.c.d'");
  assert.ok(spm.match('z.a.b.x.y.c.d'), "should match 'z.a.b.x.y.c.d'");

  assert.ok(!spm.match('a.b.c.d.x'), "should not match 'a.b.c.d.x'");
  assert.ok(!spm.match('b.c.d'), "should not match 'b.c.d'");
  assert.ok(!spm.match('a.b.c'), "should not match 'a.b.c'");
  assert.ok(!spm.match('a.b.d'), "should not match 'a.b.d'");
  assert.ok(!spm.match('a.c.d'), "should not match 'a.c.d'");
  assert.ok(!spm.match('a.b.y.c.d.x'), "should not match 'a.b.y.c.d.x'"); 
});

test("test with expresson 'this.a'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'this.a' });
  
  spm.set('state', state1);
   
  assert.ok(spm.match('a'), "should match 'a' for state1");
  assert.ok(!spm.match('b'), "should not match 'b' for state1");
  assert.ok(!spm.match('a.b'), "should not match 'a.b' for state1");
  
  spm.set('state', state2);
  
  assert.ok(!spm.match('a'), "should not match 'a' for state2"); 
   
});

test("test with expresson 'this.a.b'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'this.a.b' });
  
  spm.set('state', state1);

  assert.ok(spm.match('a.b'), "should match 'a.b'");
  assert.ok(!spm.match('a'), "should not match 'a'");
  assert.ok(!spm.match('b'), "should not match 'b'");
   
});

test("test with expresson 'this.a~b'", function (assert) {
  var spm = StatePathMatcher.create({ expression: 'this.a~b' });
  
  spm.set('state', state1);

  assert.ok(spm.match('a.b'), "should match 'a.b'");
  assert.ok(spm.match('a.x.b'), "should match 'a.x.b'");
  
  assert.ok(!spm.match('a'), "should not match 'a'");
  assert.ok(!spm.match('b'), "should not match 'b'");
  assert.ok(!spm.match('b.a'), "should not match 'b.a'");
   
});