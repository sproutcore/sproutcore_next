// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.isEqual Tests
// ========================================================================
/*globals module test */

import { SC } from "../../../core/core.js";

(function() {
  module("isArray");


  test("Simple tests", function (assert) {
    assert.ok(!SC.isArray(undefined), "undefined is not an array");
    assert.ok(!SC.isArray(null), "null is not an array");
    assert.ok(SC.isArray([]), "Array is an array");
    assert.ok(!SC.isArray({}), "Object is not an array");
    assert.ok(!SC.isArray(12), "Number is not an array");
  });

  test("SC.Array", function (assert) {
    var myArray = SC.Object.create(SC.Array);
    assert.ok(SC.isArray(myArray), "SC.Array is considered an array");
  });
})();
