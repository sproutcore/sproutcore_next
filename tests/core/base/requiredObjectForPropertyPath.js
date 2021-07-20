// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.requiredObjectForPropertyPath Tests
// ========================================================================
/*globals module test ok assert.deepEqual assert.equal expects */
import { SC, GLOBAL } from "../../../core/core.js";

module("SC.requiredObjectForPropertyPath") ;

test("should be able to resolve an object on the global", function (assert) {
  var myLocal = (GLOBAL.myGlobal = { test: 'this '}) ;

  assert.deepEqual(myLocal, { test: 'this '}) ;
  assert.deepEqual(GLOBAL.myGlobal, { test: 'this '}) ;

  // verify we can resolve our binding path
  assert.deepEqual(SC.requiredObjectForPropertyPath('myGlobal'), { test: 'this '}) ;

  GLOBAL.myGlobal = null;
});

test("should throw error when object can't be found", function (assert) {
  QUnit.assert.throws(function(){ SC.requiredObjectForPropertyPath('notExistingObject'); },
                  Error, "notExistingObject could not be found");
});
