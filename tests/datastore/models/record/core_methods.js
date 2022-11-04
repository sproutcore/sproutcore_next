// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var MyApp, dataSource;
module("Record core methods", {
  beforeEach: function() {
    dataSource = DataSource.create({

      gotParams: false,
      wasCommitted: false,

      createRecord: function(store, storeKey, params) {
        this.wasCommitted = true;
        this.gotParams = params && params['param1'] ? true: false;
      }});

    MyApp = SC.Object.create({
      store: Store.create().from(dataSource)
    })  ;

    MyApp.Foo = Record.extend({});
    MyApp.json = {
      foo: "bar",
      number: 123,
      bool: true,
      array: [1,2,3],
      guid: 1
    };

    SC.RunLoop.begin();
    MyApp.foo = MyApp.store.createRecord(MyApp.Foo, MyApp.json);
    SC.RunLoop.end();

  }
});

test("statusString", function (assert) {
  assert.equal(MyApp.foo.statusString(), 'READY_NEW', 'status string should be READY_NEW');
});

test("Can commitRecord() specific Record instance", function (assert) {

  MyApp.foo.set('foo', 'foobar');

  // commit the new record
  MyApp.foo.commitRecord({ param1: 'value1' });

  assert.equal(dataSource.wasCommitted, true, 'Record was committed');
  assert.equal(dataSource.gotParams, true, 'Params were properly passed through commitRecord');

});

test("JSON encoding an Record should encode the attributes", function (assert) {
  var str = SC.json.encode(MyApp.foo);
  var result = SC.json.decode(str);

  assert.deepEqual(MyApp.json, result, "original = encoded record");
});
