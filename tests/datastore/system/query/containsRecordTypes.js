// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
 
import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, MyApp, q;

module("Query#containsRecordTypes", {
  beforeEach: function() {
    MyApp = SC.Object.create();
    
    MyApp.Contact  = Record.extend();
    MyApp.Person   = MyApp.Contact.extend(); // person is a type of contact
    MyApp.Group    = Record.extend() ; // NOT a subclass
    MyApp.Foo      = Record.extend();
    
  },
  
  afterEach: function() { MyApp = null ; }
});

test("comparing a single record type", function (assert) {
  var set, q;
  
  q = Query.create({ recordType: MyApp.Contact });
  set = SC.Set.create().add(MyApp.Contact);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set includes recordType');
  
  set = SC.Set.create().add(MyApp.Person);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set include subclass of recordType');
  
  set = SC.Set.create().add(MyApp.Group);
  assert.equal(q.containsRecordTypes(set), false, 'should return false when set include unrelated of recordType');

  set = SC.Set.create().add(MyApp.Group).add(MyApp.Contact);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set includes  recordType along with others');
  
});

test("comparing a multiple record type", function (assert) {
  var set, q;
  
  q = Query.create({ recordTypes: [MyApp.Contact, MyApp.Group] });

  set = SC.Set.create().add(MyApp.Contact);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set includes one of recordTypes');

  set = SC.Set.create().add(MyApp.Group);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set includes one of recordTypes');
  
  set = SC.Set.create().add(MyApp.Person);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set include subclass of recordTypes'); 
  
  set = SC.Set.create().add(MyApp.Group).add(MyApp.Foo);
  assert.equal(q.containsRecordTypes(set), true, 'should return true when set includes  recordType along with others');
  
});


test("comparing with no recordType set", function (assert) {
  var set, q;
  
  // NOTE: no recordType or recordTypes
  q = Query.create({  });

  set = SC.Set.create().add(MyApp.Contact);
  assert.equal(q.containsRecordTypes(set), true, 'should always return true');

  set = SC.Set.create().add(MyApp.Group);
  assert.equal(q.containsRecordTypes(set), true, 'should always return true');
  
  set = SC.Set.create().add(MyApp.Person);
  assert.equal(q.containsRecordTypes(set), true, 'should always return true');
  
  set = SC.Set.create().add(MyApp.Group).add(MyApp.Foo);
  assert.equal(q.containsRecordTypes(set), true, 'should always return true');
  
});
