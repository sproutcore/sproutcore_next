import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

(function(root) {
  var store;
  var query;
  var recordArray;

  module("RecordArray - implements array content observers", {
    beforeEach: function() {
    },

    afterEach: function() {
      root.MyRecord = undefined;
    }
  });

  test("notifies when a record is added to the store that matches a query", function (assert) {
    var callCount = 0,
        lastRemovedCount = 0,
        lastAddedCount = 0;

    SC.run(function() {
      store = Store.create();
      root.MyRecord = Record.extend();
      query = Query.local(MyRecord);

      recordArray = store.find(query);

      recordArray.addArrayObservers({
        didChange: function(start, removedCount, addedCount) {
          lastRemovedCount = removedCount;
          lastAddedCount = addedCount;
        },

        willChange: function() {}
      });

      store.createRecord(MyRecord, {});
    });

    assert.equal(lastAddedCount, 1);
    assert.equal(lastRemovedCount, 0);
    assert.equal(recordArray.get('length'), 1);
  });

  test("notifies when a record is removed from the store that matches a query", function (assert) {
    var lastRemovedCount = 0,
        lastAddedCount = 0;

    var record;

    SC.run(function() {
      store = Store.create();
      root.MyRecord = Record.extend();
      query = Query.local(MyRecord);

      recordArray = store.find(query);

      recordArray.addArrayObservers({
        didChange: function(start, removedCount, addedCount) {
          lastRemovedCount = removedCount;
          lastAddedCount = addedCount;
        },

        willChange: function() {}
      });

      record = store.createRecord(MyRecord, {
        guid: 1
      });
    });

    assert.equal(lastAddedCount, 1);
    assert.equal(lastRemovedCount, 0);

    SC.run(function() {
      record.destroy();
    });

    assert.equal(lastAddedCount, 0);
    assert.equal(lastRemovedCount, 1);
    assert.equal(recordArray.get('length'), 0);
  });
})(window);
