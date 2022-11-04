/*global same, equals, test, module, ok */
/**
 * Nested Record Array of Records Unit Test
 *
 * @author Evin Grano
 */
 import { SC } from "../../../../core/core.js";
 import { Store, Record, ChildArray } from "../../../../datastore/datastore.js";
 

// ..........................................................
// Basic Set up needs to move to the setup and teardown
//
var NestedRecord, store, testParent, testParent2;

var initModels = function() {

  NestedRecord.ChildRecordTest1 = Record.extend({
    name: Record.attr(String),
    value: Record.attr(String)
  });

  NestedRecord.ChildRecordTest2 = Record.extend({
     name: Record.attr(String),
     info: Record.attr(String),
     value: Record.attr(String)
   });

  NestedRecord.ParentRecordTest = Record.extend({
    /** Child Record Namespace */
    nestedRecordNamespace: NestedRecord,

    name: Record.attr(String),
    elements: Record.toMany(Record, { nested: true }),

    defaultElements: Record.toMany(NestedRecord.ChildRecordTest1, {
      isNested: true,
      defaultValue: function(record, key) {
        var array = [];
        array.pushObject({});
        return array;
      }
    }),

    defaultPolymorphicElements: Record.toMany(Record, {
      isNested: true,
      defaultValue: function(record, key) {
        var array = [];
        array.pushObject({
          type: 'ChildRecordTest1',
          name: 'Default Child 1',
          value: 'burninate'
        });
        return array;
      }
    })
  });
};


// ..........................................................
// Basic Record with an Array of Children
//
module("Basic Record w/ a Parent > Array of Children", {

  beforeEach: function() {
    NestedRecord = SC.Object.create({
      store: Store.create()
    });
    store = NestedRecord.store;
    initModels();
    SC.RunLoop.begin();
    testParent = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent Name',
      elements: [
        {
          type: 'ChildRecordTest1',
          name: 'Child 1',
          value: 'eeney'
        },
        {
          type: 'ChildRecordTest2',
          name: 'Child 2',
          info: 'This is the other type',
          value: 'meeney'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Child 3',
          value: 'miney'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Child 4',
          value: 'moe'
        }
      ]
    });

    // FIXME: [EG] this configuration should work
    testParent2 = store.createRecord(NestedRecord.ParentRecordTest, {
      name: 'Parent 2',
      elements: []
    });
    SC.RunLoop.end();
  },

  afterEach: function() {
    SC.run(function () {
      delete NestedRecord.ParentRecordTest;
      delete NestedRecord.ChildRecordTest1;
      delete NestedRecord.ChildRecordTest2;
      testParent.destroy();
      testParent2.destroy();
      store.destroy();
    });

    testParent = testParent2 = store = NestedRecord = null;
  }
});

test("Function: readAttribute()", function (assert) {
  var elemsAry = testParent.readAttribute('elements');
  assert.ok(elemsAry, "check to see that the child records array exists");
  assert.equal(elemsAry.get('length'), 4, "checking to see that the length of the elements array is 4");
  assert.deepEqual(elemsAry[0],
    {
      type: 'ChildRecordTest1',
      name: 'Child 1',
      value: 'eeney'
    },
    "check to see if the first child is as expected");
  assert.deepEqual(elemsAry[3],
    {
      type: 'ChildRecordTest1',
      name: 'Child 4',
      value: 'moe'
    },
    "check to see if the last child is as expected");
});

test("Function: writeAttribute()", function (assert) {

  SC.run(function () {
    testParent.writeAttribute('elements',
      [
        {
          type: 'ChildRecordTest1',
          name: 'Tom',
          value: 'Jones'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Dick',
          value: 'Smothers'
        },
        {
          type: 'ChildRecordTest1',
          name: 'Harry',
          value: 'Balls'
        }
      ]
    );
  });

  var elemsAry = testParent.readAttribute('elements');
  assert.ok(elemsAry, "after writeAttribute(), check to see that the child records array exists");
  assert.equal(elemsAry.length, 3, "after writeAttribute(), checking to see that the length of the elements array is 3");
  assert.deepEqual(elemsAry[0],
    {
      type: 'ChildRecordTest1',
      name: 'Tom',
      value: 'Jones'
    },
    "check to see if the first child is as expected");
  assert.deepEqual(elemsAry[2],
    {
      type: 'ChildRecordTest1',
      name: 'Harry',
      value: 'Balls'
    },
    "check to see if the last child is as expected");
});

test("Basic Read", function (assert) {

  // Test general gets
  assert.equal(testParent.get('name'), 'Parent Name', "get should be correct for name attribute");
  assert.equal(testParent.get('nothing'), null, "get should be correct for invalid key");

  // Test Child Record creation
  var arrayOfCRs = testParent.get('elements');
  // Check Model Class information

  var cr, dr, dpr;
  assert.ok(SC.instanceOf(arrayOfCRs, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(arrayOfCRs.get('length'), 4, "check that the length of the array of child records is 4");
  SC.run(function () {
    cr = arrayOfCRs.objectAt(0);
  });

  assert.ok(SC.kindOf(cr, Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that first ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // Test Default Child Record creation
  var arrayOfDRs = testParent.get('defaultElements');
  assert.ok(SC.instanceOf(arrayOfDRs, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(arrayOfDRs.get('length'), 1, "check that the length of the array of default records is 1");
  SC.run(function () {
    dr = arrayOfDRs.objectAt(0);
  });
  assert.ok(SC.kindOf(dr, Record), "check that first default ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(dr, NestedRecord.ChildRecordTest1), "check that first default ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // Test Default Polymorphic Child Record creation
  var arrayOfDPRs = testParent.get('defaultPolymorphicElements');
  assert.ok(SC.instanceOf(arrayOfDPRs, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(arrayOfDPRs.get('length'), 1, "check that the length of the array of default records is 1");
  SC.run(function () {
    dpr = arrayOfDPRs.objectAt(0);
  });
  assert.ok(SC.kindOf(dpr, Record), "check that first default polymorphic ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(dpr, NestedRecord.ChildRecordTest1), "check that first default polymorphic ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");

  // // Duplication check
  var sameArray = testParent.get('elements');
  assert.ok(sameArray, 'check to see that we get an array on the second call to the parent for the child records');
  assert.equal(sameArray.get('length'), 4, "check that the length of the array of child records is still 4");
  var sameCR = sameArray.objectAt(0);
  assert.ok(sameCR, "check to see if we have an instance of a child record again");
  var oldKey = cr.get('id'), newKey = sameCR.get('id');
  assert.equal(oldKey, newKey, "check to see if the primary key are the same");
  assert.equal(SC.guidFor(cr), SC.guidFor(sameCR), "check to see if the guid are the same");
  assert.deepEqual(sameCR, cr, "check to see that it is the same child record as before");
});

test("Basic Write", function (assert) {

  // Test general gets
  SC.run(function () {
    testParent.set('name', 'New Parent Name');
  });
  assert.equal(testParent.get('name'), 'New Parent Name', "set() should change name attribute");

  SC.run(function () {
    testParent.set('nothing', 'nothing');
  });
  assert.equal(testParent.get('nothing'), 'nothing', "set should change non-existent property to a new property");

  // Test Child Record creation
  var oldCR = testParent.get('elements');
  var newChildren = [
   { type: 'ChildRecordTest1', name: 'Tom', value: 'Jones'},
   { type: 'ChildRecordTest1', name: 'Dick', value: 'Smothers'},
   { type: 'ChildRecordTest1', name: 'Harry', value: 'Balls'}
  ];

  SC.run(function () {
    testParent.set('elements', newChildren);
  });
  var newArray = testParent.get('elements');
  assert.ok(SC.instanceOf(newArray, ChildArray), "check that get() creates an actual instance of a ChildArray");
  assert.equal(newArray.get('length'), 3, "after set() on parent, check that the length of the array of child records is 3");

  var cr;
  SC.run(function () {
    cr = newArray.objectAt(0);
  });

  assert.ok(SC.kindOf(cr, Record), "check that first ChildRecord from the get() creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that first ChildRecord from the get() creates an actual instance of a ChildRecordTest1 Object");
});

test("Basic Write: reference tests", function (assert) {
   var elems, cr, key, storeRef, newElems;

   elems = testParent.get('elements');
   SC.run(function () {
     cr = elems.objectAt(0);
   });

   // Check for changes on the child bubble to the parent.
   SC.run(function () {
     cr.set('name', 'Child Name Change');
   });
   assert.equal(cr.get('name'), 'Child Name Change', "after a set('name', <new>) on child, checking that the value is updated");
   assert.ok(cr.get('status') & Record.DIRTY, 'check that the child record is dirty');
   assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
   newElems = testParent.get('elements');
   var newCR;

   SC.run(function () {
     newCR = newElems.objectAt(0);
   });
   assert.deepEqual(newCR, cr, "after a set('name', <new>) on child, checking to see that the parent has received the changes from the child record");
   var readAttrsArray = testParent.readAttribute('elements');
   assert.ok(readAttrsArray, "checks to make sure the readAttibute works with a change to the name in the first child.");
   assert.equal(readAttrsArray.length, 4, "after set() on parent, check that the length of the attribute array of child records is 4");
   assert.deepEqual(readAttrsArray[0], newCR.get('attributes'), "after a set('name', <new>) on child, readAttribute on the parent should be correct for info child attributes");
});

test("Basic Array Functionality: pushObject w/ HASH", function (assert) {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  elements.pushObject({ type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'});
  elements = testParent.get('elements');
  assert.equal(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");
  SC.run(function () {
    cr = elements.objectAt(4);
  });
  assert.ok(SC.kindOf(cr, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  assert.equal(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(cr.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  assert.equal(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");

  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  assert.deepEqual(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

test("Basic Array Functionality: pushObject w/ ChildRecord", function (assert) {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    cr = store.createRecord(NestedRecord.ChildRecordTest1, { type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'});
  });
  elements.pushObject(cr);
  elements = testParent.get('elements');
  assert.equal(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");

  SC.run(function () {
    cr = elements.objectAt(4);
  });
  assert.ok(SC.kindOf(cr, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  assert.equal(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(cr.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  assert.equal(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");
  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  assert.deepEqual(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});


test("Basic Array Functionality: popObject", function (assert) {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    elements.popObject();
  });
  elements = testParent.get('elements');
  assert.equal(elements.get('length'), 3, "after popObject() on parent, check that the length of the array of child records is 3");
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  assert.equal(elementsAttrs.length, 3, "after pushObject() on parent, check that the length of the attribute array of child records is 3");

  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(2).get('attributes');
  });
  assert.deepEqual(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(elementsAttrs[2], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

test("Basic Array Functionality: shiftObject", function (assert) {
  var elements, cr, cr2;

  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  SC.run(function () {
    cr = elements.shiftObject();
    cr2 = elements.objectAt(0);
  });

  assert.equal(cr.name, 'Child 1', "The shifted record should have the name");
  assert.equal(cr2.get('name'), 'Child 2', "The first record should have the name");
  elements = testParent.get('elements');
  assert.equal(elements.get('length'), 3, "after shiftObject() on parent, check that the length of the array of child records is 3");
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
});

test("Basic Array Functionality: replace", function (assert) {
  var elements, cr1, cr2;
  // Add something to the array
  elements = testParent.get('elements');
  SC.run(function () {
    cr1 = elements.objectAt(1);
    cr2 = elements.objectAt(2);
  });
  assert.equal(cr1.get('name'), 'Child 2', "The first record should have the name");
  assert.equal(cr2.get('name'), 'Child 3', "The second record should have the name");

  SC.run(function () {
    elements.replace(1, 2, [cr2, cr1]);
    assert.equal(elements.objectAt(2).get('name'), 'Child 2', "The new second record should have the name");
    assert.equal(elements.objectAt(1).get('name'), 'Child 3', "The new first record should still have the name");
    assert.equal(cr1.get('name'), 'Child 2', "The first record should still have the name");
    assert.equal(cr2.get('name'), 'Child 3', "The second record should still have the name");
  });

  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');
});

test("Basic Array Functionality: unshiftObject", function (assert) {
  var elements, elementsAttrs, cr, crFirst, crLast;
  // Add something to the array
  elements = testParent.get('elements');
  // PushObject Tests
  elements.unshiftObject({ type: 'ChildRecordTest1', name: 'Testikles', value: 'God Of Fertility'});
  elements = testParent.get('elements');
  assert.equal(elements.get('length'), 5, "after pushObject() on parent, check that the length of the array of child records is 5");
  SC.run(function () {
    cr = elements.objectAt(0);
  });
  assert.ok(SC.kindOf(cr, Record), "check that newly added ChildRecord creates an actual instance that is a kind of a Record Object");
  assert.ok(SC.instanceOf(cr, NestedRecord.ChildRecordTest1), "check that newly added ChildRecord creates an actual instance of a ChildRecordTest1 Object");
  assert.equal(cr.get('name'), 'Testikles', "after a pushObject on parent, check to see if it has all the right values for the attributes");
  assert.ok(cr.get('status') & Record.DIRTY, 'check that the child record is dirty');
  assert.ok(testParent.get('status') & Record.DIRTY, 'check that the parent record is dirty');

  // Verify the Attrs
  elementsAttrs = testParent.readAttribute('elements');
  assert.equal(elementsAttrs.length, 5, "after pushObject() on parent, check that the length of the attribute array of child records is 5");
  SC.run(function () {
    crFirst = elements.objectAt(0).get('attributes');
    crLast = elements.objectAt(4).get('attributes');
  });
  assert.deepEqual(elementsAttrs[0], crFirst, "verify that parent attributes are the same as the first individual child attributes");
  assert.deepEqual(elementsAttrs[4], crLast, "verify that parent attributes are the same as the last individual child attributes");
});

test("Create Parent with Broken Child Array", function (assert) {
  var elements = testParent2.get('elements');
  assert.ok(!SC.none(elements), "elements should be something");
  var isChildRecordArrays = elements.instanceOf(ChildArray);
  assert.ok(isChildRecordArrays, 'elements array is of right type');

  var length = elements.get('length');
  assert.equal(length, 0, 'length should be zero');

  elements.pushObject({type: 'ChildRecordTest1',name: 'Child 1',value: 'eeney'});
  length = elements.get('length');
  assert.equal(length, 1, 'length should be one');

});

test("pushObject should trigger an arrayContentDidChange with only 1 added item", function (assert) {
  var didChangeCalls = [], target;

  target = SC.Object.create({
    willChange: function() {},
    didChange: function() {
      didChangeCalls.push(arguments);
    }
  });

  testParent.get('elements').addArrayObservers({
    target: target,
    willChange: 'willChange',
    didChange: 'didChange'
  });

  SC.run(function () {
    testParent.get('elements').pushObject({
      type: 'ChildRecordTest1',
      name: 'Child 5',
      value: 'x'
    });
  });

  assert.equal(didChangeCalls.length, 2, 'didChange should only be called twice');
  assert.equal(didChangeCalls[0][0], 4, 'didChange should be called with a start index of 4');
  assert.equal(didChangeCalls[0][1], 0, 'didChange should be called with a removed count of 0');
  assert.equal(didChangeCalls[0][2], 1, 'didChange should be called with an added count of 1');

  testParent.get('elements').removeArrayObservers({
    target,
    willChange: 'willChange',
    didChange: 'didChange'
  });
});

test("replace should trigger an arrayContentDidChange with only 1 added item", function (assert) {
  var didChangeCalls = [], target;

  target = SC.Object.create({
    willChange: function() {},
    didChange: function() {
      didChangeCalls.push(arguments);
    }
  });

  testParent.get('elements').addArrayObservers({
    target: target,
    willChange: 'willChange',
    didChange: 'didChange'
  });
  SC.run(function () {
    testParent.get('elements').replace(3, 1, [{
      type: 'ChildRecordTest1',
      name: 'Child 5',
      value: 'x'
    }]);
  });

  assert.equal(didChangeCalls.length, 2, 'didChange should only be called twice');
  assert.equal(didChangeCalls[0][0], 3, 'didChange should be called with a start index of 3');
  assert.equal(didChangeCalls[0][1], 1, 'didChange should be called with a removed count of 1');
  assert.equal(didChangeCalls[0][2], 1, 'didChange should be called with an added count of 1');
});
