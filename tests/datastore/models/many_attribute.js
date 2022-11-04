// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../core/core.js";
import { Store, Record, Query } from "../../../datastore/datastore.js";


// test core array-mapping methods for ManyArray with ManyAttribute
var storeKeys, rec, rec2, rec3, rec4;
var foo1, foo2, foo3, bar1, bar2, bar3, MyApp;

module("ManyAttribute core methods", {
  beforeEach: function() {
    SC.RunLoop.begin();
    MyApp = window.MyApp = SC.Object.create({
      store: Store.create()
    });

    MyApp.Foo = Record.extend({

      // test simple reading of a pass-through prop
      firstName: Record.attr(String),

      // test mapping to another internal key
      otherName: Record.attr(String, { key: "firstName" }),

      // test mapping Date
      date: Record.attr(Date),

      // used to test default value
      defaultValue: Record.attr(String, {
        defaultValue: "default"
      }),

      // test toMany relationships
      fooMany: Record.toMany('MyApp.Foo', {
        supportNewRecords: false
      }),

      // test toMany relationships with different key
      fooManyKeyed: Record.toMany('MyApp.Foo', {
        key: 'fooIds'
      }),

      // test many-to-many relationships with inverse
      barToMany: Record.toMany('MyApp.Bar', {
        inverse: 'fooToMany', isMaster: true, orderBy: 'name'
      }),

      // test many-to-one relationships with inverse
      barToOne: Record.toMany('MyApp.Bar', {
        inverse: 'fooToOne', isMaster: false
      })

    });

    MyApp.Bar = Record.extend({

      // test many-to-many
      fooToMany: Record.toMany('MyApp.Foo', {
        inverse: 'barToMany', isMaster: false,
        supportNewRecords: false
      }),

      // test many-to-one
      fooToOne: Record.toOne('MyApp.Foo', {
        inverse: 'barToOne', isMaster: true
      })
    });

    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { guid: 1,
        firstName: "John",
        lastName: "Doe",
        barToMany: ['bar1'],
        barToOne:  ['bar1', 'bar2']
      },

      { guid: 2,
        firstName: "Jane",
        lastName: "Doe",
        barToMany: ['bar1', 'bar2'],
        barToOne:  []
      },

      { guid: 3,
        firstName: "Emily",
        lastName: "Parker",
        fooMany: [1,2],
        barToMany: ['bar2'],
        barToOne: []
      },

      { guid: 4,
        firstName: "Johnny",
        lastName: "Cash",
        fooIds: [1,2]
      }
    ]);

    MyApp.store.loadRecords(MyApp.Bar, [
      { guid: "bar1", name: "A", fooToMany: [1,2], fooToOne: 1 },
      { guid: "bar2", name: "Z", fooToMany: [2,3], fooToOne: 1 },
      { guid: "bar3", name: "C" }
    ]);

    foo1 = rec = MyApp.store.find(MyApp.Foo, 1);
    foo2 = rec2 = MyApp.store.find(MyApp.Foo, 2);
    foo3 = rec3 = MyApp.store.find(MyApp.Foo, 3);
    rec4 = MyApp.store.find(MyApp.Foo, 4);
    assert.equal(rec.storeKey, storeKeys[0], 'should find record');

    bar1 = MyApp.store.find(MyApp.Bar, "bar1");
    bar2 = MyApp.store.find(MyApp.Bar, 'bar2');
    bar3 = MyApp.store.find(MyApp.Bar, 'bar3');

    SC.RunLoop.end();
  },

  afterEach: function() {
    MyApp = rec = rec2 = rec3 =
    foo1 = foo2 = foo3 = bar1 = bar2 = null;
  }
});

// ..........................................................
// READING
//

test("pass-through should return builtin value" ,function() {
  assert.equal(rec.get('firstName'), 'John', 'reading prop should get attr value');
});

test("getting toMany relationship should map guid to real records", function (assert) {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  assert.equal(rec3.get('id'), 3, 'precond - should find record 3');
  assert.equal(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');
  assert.equal(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
});

test("getting toMany relationship should map guid to real records when using different key", function (assert) {
  var rec4 = MyApp.store.find(MyApp.Foo, 4);
  assert.equal(rec4.get('id'), 4, 'precond - should find record 4');
  assert.equal(rec4.get('fooManyKeyed').objectAt(0), rec, 'should get rec1 instance for rec4.fooManyKeyed');
  assert.equal(rec4.get('fooManyKeyed').objectAt(1), rec2, 'should get rec2 instance for rec4.fooManyKeyed');
});

test("getting toMany relation should not change record state", function (assert) {
  assert.equal(rec3.get('status'), Record.READY_CLEAN, 'precond - status should be READY_CLEAN');

  var recs = rec3.get('fooMany');
  assert.ok(recs, 'rec3.get(fooMany) should return records');
  assert.equal(rec3.get('status'), Record.READY_CLEAN, 'getting toMany should not change state');
});

test("reading toMany in chained store", function (assert) {
  var recs1, recs2, store, rec3a;

  recs1 = rec3.get('fooMany');
  store = MyApp.store.chain();

  rec3a = store.find(rec3);
  recs2 = rec3a.get('fooMany');

  assert.deepEqual(recs2.getEach('storeKey'), recs1.getEach('storeKey'), 'returns arrays from chained and parent should be same');
  assert.ok(recs2 !== recs1, 'returned arrays should not be same instance');

});

test("reading a null relation", function (assert) {

  // note: rec1 hash has false array
  assert.equal(rec.readAttribute('fooMany'), null, 'rec1.fooMany attr should be null');

  var ret = rec.get('fooMany');
  assert.equal(ret.get('length'), 0, 'rec1.get(fooMany).length should be 0');
  assert.deepEqual(ret.getEach('storeKey'), [], 'rec1.get(fooMany) should return empty array');
});

// ..........................................................
// WRITING
//

test("writing to a to-many relationship should update set guids", function (assert) {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  assert.equal(rec3.get('id'), 3, 'precond - should find record 3');
  assert.equal(rec3.get('fooMany').objectAt(0), rec, 'should get rec1 instance for rec3.fooMany');

  SC.RunLoop.begin();
  rec3.set('fooMany', [rec2, rec4]);
  SC.RunLoop.end();

  assert.equal(rec3.get('fooMany').objectAt(0), rec2, 'should get rec2 instance for rec3.fooMany');
  assert.equal(rec3.get('fooMany').objectAt(1), rec4, 'should get rec4 instance for rec3.fooMany');
});

test("writing to a to-many relationship should update set guids when using a different key", function (assert) {
  var rec4 = MyApp.store.find(MyApp.Foo, 4);
  assert.equal(rec4.get('id'), 4, 'precond - should find record 4');
  assert.equal(rec4.get('fooManyKeyed').objectAt(0), rec, 'should get rec1 instance for rec4.fooManyKeyed');

  SC.RunLoop.begin();
  rec4.set('fooManyKeyed', [rec2, rec3]);
  SC.RunLoop.end();

  assert.deepEqual(rec4.get('fooIds'), [2,3], 'should get array of guids (2, 3) for rec4.fooIds');
});

test("pushing an object to a to-many relationship attribute should update set guids", function (assert) {
  var rec3 = MyApp.store.find(MyApp.Foo, 3);
  assert.equal(rec3.get('id'), 3, 'precond - should find record 3');
  assert.equal(rec3.get('fooMany').length(), 2, 'should be 2 foo instances related');

  SC.run(function () {
    rec3.get('fooMany').pushObject(rec4);
  });

  assert.equal(rec3.get('fooMany').length(), 3, 'should be 3 foo instances related');

  assert.equal(rec3.get('fooMany').objectAt(0), rec, 'should get rec instance for rec3.fooMany');
  assert.equal(rec3.get('fooMany').objectAt(1), rec2, 'should get rec2 instance for rec3.fooMany');
  assert.equal(rec3.get('fooMany').objectAt(2), rec4, 'should get rec4 instance for rec3.fooMany');
});

test("modifying a toMany array should mark the record as changed", function (assert) {
  var recs = rec3.get('fooMany');
  assert.equal(rec3.get('status'), Record.READY_CLEAN, 'precond - rec3.status should be READY_CLEAN');
  assert.ok(!!rec4, 'precond - rec4 should be defined');

  SC.RunLoop.begin();
  recs.pushObject(rec4);
  SC.RunLoop.end();

  assert.equal(rec3.get('status'), Record.READY_DIRTY, 'record status should have changed to dirty');

});

test("Modifying a toMany array using replace", function (assert) {
  var recs = rec.get('barToOne'),
      objectForRemoval = recs.objectAt(1);

  SC.run(function () {
    recs.replace(1, 1, null); // the object should be removed
  });

  assert.ok(objectForRemoval !== recs.objectAt(1), "record should not be present after a replace");
  assert.equal(bar2.get('fooToOne'), null, "record should have notified attribute of change");
});


test("modifying a toMany array within a nested store", function (assert) {

  var child = MyApp.store.chain() ; // get a chained store
  var parentFooMany = rec3.get('fooMany'); // base foo many

  var childRec3 = child.find(rec3);
  var childFooMany = childRec3.get('fooMany'); // get the nested fooMany

  // save store keys before modifying for easy testing
  var expected = parentFooMany.getEach('storeKey');

  // now trying modifying...
  var childRec4 = child.find(rec4);
  assert.equal(childFooMany.get('length'), 2, 'precond - childFooMany should be like parent');

  SC.run(function () {
    childFooMany.pushObject(childRec4);
  });
  assert.equal(childFooMany.get('length'), 3, 'childFooMany should have 1 more item');

  SC.RunLoop.end(); // allow notifications to process, if there were any...

  assert.deepEqual(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should not have changed yet');
  assert.equal(rec3.get('status'), Record.READY_CLEAN, 'parent rec3 should still be READY_CLEAN');

  expected = childFooMany.getEach('storeKey'); // update for after commit

  SC.RunLoop.begin();
  child.commitChanges();
  SC.RunLoop.end();

  // NOTE: not getting fooMany from parent again also tests changing an array
  // underneath.  Does it clear caches, etc?
  assert.equal(parentFooMany.get('length'), 3, 'parent.fooMany length should have changed');
  assert.deepEqual(parentFooMany.getEach('storeKey'), expected, 'parent.fooMany should now have changed form child store');
  assert.equal(rec3.get('status'), Record.READY_DIRTY, 'parent rec3 should now be READY_DIRTY');

});

test("should be able to modify an initially empty record", function (assert) {

  assert.deepEqual(rec.get('fooMany').getEach('storeKey'), [], 'precond - fooMany should be empty');
  SC.run(function () {
    rec.get('fooMany').pushObject(rec4);
  });
  assert.deepEqual(rec.get('fooMany').getEach('storeKey'), [rec4.get('storeKey')], 'after edit should have new array');
});


test("Adding an unsaved record should throw an Error is supportNewRecords is false", function (assert) {
  var foo;

  SC.run(function () {
    foo = MyApp.store.createRecord(MyApp.Foo, {
      firstName: "John",
      lastName: "Doe",
      barToMany: ['bar1']
    });
  });

  try {
    SC.run(function () {
      bar1.get('fooToMany').pushObject(foo);
    });
    assert.ok(false, "Attempting to assign an unsaved record resulted in an error.");
  } catch (x) {
    assert.ok(true, "Attempting to assign an unsaved record resulted in an error.");
  }
});

// ..........................................................
// MANY-TO-MANY RELATIONSHIPS
//

function checkAllClean() {
  SC.A(arguments).forEach(function(r) {
    assert.equal(r.get('status'), Record.READY_CLEAN, 'PRECOND - %@.status should be READY_CLEAN'.fmt(r.get('id')));
  }, this);
}

test("removing a record from a many-to-many", function (assert) {
  assert.ok(foo1.get('barToMany').indexOf(bar1) >= 0, 'PRECOND - foo1.barToMany should contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) >= 0, 'PRECOND - bar1.fooToMany should contain foo1');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    foo1.get('barToMany').removeObject(bar1);
  });

  assert.ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.barToMany should NOT contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');

  assert.equal(foo1.get('status'), Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');

});

test("removing a record from a many-to-many; other side", function (assert) {
  assert.ok(foo1.get('barToMany').indexOf(bar1) >= 0, 'PRECOND - foo1.barToMany should contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) >= 0, 'PRECOND - bar1.fooToMany should contain foo1');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    bar1.get('fooToMany').removeObject(foo1);
  });

  assert.ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.barToMany should NOT contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');

  assert.equal(foo1.get('status'), Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');

});

test("adding a record to a many-to-many; bar side", function (assert) {
  assert.ok(foo2.get('barToMany').indexOf(bar3) < 0, 'PRECOND - foo1.barToMany should NOT contain bar1');
  assert.ok(bar3.get('fooToMany').indexOf(foo2) < 0, 'PRECOND - bar3.fooToMany should NOT contain foo1');
  checkAllClean(foo2, bar3);

  SC.run(function () {
    bar3.get('fooToMany').pushObject(foo2);
  });

  // v-- since bar3 is added through inverse, it should follow orderBy
  assert.equal(foo2.get('barToMany').indexOf(bar3), 1, 'foo1.barToMany should contain bar1');
  assert.ok(bar3.get('fooToMany').indexOf(foo2) >= 0, 'bar1.fooToMany should contain foo1');

  assert.equal(foo2.get('status'), Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
});


test("adding a record to a many-to-many; foo side", function (assert) {
  assert.ok(foo2.get('barToMany').indexOf(bar3) < 0, 'PRECOND - foo2.barToMany should NOT contain bar3');
  assert.ok(bar3.get('fooToMany').indexOf(foo2) < 0, 'PRECOND - bar3.fooToMany should NOT contain foo1');
  checkAllClean(foo2, bar3);

  SC.run(function () {
    foo2.get('barToMany').pushObject(bar3);
  });

  assert.ok(foo2.get('barToMany').indexOf(bar3) >= 0, 'foo2.barToMany should contain bar3');
  assert.ok(bar3.get('fooToMany').indexOf(foo2) >= 0, 'bar3.fooToMany should contain foo2');

  assert.equal(foo2.get('status'), Record.READY_DIRTY, 'foo2.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
});

test("reset a many-to-many; bar side", function (assert) {
  assert.equal(foo1.get('barToMany').get('length'), 1, 'PRECOND - foo1.barToMany.length should be 1');
  assert.equal(bar1.get('fooToMany').get('length'), 2, 'PRECOND - bar1.fooToMany.length should be 2');

  bar1.set('fooToMany', []);

  assert.equal(foo1.get('barToMany').get('length'), 0, 'foo1.barToMany.length should be 0');
  assert.equal(bar1.get('fooToMany').get('length'), 0, 'bar1.fooToMany.length should be 1');
});

test("reset a many-to-many; foo side", function (assert) {
  assert.equal(foo1.get('barToMany').get('length'), 1, 'PRECOND - foo1.barToMany.length should be 1');
  assert.equal(bar1.get('fooToMany').get('length'), 2, 'PRECOND - bar1.fooToMany.length should be 2');

  foo1.set('barToMany', []);

  assert.equal(foo1.get('barToMany').get('length'), 0, 'foo1.barToMany.length should be 0');
  assert.equal(bar1.get('fooToMany').get('length'), 1, 'bar1.fooToMany.length should be 1');
});

test("set an array of records to a many-to-many; bar side", function (assert) {
  assert.ok(foo3.get('barToMany').indexOf(bar1) < 0, 'PRECOND - foo3.barToMany should NOT contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo3) < 0, 'PRECOND - bar1.fooToMany should NOT contain foo3');

  bar1.set('fooToMany', [foo2, foo3]);

  assert.ok(foo2.get('barToMany').indexOf(bar1) >= 0, 'foo2.barToMany should contain bar1');
  assert.ok(foo3.get('barToMany').indexOf(bar1) >= 0, 'foo3.barToMany should contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo2) >= 0, 'bar1.fooToMany should contain foo2');
  assert.ok(bar1.get('fooToMany').indexOf(foo3) >= 0, 'bar1.fooToMany should contain foo3');
  assert.ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.barToMany should NOT contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');

  assert.equal(foo2.get('status'), Record.READY_CLEAN, 'foo2.status should be READY_CLEAN');
  assert.equal(foo3.get('status'), Record.READY_DIRTY, 'foo3.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
});

test("set an array of records to a many-to-many; foo side", function (assert) {
  assert.ok(bar3.get('fooToMany').indexOf(foo1) < 0, 'PRECOND - bar3.fooToMany should NOT contain foo1');
  assert.ok(foo1.get('barToMany').indexOf(bar3) < 0, 'PRECOND - foo1.barToMany should NOT contain bar3');

  foo1.set('barToMany', [bar2, bar3]);

  assert.ok(bar2.get('fooToMany').indexOf(foo1) >= 0, 'bar2.fooToMany should contain foo1');
  assert.ok(bar3.get('fooToMany').indexOf(foo1) >= 0, 'foo2.fooToMany should contain foo1');
  assert.ok(foo1.get('barToMany').indexOf(bar2) >= 0, 'foo1.barToMany should contain bar2');
  assert.ok(foo1.get('barToMany').indexOf(bar3) >= 0, 'foo1.barToMany should contain bar3');
  assert.ok(foo1.get('barToMany').indexOf(bar1) < 0, 'foo1.fooToMany should NOT contain bar1');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.barToMany should NOT contain foo1');

  assert.equal(bar2.get('status'), Record.READY_CLEAN, 'bar2.status should be READY_CLEAN');
  assert.equal(foo1.get('status'), Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  assert.equal(bar3.get('status'), Record.READY_CLEAN, 'bar3.status should be READY_CLEAN');
});

test("set an ManyArray to a many-to-many; foo side", function (assert) {
  assert.ok(bar1.get('fooToMany').indexOf(foo1) >= 0, 'PRECOND - bar1.fooToMany should contain foo1');
  assert.ok(bar2.get('fooToMany').indexOf(foo1) < 0, 'PRECOND - bar2.fooToMany should NOT contain foo1');
  assert.ok(foo1.get('barToMany').indexOf(bar2) < 0, 'PRECOND - foo1.barToMany should NOT contain bar2');

  foo1.get('barToMany').pushObject(bar3);

  assert.ok(foo1.get('barToMany').indexOf(bar3) >= 0, 'foo1.barToMany should contain bar3');
  assert.ok(bar3.get('fooToMany').indexOf(foo1) >= 0, 'bar3.fooToMany should contain foo1');

  foo1.set('barToMany', foo2.get('barToMany'));

  assert.ok(bar2.get('fooToMany').indexOf(foo1) >= 0, 'bar2.fooToMany should contain foo1');
  assert.ok(foo1.get('barToMany').indexOf(bar2) >= 0, 'foo1.barToMany should contain bar2');
  assert.ok(foo1.get('barToMany').indexOf(bar3) < 0, 'foo1.barToMany should NOT contain bar3');
  assert.ok(bar3.get('fooToMany').indexOf(foo1) < 0, 'bar3.fooToMany should NOT contain foo1');
});

test("set null to a many-to-many; foo side", function (assert) {
  foo1.set('barToMany', null);

  assert.ok(foo1.getPath('barToMany.length') === 0, 'foo1.barToMany.length should be 0');
  assert.ok(bar1.get('fooToMany').indexOf(foo1) < 0, 'bar1.fooToMany should NOT contain foo1');
  assert.ok(bar2.get('fooToMany').indexOf(foo1) < 0, 'bar2.fooToMany should NOT contain foo1');

  assert.equal(foo1.get('status'), Record.READY_DIRTY, 'foo1.status should be READY_DIRTY');
  assert.equal(bar1.get('status'), Record.READY_CLEAN, 'bar1.status should be READY_CLEAN');
});

// ..........................................................
// ONE-TO-MANY RELATIONSHIPS
//

test("removing a record from a one-to-many", function (assert) {
  assert.ok(foo1.get('barToOne').indexOf(bar1) >= 0, 'PRECOND - foo1.barToOne should contain bar1');
  assert.equal(bar1.get('fooToOne'), foo1, 'PRECOND - bar1.fooToOne should eq foo1');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    foo1.get('barToOne').removeObject(bar1);
  });

  assert.ok(foo1.get('barToOne').indexOf(bar1) < 0, 'foo1.barToOne should NOT contain bar1');
  assert.equal(bar1.get('fooToOne'), null, 'bar1.fooToOne should eq null');

  assert.equal(foo1.get('status'), Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  assert.equal(bar1.get('status'), Record.READY_DIRTY, 'bar1.status should be READY_DIRTY');

});


test("removing a record from a one-to-many; other-side", function (assert) {
  assert.ok(foo1.get('barToOne').indexOf(bar1) >= 0, 'PRECOND - foo1.barToOne should contain bar1');
  assert.equal(bar1.get('fooToOne'), foo1, 'PRECOND - bar1.fooToOne should eq foo1');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    bar1.set('fooToOne', null);
  });

  assert.ok(foo1.get('barToOne').indexOf(bar1) < 0, 'foo1.barToOne should NOT contain bar1');
  assert.equal(bar1.get('fooToOne'), null, 'bar1.fooToOne should eq null');

  assert.equal(foo1.get('status'), Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  assert.equal(bar1.get('status'), Record.READY_DIRTY, 'bar1.status should be READY_DIRTY');

});


test("add a record to a one-to-many; many-side", function (assert) {
  assert.ok(foo1.get('barToOne').indexOf(bar3) < 0, 'PRECOND - foo1.barToOne should NOT contain bar3');
  assert.equal(bar3.get('fooToOne'), null, 'PRECOND - bar3.fooToOne should eq null');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    foo1.get('barToOne').pushObject(bar3);
  });

  assert.ok(foo1.get('barToOne').indexOf(bar3) >= 0, 'foo1.barToOne should contain bar3');
  assert.equal(bar3.get('fooToOne'), foo1, 'bar3.fooToOne should eq foo1');

  assert.equal(foo1.get('status'), Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  assert.equal(bar3.get('status'), Record.READY_DIRTY, 'bar3.status should be READY_DIRTY');

});


test("add a record to a one-to-many; one-side", function (assert) {
  assert.ok(foo1.get('barToOne').indexOf(bar3) < 0, 'PRECOND - foo1.barToOne should NOT contain bar3');
  assert.equal(bar3.get('fooToOne'), null, 'PRECOND - bar3.fooToOne should eq null');
  checkAllClean(foo1, bar1);

  SC.run(function () {
    bar3.set('fooToOne', foo1);
  });

  assert.ok(foo1.get('barToOne').indexOf(bar3) >= 0, 'foo1.barToOne should contain bar3');
  assert.equal(bar3.get('fooToOne'), foo1, 'bar3.fooToOne should eq foo1');

  assert.equal(foo1.get('status'), Record.READY_CLEAN, 'foo1.status should be READY_CLEAN');
  assert.equal(bar3.get('status'), Record.READY_DIRTY, 'bar3.status should be READY_DIRTY');

});
