// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

// This file tests the initial state of the store when it is first created
// either independently or as a chained store.

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

module("Store#init");

test("initial setup for root store", function (assert) {
  var store = Store.create();
  
  assert.equal(SC.typeOf(store.dataHashes), SC.T_HASH, 'should have dataHashes');
  assert.equal(SC.typeOf(store.revisions), SC.T_HASH, 'should have revisions');
  assert.equal(SC.typeOf(store.statuses), SC.T_HASH, 'should have statuses');
  assert.ok(!store.editables, 'should not have editables');
  assert.ok(!store.recordErrors, 'should not have recordErrors');
  assert.ok(!store.queryErrors, 'should not have queryErrors');
}); 

