// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record } from "../../../../datastore/datastore.js";

let store, storeKey, json, hash, hash2, MyRecordType, MyKeyedRecordType;

module("Store#createRecord", {
  beforeEach: function() {

    MyRecordType = Record.extend({
      string: Record.attr(String, { defaultValue: "Untitled" }),
      number: Record.attr(Number, { defaultValue: 5 }),
      bool: Record.attr(Boolean, { defaultValue: true }),
      array: Record.attr(Array, { defaultValue: [1, 2] }),
      funcDef: Record.attr(Array, { defaultValue: function() { return [1, 3]} }),
      noDefault: Record.attr(String)
    });

    MyKeyedRecordType = Record.extend({
      string: Record.attr(String, { defaultValue: "Untitled", key: 'string_key' }),
      number: Record.attr(Number, { defaultValue: 5, key: 'number_key' }),
      bool: Record.attr(Boolean, { defaultValue: true, key: 'bool_key' }),
      array: Record.attr(Array, { defaultValue: [1, 2], key: 'array_key' }),
      funcDef: Record.attr(Array, { defaultValue: function() { return [1, 3]}, key: 'funcDef_key' }),
      noDefault: Record.attr(String, { key: 'noDefault_key' })
    });

    SC.RunLoop.begin();

    store = Store.create();

    json = {
      string: "string",
      number: 23,
      bool:   true
    };

    storeKey = Store.generateStoreKey();

    store.writeDataHash(storeKey, json, Record.READY_CLEAN);

    SC.RunLoop.end();
  }
});

test("create a record", function (assert) {
  var sk;
  var rec = Record.create();
  hash = {
    guid: "1234abcd",
    string: "abcd",
    number: 1,
    bool:   false,
    array:  [],
    funcDef: [1, 2]
    };
  hash2 = {
    string: "abcd",
    number: 1,
    bool:   false,
    array:  [],
    funcDef: [1, 2]
  };

  rec = store.createRecord(Record, hash);
  assert.ok(rec, "a record was created");
  sk=store.storeKeyFor(Record, rec.get('id'));
  assert.equal(store.readDataHash(sk), hash, "data hashes are equivalent");
  assert.equal(rec.get('id'), "1234abcd", "guids are the same");

  rec = store.createRecord(Record, hash2, "priKey");
  assert.ok(rec, "a record with a custom id was created");
  sk=store.storeKeyFor(Record, "priKey");
  assert.equal(store.readDataHash(sk), hash2, "data hashes are equivalent");
  assert.equal(rec.get('id'), "priKey", "guids are the same");

  assert.equal(store.changelog.length, 2, "The changelog has the following number of entries:");
});

/**
  There is new functionality in the store that allows the developer to reference
  attribute names or attribute keys when creating a new record.

  For example, if the Record is defined as:

    MyApp.Record = Record.extend({
      attrA: RecordAttribute(String, { key: 'attr_a' });
    })

  Previously, passing the hash { attrA: 'test' } would see `attrA` added to the
  hash when it should instead be `attr_a`.  The new functionality, recognizes
  that the attribute key should be used.

  Therefore, either of these will result in the same data hash in the store:

    MyApp.store.createRecord(MyApp.Record, { attrA: 'test' })
    MyApp.store.createRecord(MyApp.Record, { attr_a: 'test' })

*/
test("Creating a keyed record", function (assert) {
  var hash1, hash2, hash3, hash4, expectedHash, sk, rec;

  // The actual hash that should be created.
  expectedHash = {
    string_key: "abcd",
    number_key: 1,
    bool_key:   false,
    array_key:  [],
    funcDef_key: [1, 2]
  };

  // Uses only the attribute names
  hash1 = {
    string: "abcd",
    number: 1,
    bool:   false,
    array:  [],
    funcDef: [1, 2]
  };

  // Uses only the attribute keys
  hash2 = {
    string_key: "abcd",
    number_key: 1,
    bool_key:   false,
    array_key:  [],
    funcDef_key: [1, 2]
  };

  // Uses a mix of attribute names and keys
  hash3 = {
    string: "abcd",
    number_key: 1,
    bool_key:   false,
    array:  [],
    funcDef: [1, 2]
  };

  // Uses duplicate attribute names and keys in different orders
  hash4 = {
    string: "efgh",
    string_key: "abcd",
    number_key: 1,
    bool_key:   false,
    bool:   true,
    array_key:  [],
    array:  ['a'],
    funcDef: [1, 2]
  };

  rec = store.createRecord(MyKeyedRecordType, hash1, 'test1');
  sk = store.storeKeyFor(MyKeyedRecordType, rec.get('id'));
  assert.deepEqual(store.readDataHash(sk), expectedHash, "data hashes are equivalent when given only names");

  rec = store.createRecord(MyKeyedRecordType, hash2, 'test2');
  sk = store.storeKeyFor(MyKeyedRecordType, rec.get('id'));
  assert.deepEqual(store.readDataHash(sk), expectedHash, "data hashes are equivalent when given only keys");

  rec = store.createRecord(MyKeyedRecordType, hash3, 'test3');
  sk = store.storeKeyFor(MyKeyedRecordType, rec.get('id'));
  assert.deepEqual(store.readDataHash(sk), expectedHash, "data hashes are equivalent when given names and keys");

  rec = store.createRecord(MyKeyedRecordType, hash4, 'test4');
  sk = store.storeKeyFor(MyKeyedRecordType, rec.get('id'));
  assert.deepEqual(store.readDataHash(sk), expectedHash, "data hashes are equivalent when given names and keys with conflicts");
});

test("Creating an empty (null) record should make the hash available", function (assert) {

  store.createRecord(MyRecordType, null, 'guid8');
  var storeKey = store.storeKeyFor(MyRecordType, 'guid8');

  assert.ok(store.readDataHash(storeKey), 'data hash should not be empty/undefined');

});

test("Initializing default values", function (assert) {
  var rec1, rec2, sk1, sk2;

  //create 2 records
  rec1 = store.createRecord(MyRecordType, null, 'test1');
  rec2 = store.createRecord(MyRecordType, null, 'test2');

  //get storKeys
  sk1 = store.storeKeyFor(MyRecordType, rec1.get('id'));
  sk2 = store.storeKeyFor(MyRecordType, rec2.get('id'));

  assert.ok(sk1, "a first record with default values was created");

  assert.equal(store.readDataHash(sk1)['string'], "Untitled", "the default value for 'string' was initialized");
  assert.equal(store.readDataHash(sk1)['number'], 5, "the default value for 'number' was initialized");
  assert.equal(store.readDataHash(sk1)['bool'], true, "the default value for 'bool' was initialized");
  assert.deepEqual(store.readDataHash(sk1)['array'], [1, 2], "the default value for 'array' was initialized");
  assert.deepEqual(store.readDataHash(sk1)['funcDef'], [1, 3], "the default value for 'funcDef' was initialized");
  assert.equal(store.readDataHash(sk1)['noDefault'], null, "no value for 'noDefault' was initialized");

  assert.ok(sk2, "a second record with default values was created");

  rec2.get('array').push(3);
  rec2.get('funcDef').push(2);

  assert.deepEqual(store.readDataHash(sk2)['array'], [1, 2, 3], "the array for 'array' was updated");
  assert.deepEqual(store.readDataHash(sk2)['funcDef'], [1, 3, 2], "the array for 'funcDef' was updated");

  assert.ok(store.readDataHash(sk2)['array'] !== store.readDataHash(sk1)['array'], "the default value for 'array' is a copy not a reference");
  assert.ok(store.readDataHash(sk2)['funcDef'] !== store.readDataHash(sk1)['funcDef'], "the default value for 'funcDef' is a copy not a reference");
});

test("Initializing default values with keyed attributes", function (assert) {
  var rec1, rec2, sk1, sk2;

  //create 2 records
  rec1 = store.createRecord(MyKeyedRecordType, null, 'test1');
  rec2 = store.createRecord(MyKeyedRecordType, null, 'test2');

  //get storKeys
  sk1 = store.storeKeyFor(MyKeyedRecordType, rec1.get('id'));
  sk2 = store.storeKeyFor(MyKeyedRecordType, rec2.get('id'));

  assert.ok(sk1, "a first record with default values was created");

  assert.equal(store.readDataHash(sk1)['string_key'], "Untitled", "the default value for 'string' was initialized");
  assert.equal(store.readDataHash(sk1)['number_key'], 5, "the default value for 'number' was initialized");
  assert.equal(store.readDataHash(sk1)['bool_key'], true, "the default value for 'bool' was initialized");
  assert.deepEqual(store.readDataHash(sk1)['array_key'], [1, 2], "the default value for 'array' was initialized");
  assert.deepEqual(store.readDataHash(sk1)['funcDef_key'], [1, 3], "the default value for 'funcDef' was initialized");
  assert.equal(store.readDataHash(sk1)['noDefault_key'], null, "no value for 'noDefault' was initialized");

  assert.ok(sk2, "a second record with default values was created");

  rec2.get('array').push(3);
  rec2.get('funcDef').push(2);

  assert.deepEqual(store.readDataHash(sk2)['array_key'], [1, 2, 3], "the array for 'array' was updated");
  assert.deepEqual(store.readDataHash(sk2)['funcDef_key'], [1, 3, 2], "the array for 'funcDef' was updated");

  assert.ok(store.readDataHash(sk2)['array_key'] !== store.readDataHash(sk1)['array_key'], "the default value for 'array' is a copy not a reference");
  assert.ok(store.readDataHash(sk2)['funcDef_key'] !== store.readDataHash(sk1)['funcDef_key'], "the default value for 'funcDef' is a copy not a reference");
});

test("The data hash of the record should be correct BEFORE the status changes.", function (assert) {
  var rec1;

  //create record
  rec1 = store.createRecord(MyRecordType, { string: "Pre-create" }, 'test-status');
  rec1.commitRecord();

  rec1.addObserver('status', function tst () {
    if (this.get('status') === Record.READY_CLEAN) {
      assert.equal(this.get('id'), 'new-id', "The id attribute should be correct since the status has updated.");
      assert.equal(this.get('string'), "Post-create", "The string attribute should be correct since the status has updated.");
      rec1.removeObserver('status', tst); // remove after we are done 
    }
  });

  store.dataSourceDidComplete(rec1.get('storeKey'), { string: "Post-create" }, 'new-id');
});
