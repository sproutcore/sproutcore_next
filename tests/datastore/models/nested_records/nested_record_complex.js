/**
 * Complex Nested Records (Record) Unit Test
 *
 * @author Evin Grano
 */
 /* globals module, test, equals, same, ok */
 import { SC } from "../../../../core/core.js";
 import { Store, Record, Query } from "../../../../datastore/datastore.js";
 

// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, testParent;

var initModels = function(){
  NestedRecord.Address = Record.extend({
    street: Record.attr(String),
    city: Record.attr(String),
    state: Record.attr(String, {defaultValue: 'VA'})
  });

  NestedRecord.Person = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: Record.attr(String),
    address: Record.toOne('NestedRecord.Address', { nested: true }),
    children: Record.toMany('NestedRecord.GrandchildRecordTest', { nested: true })
  });

  NestedRecord.ParentRecordTest = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: Record.attr(String),
    person: Record.toOne('NestedRecord.Person', { nested: true })
  });

  NestedRecord.GrandchildRecordTest = Record.extend({
    name: Record.attr(String)
  });
};

// ..........................................................
// Basic Record Stuff
//
module("Basic Record Functions w/ a Parent > Child > Child", {

  beforeEach: function() {
    NestedRecord = SC.Object.create({
      store: Store.create()
    });
    window.NestedRecord = NestedRecord;
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent Name',
      person: {
        type: 'Person',
        name: 'Albert',
        address: {
          type: 'Address',
          street: '123 Sesame St',
          city: 'New York',
          state: 'NY'
        },
        children: [{
          name: 'Grandchild Name 1'
        },{
          name: 'Grandchild Name 2'
        }]
      }
    });
    SC.RunLoop.end();
  },

  afterEach: function() {
    delete NestedRecord.ParentRecordTest;
    delete NestedRecord.Person;
    delete NestedRecord.Address;
    //delete window.NestedRecord;
    NestedRecord = null;
    testParent = null;
    store = null;
  }
});

test("Function: readAttribute() in the Parent Record", function (assert) {

  assert.equal(testParent.readAttribute('name'), 'Parent Name', "readAttribute should be correct for name attribute");
  assert.equal(testParent.readAttribute('nothing'), null, "readAttribute should be correct for invalid key");
  // TODO: same gets hung up by Array.prototype.isEqual which rejects Array & Object items (b/c isEqual does)
  // assert.deepEqual(testParent.readAttribute('person'),
  //   {
  //     type: 'Person',
  //     name: 'Albert',
  //     address: {
  //       type: 'Address',
  //       street: '123 Sesame St',
  //       city: 'New York',
  //       state: 'NY'
  //     },
  //     children: [{
  //       name: 'Grandchild Name 1'
  //     },{
  //       name: 'Grandchild Name 2'
  //     }]
  //   },
  //   "readAttribute should be correct for 'person' child attribute");
});

test("Function: readAttribute() in the Parent > Child", function (assert) {
  var person = testParent.get('person');
  assert.ok(person, "check to see if the first child in the chain exists");
  assert.equal(person.readAttribute('name'), 'Albert', "child readAttribute should be correct for name attribute");
  assert.equal(person.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key");
  assert.deepEqual(person.readAttribute('address'),
    {
      type: 'Address',
      street: '123 Sesame St',
      city: 'New York',
      state: 'NY'
    },
    "readAttribute should be correct for address on the child");
});

test("Function: readAttribute() in the Parent > Child > Child", function (assert) {
  var address = testParent.getPath('person.address');
  assert.ok(address, "check to see if the child of the child in the chain exists with a getPath()");
  assert.equal(address.readAttribute('street'), '123 Sesame St', "child readAttribute should be correct for street attribute w/ getPath()");
  assert.equal(address.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key w/ getPath()");

  // Test the individual gets
  var person = testParent.get('person');
  var address2 = person.get('address');
  assert.ok(address2, "check to see if the child of the child in the chain exists with a get");
  assert.equal(address2.readAttribute('street'), '123 Sesame St', "child readAttribute should be correct for street attribute w/ get()");
  assert.equal(address2.readAttribute('nothing'), null, "child readAttribute should be correct for invalid key w/ get()");
});

test("Function: writeAttribute() in the Parent Record", function (assert) {

  testParent.writeAttribute('name', 'New Parent Name');
  assert.equal(testParent.get('name'), 'New Parent Name', "writeAttribute should be the new name attribute");

  testParent.writeAttribute('nothing', 'nothing');
  assert.equal(testParent.get('nothing'), 'nothing', "writeAttribute should be correct for new key");

  testParent.writeAttribute('person',
  {
    type: 'Person',
    name: 'Al Gore',
    address: {
      type: 'Address',
      street: '123 Crazy St',
      city: 'Khacki Pants',
      state: 'Insanity'
    }
  });
  assert.deepEqual(testParent.readAttribute('person'),
    {
      type: 'Person',
      name: 'Al Gore',
      address: {
        type: 'Address',
        street: '123 Crazy St',
        city: 'Khacki Pants',
        state: 'Insanity'
      }
    },
    "writeAttribute with readAttribute should be correct for person child attribute");
});

test("Function: writeAttribute() in the Parent > Child", function (assert) {
  var person = testParent.get('person');
  person.writeAttribute('name', 'Luke Skywalker');
  assert.equal(person.readAttribute('name'), 'Luke Skywalker', "writeAttribute should be the new name attribute on the child");
  var p = testParent.readAttribute('person');
  assert.equal(p.name, 'Luke Skywalker', "check to see if a writeAttribute single change on the child will reflect on the parent");

  // check for a change on the child of the child
  var newAddress = {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  };
  person.writeAttribute('address', newAddress);
  assert.deepEqual(person.readAttribute('address'), {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  }, "writeAttribute should be the new address attribute on the child");
  p = testParent.readAttribute('person');
  assert.deepEqual(p.address, {
    type: 'Address',
    street: '1 Way Street',
    city: 'Springfield',
    state: 'IL'
  }, "check to see if a writeAttribute address change on the child will reflect on the parent");
});

test("Function: writeAttribute() in the Parent > Child > Child", function (assert) {
  var address = testParent.getPath('person.address');
  address.writeAttribute('street', '1 Death Star Lane');
  assert.equal(address.readAttribute('street'), '1 Death Star Lane', "writeAttribute should be the new name attribute on the child.street");
  // Now, test the person
  var p = testParent.readAttribute('person');
  assert.equal(p.address.street, '1 Death Star Lane', "check to see if a writeAttribute change on the child will reflect on the child > child.address.street");
  // now test the Parent record
  var parentAttrs = testParent.get('attributes');
  assert.equal(parentAttrs.person.address.street, '1 Death Star Lane', "check to see if a writeAttribute change on the child will reflect on the child > child > parent.attributes.person.address.street");
});

test("Basic Read", function (assert) {

  // Test general gets
  assert.equal(testParent.get('name'), 'Parent Name', "Parent.get() should be correct for name attribute");
  assert.equal(testParent.get('nothing'), null, "Parent.get() should be correct for invalid key");

  // Test Child Record creation
  var p = testParent.get('person');
  // Check Model Class information
  assert.ok(SC.kindOf(p, Record), "(parent > child).get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "(parent > child).get() creates an actual instance of a Person Object");

  var a = testParent.getPath('person.address');
  // Check Model Class information
  assert.ok(SC.kindOf(a, Record), "(parent > child > child) w/ getPath() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(a, NestedRecord.Address), "(parent > child > child) w/ getPath() creates an actual instance of an Address Object");

});

test("Basic Write", function (assert) {
  var oldP, p, key, oldKey, storeRef;
  var a, parentAttrs;
  // Test general gets
  testParent.set('name', 'New Parent Name');
  assert.equal(testParent.get('name'), 'New Parent Name', "set() should change name attribute");
  testParent.set('nothing', 'nothing');
  assert.equal(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");

  // Test Child Record creation
  oldP = testParent.get('person');
  oldKey = oldP.get('id');
  testParent.set('person', {
    type: 'Person',
    name: 'Al Gore',
    address: {
      type: 'Address',
      street: '123 Crazy St',
      city: 'Khacki Pants',
      state: 'Insanity'
    }
  });
  p = testParent.get('person');
  // Check Model Class information
  assert.ok(SC.kindOf(p, Record), "set() with an object creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "set() with an object creates an actual instance of a ChildRecordTest Object");

 // Check for changes on the child bubble to the parent.
  p.set('name', 'Child Name Change');
  assert.equal(p.get('name'), 'Child Name Change', "after a set('name', <new>) on child, checking that the value is updated");
  assert.ok(p.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
  oldP = p;
  p = testParent.get('person');
  assert.deepEqual(p, oldP, "after a set('name', <new>) on child, checking to see that the parent has received the changes from the child record");
  assert.deepEqual(testParent.readAttribute('person'), p.get('attributes'), "after a set('name', <new>) on child, readAttribute on the parent should be correct for person child attributes");

  // Check changes on the address
  a = testParent.getPath('person.address');
  a.set('street', '321 Nutty Professor Lane');
  parentAttrs = testParent.readAttribute('person');
  assert.deepEqual(a.get('attributes'), parentAttrs.address, "after a set('street', <new>) on address child, checking to see that the parent has received the changes from the child record");
});

test("Basic normalize()", function (assert) {
  var pAttrs;

  SC.run(function () {
    testParent.set('person', {
      type: 'Person',
      name: 'Al Gore',
      address: {
        type: 'Address',
        street: '123 Crazy St',
        city: 'Khacki Pants'
      }
    });
  });
  testParent.normalize();
  pAttrs = testParent.get('attributes');
  assert.equal(pAttrs.person.address.state, 'VA', "test normalization is the default value of VA");
});


test("Modifying Grandchild Nested Record Dirties the Main Record", function (assert) {
  var childRecord,
      grandChildren,
      grandChild0;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
    grandChild0 = grandChildren.objectAt(0);
  });

  // Check Model Class information
  assert.ok(SC.kindOf(grandChild0, Record), "get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(grandChild0, NestedRecord.GrandchildRecordTest), "get() creates an actual instance of a GrandchildRecordTest Object");

  // Check for changes on the child bubble to the parent.
  SC.run(function () {
    grandChild0.set('name', 'Grandchild Name Change');
  });

  assert.equal(grandChild0.get('name'), 'Grandchild Name Change', "after a set('name', <new>) on grandchild, checking that the value is updated");
  assert.ok(grandChild0.get('status') & Record.DIRTY, 'check that the grandchild record is dirty');
  assert.ok(childRecord.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
});

test("Adding Grandchild Nested Record Dirties the Main Record", function (assert) {
  var childRecord,
      grandChildren,
      newGrandchildRecord;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
  });

  SC.run(function () {
    newGrandchildRecord = store.createRecord(NestedRecord.GrandchildRecordTest, { name: 'New Grandchild Name' });
    grandChildren.pushObject(newGrandchildRecord);
  });

  assert.ok(newGrandchildRecord.get('status') & Record.DIRTY, 'check that the grandchild record is dirty');
  assert.ok(childRecord.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
});

test("Reloading Main Record Updates Existing Nested Records", function (assert) {
  var childRecord,
      grandChildren,
      grandChild0;

  SC.run(function () {
    childRecord = testParent.get('person');
    grandChildren = childRecord.get('children');
    grandChild0 = grandChildren.objectAt(0);
  });

  SC.run(function () {
    store.writeDataHash(testParent.get('storeKey'), {
      guid: 'p3',
      name: 'Parent Name Updated',
      person: {
        type: 'Person',
        name: 'Child Name Updated',
        address: {
          type: 'Address',
          street: '123 Sesame St',
          city: 'New York',
          state: 'NY'
        },
        children: [{
          name: 'Grandchild Name 1 Updated',
          value: 'Punk Goo'
        },{
          name: 'Grandchild Name 2 Updated',
          value: 'Ponk Goo'
        }]
      }
    }, Record.READY_CLEAN);
  });

  assert.equal(childRecord.get('name'), 'Child Name Updated', "after writeDataHash, checking that the value is updated on child");
  assert.equal(grandChild0.get('name'), 'Grandchild Name 1 Updated', "after writeDataHash, checking that the value is updated on grandchild");
});
