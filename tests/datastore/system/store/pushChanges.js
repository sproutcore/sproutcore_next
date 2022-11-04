// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module ok equals test */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

var store, storeKey1, storeKey2, storeKey3, storeKey4, storeKey5, storeKey6, json;
module("Store#pushChanges", {
  beforeEach: function () {
    SC.RunLoop.begin();
    store = Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   true
    };

    storeKey1 = Store.generateStoreKey();
    store.writeDataHash(storeKey1, json, Record.EMPTY);

    storeKey2 = Store.generateStoreKey();
    store.writeDataHash(storeKey2, json, Record.EMPTY);

    storeKey3 = Store.generateStoreKey();
    store.writeDataHash(storeKey3, json, Record.EMPTY);

    storeKey4 = Store.generateStoreKey();
    store.writeDataHash(storeKey4, json, Record.BUSY_LOADING);

    storeKey5 = Store.generateStoreKey();
    store.writeDataHash(storeKey5, json, Record.BUSY_LOADING);

    storeKey6 = Store.generateStoreKey();
    store.writeDataHash(storeKey6, json, Record.BUSY_LOADING);
    SC.RunLoop.end();
  },

  afterEach: function () {
    store.destroy();
    store = json = null;
  }
});

test("Do a pushRetrieve and check if there is conflicts", function (assert) {
  var res = store.pushRetrieve(Record, undefined, undefined, storeKey1);
  assert.equal(res, storeKey1, "There is no conflict, pushRetrieve was succesful.");
  res = store.pushRetrieve(Record, undefined, undefined, storeKey4);
  assert.ok(!res, "There is a conflict, because of the state, this is expected.");
});

test("Do a pushDestroy and check if there is conflicts", function (assert) {
  var res = store.pushDestroy(Record, undefined, storeKey2);
  assert.equal(res, storeKey2, "There is no conflict, pushDestroy was succesful.");
  res = store.pushRetrieve(Record, undefined, undefined, storeKey5);
  assert.ok(!res, "There is a conflict, because of the state, this is expected.");
});

test("Issue a pushError and check if there is conflicts", function (assert) {
  var res = store.pushError(Record, undefined, Record.NOT_FOUND_ERROR, storeKey3);
  assert.equal(res, storeKey3, "There is no conflict, pushError was succesful.");
  res = store.pushRetrieve(Record, undefined, undefined, storeKey6);
  assert.ok(!res, "There is a conflict, because of the state, this is expected.");
});

test("A pushRetrieve updating the id of an existing record should update the primary Key cache", function (assert) {
  var tmpid, recFirst, recSecond, sK;

  tmpid = "@2345235asddsgfd";
  recFirst = { firstname: 'me', lastname: 'too', guid: tmpid };
  recSecond = { firstname: 'me', lastname: 'too', guid: 1 };
  SC.RunLoop.begin();

  sK = store.loadRecord(Record, recFirst, tmpid);
  SC.RunLoop.end();
  assert.equal(store.idFor(sK), tmpid); //check whether the id is indeed tmpid
  SC.RunLoop.begin();
  store.pushRetrieve(Record, 1, recSecond, sK);
  SC.RunLoop.end();
  assert.equal(store.idFor(sK), 1); // id should now have been updated
});
