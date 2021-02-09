// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test ok equals same */

import { SC } from '../../../core/core.js';
import { View, MainPane, rectsEqual } from '../../../view/view.js';


var counter, pane, view, additionalView;

module("View#didAppendToDocument", {
  beforeEach: function () {
    counter = 0;

    pane = MainPane.create({
      childViews: [
        View.extend({
          render: function (context, firstTime) {
            context.push('new string');
          },
          didAppendToDocument: function (){
            assert.ok(document.getElementById(this.get('layerId')), "view layer should exist");
            counter++;
          }
        })
      ]
    });
    view = pane.childViews[0];

    additionalView = View.create({
      didAppendToDocument: function (){
        assert.ok(document.getElementById(this.get('layerId')), "additionalView layer should exist");
        counter++;
      }
    });
  },

  afterEach: function () {
    pane.remove().destroy();
    pane = null;
  }
});

test("Check that didAppendToDocument gets called at the right moment", function (assert) {

  assert.equal(counter, 0, "precond - has not been called yet");
  pane.append(); // make sure there is a layer...
  assert.equal(counter, 1, "didAppendToDocument was called once");

  SC.run(function () {
    view.updateLayer();
  });

  // This seems incorrect.  It's not appending the view layer again it's just updating it.
  // assert.equal(counter, 1, "didAppendToDocument is called every time a new DOM element is created");

  pane.appendChild(additionalView);

  SC.RunLoop.begin().end();
  assert.equal(counter, 2, "");
});

// // Test for bug: when a childView has a non-fixed layout and we request its frame before the parentView has
// // a layer and the parentView uses static layout, then the frame returned will be {x: 0, y:0, width: 0, height: 0}
// // and any further requests for the childView's frame will not return a new value unless the parentViewDidChange
// // or parentViewDidResize.  A weird case, but we prevent it from failing anyhow.

test("Check that childView is updated if the pane has a static layout and view doesn't have a fixed layout", function (assert) {
  var childFrame,
      wrongFrame = { x:0, y:0, width: 0, height: 0 },
      correctFrame;

  pane.set('useStaticLayout', true);

  childFrame = view.get('frame');
  assert.ok(rectsEqual(childFrame, wrongFrame), 'getting frame before layer exists on non-fixed layout childView should return an empty frame');

  SC.run(function () {
    pane.append(); // make sure there is a layer...
  });

  childFrame = view.get('frame');
  correctFrame = pane.get('frame');

  console.log("childFrame", childFrame);
  console.log('correctFrame', correctFrame);
  assert.ok(rectsEqual(childFrame, correctFrame), 'getting frame after layer exists on non-fixed layout childView should return actual frame');
});


test("Check that childView is updated if it has a static layout", function (assert) {
  var childFrame,
      wrongFrame = {x:0, y:0, width: 0, height: 0},
      correctFrame;

  view.set('useStaticLayout', true);

  assert.equal(counter, 0, "precond - has not been called yet");
  pane.append(); // make sure there is a layer...
  assert.equal(counter, 1, "didAppendToDocument was called once");
});
