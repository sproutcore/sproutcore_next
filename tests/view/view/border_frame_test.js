// ==========================================================================
// Project:   Showcase
// Copyright: ©2012 7x7 Software, Inc.
// License:   Licensed under MIT license
// ==========================================================================

/*global module, test, same*/
import { SC } from '../../../core/core.js';
import { View, Pane } from '../../../view/view.js';


var view;
module("View#borderFrame", {
  beforeEach: function () {
    SC.run(function () {
      view = View.create({
        layout: { width: 100, height: 100 }
      });
    });
  },

  afterEach: function () {
    view.destroy();
    view = null;
  }
});

test("The borderFrame property of the view should include the borders from the layout.", function (assert) {
  var borderFrame,
    frame;

  // No borders.
  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 0, width: 100, height: 100 }, "The frame without borders is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame without borders is");

  // Right 5px border.
  SC.run(function () {
    view.adjust('borderRight', 5);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 0, width: 95, height: 100 }, "The frame with 5px right border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border is");

  // Top 10px border.
  SC.run(function () {
    view.adjust('borderTop', 10);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 10, width: 95, height: 90 }, "The frame with 5px right border & 10px top border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border is");

  // Left 15px border.
  SC.run(function () {
    view.adjust('borderLeft', 15);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 15, y: 10, width: 80, height: 90 }, "The frame with 5px right border & 10px top border & 15px left border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border & 15px left border is");

  // Bottom 20px border.
  SC.run(function () {
    view.adjust('borderBottom', 20);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 15, y: 10, width: 80, height: 70 }, "The frame with 5px right border & 10px top border & 15px left border & 20px bottom border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border & 15px left border & 20px bottom border is");

  // 25px border.
  SC.run(function () {
    view.set('layout', { width: 100, height: 100, border: 25 });
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 25, y: 25, width: 50, height: 50 }, "The frame with 25px border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 25px border is");

});


test("The borderFrame property of the view should be correct for view with useStaticLayout.", function (assert) {
  var borderFrame,
    frame,
    pane;

  view.set('useStaticLayout', true);

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, null, "The frame with useStaticLayout true is");
  assert.deepEqual(borderFrame, null, "The borderFrame with useStaticLayout true is");

  SC.run(function () {
    pane = Pane.create({
      childViews: [view]
    }).append();
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 0, width: 100, height: 100 }, "The frame with useStaticLayout true after rendering is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with useStaticLayout true after rendering is");

  // Right 5px border.
  SC.run(function () {
    view.adjust('borderRight', 5);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 0, width: 95, height: 100 }, "The frame with 5px right border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border is");

  // Top 10px border.
  SC.run(function () {
    view.adjust('borderTop', 10);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 0, y: 10, width: 95, height: 90 }, "The frame with 5px right border & 10px top border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border is");

  // Left 15px border.
  SC.run(function () {
    view.adjust('borderLeft', 15);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 15, y: 10, width: 80, height: 90 }, "The frame with 5px right border & 10px top border & 15px left border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border & 15px left border is");

  // Bottom 20px border.
  SC.run(function () {
    view.adjust('borderBottom', 20);
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 15, y: 10, width: 80, height: 70 }, "The frame with 5px right border & 10px top border & 15px left border & 20px bottom border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 5px right border & 10px top border & 15px left border & 20px bottom border is");

  // 25px border.
  SC.run(function () {
    view.set('layout', { width: 100, height: 100, border: 25 });
  });

  frame = view.get('frame');
  borderFrame = view.get('borderFrame');

  assert.deepEqual(frame, { x: 25, y: 25, width: 50, height: 50 }, "The frame with 25px border is");
  assert.deepEqual(borderFrame, { x: 0, y: 0, width: 100, height: 100 }, "The borderFrame with 25px border is");

  pane.destroy();
});

test("borderFrame on a view with a scale.", function (assert) {
  var borderFrame,
    frame,
    pane;

    SC.run(function() {
      view.adjust({ border: 2 });
    });

    frame = view.get('frame');
    borderFrame = view.get('borderFrame');

    assert.deepEqual(frame, { x: 2, y: 2, height: 96, width: 96 }, "PRELIM: The unscaled frame with border: 2 is correct.");
    assert.deepEqual(borderFrame, { x: 0, y: 0, height: 100, width: 100 }, "PRELIM: The unscaled borderFrame with border: 2 is correct.");

    SC.run(function() {
      view.adjust({ scale: 0.5 });
    });

    frame = view.get('frame');
    borderFrame = view.get('borderFrame');

    assert.deepEqual(frame, { x: 26, y: 26, height: 48, width: 48, scale: 0.5 }, "The scaled frame with border: 2 is correct.");
    assert.deepEqual(borderFrame, { x: 25, y: 25, height: 50, width: 50, scale: 0.5 }, "The scaled borderFrame with border: 2 is correct.");

});
