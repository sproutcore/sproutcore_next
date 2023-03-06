// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { CollectionView } from "../../../../desktop/desktop.js";

var view ;

module("CollectionView.layerIdFor, contentIndexForLayerId", {
  beforeEach: function() {
    view = CollectionView.create();
  }
});

// ..........................................................
// TEST ROUND TRIP
//

test("0 index", function (assert) {
  var layerId = view.layerIdFor(0) ;
  assert.ok(layerId, 'should return string');
  assert.equal(view.contentIndexForLayerId(layerId), 0, 'should parse out idx');
});

test("10 index", function (assert) {
  var layerId = view.layerIdFor(10) ;
  assert.ok(layerId, 'should return string');
  assert.equal(view.contentIndexForLayerId(layerId), 10, 'should parse out idx');
});

test("with custom layerId", function (assert) {
  var layerId,
      contentIndex;
  view.set('layerId', 'my-custom-layer-id');
  layerId = view.layerIdFor(10);
  assert.ok(layerId.indexOf('my-custom-layer-id') === 0, 'index layerId uses custom layerId prefix');
  contentIndex = view.contentIndexForLayerId(layerId);
  assert.equal(contentIndex, 10, 'should parse out index from content index layerId');

  contentIndex = view.contentIndexForLayerId('my-custom-layer-id-100');
  assert.equal(contentIndex, 100, 'should parse out index with custom layerId');
});

// ..........................................................
// TEST SPECIAL PARSING CASES
//

test("parse null id", function (assert) {
  assert.equal(view.contentIndexForLayerId(null), null, 'should return null');
});

test("parse collection view's layerId", function (assert) {
  assert.equal(view.contentIndexForLayerId(view.get('layerId')), null, 'should return null');
});

test("parse layerId from other object", function (assert) {
  var otherView = CollectionView.create();
  var id = otherView.layerIdFor(20);
  assert.equal(view.contentIndexForLayerId(id), null, 'should return null');
});

test("parse short arbitrary id", function (assert) {
  assert.equal(view.contentIndexForLayerId("sc242"), null, 'should return null');
});

test("parse long arbitrary id", function (assert) {
  assert.equal(view.contentIndexForLayerId("sc242-234-2453-sdf3"), null, 'should return null');
});

test("parse empty string", function (assert) {
  assert.equal(view.contentIndexForLayerId(""), null, 'should return null');
});

test("parse garbage", function (assert) {
  assert.equal(view.contentIndexForLayerId(234), null, 'should return null');
});
