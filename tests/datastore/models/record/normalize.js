// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */
import { SC } from "../../../../core/core.js";
import { Store, Record, ChildAttribute } from "../../../../datastore/datastore.js";

// test normalize method for Record
var storeKeys, rec, rec2, rec3, rec4, MyApp;
module("Record normalize method", {
  beforeEach: function() {

    SC.RunLoop.begin();
 
    MyApp = window.MyApp = SC.Object.create({
      store: Store.create()
    });
    
    MyApp.Foo = Record.extend({
      
      guid: Record.attr(String, { defaultValue: function() {
        var i, rnum, chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",
          strLen = 8, ret = '';
    		for (i=0; i<strLen; i++) {
    			rnum = Math.floor(Math.random() * chars.length);
    			ret += chars.substring(rnum,rnum+1);
    		}
    		return ret;
      } }),
      
      // test simple reading of a pass-through prop
      firstName: Record.attr(String),

      // test Array
      anArray: Record.attr(Array),
      
      // used to test default value
      defaultValue: Record.attr(String, {
        defaultValue: "default"
      }),
      
      // test toOne relationships
      relatedTo: Record.toOne('MyApp.Foo', { defaultValue: '1' }),
      
      // test toOne relationship computed default
      relatedToComputed: Record.toOne('MyApp.Foo', { 
        defaultValue: function() {
          var num = Math.floor(Math.random()*2+1);
          return 'foo' + num;
        }
      }),
      
      // test toMany relationships
      relatedToMany: Record.toMany('MyApp.Foo')
 
    });

    // A parent record
    MyApp.FooParent = Record.extend({
      nestedRecordNamespace: MyApp,
      myChild: ChildAttribute.attr('MyApp.FooChild')
    });

    // A child record
    MyApp.FooChild = Record.extend({
    });
    
    MyApp.Bar = Record.extend({
      // test toOne relationships
      relatedTo: Record.toOne('MyApp.Bar', { defaultValue: '1' })
    });
    
    MyApp.OneBar = Record.extend({
      manyFoos: Record.toMany('MyApp.ManyFoo', {
        key: 'many_foos',
        inverse: 'oneBar'
      })
    });
    
    MyApp.ManyFoo = Record.extend({
      oneBar: Record.toOne('MyApp.OneBar', {
        key: 'bar_id',
        inverse: 'manyFoos'
      })
    });
    
    storeKeys = MyApp.store.loadRecords(MyApp.Foo, [
      { 
        guid: 'foo1', 
        firstName: 123, 
        anArray: ['one', 'two', 'three']
      },
      
      { 
        guid: 'foo2', 
        firstName: "Jane",
        relatedTo: 'foo1'
      },
      
      {
        guid: 'foo3'
      }
      
    ]);
    
    rec = MyApp.store.find(MyApp.Foo, 'foo1');
    rec2 = MyApp.store.find(MyApp.Foo, 'foo2');
    rec3 = MyApp.store.find(MyApp.Foo, 'foo3');
    
    assert.equal(rec.storeKey, storeKeys[0], 'should find record');
    
  },
  
  afterEach: function() {
    SC.RunLoop.end();
  }
  
});

// ..........................................................
// NORMALIZING
// 

test("normalizing a pre-populated record" ,function() {
  
  assert.equal(rec.attributes()['firstName'], 123, 'hash value of firstName is 123');
  assert.equal(rec.get('firstName'), '123', 'get value of firstName is 123 string');
  
  rec.normalize();
  
  var sameValue = rec.attributes()['firstName'] === '123';
  var relatedTo = rec.attributes()['relatedTo'] === '1';
  var relatedToComputed = rec.attributes()['relatedToComputed'];
  
  var computedValues = ['foo1', 'foo2', 'foo3'];
  
  assert.ok(sameValue, 'hash value of firstName after normalizing is 123 string');
  assert.ok(sameValue, 'hash value of relatedTo should be 1');
  assert.ok(computedValues.indexOf(relatedToComputed)!==-1, 'hash value of relatedToComputed should be either foo1, foo2 or foo3');
  
  assert.equal(rec.get('firstName'), '123', 'get value of firstName after normalizing is 123 string');
  
});

test("normalizing an empty record" ,function() {
  
  assert.equal(rec3.attributes()['defaultValue'], undefined, 'hash value of defaultValue is undefined');
  assert.equal(rec3.get('defaultValue'), 'default', 'get value of defaultValue is default');
  
  rec3.normalize();
  
  assert.equal(rec3.attributes()['defaultValue'], 'default', 'hash value of defaultValue after normalizing is default');
  assert.equal(rec3.get('defaultValue'), 'default', 'get value of defaultValue after normalizing is default');
  
});

test("normalizing with includeNull flag" ,function() {
  
  assert.equal(rec3.attributes()['firstName'], undefined, 'hash value of firstName is undefined');
  assert.equal(rec3.get('firstName'), null, 'get value of firstName is null');
  
  rec3.normalize(true);
  
  assert.equal(rec3.attributes()['firstName'], null, 'hash value of firstName after normalizing is null');
  assert.equal(rec3.get('firstName'), null, 'get value of firstName after normalizing is null');
  
});

test("normalizing a new record with toOne should reflect id in data hash" ,function() {

  var recHash = { 
    guid: 'foo4', 
    firstName: "Jack",
    relatedTo: 'foo1'
  };

  var newRecord = MyApp.store.createRecord(MyApp.Foo, recHash);
  MyApp.store.commitRecords();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo1', 'hash value of relatedTo is foo1');
  assert.equal(newRecord.get('relatedTo'), rec, 'get value of relatedTo is foo1');

  newRecord.normalize();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo1', 'hash value of relatedTo after normalizing is still foo1');
  assert.equal(newRecord.get('relatedTo'), rec, 'get value of relatedTo after normalizing remains foo1');
  
});

test("normalizing a new record with toMany should reflect id in data hash" ,function() {

  var recHash = { 
    guid: 'foo5', 
    firstName: "Andrew",
    relatedToMany: ['foo1', 'foo2']
  };

  var newRecord = MyApp.store.createRecord(MyApp.Foo, recHash);
  MyApp.store.commitRecords();
  
  assert.ok(SC.typeOf(newRecord.attributes()['relatedToMany'])===SC.T_ARRAY, 'should be a hash');
  assert.equal(newRecord.get('relatedToMany').get('length'), 2, 'number of relatedToMany is 2');
  
  newRecord.normalize();
  
  assert.ok(SC.typeOf(newRecord.attributes()['relatedToMany'])===SC.T_ARRAY, 'should still be a hash after normalizing');
  assert.equal(newRecord.get('relatedToMany').get('length'), 2, 'number of relatedToMany is still 2');
  
});

test("normalizing a new record with toOne that has broken relationship" ,function() {

  var recHash = { 
    guid: 'foo5', 
    firstName: "Andrew",
    relatedTo: 'foo10' // does not exist
  };

  var newRecord = MyApp.store.createRecord(MyApp.Foo, recHash);
  MyApp.store.commitRecords();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo10', 'should be foo10');
  
  newRecord.normalize();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo10', 'should remain foo10');
  
});

test("normalizing a new record with toOne with relationship to wrong recordType" ,function() {

  var recHash = { 
    guid: 'bar1', 
    firstName: "Andrew",
    relatedTo: 'foo1' // does exist but wrong recordType
  };

  var newRecord = MyApp.store.createRecord(MyApp.Bar, recHash);
  MyApp.store.commitRecords();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo1', 'should be foo1');
  
  newRecord.normalize();
  
  assert.equal(newRecord.attributes()['relatedTo'], 'foo1', 'should remain foo1');
  
});

test("normalizing a new record with no guid should work with defaultValue" ,function() {
  
  var recHash = { 
    firstName: "Andrew",
    relatedTo: 'foo1' // does exist but wrong recordType
  };
  
  var newRecord = MyApp.store.createRecord(MyApp.Foo, recHash);
  MyApp.store.commitRecords();
  
  var firstGuid = newRecord.get('guid');
  
  assert.equal(newRecord.get('firstName'), 'Andrew', 'firstName should be Andrew');
  
  newRecord.normalize();
  
  var findRecord = MyApp.store.find(MyApp.Foo, firstGuid);
  
  assert.equal(findRecord.get('guid'), firstGuid, 'guid should be the same as first');
  
});

test("normalizing a new record with a null child reference", function (assert) {
  var recHash = {
    guid: 'testId1'
  };

  // Create a parent record with an ChildAttribute property referring to no child.
  // Make sure normalize() can handle that.
  var newRecord = MyApp.store.createRecord(MyApp.FooParent, recHash);
  var newRecordId, findRecord;
  
  MyApp.store.commitRecords();
  newRecordId = newRecord.get('id');
  newRecord.normalize();

  findRecord = MyApp.store.find(MyApp.FooParent, newRecordId);
  assert.equal(findRecord.get('id'), newRecordId, 'id should be the same as the first');
});

test("normalizing a new record with toOne without defaultValue" ,function() {
  
  var oneBarHash = {
    guid: 1,
    many_foos: [1]
  }
  
  var oneBarRecord = MyApp.store.createRecord(MyApp.OneBar, oneBarHash);

  var fooHash = {
    guid: 1,
    bar_id: 1
  };

  var fooRecord = MyApp.store.createRecord(MyApp.ManyFoo, fooHash);
  MyApp.store.commitRecords();
    
  assert.equal(fooRecord.attributes()['bar_id'], 1, 'hash value of oneBar is 1');
  assert.equal(fooRecord.get('oneBar'), oneBarRecord, 'get value of oneBar is 1');

  fooRecord.normalize();
  
  assert.equal(fooRecord.attributes()['bar_id'], 1, 'hash value of oneBar after normalizing is still 1');
  assert.equal(fooRecord.get('oneBar'), oneBarRecord, 'get value of oneBar after normalizing remains 1');
  
});


test("normalizing an undefined Date value", function (assert) {
  var Message = Record.extend({
    to: Record.attr(String),
    from: Record.attr(String),
    timestamp: Record.attr(Date),
    text: Record.attr(String)
  });

  var message = MyApp.store.createRecord(Message, {
    guid: 'chocolate-moose',
    to: 'swedish.chef@muppets.com',
    from: 'moose@muppets.com',
    text: 'Bork bork bork!'
  });

  message.normalize();

  assert.equal(message.get('timestamp'), null, "normalizes to null");
});

