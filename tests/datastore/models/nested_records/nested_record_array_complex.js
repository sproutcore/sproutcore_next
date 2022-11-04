/**
 * Nested Record Array (ChildRecord) Unit Test
 *
 * @author Evin Grano
 */
/*global same, equals, ok, test, module*/

import { SC } from "../../../../core/core.js";
import { Store, Record, ChildArray } from "../../../../datastore/datastore.js";


// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, testParent, peopleData1, peopleData2, personData1, addressData1;

var initModels = function(){
  NestedRecord.Group = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: Record.attr(String),
    people: Record.toMany('NestedRecord.Person', { nested: true })
  });

  NestedRecord.Person = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: Record.attr(String),
    addresses: Record.toMany('NestedRecord.Address', { nested: true })
  });

  NestedRecord.Address = Record.extend({
    street: Record.attr(String),
    city: Record.attr(String),
    state: Record.attr(String, {defaultValue: "VA"})
  });
};

// ..........................................................
// Basic ParentRecord with an Array of Children
//
module("Complex Record: Parent > Array of Children > Array of Children", {

  beforeEach: function() {
    NestedRecord = SC.Object.create({
      store: Store.create()
    });
    window.NestedRecord = NestedRecord;
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.Group, {
      name: 'Test Group',
      people: [
        {
          type: 'Person',
          name: 'Barack Obama',
          addresses: [
            { type: 'Address', street: '123 Some Street', city: 'Chicago', state: 'IL'},
            { type: 'Address', street: '222 Socialist Way ', city: 'Washington', state: 'DC'}
          ]
        },
        {
          type: 'Person',
          name: 'John Doe',
          addresses: [
            { type: 'Address', street: '1111 Cross Street', city: 'Anywhere', state: 'CA'},
            { type: 'Address', street: '555 18th Street ', city: 'Boulder', state: 'CO'},
            { type: 'Address', street: '444 Goofy Street ', city: 'Redneck', state: 'AR'}
          ]
        },
        {
          type: 'Person',
          name: 'Jane Doe',
          addresses: [
            { type: 'Address', street: '987 Crispy Kreme Lane', city: 'Lard', state: 'TX'}
          ]
        }
      ]
    });
    SC.RunLoop.end();
    // Second Array for testings
    peopleData2 = [
      {
        type: 'Person',
        name: 'Tom Jones',
        addresses: [
          { type: 'Address', street: '1 Freezing Circle', city: 'Nome', state: 'AK'},
          { type: 'Address', street: '444 Not Unusual Love Place', city: 'Las Vegas', state: 'NV'},
          { type: 'Address', street: '66 On The Road', city: 'Touring', state: 'Anywhere'}
        ]
      },
      {
        type: 'Person',
        name: 'Dick Smothers',
        addresses: [
          { type: 'Address', street: '1 Mom Likes Best Place', city: 'Tujunga', state: 'CA'}
        ]
      }
    ];

    personData1 = {
      type: 'Person',
      name: 'Testikles, God Of Fertility',
      addresses: [
        { type: 'Address', street: '45 Gods and Goddess Place', city: 'Mount', state: 'Olympus'},
        { type: 'Address', street: '1 Special Circle', city: 'Your Mom', state: 'Your State'}
      ]
    };

    // Address Test Data
    addressData1 = [
      { type: 'Address', street: '1 Main Street', city: 'Greenbow', state: 'AL'},
      { type: 'Address', street: '666 Wall Street', city: 'New York', state: 'NY'},
      { type: 'Address', street: '4 Dirt Road', city: 'Pleasent', state: 'CO'},
      { type: 'Address', street: '1 Yellow Brick Road', city: 'Dorothy', state: 'KA'}
    ];
  },

  afterEach: function() {
    delete NestedRecord.Group;
    delete NestedRecord.Person;
    delete NestedRecord.Address;
    //delete window.NestedRecord;
    NestedRecord = null;
    testParent = null;
    peopleData1 = null;
    peopleData2 = null;
    personData1 = null;
    addressData1 = null;
    store = null;
  }
});

test("Function: readAttribute()", function (assert) {
  var ppl;
  ppl = testParent.readAttribute('people');
  assert.ok(ppl, "check to see that the child records array exists");
  assert.equal(ppl.length, 3, "checking to see that the length of the elements array is 3");

  // Check the first person
  assert.equal(ppl[0].name, 'Barack Obama', "first person, check to see name is Barack Obama");
  assert.equal(ppl[0].addresses.length, 2, "first person, check to see length of the addresses is 2");
  assert.deepEqual(ppl[0].addresses[0], { type: 'Address', street: '123 Some Street', city: 'Chicago', state: 'IL'},
    "check to see if the first person's first address is as expected");
  assert.deepEqual(ppl[0].addresses[1], { type: 'Address', street: '222 Socialist Way ', city: 'Washington', state: 'DC'},
    "check to see if the first person's last address is as expected");

  // Check Last person
  assert.equal(ppl[2].name, 'Jane Doe', "last person, check to see name is Jane Doe");
  assert.equal(ppl[2].addresses.length, 1, "last person, check to see length of the addresses is 2");
  assert.deepEqual(ppl[2].addresses[0], { type: 'Address', street: '987 Crispy Kreme Lane', city: 'Lard', state: 'TX'},
    "check to see if the last person's first address is as expected");
});

test("Function: writeAttribute()", function (assert) {
  var ppl;
  testParent.writeAttribute('people', peopleData2);
  ppl = testParent.readAttribute('people');
  assert.ok(ppl, "after writeAttribute(), check to see that the child records array exists");
  assert.equal(ppl.length, 2, "after writeAttribute(), checking to see that the length of the elements array is 2");

  // Check the first person
  assert.equal(ppl[0].name, 'Tom Jones', "first person, check to see name is Tom Jones");
  assert.equal(ppl[0].addresses.length, 3, "first person, check to see length of the addresses is 3");
  assert.deepEqual(ppl[0].addresses[0], { type: 'Address', street: '1 Freezing Circle', city: 'Nome', state: 'AK'},
    "check to see if the first person's first address is as expected");
  assert.deepEqual(ppl[0].addresses[2], { type: 'Address', street: '66 On The Road', city: 'Touring', state: 'Anywhere'},
    "check to see if the first person's last address is as expected");

  // Check Last person
  assert.equal(ppl[1].name, 'Dick Smothers', "last person, check to see name is Dick Smothers");
  assert.equal(ppl[1].addresses.length, 1, "last person, check to see length of the addresses is 2");
  assert.deepEqual(ppl[1].addresses[0], { type: 'Address', street: '1 Mom Likes Best Place', city: 'Tujunga', state: 'CA'},
    "check to see if the last person's first address is as expected");

});

test("Basic Read, Testing the First Child Array", function (assert) {
  var ppl, pplAttr, pplDup, p, pDup, pStore, key, oldKey;
  // Test general gets
  assert.equal(testParent.get('name'), 'Test Group', "get should be correct for name attribute: Test Group");
  assert.equal(testParent.get('nothing'), null, "get should be correct for invalid key");

  // Test Person (Child Record) creation
  ppl = testParent.get('people');
  // Check Model Class information

  assert.ok(SC.instanceOf(ppl, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(ppl.get('length'), 3, "check that the length of the array of child records is 3");
  p = ppl.objectAt(0);
  assert.ok(SC.kindOf(p, Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "check that first ChildRecord from the get() creates an actual instance of a Person Object");

  // Duplication check
  pplDup = testParent.get('people');
  assert.ok(pplDup, 'check to see that we get an array on the second call to the parent for the child records');
  assert.equal(pplDup.get('length'), 3, "check that the length of the array of child records is still 3");
  pDup = pplDup.objectAt(0);
  assert.ok(pDup, "check to see if we have an instance of a child record again");
  oldKey = p.get('id');
  key = pDup.get('id');
  assert.equal(key, oldKey, "check to see if the primary keys are the same");
  assert.equal(SC.guidFor(pDup), SC.guidFor(p), "check to see if the guid are the same");
  assert.deepEqual(pDup, p, "check to see that it is the same child record as before");
});

test("Basic Read, Testing the Second Child Array", function (assert) {
  var pDup, pStore;
  var ppl, pplAttr, p, addrs, addrsDup, addrsAttr, a, aDup, aStore, key, oldKey;

  // Test Addresses (Child Record) creation
  ppl = testParent.get('people');
  p = ppl.objectAt(0);
  addrs = p.get('addresses');
  // Check Model Class information

  assert.ok(SC.instanceOf(addrs, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(addrs.get('length'), 2, "check that the length of the array of child records is 2");
  a = addrs.objectAt(0);
  assert.ok(SC.kindOf(a, Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(a, NestedRecord.Address), "check that first ChildRecord from the get() creates an actual instance of a Address Object");

  // Duplication check
  addrsDup = p.get('addresses');
  assert.ok(addrsDup, 'check to see that we get an array on the second call to the parent for the child records');
  assert.equal(addrsDup.get('length'), 2, "check that the length of the array of child records is still 2");
  aDup = addrsDup.objectAt(0);
  assert.ok(aDup, "check to see if we have an instance of a child record again");
  oldKey = a.get('id');
  key = aDup.get('id');
  assert.equal(key, oldKey, "check to see if the primary key are the same");
  assert.equal(SC.guidFor(aDup), SC.guidFor(a), "check to see if the guid are the same");
  assert.deepEqual(aDup, a, "check to see that it is the same child record as before");
});

test("Basic Write: Testing the First Child Array", function (assert) {
  var ppl, p, pAddrs, pAddrsAttr, pStore, key, oldKey, aFirst, aLast;
  // Test general gets
  testParent.set('name', 'New Group');
  assert.equal(testParent.get('name'), 'New Group', "set() should change name attribute");
  testParent.set('nothing', 'nothing');
  assert.equal(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");

   testParent.set('people', peopleData2);
   ppl = testParent.get('people');
   assert.ok(SC.instanceOf(ppl, ChildArray), "check that get() creates an actual instance of a ChildArray");
   assert.equal(ppl.get('length'), 2, "after set() on parent, check that the length of the array of child records is 2");
   p = ppl.objectAt(0);
   assert.ok(SC.kindOf(p, Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
   assert.ok(SC.instanceOf(p, NestedRecord.Person), "check that first ChildRecord from the get() creates an actual instance of a Person Object");

   // TODO: [EG] Add test to make sure the number of ChildRecords in store is correct when we add store record clearing

   // Check for changes on the child bubble to the parent.
   p.set('addresses', addressData1);
   pAddrs = p.get('addresses');
   assert.ok(SC.kindOf(pAddrs, ChildArray), "check to see that the set('addresses') has returned a ChildArray");
   assert.equal(pAddrs.get('length'), 4, "check with a get() that the new address length is 4");
   pAddrsAttr = p.readAttribute('addresses');
   assert.equal(pAddrsAttr.length, 4, "check with a readAttribute() that the new address length is 4");
   aFirst = pAddrs.objectAt(0);
   aLast = pAddrs.objectAt(3);
   assert.deepEqual(pAddrsAttr[0], aFirst.get('attributes'), "check from the Person (parent Record) that the first Address's attributes are the same as the Person's readAttribute for the reference");
   assert.deepEqual(pAddrsAttr[3], aLast.get('attributes'), "check from the Person (parent Record) that the last Address's attributes are the same as the Person's readAttribute for the reference");
   assert.ok(p.get('status') & Record.DIRTY, 'check that the person (child record) is dirty');
   assert.ok(testParent.get('status') & Record.DIRTY, 'check that the group (parent record) is dirty');
});

test("Basic Write: Testing the Second Child Array", function (assert) {
  var ppl, pplAttr, p, addrsAttr, addrs, a;

  ppl = testParent.get('people');
  p = ppl.objectAt(0);
  addrs = p.get('addresses');
  a = addrs.objectAt(0);

  // New do the test on the address
  a.set('street', '123 New Street');
  assert.ok(a.get('status') & Record.DIRTY, 'check that the address (child record) is dirty');
  assert.ok(p.get('status') & Record.DIRTY, 'check that the person (child record) is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the group (parent record) is dirty');

  // Check for changes on the child bubble to the parent.
  addrsAttr = p.readAttribute('addresses');
  assert.equal(addrsAttr.length, 2, "check the length of the address attribute is still 2");
  assert.equal(addrsAttr[0], a.get('attributes'), "check to see if the person's address attribute is the same as the address's attributes");

  // Check the group people stuff
  pplAttr = testParent.readAttribute('people');
  assert.equal(pplAttr[0].addresses[0], a.get('attributes'), "check to see if the groups reference's address attribute is the same as the address's attributes");
});

test("Basic Array Functionality: pushObject", function (assert) {
  var ppl, pplAttr, p, pFirst, pLast;
  // Add something to the array
  ppl = testParent.get('people');
  // PushObject Tests
  ppl.pushObject(personData1);
  ppl = testParent.get('people');
  assert.equal(ppl.get('length'), 4, "after pushObject() on parent, check that the length of the array of child records is 4");
  p = ppl.objectAt(3);
  assert.ok(SC.kindOf(p, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "check that newly added ChildRecord creates an actual instance of a Person Object");
  assert.equal(p.get('name'), 'Testikles, God Of Fertility', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(p.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  pplAttr = testParent.readAttribute('people');
  assert.equal(pplAttr.length, 4, "after pushObject() on parent, check that the length of the attribute array of child records is 4");
  pFirst = ppl.objectAt(0);
  pLast = ppl.objectAt(3);
  assert.deepEqual(pplAttr[0], pFirst.get('attributes'), "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(pplAttr[3], pLast.get('attributes'), "verify that parent attributes are the same as the last individual child attributes");
});

test("Advanced Array Functionality: pushObject", function (assert) {
  var ppl, that = this;
  that.willChange = 0;
  that.didChange = 0;
  that.removedCount = 0;
  that.addedCount = 0;

  this.arrayContentWillChange = function(start, removedCount, addedCount) {
    that.willChange += 1;
  };
  this.arrayContentDidChange = function(start, removedCount, addedCount) {
    that.didChange += 1;
    that.removedCount += removedCount;
    that.addedCount += addedCount;
  };

  // Create thea rray and add observers
  ppl = testParent.get('people');
  ppl.addArrayObservers({
    target: this,
    willChange: this.arrayContentWillChange,
    didChange: this.arrayContentDidChange
  });

  // This should fire willChange and didChange once each
  ppl.pushObject(peopleData2[0]);
  assert.equal(that.willChange, 1, "arrayContentWillChange should have been executed once");
  assert.equal(that.didChange, 1, "arrayContentDidChange should have been executed once");
  assert.equal(that.removedCount, 0, "Zero records were removed");
  assert.equal(that.addedCount, 1, "1 Record was added");

  // Reset
  that.willChange = 0;
  that.didChange = 0;
  that.removedCount = 0;
  that.addedCount = 0;

  // This should fire willChange and didChange once each
  ppl.pushObject(peopleData2[1]);
  assert.equal(that.willChange, 1, "arrayContentWillChange should have been executed once");
  assert.equal(that.didChange, 1, "arrayContentDidChange should have been executed once");
  assert.equal(that.removedCount, 0, "Zero records were removed");
  assert.equal(that.addedCount, 1, "A second record was added");
});

test("Basic Array Functionality: popObject", function (assert) {
  var ppl, pplAttr, p, pFirst, pLast;
  // Add something to the array
  ppl = testParent.get('people');
  // popObject Tests
  ppl.popObject();
  ppl = testParent.get('people');
  assert.equal(ppl.get('length'), 2, "after popObject() on parent, check that the length of the array of child records is 2");
  p = ppl.objectAt(0);
  assert.ok(SC.kindOf(p, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "check that newly added ChildRecord creates an actual instance of a Person Object");
  assert.equal(p.get('name'), 'Barack Obama', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(p.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  pplAttr = testParent.readAttribute('people');
  assert.equal(pplAttr.length, 2, "after pushObject() on parent, check that the length of the attribute array of child records is 2");
  pFirst = ppl.objectAt(0);
  pLast = ppl.objectAt(1);
  assert.deepEqual(pplAttr[0], pFirst.get('attributes'), "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(pplAttr[1], pLast.get('attributes'), "verify that parent attributes are the same as the last individual child attributes");
});

test("Basic Array Functionality: shiftObject access first", function (assert) {
  var ppl, p, removed, first, second;
  // Add something to the array
  ppl = testParent.get('people');

  SC.run(function () {
    first = ppl.objectAt(0);
    second = ppl.objectAt(1);
    assert.equal(first.get('name'), 'Barack Obama', "The first instance has the name");
    assert.equal(second.get('name'), 'John Doe', "The second instance has the name");
    removed = ppl.shiftObject();
    assert.equal(ppl.get('length'), 2, "after shiftObject() on parent, check that the length of the array of child records is 2");
  });

  SC.run(function () {
    p = ppl.objectAt(0);
    assert.equal(removed.name, 'Barack Obama', "The removed object should have name");
    assert.equal(p.get('name'), 'John Doe', "The new first instance should have name");
    assert.equal(first.get('name'), 'Barack Obama', "The previous instance should still have the name");
    assert.equal(second.get('name'), 'John Doe', "The previous instance should still have the name");
    assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
  });
});

test("Basic Array Functionality: shiftObject access after", function (assert) {
  var ppl, p, removed, first, second;
  // Add something to the array
  ppl = testParent.get('people');

  SC.run(function () {
    removed = ppl.shiftObject();
    assert.equal(ppl.get('length'), 2, "after shiftObject() on parent, check that the length of the array of child records is 2");
  });

  SC.run(function () {
    first = ppl.objectAt(0);
    second = ppl.objectAt(1);
    assert.equal(removed.name, 'Barack Obama', "The removed object should have name");
    assert.equal(first.get('name'), 'John Doe', "The new first instance should have name");
    assert.equal(second.get('name'), 'Jane Doe', "The new second instance should have name");
    assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
  });
});

test("Basic Array Functionality: unshiftObject", function (assert) {
  var ppl, pplAttr, p, pFirst, pLast;
  // Add something to the array
  ppl = testParent.get('people');
  // PushObject Tests
  SC.run(function () {
    ppl.unshiftObject(personData1);
  });

  ppl = testParent.get('people');
  assert.equal(ppl.get('length'), 4, "after unshiftObject() on parent, check that the length of the array of child records is 4");
  SC.run(function () {
    p = ppl.objectAt(0);
  });
  assert.ok(SC.kindOf(p, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(p, NestedRecord.Person), "check that newly added ChildRecord creates an actual instance of a Person Object");
  assert.equal(p.get('name'), 'Testikles, God Of Fertility', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(p.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  pplAttr = testParent.readAttribute('people');
  assert.equal(pplAttr.length, 4, "after unshiftObject() on parent, check that the length of the attribute array of child records is 4");
  SC.run(function () {
    pFirst = ppl.objectAt(0);
    pLast = ppl.objectAt(3);
  });
  assert.deepEqual(pplAttr[0], pFirst.get('attributes'), "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(pplAttr[3], pLast.get('attributes'), "verify that parent attributes are the same as the last individual child attributes");
});

test("Test: normalization on complex nested records", function (assert) {
  var ppl, addresses, pAttrs;
  // Add something to the array
  ppl = testParent.get('people');

  SC.run(function () {
    addresses = ppl.objectAt(0).get('addresses');
    addresses.pushObject({ type: 'Address', street: '2 Main Street', city: 'Awesome'});
    testParent.normalize();
  });
  pAttrs = testParent.get('attributes');
  assert.equal(pAttrs.people[0].addresses[2].state, 'VA', "test normalization is the default value of VA");
});


