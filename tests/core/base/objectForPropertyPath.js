// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// SC.objectForPropertyPath Tests
// ========================================================================
/*globals module test ok assert.deepEqual assert.equal expects */
import { SC, GLOBAL } from "../../../core/core.js";


// An ObjectController will make a content object or an array of content objects
module("SC.objectForPropertyPath") ;

test("should be able to resolve an object on the global", function (assert) {
  var myLocal = (GLOBAL.myGlobal = { test: 'this '}) ;

  assert.deepEqual(myLocal, { test: 'this '}) ;
  assert.deepEqual(GLOBAL.myGlobal, { test: 'this '}) ;

  // verify we can resolve our binding path
  assert.deepEqual(SC.objectForPropertyPath('myGlobal'), { test: 'this '}) ;

  GLOBAL.myGlobal = null;
});

test("should return undefined if object can't be found", function (assert) {
  var result = SC.objectForPropertyPath("notExistingObject", GLOBAL);
  assert.deepEqual(result, undefined);
});
