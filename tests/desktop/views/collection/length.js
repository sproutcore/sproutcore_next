// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { CollectionView } from "../../../../desktop/desktop.js";
import { CoreTest } from "../../../../testing/core.js";

var view, content1, content2 ;

module("CollectionView.length", {
  beforeEach: function() {

    // stub in collection view to verify that proper method are called
    view = CollectionView.create({

      observer: CoreTest.stub('observer(length)').observes('length'),
      computeLayout: CoreTest.stub('computeLayout', CollectionView.prototype.computeLayout),

      reset: function(){
        this.observer.reset();
        this.computeLayout.reset();
      }
    });

    content1 = "a b c".w();
    content2 = "d e f g h".w();
  }
});

test("no content should have length of 0", function (assert) {
  assert.equal(view.get('content'), null, 'precond - content is null');
  assert.equal(view.get('length'), 0, 'length should be 0');
});

test("length should be set property on newly inited object with content already set", function (assert) {
  view = CollectionView.create({ content: content1 });
  assert.equal(view.get('length'), content1.get('length'), 'view.length should be content.length');
});

test("setting content should update length & notify", function (assert) {
  view.set('content', content1);
  assert.equal(view.get('length'), content1.get('length'), 'view.length should equal new length');
  view.observer.expect(1);
});

test("changing the content should update length & notify", function (assert) {
  view.set('content', content1);
  view.reset(); // don't care.
  assert.ok(content1.get('length') !== content2.get('length'), 'precond - content1.length should not equal content2.length');

  view.set('content', content2);

  assert.equal(view.get('length'), content2.get('length'), 'view.length should equal new length');
  view.observer.expect(1);
});

test("modifying content to make it shorter should update view length and notify", function (assert) {
  view.set('content', content1);
  view.reset(); // don't care.

  var len = content1.get('length');
  content1.removeAt(1);

  assert.equal(view.get('length'), len-1, 'view.length should equal new length');
  view.observer.expect(1);
});

test("modifying content to add length should update view length and notify", function (assert) {
  view.set('content', content1);
  view.reset(); // don't care.

  var len = content1.get('length');
  content1.insertAt(1, 'foo');

  assert.equal(view.get('length'), len+1, 'view.length should equal new length');
  view.observer.expect(1);
});

test("modifying content so that it does not change the length should NOT change view length OR notify", function (assert) {
  view.set('content', content1);
  view.reset(); // don't care.

  var len = content1.get('length');
  content1.replace(1, 1, 'foo');

  assert.equal(view.get('length'), len, 'view.length should equal new length');
  view.observer.expect(0);
});
