/**
 * Nested Records and the Data Store(Record) Unit Test
 *
 * @author Evin Grano
 */
/*global ok, equals, test, module */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, storeKeys;

var initModels = function () {
  NestedRecord.Directory = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,
    name: Record.attr(String),
    content: Record.toOne(Record, { isNested: true }),
    contents: Record.toMany(Record, { isNested: true })
  });

  NestedRecord.File = Record.extend({
    name: Record.attr(String)
  });

};

// ..........................................................
// Basic Record Stuff
//
module("Data Store Tests for Nested Records", {

  beforeEach: function () {
    SC.RunLoop.begin();
    NestedRecord = SC.Object.create({
      store: Store.create()
    });
    store = NestedRecord.store;
    initModels();

    storeKeys = store.loadRecords([NestedRecord.Directory, NestedRecord.File], [
      {
        type: 'Directory',
        name: 'Dir 1',
        guid: 1,
        content: {
          type: 'File',
          guid: 44,
          name: 'File 4'
        },
        contents: [
          {
            type: 'Directory',
            name: 'Dir 2',
            guid: 2,
            contents: [
              {
                type: 'File',
                guid: 3,
                name: 'File 1'
              },
              {
                type: 'File',
                guid: 4,
                name: 'File 2'
              }
            ]
          }
        ]
      },
      {
        type: 'File',
        id: 5,
        name: 'File 3'
      }
    ]);
    SC.RunLoop.end();
  },

  afterEach: function () {
    delete NestedRecord.Directory;
    delete NestedRecord.File;
    NestedRecord = null;
    store = null;
  }
});

test("Proper Initialization", function (assert) {
  var first, second;
  assert.equal(storeKeys.get('length'), 2, "number of primary store keys should be 2");


  // First
  SC.run(function() { first = store.materializeRecord(storeKeys[0]); });
  assert.ok(SC.kindOf(first, Record), "first record is a kind of a Record Object");
  assert.ok(SC.instanceOf(first, NestedRecord.Directory), "first record is a instance of a NestedRecord.Directory Object");

  // Second
  SC.run(function() { second = store.materializeRecord(storeKeys[1]); });
  assert.ok(SC.kindOf(second, Record), "second record is a kind of a Record Object");
  assert.ok(SC.instanceOf(second, NestedRecord.File), "second record is a instance of a NestedRecord.File Object");
});

test("Proper Status", function (assert) {
  var first, second;

  // First
  SC.run(function() { first = store.materializeRecord(storeKeys[0]); });
  assert.equal(first.get('status'), Record.READY_CLEAN, 'first record has a READY_CLEAN State');

  // Second
  SC.run(function() { second = store.materializeRecord(storeKeys[1]); });
  assert.equal(second.get('status'), Record.READY_CLEAN, 'second record has a READY_CLEAN State');

  // Shallow property update.
  SC.run(function() { first.get('contents').objectAt(0).set('name', 'Dir 2 - Updated') });
  assert.equal(first.get('status'), Record.READY_DIRTY, 'first record has a READY_DIRTY State');
});

test("Property update", function (assert) {
  var first, second;

  // First
  SC.run(function() { first = store.materializeRecord(storeKeys[0]); });
  assert.equal(first.get('status'), Record.READY_CLEAN, 'first record has a READY_CLEAN State');

  // Nested property update.
  SC.run(function() { first.get('content').set('name', 'File 4 - Updated') });
  assert.equal(first.get('status'), Record.READY_DIRTY, 'first record has a READY_DIRTY State');
});

test("Deep property update", function (assert) {
  var first, second;

  // First
  SC.run(function() { first = store.materializeRecord(storeKeys[0]); });
  assert.equal(first.get('status'), Record.READY_CLEAN, 'first record has a READY_CLEAN State');

  // Deep property update.
  SC.run(function() { first.get('contents').objectAt(0).get('contents').objectAt(0).set('name', 'Dir 2 - Updated') });
  assert.equal(first.get('status'), Record.READY_DIRTY, 'first record has a READY_DIRTY State');
});

test("Can Push onto child array", function (assert) {
  var first, contents;

  // First
  SC.run(function() {
    first = store.materializeRecord(storeKeys[0]);
    first = first.get('contents').objectAt(0);
    contents = first.get('contents');

    assert.equal(contents.get('length'), 2, "should have two items");

    contents.forEach(function (f) {
      assert.ok(SC.instanceOf(f, NestedRecord.File), "should be a NestedRecord.File");
      assert.ok(f.get('name'), "should have a name property");
    });

    contents.pushObject({type: 'File', name: 'File 4', id: 12});

    assert.equal(contents.get('length'), 3, "should have three items");

    contents.forEach(function (f) {
      assert.ok(SC.instanceOf(f, NestedRecord.File), "should be a NestedRecord.File");
      assert.ok(f.get('name'), "should have a name property");
      assert.equal(f.get('status'), Record.READY_DIRTY, 'second record has a READY_DIRTY State');
    });
  });

});

test("Use in Nested Store", function (assert) {
  var nstore, dir, c, file,
      pk, id, nFile, nDir, nC;

  // First, find the first file
  SC.run(function() { dir = store.find(NestedRecord.Directory, 1); });
  assert.ok(dir, "Directory id:1 exists");
  assert.equal(dir.get('name'), 'Dir 1', "Directory id:1 has a name of 'Dir 1'");
  c = dir.get('contents');
  assert.ok(c, "Content of Directory id:1 exists");
  SC.run(function() {dir = c.objectAt(0);});
  assert.ok(dir, "Directory id:2 exists");
  assert.equal(dir.get('name'), 'Dir 2', "Directory id:2 has a name of 'Dir 2'");
  c = dir.get('contents');
  assert.ok(c, "Content of Directory id:2 exists");
  SC.run(function() {file = c.objectAt(0);});
  assert.ok(file, "File id:1 exists");
  assert.equal(file.get('name'), 'File 1', "File id:1 has a name of 'File 1'");

  // Second, create nested store
  nstore = store.chain();
  SC.RunLoop.begin();
  nDir = nstore.find(NestedRecord.Directory, 1);
  nC = nDir.get('contents');
  nDir = nC.objectAt(0);
  nC = nDir.get('contents');
  nFile = nC.objectAt(0);
  // pk = file.get('primaryKey');
  // id = file.get(pk);
  // nFile = nstore.find(NestedRecord.File, id);
  SC.RunLoop.end();
  assert.ok(nFile, "Nested > File id:1 exists");
  assert.equal(nFile.get('name'), 'File 1', "Nested > File id:1 has a name of 'File 1'");

  // Third, change the name of the nested store and see what happens
  SC.run(function(){nFile.set('name', 'Change Name');});
  assert.equal(nFile.get('name'), 'Change Name', "Nested > File id:1 has changed the name to 'Changed Name'");
  assert.equal(file.get('name'), 'File 1', "Base > File id:1 still has the name of 'File 1'");
  nDir = nstore.find(NestedRecord.Directory, 1);

  // Fourth, commit the changes
  SC.run(function(){
    nstore.commitChanges();
    nstore.destroy();
  });
  nstore = null;
  assert.equal(file.get('name'), 'Change Name', "Base > File id:1 has changed to name of 'Changed Name'");

  // Fifth, double check that the change exists
  dir = store.find(NestedRecord.Directory, 1);
  SC.run(function() {
     file = dir.get('contents').objectAt(0).get('contents').objectAt(0);
  });
  assert.equal(dir.get('status'), Record.READY_DIRTY, 'Base > Directory id:1 has a READY_DIRTY State');
  assert.equal(file.get('status'), Record.READY_DIRTY, 'Base > File id:1 has a READY_DIRTY State');
  assert.equal(file.get('name'), 'Change Name', "Base > File id:1 has actually changed to name of 'Changed Name'");

});

test("Store#pushRetrieve for parent updates the child records", function (assert) {
  SC.RunLoop.begin()
  var parent = store.materializeRecord(storeKeys[0]),
    nr = parent.get('contents').firstObject(),
    newDataHash = {
      type: 'Directory',
      name: 'Dir 1 Changed',
      guid: 1,
      content: {
        type: 'File',
        guid: 444,
        name: 'File 4 Changed'
      },
      contents: [
        {
          type: 'Directory',
          name: 'Dir 2 Changed',
          guid: 2,
          contents: [
            {
              type: 'File',
              guid: 3,
              name: 'File 1'
            },
            {
              type: 'File',
              guid: 4,
              name: 'File 2'
            }
          ]
        }
      ]
    };

  parent = store.materializeRecord(storeKeys[0]);
  nr = parent.get('contents').get('firstObject');
  var cr = parent.get('content');

  assert.ok(nr, "Got nested record");
  assert.equal(nr.get('name'), 'Dir 2', "Dir id:2 has correct name");

  store.pushRetrieve(null, null, newDataHash, storeKeys[0]);
  store.flush();
  SC.RunLoop.end()

  assert.equal(parent.get('name'), 'Dir 1 Changed', 'Dir id:1 name was changed');
  assert.equal(nr.get('name'), 'Dir 2 Changed', "Dir id:2 name was changed");
  assert.equal(cr.get('name'), 'File 4 Changed', "File id:444 name was changed");
});



/*
NOTE:
 It is a known problem for the nested record implementation that the order in the array of nested
 records is significant. That is why the following tests will fail. 
 They are kept in to fix this in a later stage.


// When the length of the nested array changes, only the values that were previously retrieved will
// be updated. However, if the nested array length change is due to inserting of an object before
// the previously retrieved object. The previously retrieved object's hash will be updated
// incorrectly.
test("Store#pushRetrieve for parent updates the child records, even on different path", function (assert) {
  SC.RunLoop.begin()
  var parent = store.materializeRecord(storeKeys[0]),
    nr = parent.get('contents').firstObject(),
    newDataHash = {
      type: 'Directory',
      name: 'Dir 1 Changed',
      guid: 1,
      content: {
        type: 'File',
        guid: 8,
        name: 'File 8'
      },
      contents: [
        {
          type: 'Directory',
          name: 'Dir 3',
          guid: 5,
          contents: [
            {
              type: 'File',
              guid: 6,
              name: 'File 6'
            },
            {
              type: 'File',
              guid: 7,
              name: 'File 7'
            }
          ]
        },
        {
          type: 'Directory',
          name: 'Dir 2 Changed',
          guid: 2,
          contents: [
            {
              type: 'File',
              guid: 3,
              name: 'File 1'
            },
            {
              type: 'File',
              guid: 4,
              name: 'File 2'
            }
          ]
        }
      ]
    };

  parent = store.materializeRecord(storeKeys[0]);
  nr = parent.get('contents').objectAt(0);//store.find(NestedRecord.Directory,2);

  assert.ok(nr, "Got nested record");
  assert.equal(nr.get('name'), 'Dir 2', "Dir id:2 has correct name");

  store.pushRetrieve(null, null, newDataHash, storeKeys[0]);
  store.flush();
  SC.RunLoop.end()

  assert.equal(parent.get('name'), 'Dir 1 Changed', 'Dir id:1 name was changed');
  assert.equal(nr.get('name'), 'Dir 2 Changed', "Dir id:2 name has changed");
});

test("Store#pushRetrieve for parent updates the child records, works on first object", function (assert) {
  SC.RunLoop.begin()
  var parent = store.materializeRecord(storeKeys[0]),
    nr = parent.get('contents').firstObject(),
    newDataHash = {
      type: 'Directory',
      name: 'Dir 1 Changed',
      guid: 1,
      contents: [
        {
          type: 'Directory',
          name: 'Dir 3',
          guid: 5,
          contents: [
            {
              type: 'File',
              guid: 6,
              name: 'File 6'
            },
            {
              type: 'File',
              guid: 7,
              name: 'File 7'
            }
          ]
        },
        {
          type: 'Directory',
          name: 'Dir 2 Changed',
          guid: 2,
          contents: [
            {
              type: 'File',
              guid: 3,
              name: 'File 1'
            },
            {
              type: 'File',
              guid: 4,
              name: 'File 2'
            }
          ]
        }
      ]
    };

  parent = store.materializeRecord(storeKeys[0]);
  nr = parent.get('contents').firstObject();

  assert.ok(nr, "Got nested record");
  assert.equal(nr.get('name'), 'Dir 2', "Dir id:2 has correct name");

  store.pushRetrieve(null, null, newDataHash, storeKeys[0]);
  store.flush();
  SC.RunLoop.end()

  assert.equal(parent.get('name'), 'Dir 1 Changed', 'Dir id:1 name was changed');
  assert.equal(nr.get('name'), 'Dir 2 Changed', "First object name has changed");
});

test("Store#pushRetrieve for parent updates the child records, on paths nested more than 2 levels", function (assert) {
  SC.RunLoop.begin()
  var parent = store.materializeRecord(storeKeys[0]),
    nr = parent.get('contents').firstObject().get('contents').firstObject(),
    newDataHash = {
      type: 'Directory',
      name: 'Dir 1 Changed',
      guid: 1,
      contents: [
        {
          type: 'Directory',
          name: 'Dir 3',
          guid: 5,
          contents: [
            {
              type: 'File',
              guid: 6,
              name: 'File 6'
            },
            {
              type: 'File',
              guid: 7,
              name: 'File 7'
            }
          ]
        },
        {
          type: 'Directory',
          name: 'Dir 2 Changed',
          guid: 2,
          contents: [
            {
              type: 'File',
              guid: 3,
              name: 'File 1 Changed'
            },
            {
              type: 'File',
              guid: 4,
              name: 'File 2'
            }
          ]
        }
      ]
    };

  assert.ok(nr, "(deep walk) Got nested record");
  assert.equal(nr.get('name'), 'File 1', "(deep walk) File id:3 has correct name");

  parent = store.materializeRecord(storeKeys[0]);
  nr = store.find(NestedRecord.File,3);

  assert.ok(nr, "Got nested record");
  assert.equal(nr.get('name'), 'File 1', "File id:3 has correct name");

  store.pushRetrieve(null, null, newDataHash, storeKeys[0]);
  store.flush();
  SC.RunLoop.end()

  assert.equal(parent.get('name'), 'Dir 1 Changed', 'Dir id:1 name was changed');
  assert.equal(nr.get('name'), 'File 1 Changed', "File id:3 name has changed");
});

*/