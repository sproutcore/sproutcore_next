// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp Sample */

import { Record, Store, FixturesDataSource } from '../../../datastore/datastore.js';
import { SC } from '../../../core/core.js';

var store, fds, storeKey1,storeKey2;

module("FixturesDataSource", {
  beforeEach: function() {
    SC.RunLoop.begin();

    var Sample = window.Sample = SC.Object.create();
    Sample.File = Record.extend({ test:'hello'});

    // files
    Sample.File.FIXTURES = [
    { guid: '10', name: 'Home', url: '/emily_parker', isDirectory: true, parent: null, children: 'Collection'},
    { guid: '11', name: 'Documents', fileType: 'documents', url: '/emily_parker/Documents', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '137',name: 'Library', fileType: 'library', url: '/emily_parker/Library', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '12', name: 'Movies', fileType: 'movies', url: '/emily_parker/Movies', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '134',name: 'Music', fileType: 'music', url: '/emily_parker/Music', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '135',name: 'Pictures', fileType: 'pictures', url: '/emily_parker/Pictures', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true},
    { guid: '13', name: 'Auto Insurance', fileType: 'folder', url: '/emily_parker/Documents/Auto%20Insurance', isDirectory: true, parent: '11', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'October 21, 2007', filetype: 'directory', isShared: false},
    { guid: '150', name: 'Birthday Invitation.pdf', fileType: 'file', url: '/emily_parker/Documents/Birthday%20Invitation', isDirectory: false, parent: '11', createdAt: 'October 17, 2007', modifiedAt: 'October 21, 2007', filetype: 'pdf', isShared: false},
    { guid: '136', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true}
    ];

    store = Store.create().from(Record.fixtures);
  },

  afterEach: function() {
    SC.RunLoop.end();
  }
});

test("Verify find() loads all fixture data", function (assert) {

  var result = store.find(Sample.File),
      rec, storeKey, dataHash;

  assert.ok(result, 'should return a result');
  assert.equal(result.get('length'), Sample.File.FIXTURES.get('length'), 'should return records for each item in FIXTURES');

  // verify storeKeys actually return Records
  var idx, len = result.get('length'), expected = [];
  for(idx=0;idx<len;idx++) {
    rec = result.objectAt(idx);
    storeKey = rec ? rec.get('storeKey') : null;
    dataHash = storeKey ? store.readDataHash(storeKey) : null;

    assert.ok(!!dataHash, 'storeKey at result[%@] (%@) should return dataHash'.fmt(idx, storeKey));

    expected.push(rec); // save record for later test
  }

  // verify multiple calls to find() returns SAME data
  result = store.find(Sample.File);

  assert.equal(result.get('length'), expected.length, 'second result should have same length as first');
  len = result.get('length');
  for(idx=0;idx<len;idx++) {
    rec = result.objectAt(idx);
    assert.equal(rec, expected[idx], 'record returned at index %@ should be same as previous'.fmt(idx));
  }
});

test("Verify find() loads data from store", function (assert) {
  var sk=store.find(Sample.File, "150");
  assert.equal(sk.get('name'), 'Birthday Invitation.pdf', 'returns record should have name from fixture');
});


test("Destroy a record and commit", function (assert) {
  var ret      = store.find(Sample.File, "136"),
      storeKey = ret.get('storeKey'),
      fixtures = store.get('dataSource');

  assert.ok(ret, 'precond - must have record in store');
  assert.ok(fixtures.fixtureForStoreKey(store, storeKey), 'precond - fixtures should have data for record');

  store.destroyRecord(Sample.File, "136");
  store.commitRecords();
  assert.ok(!fixtures.fixtureForStoreKey(store, storeKey), 'fixtures should no longer have data for record');
});

test("Create a record and commit it", function (assert) {

  var fixtures = store.get('dataSource'),
      dataHash = { guid: '200', name: 'Software', fileType: 'software', url: '/emily_parker/Software', isDirectory: true, parent: '10', children: 'Collection', createdAt: 'June 15, 2007', modifiedAt: 'June 15, 2007', filetype: 'directory', isShared: true, sharedAt: 'October 15, 2007', sharedUntil: 'March 31, 2008', sharedUrl: '2fhty', isPasswordRequired: true },
      storeKey ;

  store.createRecord(Sample.File, dataHash) ;
  store.commitRecords();

  storeKey = Sample.File.storeKeyFor(dataHash.guid);
  assert.ok(fixtures.fixtureForStoreKey(store, storeKey), 'should have data hash in fixtures');
});


test("Update and commit a record", function (assert) {

  var rec      = store.find(Sample.File, "10"),
      storeKey = Sample.File.storeKeyFor("10"),
      fixtures = store.get('dataSource'),
      fixture = fixtures.fixtureForStoreKey(store, storeKey);

  assert.equal(fixture.name, rec.get('name'), 'precond - fixture state should match name');
  assert.equal(rec.get('status'), Record.READY_CLEAN, "Status should be READY_CLEAN because no changes have been made");

  rec.set('name', 'foo');
  assert.equal(rec.get('status'), Record.READY_DIRTY, "Status should be READY_DIRTY after changing name");

  store.commitRecords();
  assert.equal(store.readStatus(storeKey), Record.READY_CLEAN, "Status in store should be READY_CLEAN after save");
  assert.equal(rec.get('status'), Record.READY_CLEAN, "Status in record should be READY_CLEAN after save");

  fixture = fixtures.fixtureForStoreKey(store, storeKey);
  assert.equal(fixture.name, rec.get('name'), 'fixture state should update to match new name');

});
