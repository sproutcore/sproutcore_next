/*globals MyApp module test ok equals same stop start */

import { SC } from "../../../../core/core.js";
import { Store, Record, RelationshipSupport } from "../../../../datastore/datastore.js";

module("Propogating relationships with Store#pushRetrieve and Store#pushDestroy", {
  beforeEach: function () {
    var MyApp = window.MyApp = SC.Object.create({
      store: Store.create(RelationshipSupport)
    });
  }
});

// ..........................................................
// pushRetrieve BEHAVIOR
//

/**
 [master] --> [slave]

  precond - master has a slave
  test - slave has a master
 */
test("Master updates a slave [one(master) to one(slave)].", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have a slave');
  assert.equal(s1.get('master'), m1, 's1 should have a master');
});

/**
 [master]
  v
  |
  +--> [slave1]
  |
 ...
  |
  +--> [slaveN]

  precond - master has slaves
  test - slaves have a master
 */
test("A master updates many slave [one(master) to many(slave)].", function (assert) {
  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slaves',
      isMaster: false
    })
  });

  MyApp.Master = Record.extend({
    slaves: Record.toMany('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1', 's2'] }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2'),
      m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slaves').length(), 2, 'precond - m1 has 2 slaves');
  assert.equal(s1.get('master'), m1, 's1 should have master m1');
  assert.equal(s2.get('master'), m1, 's2 should have master m1');
});

/**
 [slave]
  ^
  |
  +--< [master1]
  |
 ...
  |
  +--< [masterN]

  precond - master has a slave
  test - slave has many masters
 */
test("Many parent master updates a slave [many(master) to one(slave)]", function (assert) {
  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' },
    { guid: 'm2', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have slave s1');
  assert.equal(m2.get('slave'), s1, 'precond - m2 should have slave s1');

  assert.equal(s1.get('masters').length(), 2, 'slave has 2 masters');
  assert.ok(s1.get('masters').indexOf(m1) !== -1, 'slave has master m1');
  assert.ok(s1.get('masters').indexOf(m2) !== -1, 'slave has master m2');
});

/**
 [master1] ... [masterN]
  v             v
  |             |
  >------- ... -> [slave1]
  |             |
 ...           ...
  |             |
  >------- ... -> [slaveN]

  precond - masters have many slaves
  test - slaves have many masters
 */
test("Many masters update many slaves [many(master) to many(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slaves: Record.toMany('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slaves',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1', 's2'] },
    { guid: 'm2', slaves: ['s1', 's2'] }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2');

  assert.equal(m1.get('slaves').length(), 2, 'precond - m1 should have 2 slaves');
  assert.equal(m2.get('slaves').length(), 2, 'precond - m2 should have 2 slaves');

  assert.equal(s1.get('masters').length(), 2, 's1 should have 2 masters');
  assert.ok(s1.get('masters').indexOf(m1) !== -1, 's1 should have m1 as a master');
  assert.ok(s1.get('masters').indexOf(m2) !== -1, 's1 should have m2 as a master');

  assert.equal(s2.get('masters').length(), 2, 's2 should have 2 masters');
  assert.ok(s2.get('masters').indexOf(m1) !== -1, 's2 should have m1 as a master');
  assert.ok(s2.get('masters').indexOf(m2) !== -1, 's2 should have m2 as a master');
});

/**
 [slave] >--- X ---> [*]

  precond - * is related to slave
  test - after update to slave, * is related to slave
 */
test("A slave does NOT update a relationship [one(slave) to *]", function (assert) {
  MyApp.Slave = Record.extend({
    relative: Record.toOne('MyApp.Relative', {
      inverse: 'slave',
      isMaster: false
    })
  });

  MyApp.Relative = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'relative',
      isMaster: true
    })
  });

  // case create slave WITHOUT relationship
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Relative, [
    { guid: 'r1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      r1 = MyApp.store.find(MyApp.Relative, 'r1');

  assert.equal(s1.get('relative'), r1, 'precond1 - s1 has relative r1');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);
  SC.RunLoop.end();

  assert.ok(SC.none(s1.get('relative')), 'precond2 - s1 has no relative');
  assert.equal(r1.get('slave'), s1, 'test1- r1 is related to s1');

  // case - create slave WITH relationship
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Relative, [
    { guid: 'r2'}
  ]);

  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's2', relative: 'r2' }
  ]);
  SC.RunLoop.end();

  var s2 = MyApp.store.find(MyApp.Slave, 's2'),
      r2 = MyApp.store.find(MyApp.Relative, 'r2');

  assert.equal(s2.get('relative'), r2, 'precond3 - s2 is related to r2');
  assert.ok(SC.none(r2.get('slave')), 'test2 - r2 should NOT have a slave');
});

/**
 [master1] <----> [master2]

  precond - master1 has master2
  test - master2 has master1
 */
test("A master will mutually update a master [one(master) to one(master)].", function (assert) {
  MyApp.Master = Record.extend({
    relative: Record.toOne('MyApp.Master', {
      inverse: 'relative',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm2', relative: 'm1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2');

  assert.equal(m1.get('relative'), m2, 'precond - m1 should have a relative "m2"');
  assert.equal(m2.get('relative'), m1, 'm2 should have a relative "m1"');
});

// ..........................................................
// REPLACING RELATIONSHIPS
//

/**
 [master1] <--> [slave]

  precond - master1 has slave
  precond - slave has master1

 ...relate master2 to slave...

 [master1] --> [slave]
                ^
                |
 [master2] <----+

  precond - master2 has slave
  precond - slave has master2
  test - master1 has slave
 */
test("Stealing relationship does NOT propagate to other masters [one(master) to one(slave)]", function (assert) {
  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have s1');
  assert.equal(s1.get('master'), m1, 'precond - s1 should relate to m1');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm2', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m2 = MyApp.store.find(MyApp.Master, 'm2');

  assert.equal(m2.get('slave'), s1, 'precond - m2 should have s1');
  assert.equal(s1.get('master'), m2, 'precond - s1 should relate to m2');

  assert.equal(m1.get('slave'), s1, 'm1 should have child s1');
});


// ..........................................................
// RELINQUISHING RELATIONSHIPS
//

/**
 [master] <----> [slave1]

  precond - master has slave1
  precond - slave1 has master

 [master] <----> [slave2]

            X--- [slave1]

  precond - master has slave2
  precond - slave2 has master

  test - slave1 does NOT have master
 */
test("Relinquishing relationship on master<->* does propagate [one(master) to one(*)]", function (assert) {
  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2'),
      m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have s1');
  assert.equal(s1.get('master'), m1, 'precond - s1 should relate to m1');
  assert.ok(SC.none(s2.get('master')), 'precond - s2 has false master');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's2' }
  ]);
  SC.RunLoop.end();

  assert.equal(m1.get('slave'), s2, 'precond - m1 should have s2');
  assert.equal(s2.get('master'), m1, 'precond - s2 should relate to m1');

  assert.ok(SC.none(s1.get('master')), 'test1 - s1 should have false master');
});

/**
 [master] <----> [slave1, ..., slaveN]

  precond - master has slaves
  precond - slaves have master

 [master] ---X [slave1]

  precond - master does NOT have slave1
  test - slave1 does NOT have master
 */
test("Relinquishing a toMany relationship does propagate from master [one(master) to many(*)]", function (assert) {
  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slaves',
      isMaster: false
    })
  });

  MyApp.Master = Record.extend({
    slaves: Record.toMany('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1', 's2'] }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2'),
      m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slaves').length(), 2, 'precond1 - m1 should have 2 slaves');
  assert.equal(s1.get('master'), m1, 'precond2 - s1 should relate to m1');
  assert.equal(s2.get('master'), m1, 'precond3 - s2 should relate to m1');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1'] }
  ]);
  SC.RunLoop.end();

  assert.equal(m1.get('slaves').length(), 1, 'precond4 - m1 should have 1 slave');
  assert.equal(m1.get('slaves').objectAt(0), s1, 'precond5 - m1 should have slave s1');
  assert.equal(s1.get('master'), m1, 'precond6 - s1 should relate to m1');

  assert.ok(SC.none(s2.get('master')), 's2 should NOT have master');
});

/**
 [slave]
  ^
  |
  +--< [master1]
  |
 ...
  |
  +--< [masterN]

   precond - master1 has relationship to slave
   precond - slave has relationship many masters
   precond - slave has relationship to master1

  ...master1 relinquishes relationship to slave...

 [slave]
  ^
  |
 ...
  |
  +--< [masterN]

   precond - master1 has no slave
   test - slave has many masters, none of which is master1

 */
test("Relinquish propagates from many master to one slave [many(master) to one(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' },
    { guid: 'm2', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1');

  assert.equal(s1.get('masters').length(), 2, 'precond - s1 should have 2 masters');
  assert.equal(m1.get('slave'), s1, 'precond - m1 should have slave s1');
  assert.equal(m2.get('slave'), s1, 'precond - m2 should have slave s1');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1' }
  ]);
  SC.RunLoop.end();

  assert.ok(SC.none(m1.get('slave')), 'precond - m1 should NOT have relationship with s1');
  assert.equal(s1.get('masters').length(), 1, 's1 should have 1 master');
  assert.equal(s1.get('masters').indexOf(m1), -1, 'm1 should NOT be that master');
});

/**
 [master1] ... [masterN]
  v             v
  |             |
  >------- ... -> [slave1]
  |             |
 ...           ...
  |             |
  >------- ... -> [slaveN]

  precond - masters have many slaves
  precond - slaves have many masters

  ... master1 relinquishes relationship to slave1 ...

 [master1] ... [masterN]
  v             v
  |             |
  >-- X         > [slave1]
  |             |
 ...           ...
  |             |
  >------- ... -> [slaveM]

  precond - master1 has M-1 slaves (& not slave 1)

  test - slave1 has N-1 masters
  test - slave does NOT have relationship to master1
 */
test("Removing a relationship propagates from many master to many slave [many(master) to many(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slaves: Record.toMany('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slaves',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1', 's2'] },
    { guid: 'm2', slaves: ['s1', 's2'] }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2');

  assert.equal(m1.get('slaves').length(), 2, 'precond - m1 should have 2 slaves');
  assert.equal(m2.get('slaves').length(), 2, 'precond - m2 should have 2 slaves');
  assert.ok(s1.get('masters').indexOf(m1) !== -1, 'precond - s1 should have m1 as a master');
  assert.ok(s1.get('masters').indexOf(m2) !== -1, 'precond - s1 should have m2 as a master');
  assert.ok(s2.get('masters').indexOf(m1) !== -1, 'precond - s2 should have m1 as a master');
  assert.ok(s2.get('masters').indexOf(m2) !== -1, 'precond - s2 should have m2 as a master');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s2'] }
  ]);
  SC.RunLoop.end();

  assert.equal(m1.get('slaves').length(), 1, 'precond - m1 should have 1 slave');
  assert.equal(m1.get('slaves').objectAt(0), s2, 'precond - m1 should have relationship to s2');

  assert.ok(s1.get('masters').indexOf(m1) === -1, 's1 should NOT have m1 as a master');
  assert.ok(s1.get('masters').indexOf(m2) !== -1, 's1 should have m2 as a master');
});

// ..........................................................
// pushDestroy BEHAVIOR
//

/**
 [master] --> [slave]

  precond - master has slave
  precond - slave has master

 ... pushDestroy master ...

  test - slave has false master
 */
test("pushDestroy record propagates from master to slave [*(master) to one(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      s1 = MyApp.store.find(MyApp.Slave, 's1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have s1 as slave');
  assert.equal(s1.get('master'), m1, 'precond - s1 should have m1 as slave');

  SC.RunLoop.begin();
  MyApp.store.pushDestroy(MyApp.Master, 'm1');
  SC.RunLoop.end();

  assert.equal(m1.get('status'), Record.DESTROYED_CLEAN, 'precond - m1 was destroyed');
  assert.ok(SC.none(s1.get('master')), 's1 should NOT have a master');
});

/**
 [master] --> [slave]

  precond - master has slave
  precond - slave has master

 ... pushDestroy master ...

  test - slave has false master
 */
test("pushDestroy record propagates from master to many slaves [*(master) to many(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slaves: Record.toMany('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slaves',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' },
    { guid: 's2' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slaves: ['s1', 's2'] }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2');

  assert.equal(m1.get('slaves').length(), 2, 'precond - m1 should have 2 slaves');
  assert.ok(s1.get('masters').indexOf(m1) !== -1, 'precond - s1 should have m1 as a master');
  assert.ok(s2.get('masters').indexOf(m1) !== -1, 'precond - s2 should have m1 as a master');

  SC.RunLoop.begin();
  MyApp.store.pushDestroy(MyApp.Master, 'm1');
  SC.RunLoop.end();

  assert.equal(m1.get('status'), Record.DESTROYED_CLEAN, 'precond - m1 was destroyed');
  assert.equal(s1.get('masters').length(), 0, 's1 should NOT have a master');
  assert.equal(s2.get('masters').length(), 0, 's2 should NOT have a master');
});

/**
  [master] --> [slave]

  precond - slave has a master
  precond - master has a slave

  slave.destroy();

  precond - slave is destroyed

  ... pushDestroy master ...

  test - slave does NOT exist
  test - master does NOT exist
 */
test("pushDestroy record doesn't create a slave when it's been destroyed [*(master) to one(slave)]", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      s1 = MyApp.store.find(MyApp.Slave, 's1');

  assert.equal(m1.get('slave'), s1, 'precond - m1 should have 2 slaves');
  assert.equal(s1.get('master'), m1, 'precond - s1 should have m1 as a master');

  SC.RunLoop.begin();
  s1.destroy();
  MyApp.store.commitRecords();
  MyApp.store.dataSourceDidDestroy(s1.storeKey);
  SC.RunLoop.end();

  assert.ok(s1.isDestroyed(), 'precond - s1 should be destroyed');

  SC.RunLoop.begin();
  MyApp.store.pushDestroy(MyApp.Master, 'm1');
  SC.RunLoop.end();

  assert.ok(s1.isDestroyed(), 'test - s1 should be destroyed');
  assert.ok(m1.isDestroyed(), 'test - m1 should be destroyed');
});

/**
  Standard Sproutcore Behaviors

  This is data showing up from the server- after pushing in changes,
  all records should have status READY_CLEAN.
 */
test("Record status for master and slave should be READY_CLEAN", function (assert) {
  MyApp.Master = Record.extend({
    master: Record.toOne('MyApp.Slave', {
      inverse: 'slave',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    slave: Record.toOne('MyApp.Master', {
      inverse: 'master',
      isMaster: false
    })
  });

  // link one -> one
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 'precond - s1 should be ready clean');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.ok(m1.get('status') & Record.READY_CLEAN, 'm1 should be ready clean after linkage');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 's1 should be ready clean after linkage');

  // unlink
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1' }
  ]);
  SC.RunLoop.end();

  assert.ok(m1.get('status') & Record.READY_CLEAN, 'm1 should be ready clean after unlink');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 's1 should be ready clean after unlink');
});

test("Record relationships are NOT propagated if related store item does NOT exist at load time", function (assert) {
  MyApp.Generic = Record.extend({
    relative: Record.toOne('MyApp.Generic', {
      inverse: 'relative',
      isMaster: true
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Generic, [
    { guid: 'g2', relative: 'g1' },
    { guid: 'g1' }
  ]);
  SC.RunLoop.end();

  var g1 = MyApp.store.find(MyApp.Generic, 'g1'),
      g2 = MyApp.store.find(MyApp.Generic, 'g2');

  assert.equal(g2.get('relative'), g1, 'precond - g2 should be relative of g1');
  assert.ok(SC.none(g1.get('relative')), 'g1 should not be related to g2');
});

test("Record Attribute can reference renamed attribute key", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true,
      key: 'alice'
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    })
  });

  // link one -> one
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);
  SC.RunLoop.end();


  var s1 = MyApp.store.find(MyApp.Slave, 's1');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 'precond - s1 should be ready clean');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', alice: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'm1 should be master of s1');
  assert.equal(s1.get('master'), m1, 's1 should have master of m1');
});

test("Record Attribute can reference renamed attribute key (1 to many)", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'masters',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    masters: Record.toMany('MyApp.Master', {
      inverse: 'slave',
      isMaster: false,
      key: 'master_ids'
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);
  SC.RunLoop.end();

  var s1 = MyApp.store.find(MyApp.Slave, 's1');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 'precond - s1 should be ready clean');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'm1 should be master of s1');
  assert.deepEqual(s1.get('masters').toArray(), [m1], 's1 should have m1 in masters');
  assert.deepEqual(s1.get('attributes').master_ids, [m1.get('id')], 's1.attributes should have master_ids key');
});

test("Record Attribute can reference renamed attribute key (on remote side)", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false,
      key: 'bob'
    })
  });

  // link one -> one
  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's1' }
  ]);
  SC.RunLoop.end();


  var s1 = MyApp.store.find(MyApp.Slave, 's1');
  assert.ok(s1.get('status') & Record.READY_CLEAN, 'precond - s1 should be ready clean');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1');

  assert.equal(m1.get('slave'), s1, 'm1 should be master of s1');
  assert.equal(s1.get('master'), m1, 's1 should have master of m1');
});

test("Record property does change on linkage", function (assert) {
  MyApp.Generic = Record.extend({
    relative: Record.toOne('MyApp.Generic', {
      inverse: 'relative',
      isMaster: true
    }),

    callCount: 0,

    _relativeObserver: function () {
      this.incrementProperty('callCount');
    }.observes('relative')
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Generic, [
    { guid: 'g1' },
    { guid: 'g2' }
  ]);
  SC.RunLoop.end();

  var g1 = MyApp.store.find(MyApp.Generic, 'g1'),
      g2 = MyApp.store.find(MyApp.Generic, 'g2');

  assert.equal(g1.get('callCount'), 0, 'precond - g1._relativeObserver should NOT have fired yet');
  assert.equal(g2.get('callCount'), 0, 'precond - g2._relativeObserver should NOT have fired yet');

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Generic, [
    { guid: 'g2', relative: 'g1' }
  ]);
  SC.RunLoop.end();

  assert.equal(g1.get('relative'), g2, 'precond - g1 should be relative of g2');
  assert.equal(g2.get('relative'), g1, 'precond - g2 should be relative of g1');

  assert.equal(g1.get('callCount'), 1, 'g1._relativeObserver should fire once');
  assert.equal(g2.get('callCount'), 1, 'g2._relativeObserver should fire once');
});

// ..........................................................
// RECORD ATTRIBUTE
//

/**
  lazilyInstantiate RecordAttribute flag tests.
 */
test("RecordAttribute flag 'lazilyInstantiate' tests", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true,
      lazilyInstantiate: true
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false,
      lazilyInstantiate: true // should be a noop
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's2', master: 'm2' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2');

  // test lazy creation on isMaster => true
  assert.ok(s1, 's1 should be created lazily');
  assert.equal(m1.get('slave'), s1, 'm1 should be master of s1');

  // test lazy creation fails on isMaster => false
  assert.ok(SC.none(m2), 'm2 should NOT have been created');
  assert.ok(!s2.get('master') ||
      s2.get('master').get('status') & Record.ERROR, 's2 should have no master record');
});

/**
  lazilyInstantiate RecordAttribute flag can be a function.
 */
test("RecordAttribute flag 'lazilyInstantiate' can be a function", function (assert) {
  MyApp.Master = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true,
      lazilyInstantiate: function () {
        return false;
      }
    })
  });

  MyApp.Slave = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false,
      lazilyInstantiate: true // should be a noop
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.Master, [
    { guid: 'm1', slave: 's1' }
  ]);

  MyApp.store.loadRecords(MyApp.Slave, [
    { guid: 's2', master: 'm2' }
  ]);
  SC.RunLoop.end();

  var m1 = MyApp.store.find(MyApp.Master, 'm1'),
      m2 = MyApp.store.find(MyApp.Master, 'm2'),
      s1 = MyApp.store.find(MyApp.Slave, 's1'),
      s2 = MyApp.store.find(MyApp.Slave, 's2');

  // test lazy creation on isMaster => false
  assert.ok(!s1, 's1 should NOT be created lazily');

  // test lazy creation fails on isMaster => false
  assert.ok(SC.none(m2), 'm2 should NOT have been created');
  assert.ok(!s2.get('master') ||
      s2.get('master').get('status') & Record.ERROR, 's2 should have no master record');
});


/**
   lazilyInstantiate should ride the chain all the way to the top.

   That is, if a record's primaryKey is a record that has the
   flag 'lazilyInstantiate' on it, it should lazily create that one,
   and so on.
 */
test("RecordAttribute flag 'lazilyInstantiate' will create chains of records properly", function (assert) {
  MyApp.SuperMaster = Record.extend({
    master: Record.toOne('MyApp.Master', {
      inverse: 'superMaster',
      isMaster: true,
      lazilyInstantiate: true
    })
  });

  MyApp.Master = Record.extend({
    primaryKey: 'slave',

    superMaster: Record.toOne('MyApp.SuperMaster', {
      inverse: 'master',
      isMaster: false
    }),

    slave: Record.toOne('MyApp.Slave', {
      inverse: 'master',
      isMaster: true,
      lazilyInstantiate: true
    })
  });

  MyApp.Slave = Record.extend({
    primaryKey: 'subSlave',

    master: Record.toOne('MyApp.Master', {
      inverse: 'slave',
      isMaster: false
    }),

    subSlave: Record.toOne('MyApp.SubSlave', {
      inverse: 'slave',
      isMaster: true,
      lazilyInstantiate: true
    })
  });

  MyApp.SubSlave = Record.extend({
    slave: Record.toOne('MyApp.Slave', {
      inverse: 'subSlave',
      isMaster: false
    })
  });

  SC.RunLoop.begin();
  MyApp.store.loadRecords(MyApp.SuperMaster, [
    { guid: 'sm', master: 's' }
  ]);
  SC.RunLoop.end();

  var sm = MyApp.store.find(MyApp.SuperMaster, 'sm'),
      m = MyApp.store.find(MyApp.Master, 's'),
      s = MyApp.store.find(MyApp.Slave, 's'),
      ss = MyApp.store.find(MyApp.SubSlave, 's');

  assert.ok(m, 'm should be created lazily');
  assert.equal(m.get('superMaster'), sm, 'sm should be master of m');

  assert.ok(s, 's should be created lazily');
  assert.equal(s.get('master'), m, 'm should be master of s');

  assert.ok(ss, 'ss should be created lazily');
  assert.equal(ss.get('slave'), s, 's should be master of ss');
});

