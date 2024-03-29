// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, equals */
import { SC } from '../../../../core/core.js';


var family, grandma, momma, child1, child2, child3, child4, child5, observerFiredCount, observer2FiredCount;
module("SC.Observable - Observing with @each", {
  beforeEach: function () {
    momma = SC.Object.create({ children: [] });
    grandma = SC.Object.create({ momma: momma });
    family = SC.Object.create({
      grandma: grandma,
      eachCallback: function () {
        observerFiredCount++;
      },
      childrenCallback: function () {
        observer2FiredCount++;
      }
    });

    child1 = SC.Object.create({ name: "Bartholomew" });
    child2 = SC.Object.create({ name: "Agnes" });
    child3 = SC.Object.create({ name: "Dan" });
    child4 = SC.Object.create({ name: "Nancy" });
    child5 = SC.Object.create({ name: "Constance" });

    momma.set('children', [child1, child2, child3]);

    observerFiredCount = 0;
    observer2FiredCount = 0;
  },

  afterEach: function () {
    family.destroy();
    grandma.destroy();
    momma.destroy();
    child1.destroy();
    child2.destroy();
    child3.destroy();
    child4.destroy();
    child5.destroy();

    family = grandma = momma = child1 = child2 = child3 = child4 = child5 = null;
  }
});

test("chained observers on enumerable properties are triggered when the observed property of any item changes", function (assert) {
  family.addObserver('grandma.momma.children.@each.name', family, family.eachCallback);
  family.addObserver('grandma.momma.children', family, family.childrenCallback);

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').setEach('name', 'Juan'); });
  assert.equal(observerFiredCount, 3, "observer fired after changing child names");

  observerFiredCount = 0;
  SC.run(function () { momma.children.pushObject(child4); });
  assert.equal(observerFiredCount, 1, "observer fired after adding a new item");

  observerFiredCount = 0;
  SC.run(function () { child4.set('name', "Herbert"); });
  assert.equal(observerFiredCount, 1, "observer fired after changing property on new object");

  var oldChildren = momma.get('children');
  momma.set('children', []);
  observerFiredCount = 0;
  SC.run(function () {
    oldChildren.pushObject(child5);
    oldChildren.objectAt(0).set('name', "Hanna");
  });
  assert.equal(observerFiredCount, 0, "observer did not fire after changing removed array and property on an object in removed array");
  assert.equal(observer2FiredCount, 1, "children observer did fire only once by replacing children with empty array");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { child1.set('name', "Hanna"); });
  assert.equal(observerFiredCount, 0, "observer did not fire after changing property on a removed object");

  observerFiredCount = 0;
  SC.run(function () { momma.set('children', [child1, child2, child3, child4]); });
  assert.equal(observerFiredCount, 0, "@each observer did not fire after replacing children with 4 objects");
  assert.equal(observer2FiredCount, 1, "children observer did fire only once after replacing children with 4 objects");

  observerFiredCount = 0;
  observer2FiredCount = 0;
  SC.run(function () { momma.set('children', []); });
  assert.equal(observerFiredCount, 0, "@each observer did not fire after replacing children with empty array");
  assert.equal(observer2FiredCount, 1, "children observer did fire only once after replacing children with empty array");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').pushObjects([child1, child2, child3, child4]); });
  assert.equal(observerFiredCount, 1, "observer did fire only once after adding 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child1, child2]); });
  assert.equal(observerFiredCount, 1, "observer did fire once after removing 2 of 4 objects");

  observerFiredCount = 0;
  SC.run(function () { momma.get('children').removeObjects([child3, child4]); });
  assert.equal(observerFiredCount, 1, "observer did fire once after removing all objects");

  // New grandma.
  observerFiredCount = 0;
  grandma.destroy();
  grandma = SC.Object.create({ momma: momma });
  family.set('grandma', grandma);
  assert.equal(observerFiredCount, 0, "observer did not fire after replacing dear old grandma");

  oldChildren = momma.get('children');
  momma.destroy();
  momma = SC.Object.create({ children: oldChildren });
  grandma.set('momma', momma);
  assert.equal(observerFiredCount, 0, "observer did not fire after replacing dear old momma");

  // Clean up.
  family.removeObserver('grandma.momma.children.@each.name', family, family.eachCallback);
});


test("observer cleanup", function (assert) {
  family.addObserver('grandma.momma.children.@each.name', family, family.eachCallback);
  family.removeObserver('grandma.momma.children.@each.name', family, family.eachCallback);

  // Clean up.
  assert.equal(family._kvo_observed_keys.length, 0, "family has no observed keys");
  assert.equal(grandma._kvo_observed_keys.length, 0, "grandma has no observed keys");
  assert.equal(momma._kvo_observed_keys.length, 0, "momma has no observed keys: %@".fmt(momma._kvo_observed_keys.toArray()));
  assert.equal(momma.children._kvo_observed_keys.length, 0, "momma.children has no observed keys: %@".fmt(momma.children._kvo_observed_keys.toArray()));
  assert.equal(child1._kvo_observed_keys.length, 0, "child1 has no observed keys");
});

test("content observers are removed correctly", function (assert) {
  var child1 = SC.Object.create({ name: "Bartholomew", age: 15 });
  var child2 = SC.Object.create({ name: "Agnes", age: 12 });
  var children = [child1, child2];

  var observerFiredCount = 0;
  var observerFunc = function () { observerFiredCount++; };

  children.addObserver('@each.name', this, observerFunc);
  children.removeObserver('@each.name', this, observerFunc);
  observerFiredCount = 0;
  SC.run(function () { children.setEach('name', "Hanna"); });
  assert.equal(observerFiredCount, 0, "name observer did not fire after it was removed");

  children.addObserver('@each.age', this, observerFunc);
  children.removeObserver('@each.age', this, observerFunc);
  observerFiredCount = 0;
  SC.run(function () { children.setEach('age', 14); });
  assert.equal(observerFiredCount, 0, "age observer did not fire after it was removed");
});
