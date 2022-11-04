// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp Sample */

import { SC } from "../../../../core/core.js";
import { Store, Record, DataSource } from "../../../../datastore/datastore.js";

var store, nestedStore, Application, dataSource;

module("NestedStore Core Methods", {
  beforeEach: function() {
    dataSource = DataSource.create();
    
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
    store = Store.create({ name: 'Test nested store'} ).from(dataSource);
    for(var i in Application.Data) {
      store.loadRecords(Application[i], Application.Data[i]);
    }
    SC.RunLoop.end();
    
    // make sure RecordType by String can map
    window.Application = Application;
    
    nestedStore = store.chain();
  }    
});

test("Make sure that setting an attribute on a record will only notify respective observers once", function (assert) {
  
  var file = nestedStore.find(Application.File, '14');
  Application._nameDidChange = 0 ;
  
  SC.RunLoop.begin();
  file.writeAttribute('name', 'My Great New Name');
  SC.RunLoop.end();
  
  assert.equal(Application._nameDidChange, 1, 'observer was only fired once');

});
