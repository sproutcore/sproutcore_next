// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../../../core/core.js'; 

(function() {
  var observerObject, array;

  var willChangeStart, willChangeAdded, willChangeRemoved, willChangeSource, willChangeCallCount;
  var didChangeStart, didChangeAdded, didChangeRemoved, didChangeSource, didChangeCallCount;

  module("Enumerable Observers", {
    beforeEach: function() {
      array = [1, 2, 3];

      observerObject = SC.Object.create({
        arrayContentWillChange: function(start, removedCount, addedCount, source) {
          willChangeStart = start;
          willChangeAdded = addedCount;
          willChangeRemoved = removedCount;
          willChangeSource = source;
          willChangeCallCount = willChangeCallCount ? willChangeCallCount++ : 1;
        },

        arrayContentDidChange: function(start, removedCount, addedCount, source) {
          didChangeStart = start;
          didChangeAdded = addedCount;
          didChangeRemoved = removedCount;
          didChangeSource = source;
          didChangeCallCount = didChangeCallCount ? didChangeCallCount++ : 1;
        }
      });

      array.addArrayObservers({
        target: observerObject,
        willChange: 'arrayContentWillChange',
        didChange: 'arrayContentDidChange'
      });
    }
  });

  test("should be called when an object is added to an enumerable", function() {
    array.pushObject(4);

    assert.equal(willChangeCallCount, 1, "calls arrayContentWillChange once");
    assert.equal(didChangeCallCount, 1, "calls arrayContentDidChange once");

    assert.equal(didChangeSource.objectAt(willChangeStart), 4);
    assert.equal(didChangeAdded, 1, "specifies one object added");
    assert.equal(didChangeRemoved, 0, "specifies no objects removed");
  });

  test("should not be called when the observer is removed", function() {
    array.pushObject(4);
    assert.equal(didChangeCallCount, 1, "precond - observer fires when added");
    didChangeCallCount = 0;

    array.removeArrayObservers({
      target: observerObject,
      willChange: 'arrayContentWillChange',
      didChange: 'arrayContentDidChange'
    });
    array.pushObject(5);
    assert.equal(didChangeCallCount, 0, "observer does not fire after being removed");
  });

  test("should include both added and removed objects", function() {
    array.replace(1, 1, [6, 7, 8]);

    assert.equal(willChangeStart, 1);
    assert.equal(willChangeRemoved, 1);
    assert.equal(willChangeAdded, 3);
    assert.equal(willChangeSource, array);

    assert.equal(didChangeStart, 1);
    assert.equal(didChangeRemoved, 1);
    assert.equal(didChangeAdded, 3);
    assert.equal(didChangeSource, array);
  });
})();
