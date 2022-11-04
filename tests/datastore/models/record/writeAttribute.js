// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module, ok, equals, same, test */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


var store, Foo, json, foo ;
module("Record#writeAttribute", {
  beforeEach: function() {
    SC.RunLoop.begin();
    store = Store.create();
    Foo = Record.extend();
    json = {
      foo: "bar",
      number: 123,
      bool: true,
      array: [1,2,3],
      guid: 1
    };

    foo = store.createRecord(Foo, json);
    store.writeStatus(foo.storeKey, Record.READY_CLEAN);
    SC.RunLoop.end();
  },

  afterEach: function () {
    store.destroy();
    Foo = store = json = foo = null;
  }
});

test("returns receiver", function (assert) {
  assert.equal(foo.writeAttribute("bar", "baz"), foo, 'should return receiver');
});

test("first time writing should mark record as dirty", function (assert) {
  // precondition
  assert.equal(foo.get('status'), Record.READY_CLEAN, 'precond - start clean');

  SC.RunLoop.begin();
  // action
  foo.writeAttribute("bar", "baz");
  SC.RunLoop.end();

  // evaluate
  assert.equal(foo.get('status'), Record.READY_DIRTY, 'should make READY_DIRTY after write');
});

test("state change should be deferred if writing inside of a beginEditing()/endEditing() pair", function (assert) {

  // precondition
  assert.equal(foo.get('status'), Record.READY_CLEAN, 'precond - start clean');

  SC.RunLoop.begin();
  // action
  foo.beginEditing();

  foo.writeAttribute("bar", "baz");

  assert.equal(foo.get('status'), Record.READY_CLEAN, 'should not change state yet');

  foo.endEditing();

  SC.RunLoop.end();

  // evaluate
  assert.equal(foo.get('status'), Record.READY_DIRTY, 'should make READY_DIRTY after write');

}) ;

test("raises exception if you try to write an attribute before an attribute hash has been set", function (assert) {
  store.removeDataHash(foo.storeKey);
  assert.equal(store.readDataHash(foo.storeKey), null, 'precond - should not have store key');

  var cnt=0 ;
  try {
    foo.writeAttribute("foo", "bar");
  } catch(e) {
    assert.equal(e.message, Record.BAD_STATE_ERROR.message, 'should throw BAD_STATE_ERROR');
    cnt++;
  }
  assert.equal(cnt, 1, 'should raise exception');
});


test("Writing to an attribute in chained store sets correct status", function (assert) {

  var chainedStore = store.chain() ;

  var chainedRecord = chainedStore.find(Foo, foo.get('id'));
  assert.equal(chainedRecord.get('status'), Record.READY_CLEAN, 'precon - status should be READY_CLEAN');

  SC.RunLoop.begin();
  chainedRecord.writeAttribute('foo', 'newValue');
  SC.RunLoop.end();
  //chainedRecord.set('foo', 'newValue');

  assert.equal(chainedRecord.get('status'), Record.READY_DIRTY, 'status should be READY_DIRTY');

});


test("Writing a new guid", function (assert) {
  assert.equal(foo.get('id'), 1, 'foo.id should be 1');
  foo.set('guid', 2);
  assert.equal(foo.get('id'), 2, 'foo.id should be 2');
});

test("Writing primaryKey of 'id'", function (assert) {
  var PrimaryKeyId = Record.extend({ primaryKey: 'id' });
  var foo2 = store.createRecord(PrimaryKeyId, { id: 1 });

  assert.equal(foo2.get('id'), 1, 'foo2.id should be 1');
  foo2.set('id', 2);
  assert.equal(foo2.get('id'), 2, 'foo2.id should be 2');
  assert.equal(store.idFor(foo2.get('storeKey')), 2, 'foo2.id should be 2 in the store');
});
