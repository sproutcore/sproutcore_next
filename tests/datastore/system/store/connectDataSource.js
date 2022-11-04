// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

module("connecting DataSource to a store");

test("data source passed as string should be available as after running _getDataSource", function (assert) {
  window.MyTestDataSource = DataSource.extend({
    foo: 'bar'
  });

  var store = Store.create().from("MyTestDataSource");
  assert.deepEqual(store.get("dataSource"), "MyTestDataSource");

  var dataSource = store._getDataSource();
  assert.deepEqual(dataSource.foo, 'bar');

  assert.deepEqual(store.get('dataSource').foo, 'bar');
});

test("data source is required, if it can't be found, error should be thrown", function (assert) {
  assert.expect(1);

  try {
    Store.create().from("YourTestDataSource")._getDataSource();
  } catch (x) {
    assert.deepEqual(x.message, 'YourTestDataSource could not be found');
  }
});
