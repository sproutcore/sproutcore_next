// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";

// test parsing of query string
var store, storeKey, rec1, rec2, rec3, rec4, rec5, rec6, rec7, MyApp, q;
module("Query evaluation of records", {
  beforeEach: function() {
    
    SC.RunLoop.begin();
    
    // setup dummy app and store
    MyApp = SC.Object.create({
      store: Store.create()
    });
    
    // setup dummy models
    MyApp.Animal = Record.extend({});
    MyApp.Person = Record.extend({
      pet: Record.toOne(MyApp.Animal, { nested: true })
    });

    // load some data
    MyApp.store.loadRecords(MyApp.Person, [
      { guid: 1, firstName: "John", lastName: "Doe", married: true },
      { guid: 2, firstName: "Jane", lastName: "Doe", married: false },
      { guid: 3, firstName: "Emily", lastName: "Parker", bornIn: 1975, married: true },
      { guid: 4, firstName: "Johnny", lastName: "Cash", married: true },
      { guid: 5, firstName: "Bert", lastName: "Berthold", married: true },
      { guid: 6, firstName: "Ronald", lastName: "Fitzgerald", parents: { father: "Frank", mother: "Nancy" }},
      { guid: 7, firstName: "Jack", lastName: "Dimpleton", pet: { guid: 1, name: "Fido" } }
    ]);
    
    rec1 = MyApp.store.find(MyApp.Person,1);
    rec2 = MyApp.store.find(MyApp.Person,2);
    rec3 = MyApp.store.find(MyApp.Person,3);
    rec4 = MyApp.store.find(MyApp.Person,4);
    rec5 = MyApp.store.find(MyApp.Person,5);
    rec6 = MyApp.store.find(MyApp.Person,6);
    rec7 = MyApp.store.find(MyApp.Person,7);
    
    SC.RunLoop.end();
    
    q = Query.create();
  }
});


// ..........................................................
// RECORD PROPERTIES
// 

test("should get record properties correctly", function (assert) {

  q.conditions = "fakeProp = 'Foo'";
  q.parse();
  assert.equal(q.contains(rec1), false, 'John should not match: fakeProp = "Foo"');
  
  q.conditions = "firstName = 'John'";
  q.parse();
  assert.equal(q.contains(rec1), true, 'John should match: firstName = "John"');
  assert.equal(q.contains(rec2), false, 'Jane should not match: firstName = "John"');

  q.conditions = "parents.father = 'Frank'";
  q.parse();
  assert.equal(q.contains(rec6), true, "Ronald should match: parents.father = 'Frank'");
  assert.equal(q.contains(rec1), false, "John should not match: parents.father = 'Frank'");

  q.conditions = "pet.name = 'Fido'";
  q.parse();
  assert.equal(q.contains(rec7), true, "Jack should match: pet.name = 'Fido'");
  assert.equal(q.contains(rec6), false, "Ronald should not match: pet.name = 'Fido'");

  q.conditions = "pet.parentRecord.firstName = 'Jack'";
  q.parse();
  assert.equal(q.contains(rec7), true, "Jack should match: pet.parentRecord.firstName = 'Jack'");
  assert.equal(q.contains(rec6), false, "Ronald should not match: pet.parentRecord.firstName = 'Jack'");

  q.conditions = "lastName BEGINS_WITH firstName";
  q.parse();
  assert.equal(q.contains(rec5), true, 'Bert Berthold should match: lastName BEGINS_WITH firstName');
  assert.equal(q.contains(rec2), false, 'Jane Doe should not match: lastName BEGINS_WITH firstName');
  
  q.conditions = "lastName CONTAINS firstName";
  q.parse();
  assert.equal(q.contains(rec5), true, 'Bert Berthold should match: lastName CONTAINS firstName');
  assert.equal(q.contains(rec2), false, 'Jane Doe should not match: lastName CONTAINS firstName');

}); 


test("should handle undefined record properties correctly", function (assert) {
  
  q.conditions = "bornIn = 1975";
  q.parse();
  assert.equal(q.contains(rec3), true, 'record with bornIn set should match');
  assert.equal(q.contains(rec2), false, 'record without bornIn set should not match');
  
  q.conditions = "bornIn = undefined";
  q.parse();
  assert.equal(q.contains(rec3), false, 'record with bornIn set different to null should not match');
  assert.equal(q.contains(rec2), true, 'record without bornIn set should match');
  
}); 

test("should handle boolean correctly", function (assert) {
  
  q.conditions = "married = true";
  q.parse();
  assert.equal(q.contains(rec1), true, 'record with married set should match');
  assert.equal(q.contains(rec2), false, 'record without married set should not match');
  
});
  
