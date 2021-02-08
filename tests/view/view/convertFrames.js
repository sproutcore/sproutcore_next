// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */
import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';
import { htmlbody, clearHtmlbody } from '../../../testing/testing.js';

// ..........................................................
// COMMON SETUP CODE
//
var pane, a, b, aa, aaa, bb, f ;
var A_LEFT = 10, A_TOP = 10, B_LEFT = 100, B_TOP = 100, A_SCALE = 2;

function setupFrameViews() {
  htmlbody('<style> .sc-view { border: 1px blue solid; position: absolute; }</style>');

  pane = Pane.design()
    .layout({ top: 0, left: 0, width: 400, height: 300 })
    .childView(View.design()
      .layout({ top: A_TOP, left: A_LEFT, width: 150, height: 150 })
      .childView(View.design()
        .layout({ top: A_TOP, left: A_LEFT, width: 50, height: 50, scale: A_SCALE, transformOriginX: 0, transformOriginY: 0 })
        .childView(View.design()
          .layout({ top: A_TOP, left: A_LEFT, width: 10, height: 10 }))))

    .childView(View.design()
      .layout({ top: B_TOP, left: B_LEFT, width: 150, height: 150 })
      .childView(View.design()
        .layout({ top: B_TOP, left: B_LEFT, width: 10, height: 10 })))
    .create();

  a = pane.childViews[0];
  b = pane.childViews[1];
  aa = a.childViews[0];
  aaa = aa.childViews[0];
  bb = b.childViews[0];

  f = { x: 50, y: 50, width: 10, height: 10 };
  pane.append();
}

function teardownFrameViews() {
  pane.remove() ;
  pane.destroy();
  pane = a = aa = aaa = b = bb = null ;
  clearHtmlbody();
}

// ..........................................................
// convertFrameToView()
//
module('View#convertFrameToView', {
  beforeEach: setupFrameViews, afterEach: teardownFrameViews
});

test("convert a -> top level", function (assert) {
  var result = a.convertFrameToView(f, null);
  f.x += A_LEFT; f.y += A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child -> top level", function (assert) {
  var result = aa.convertFrameToView(f, null);
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2; f.y += A_TOP*2 ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child -> top level", function (assert) {
  var result = aaa.convertFrameToView(f, null);
  f.x += A_LEFT; f.y += A_TOP ;
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2; f.y += A_TOP*2 ;
  assert.deepEqual(result, f, 'should convert frame');
});


test("convert a -> sibling", function (assert) {
  var result = a.convertFrameToView(f, b);
  f.x += A_LEFT - B_LEFT; f.y += A_TOP - B_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child -> parent sibling", function (assert) {
  var result = aa.convertFrameToView(f, b);
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2 - B_LEFT; f.y += A_TOP*2 - B_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child -> parent sibling", function (assert) {
  var result = aaa.convertFrameToView(f, b);
  f.x += A_LEFT; f.y += A_TOP ;
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2 - B_LEFT; f.y += A_TOP*2 - B_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a -> child", function (assert) {
  var result = a.convertFrameToView(f, aa);
  f.x -= A_LEFT; f.y -= A_TOP ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child -> parent", function (assert) {
  var result = aa.convertFrameToView(f, a);
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT; f.y += A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child -> parent", function (assert) {
  var result = aaa.convertFrameToView(f, a);
  f.x += A_LEFT; f.y += A_TOP ;
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT; f.y += A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a -> nested child", function (assert) {
  var result = a.convertFrameToView(f, aaa);
  f.x -= A_LEFT; f.y -= A_TOP ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child -> direct parent (child)", function (assert) {
  var result = aaa.convertFrameToView(f, aa);
  f.x += A_LEFT; f.y += (A_TOP) ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a -> child of sibling", function (assert) {
  var result = a.convertFrameToView(f, bb);
  f.x += A_LEFT - (B_LEFT+B_LEFT); f.y += A_TOP - (B_TOP+B_TOP) ;
  assert.deepEqual(result, f, 'should convert frame');
});


test("convert child -> child of sibling", function (assert) {
  var result = aa.convertFrameToView(f, bb);
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2 - (B_LEFT+B_LEFT); f.y += A_TOP*2 - (B_TOP+B_TOP) ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child -> child of sibling", function (assert) {
  var result = aaa.convertFrameToView(f, bb);
  f.x += A_LEFT; f.y += (A_TOP) ;
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT*2 - (B_LEFT+B_LEFT); f.y += A_TOP*2 - (B_TOP+B_TOP) ;
  assert.deepEqual(result, f, 'should convert frame');
});


// ..........................................................
// convertFrameFromView()
//
module('View#convertFrameFromView', {
  beforeEach: setupFrameViews, afterEach: teardownFrameViews
});

test("convert a <- top level", function (assert) {
  var result = a.convertFrameFromView(f, null);
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child <- top level", function (assert) {
  var result = aa.convertFrameFromView(f, null);
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child <- top level", function (assert) {
  var result = aaa.convertFrameFromView(f, null);
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});


test("convert a <- sibling", function (assert) {
  var result = a.convertFrameFromView(f, b);
  f.x += B_LEFT - A_LEFT; f.y += B_TOP - A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child <- parent sibling", function (assert) {
  var result = aa.convertFrameFromView(f, b);
  f.x += B_LEFT; f.y += B_TOP;
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child <- parent sibling", function (assert) {
  var result = aaa.convertFrameFromView(f, b);
  f.x += B_LEFT; f.y += B_TOP;
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a <- child", function (assert) {
  var result = a.convertFrameFromView(f, aa);
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT; f.y += A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert child <- parent", function (assert) {
  var result = aa.convertFrameFromView(f, a);
  f.x -= A_LEFT; f.y -= A_TOP ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child <- parent", function (assert) {
  var result = aaa.convertFrameFromView(f, a);
  f.x -= A_LEFT; f.y -= A_TOP ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a <- nested child", function (assert) {
  var result = a.convertFrameFromView(f, aaa);
  f.x += A_LEFT; f.y += A_TOP ;
  f.x *= A_SCALE; f.y *= A_SCALE;
  f.width *= A_SCALE; f.height *= A_SCALE;
  f.x += A_LEFT; f.y += A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child <- direct parent (child)", function (assert) {
  var result = aaa.convertFrameFromView(f, aa);
  f.x -= A_LEFT; f.y -= (A_TOP) ;
  assert.deepEqual(result, f, 'should convert frame');
});



test("convert a <- child of sibling", function (assert) {
  var result = a.convertFrameFromView(f, bb);
  f.x += (B_LEFT+B_LEFT) - A_LEFT ; f.y += (B_TOP+B_TOP) - A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});


test("convert child <- child of sibling", function (assert) {
  var result = aa.convertFrameFromView(f, bb);
  f.x += (B_LEFT+B_LEFT); f.y += (B_TOP+B_TOP);
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  assert.deepEqual(result, f, 'should convert frame');
});

test("convert nested child <- child of sibling", function (assert) {
  var result = aaa.convertFrameFromView(f, bb);
  f.x += (B_LEFT+B_LEFT); f.y += (B_TOP+B_TOP);
  f.x -= A_LEFT*2; f.y -= A_TOP*2 ;
  f.x /= A_SCALE; f.y /= A_SCALE;
  f.width /= A_SCALE; f.height /= A_SCALE;
  f.x -= A_LEFT; f.y -= A_TOP ;
  assert.deepEqual(result, f, 'should convert frame');
});

