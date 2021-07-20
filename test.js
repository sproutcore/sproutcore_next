// import SC from "./typings/core";

import SC from  './typings/core';


const MyKlass = SC.Object.extend({
  testOne: "1"
})

const MyKlass2 = MyKlass.extend({
  testTwo: "2",
  anotherTest: function () {
    return this.testTwo;
  }.property('testTwo').cacheable()
})

const myObj = MyKlass.create({
  test2: 'test2',
  test: function () {
    const t = this;
    return this.test2;
  }.property().cacheable(),
});

const myObjTwo = MyKlass2.create({
  test25: '25',
  someMethod: function () {
    const t = this;
  }
});
