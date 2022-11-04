// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp Sample */

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var store, Application, dataSource;

module("Store Core Methods", {
  beforeEach: function() {
    dataSource = DataSource.create({

      gotParams: false,

      updateRecord: function(store, storeKey, params) {
        this.gotParams = params && params['param1'] ? true: false;
      }
    });

    Application = {};
    Application._nameDidChange = 0;

    Application.File = Record.extend({

      nameDidChange: function(object, key) {
        Application._nameDidChange++;
      }.observes('name', 'url', 'isDirectory')

    });
    Application.FileDisk = Record.extend({ });

    Application.Data = {

      "FileDisk": [
        { guid: '14', name: 'Main Drive', parent: null, children: null }
      ],

      "File": [
        { guid: '10', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
        { guid: '11', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '137',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '12', name: 'Movies', fileType: 'movies', url: '/emily_parker/Movies', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '134',name: 'Music', fileType: 'music', url: '/emily_parker/Music', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '135',name: 'Pictures', fileType: 'pictures', url: '/emily_parker/Pictures', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
        { guid: '13', name: 'Auto Insurance', fileType: 'folder', url: '/emily_parker/Documents/Auto%20Insurance', isDirectory: true, parent: '11', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
        { guid: '14', name: 'Birthday Invitation.pdf', fileType: 'file', url: '/emily_parker/Documents/Birthday%20Invitation', isDirectory: false, parent: '11', createdAt: 'October 17, 2007', modifiedAt: 'October 21, 2007', filetype: 'pdf', isShared: false},
        { guid: '136', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true}
      ]
    };

    SC.RunLoop.begin();
    store = Store.create({ name: 'Test store'} ).from(dataSource);
    for(var i in Application.Data) {
      store.loadRecords(Application[i], Application.Data[i]);
    }
    SC.RunLoop.end();

    // make sure RecordType by String can map
    window.Application = Application;
  }
});

test("Verify that Store's toString() includes the store's name, if it was specified", function (assert) {

  var description = store.toString();
  assert.ok(description.indexOf('Test store') !== -1, 'should contain "Test store"');

});

test("Verify loadRecords() loads data", function (assert) {

  assert.equal(store.find(Application.File, '14').get('name'), 'Birthday Invitation.pdf', 'should return File 14');
  assert.equal(store.find(Application.FileDisk, '14').get('name'), 'Main Drive', 'should return FileDisk 14');

});

test("Verify storeKeys() gets all store keys", function (assert) {

  var storeKey;

  assert.equal(store.storeKeys().length, 10, 'Length should be 10');

  storeKey = store.storeKeyFor(Application.File, '10');
  store.writeStatus(storeKey, Record.EMPTY);
  assert.equal(store.storeKeys().length, 9, 'Length should be one less now');

});

test("find() should take both Record object and Record string as recordtype argument", function (assert) {

  assert.equal(store.find('Application.File', '14').get('name'), 'Birthday Invitation.pdf', 'should return File 14');
  assert.equal(store.find(Application.File, '14').get('name'), 'Birthday Invitation.pdf', 'should return FileDisk 14');

});

test("loading more records should not sending _flushRecordChanges() until the end of the runloop", function (assert) {

  var moreData = [
      { guid: '55', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
      { guid: '56', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
      { guid: '57',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false}
  ];

  SC.RunLoop.begin();

  var storeKeys = store.loadRecords(Application.File, moreData);
  assert.equal(storeKeys.length, 3, 'precon - should have loaded three records');
  assert.equal(store.recordPropertyChanges.storeKeys.length, 3, 'should be three storeKeys in changelog');

  SC.RunLoop.end();

  // recordPropertyChanges may not exist after notifications have gone out.
  // treat that like having len=0
  var changes = store.recordPropertyChanges;
  var len = (changes && changes.storeKeys) ? changes.storeKeys.length : 0;
  assert.equal(len, 0, 'should be zero storeKeys in changelog');

});

test("Passing params through commitRecords()", function (assert) {

  var file = store.find(Application.File, '14');
  file.set('name', 'My Great New Name');

  store.commitRecords(null, null, null, { param1: 'value1' });

  assert.equal(dataSource.gotParams, true, 'params should have travelled through to dataSource updateRecord() call');

});

test("Make sure that setting an attribute on a record will only notify respective observers once", function (assert) {

  var file = store.find(Application.File, '14');
  Application._nameDidChange = 0 ;

  SC.RunLoop.begin();
  file.writeAttribute('name', 'My Great New Name');
  SC.RunLoop.end();

  assert.equal(Application._nameDidChange, 1, 'observer should have been fired only once');

});

test("Test that reset() clears out the store for re-use", function (assert) {
  var isEmptyObject = function ( obj ) {
    var name;

    for (name in obj) {
      return false;
    }
    return true;
  };

  assert.ok(!isEmptyObject(store.dataHashes), "We expect there to be values in store.dataHashes");
  assert.ok(!isEmptyObject(store.revisions), "We expect there to be values in store.revisions");
  assert.ok(!isEmptyObject(store.statuses), "We expect there to be values in store.statuses");

  store.reset();

  assert.ok(isEmptyObject(store.dataHashes), "We expect there to no longer be any values in store.dataHashes");
  assert.ok(isEmptyObject(store.revisions), "We expect there to no longer be any values in store.revisions");
  assert.ok(isEmptyObject(store.statuses), "We expect there to no longer be any values in store.statuses");
});

// test("Calling replaceIdFor() should notify the record that its id has changed", function() {
//
//   var file = store.find(Application.File, '14');
//
//   file.get('id'); // Just getting the id, so it gets cached.
//
//   Store.replaceIdFor(file.get('storeKey'), 999);
//   assert.equal(file.get('id'), 999, 'the record should have the new id');
//
// });

