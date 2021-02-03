// ==========================================================================
// Statechart Unit Test
// ==========================================================================
/*globals SC */

import { SC } from '/core/core.js';
import { Async } from '/statechart/statechart.js';


var Obj, obj, async, func;

// ..........................................................
// CONTENT CHANGING
// 

module("Async Tests", {
  beforeEach: function() {
    Obj = SC.Object.extend({
      fooInvoked: false,
      arg1: null,
      arg2: null,

      foo: function(arg1, arg2) {
        this.set('fooInvoked', true);
        this.set('arg1', arg1);
        this.set('arg2', arg2);
      }
    });
  },
  
  afterEach: function() {
    Obj = obj = async = func = null;
  }
});

test("test async - Async.perform('foo')", function (assert) {
  async = Async.perform('foo');
  assert.equal(SC.kindOf(async, Async), true);
  assert.equal(async.get('func'), 'foo');
  assert.equal(async.get('arg1'), null);
  assert.equal(async.get('arg2'), null);
  
  obj = Obj.create();
  async.tryToPerform(obj);
  assert.equal(obj.get('fooInvoked'), true);
  assert.equal(obj.get('arg1'), null);
  assert.equal(obj.get('arg2'), null);
});

test("test async - Async.perform('foo', 'hello', 'world')", function (assert) {  
  async = Async.perform('foo', 'hello', 'world');
  assert.equal(async.get('func'), 'foo');
  assert.equal(async.get('arg1'), 'hello');
  assert.equal(async.get('arg2'), 'world');
  
  obj = Obj.create();
  async.tryToPerform(obj);
  assert.equal(obj.get('fooInvoked'), true);
  assert.equal(obj.get('arg1'), 'hello');
  assert.equal(obj.get('arg2'), 'world');
});

test("test async - Async.perform(function() { ... })", function (assert) {    
  func = function() { this.foo(); };
  async = Async.perform(func);
  assert.equal(async.get('func'), func);
  assert.equal(async.get('arg1'), null);
  assert.equal(async.get('arg2'), null);
  
  obj = Obj.create();
  async.tryToPerform(obj);
  assert.equal(obj.get('fooInvoked'), true);
  assert.equal(obj.get('arg1'), null);
  assert.equal(obj.get('arg2'), null);
});
  
test("test async - Async.perform(function() { ... }, 'aaa', 'bbb')", function (assert) {  
  func = function(arg1, arg2) { this.foo(arg1, arg2); };
  async = Async.perform(func, 'aaa', 'bbb');
  assert.equal(async.get('func'), func);
  assert.equal(async.get('arg1'), 'aaa');
  assert.equal(async.get('arg2'), 'bbb');
  
  obj = Obj.create();
  async.tryToPerform(obj);
  assert.equal(obj.get('fooInvoked'), true);
  assert.equal(obj.get('arg1'), 'aaa');
  assert.equal(obj.get('arg2'), 'bbb');
});

test("test async - Async.perform('bar')", function (assert) {  
  async = Async.perform('bar');
  assert.equal(async.get('func'), 'bar');
  
  obj = Obj.create();
  async.tryToPerform(obj);
  assert.equal(obj.get('fooInvoked'), false);
});