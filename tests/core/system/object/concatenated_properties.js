// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC, GLOBAL } from '../../../../core/core.js';

(function(){

  var klass;

  module("SC.Object Concatenated Properties", {
    beforeEach: function(){
      klass = SC.Object.extend({
        concatenatedProperties: ['values'],
        values: ['a', 'b', 'c']
      });
    }
  });

  test("concatenates instances", function (assert) {
    var obj = klass.create({
      values: ['d', 'e', 'f']
    });

    var values = obj.get('values'),
        expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(values, expected, "should concatenate values property (expected: %@, got: %@)".fmt(expected, values));
  });

  test("concatenates subclasses", function (assert) {
    var subKlass = klass.extend({
      values: ['d', 'e', 'f']
    });
    var obj = subKlass.create();

    var values = obj.get('values'),
        expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(values, expected, "should concatenate values property (expected: %@, got: %@)".fmt(expected, values));
  });

  test("concatenates reopen", function (assert) {
    klass.reopen({
      values: ['d', 'e', 'f']
    });
    var obj = klass.create();

    var values = obj.get('values'),
        expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(values, expected, "should concatenate values property (expected: %@, got: %@)".fmt(expected, values));
  });

  test("concatenates mixin", function (assert) {
    var mixin = {
      values: ['d', 'e']
    };
    var subKlass = klass.extend(mixin, {
      values: ['f']
    });
    var obj = subKlass.create();

    var values = obj.get('values'),
        expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(values, expected, "should concatenate values property (expected: %@, got: %@)".fmt(expected, values));
  });

  test("concatenates reopen, subclass, and instance", function (assert) {
    klass.reopen({ values: ['d'] });
    var subKlass = klass.extend({ values: ['e'] });
    var obj = subKlass.create({ values: ['f'] });

    var values = obj.get('values'),
        expected = ['a', 'b', 'c', 'd', 'e', 'f'];
    assert.deepEqual(values, expected, "should concatenate values property (expected: %@, got: %@)".fmt(expected, values));
  });


})();
