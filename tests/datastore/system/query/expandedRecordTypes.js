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
    
    MyApp.Contact  = Record.extend({ isContact: true });
    MyApp.Person   = MyApp.Contact.extend({ isPerson: true }); // person is a type of contact
    MyApp.Group    = Record.extend({ isGroup: true }) ; // NOT a subclass
    MyApp.Foo      = Record.extend({ isFoo: true });
    
  },
  
  afterEach: function() { 
    MyApp = null ; 
    Record.subclasses = SC.Set.create(); // reset subclasses
  }
});

test("single recordType with no subclasses", function (assert) {
  var q = Query.local(MyApp.Foo),
      expected = SC.CoreSet.create().add(MyApp.Foo);
      expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'should have only MyApp.Foo');
});

test("multiple recordTypes with no subclasses", function (assert) {
  var q = Query.local([MyApp.Foo, MyApp.Group]),
      expected = SC.CoreSet.create().add(MyApp.Foo).add(MyApp.Group);
      expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'should have MyApp.Foo, MyApp.Group');
});

test("base Record", function (assert) {
  var q = Query.local(),
      expected = SC.CoreSet.create().addEach([MyApp.Foo, MyApp.Group, MyApp.Person, MyApp.Contact, Record]);
      expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'should have all defined types');
});

test("type with subclass", function (assert) {
  var q = Query.local(MyApp.Contact),
      expected = SC.CoreSet.create().addEach([MyApp.Person, MyApp.Contact]);
      expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'should have all Contact and Person');
});

test("adding new type should invalidate property", function (assert) {
  var q = Query.local(MyApp.Contact),
      expected = SC.CoreSet.create().addEach([MyApp.Person, MyApp.Contact]);   
      expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'precond - should have all Contact and Person');
  
  expected = SC.CoreSet.create().addEach([MyApp.Person, MyApp.Contact]);   
  var Bar = MyApp.Person.extend(); // add a new record
  expected.add(Bar);
  expected.freeze();
  assert.deepEqual(q.get('expandedRecordTypes'), expected, 'should have all Contact, Person, and Bar');
});
