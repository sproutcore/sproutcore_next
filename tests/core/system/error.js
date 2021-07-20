// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.Error Base Tests
// ========================================================================
/*globals module test ok isObj equals expects */
import { SC, GLOBAL } from '../../../core/core.js';

module("SC.ERROR");

test("SC.Error.desc creates an error instance with description,label and code", function (assert) {
  var c = SC.Error.desc('This is an error instance','Error Instance', "FOO");
  assert.equal(SC.T_ERROR,SC.typeOf(c),'Error instance');
  assert.equal('This is an error instance',c.message,'Description');
  assert.equal('Error Instance',c.label,'Label');
  assert.equal(c.get('errorValue'), "FOO", 'error value should be set');
});

test("SC.$error creates an error instance with description,label and code", function (assert) {
  var d = SC.$error('This is a new error instance','New Error Instance', "FOO");
  assert.equal(SC.T_ERROR,SC.typeOf(d),'New Error instance');
  assert.equal('This is a new error instance',d.message,'Description');
  assert.equal('New Error Instance',d.label,'Label');
  assert.equal(d.get('errorValue'), "FOO", 'error value should be set');
});

test("SC.$ok should return true if the passed value is an error object or false", function (assert) {
  assert.ok(SC.$ok(true), '$ok(true) should be true');
  assert.ok(!SC.$ok(false), '$ok(false) should be false');
  assert.ok(SC.$ok(null), '$ok(null) should be true');
  assert.ok(SC.$ok(undefined), '$ok(undefined) should be true');
  assert.ok(SC.$ok("foo"), '$ok(foo) should be true');
  assert.ok(!SC.$ok(SC.$error("foo")), '$ok(SC.Error) should be false');

  assert.ok(!SC.$ok(new SC.Error()), '$ok(Error) should be false');
  assert.ok(!SC.$ok(SC.Object.create({ isError: true })), '$ok({ isError: true }) should be false');
});

test("SC.$val should return the error value if it has one", function (assert) {
  assert.equal(SC.val(true), true, 'val(true) should be true');
  assert.equal(SC.val(false), false, 'val(false) should be false');
  assert.equal(SC.val(null), null, 'val(null) should be true');
  assert.equal(SC.val(undefined), undefined, '$ok(undefined) should be true');
  assert.equal(SC.val("foo"), "foo", 'val(foo) should be true');
  assert.equal(SC.val(SC.$error("foo", "FOO", "BAZ")), "BAZ", 'val(SC.Error) should be BAZ');
  assert.equal(SC.val(SC.$error("foo", "FOO")), undefined, 'val(SC.Error) should be undefined');
  assert.equal(SC.val(new SC.Error()), null, 'val(Error) should be null');
  assert.equal(SC.val(SC.Object.create({ isError: true, errorValue: "BAR" })), "BAR", 'val({ isError: true, errorValue: BAR }) should be BAR');
});

test("errorObject property should return the error itself", function (assert) {
  var er = SC.$error("foo");
  assert.equal(er.get('errorObject'), er, 'errorObject should return receiver');
});

test("SC.Error#throw throw an error with description,label and code", function (assert) {
  var msg='',
    error = SC.Error.desc('This is an error instance','Error Instance', "FOO");
  try{
    error.throw();
  }catch(e){
    msg=e.message;
  }
  assert.equal(error.toString(), msg, "should throw the following error ");
});

test("SC.$throw creates and throw an error instance with description,label and code", function (assert) {
  var msg='';
  try{
    SC.$throw('This is an error instance','Error Instance', "FOO")
  }catch(error){
    msg=error.message;
  }
  assert.equal(msg.split(':')[2], 'This is an error instance (FOO)', "should throw the following error ");
});
