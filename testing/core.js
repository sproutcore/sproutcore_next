// ==========================================================================
// Project:   SproutCore Unit Testing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals CoreTest */

// these compiler directives are normally defined in runtime's core.  But
// since the testing framework needs to be totally independent, we redefine
// them here also.

import '../node_modules/jquery/dist/jquery.slim.js';


import { Runner } from './system/runner.js';
import { CoreTest } from './system/core_test.js';

CoreTest.Runner = Runner;


// ..........................................................
// EXPORT BASIC API
//

CoreTest.defaultPlan = function defaultPlan() {
  var plan = CoreTest.plan;
  if (!plan) {
    CoreTest.runner = CoreTest.Runner.create();
    plan = CoreTest.plan = CoreTest.runner.plan;
  }
  return plan;
};

// create a module.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
const module = function(desc, l) {
  CoreTest.defaultPlan().module(desc, l);
};

// create a test.  If this is the first time, create the test plan and
// runner.  This will cause the test to run on page load
const test = function(desc, func) {
  CoreTest.defaultPlan().test(desc, func);
};

// reset htmlbody for unit testing
const clearHtmlbody = function() {
  CoreTest.defaultPlan().clearHtmlbody();
};

const htmlbody = function(string) {
  CoreTest.defaultPlan().htmlbody(string);
};

export { CoreTest, module, test, clearHtmlbody, htmlbody };

