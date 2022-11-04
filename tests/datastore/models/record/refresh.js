// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


var MyFoo = null, callInfo, MyApp ;
module("Record#refresh", {
  beforeEach: function() {
    SC.RunLoop.begin();
    MyApp = SC.Object.create({
      store: Store.create()
    })  ;
  
    MyApp.Foo = Record.extend();
    MyApp.json = { 
      foo: "bar", 
      number: 123,
      bool: true,
      array: [1,2,3] 
    };
    
    MyApp.foo = MyApp.store.createRecord(MyApp.Foo, MyApp.json);
    
    // modify store so that every time refreshRecords() is called it updates 
    // callInfo
    callInfo = null ;
    MyApp.store.refreshRecord = function(records) {
      callInfo = SC.A(arguments) ; // save method call
    };
  },
  
  afterEach: function() {
    SC.RunLoop.end();
  }
  
});

test("calling refresh should call refreshRecord() on store", function (assert) {
  MyApp.foo.refresh();
  assert.deepEqual(callInfo, [null,null,MyApp.foo.storeKey,undefined], 'refreshRecord() should be called on parent');
});

test("should return receiver", function (assert) {
  assert.equal(MyApp.foo.refresh(), MyApp.foo, 'should return receiver');
});

