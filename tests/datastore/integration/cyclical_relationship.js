// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module test ok equals same AB */

import { SC } from "../../../core/core.js";
import { Store, Record, Query } from "../../../datastore/datastore.js";


module("Cyclical relationships", { 
  beforeEach: function() {

    // define the application space
    window.AB = SC.Object.create({
      store: Store.create().from(Record.fixtures)
    }); 

    // ..........................................................
    // MODEL
    // 
    
    // Describes a single contact
    AB.Contact = Record.extend({
      name: Record.attr(String),
      group: Record.toOne('AB.Group'),
      isFavorite: Record.attr(Boolean)
    });
    
    AB.Group = Record.extend({
      name: Record.attr(String),
      
      // dynamically discover contacts for a group using a foreign key
      contacts: function() {
        var q = Query.local(AB.Contact, "group = {record}", {
          record: this
        });  
        return this.get('store').find(q);
      }.property().cacheable(),
      
      // discover favorite contacts only
      favoriteContacts: function() {
        return this.get('contacts').filterProperty('isFavorite', true);
      }.property('contacts').cacheable(),
      
      // we need to reset favoriteContacts whenever the contacts themselves
      // change
      contactsContentDidChange: function() {
        this.notifyPropertyChange('favoriteContacts');
      }.observes('.contacts*[]')
      
    });
    
    AB.Group.FIXTURES = [
      { guid: 100, name: "G1" },
      { guid: 101, name: "G2" }
    ];

    AB.Contact.FIXTURES = [
      { guid: 1,
        name: "G1-Fav1",
        group: 100,
        isFavorite: true },

      { guid: 2,
        name: "G1-Fav2",
        group: 100,
        isFavorite: true },

      { guid: 3,
        name: "G1-Norm1",
        group: 100,
        isFavorite: false },

      { guid: 4,
        name: "G2-Fav1",
        group: 101,
        isFavorite: true },

      { guid: 5,
        name: "G1-Norm1",
        group: 101,
        isFavorite: false }
    ];
    
    
    SC.RunLoop.begin();
    
  },
  
  afterEach: function() {
    SC.RunLoop.end(); 
    AB = null;
  }
});

test("getting all contacts in a group", function (assert) {
  var group  = AB.store.find(AB.Group, 100);
  var expected = AB.store.find(AB.Contact).filterProperty('group', group);
  assert.deepEqual(group.get('contacts').toArray(), expected, 'contacts');
});

test("finding favoriteContacts", function (assert) {
  var group  = AB.store.find(AB.Group, 100);
  var expected = AB.store.find(AB.Contact)
    .filterProperty('group', group)
    .filterProperty('isFavorite', true);
    
  assert.deepEqual(group.get('favoriteContacts'), expected, 'contacts');
  
  var c = AB.store.find(AB.Contact, 4) ;
  c.set('group', group); // move to group...
  SC.RunLoop.end();
  SC.RunLoop.begin();
  
  expected.push(c);
  assert.deepEqual(group.get('favoriteContacts'), expected, 'favoriteContacts after adding extra');
  
});


