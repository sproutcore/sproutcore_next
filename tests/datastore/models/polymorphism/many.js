// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*globals module ok equals same test MyApp */

import { SC } from "../../../../core/core.js";
import { Store, Record, Query } from "../../../../datastore/datastore.js";


(function() {

  var store, Employee, Company, Engineer, Executive, Accountant, Other,
      strobe, colin, charles, matt, yehuda, erin, digits;

  module("Polymorphic Record - toMany tests", {
    beforeEach: function() {
      SC.RunLoop.begin();
      store = Store.create();

      Employee = Record.extend({
        name: Record.attr(String)
      });
      Employee.isPolymorphic = true;

      Company = Record.extend({
        name: Record.attr(String),
        employees: Record.toMany(Employee, {inverse: 'company'})
      });

      Engineer = Employee.extend({
        isEngineer: true
      });

      Executive = Employee.extend({
        isExecutive: true
      });

      Accountant = Employee.extend({
        isAccountant: true
      });

      Other = Employee.extend({
        isOther: true
      });

      strobe = store.createRecord(Company, {
        name: "Strobe",
        employees: ['1', '2', '3', '4', '5', '6']
      });

      colin = store.createRecord(Engineer, {guid: '1', name: 'Colin'});
      yehuda = store.createRecord(Engineer, {guid: '2', name: 'Yehuda'});
      charles = store.createRecord(Executive, {guid: '3', name: 'Charles'});
      matt = store.createRecord(Executive, {guid: '4', name: 'Matt'});
      erin = store.createRecord(Other, {guid: '5', name: 'Erin'});
      digits = store.createRecord(Accountant, {guid: '6', name: 'P. Diggy'});

    },
    afterEach: function() {
      store = Employee = Company = Engineer = Executive = Accountant = Other = null;
      strobe = colin = charles = matt = yehuda = erin = digits = null;
      SC.RunLoop.end();
    }
  });

  function testRecord(record, expected) {
    assert.equal(record, expected, "Record should be the same as what's expected");
    assert.ok(record.constructor === expected.constructor, "Record should be the same subtype as expected");
  }

  test("toOne relationship returns record of correct type", function (assert) {
    var employees = strobe.get('employees');
    testRecord(employees.objectAt(0), colin);
    testRecord(employees.objectAt(1), yehuda);
    testRecord(employees.objectAt(2), charles);
    testRecord(employees.objectAt(3), matt);
    testRecord(employees.objectAt(4), erin);
    testRecord(employees.objectAt(5), digits);
  });

})();
