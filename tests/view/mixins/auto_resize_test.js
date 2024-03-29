// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { TextFieldView, View, LabelView, AutoResize, Pane } from '../../../view/view.js';

/*global module, test, equals, ok, start, stop */

var view;

/** Test the View states. */
module("AutoResize", {

  beforeEach: function () {
    SC.run(function () {
      view = LabelView.create(AutoResize, {
        layout: { left: 0, height: 40 },
        value: "The bottom line, Williams said, is that the internet is “a giant machine designed to give people what they want.” It’s not a utopia. It’s not magical. It’s simply an engine of convenience. Those who can tune that engine well — who solve basic human problems with greater speed and simplicity than those who came before — will profit immensely. Those who lose sight of basic human needs — who want to give people the next great idea — will have problems. “We often think of the internet enables you to do new things,” Williams said. “But people just want to do the same things they’ve always done.”"
      });
    });
  },

  afterEach: function () {
    view.destroy();
    view = null;
  }

});

/**
  When resizing only the height, we should restrict the width to that of the given
  element. This way, the height will grow appropriately to fit the target as
  text wraps within the maximum width.
  */
test("Resize height only.", function (assert) {
  // stop(700);
  const cb = assert.async();

  var pane = Pane.create({
    layout: { top: 200, left: 0, width: 200, height: 200 }
  });

  // Set the view up for height only resizing.
  // i.e. It should grow to fit the text wrapped within the width of the view.
  SC.run(function () {
    view.set('shouldResizeWidth', false);
    view.set('shouldResizeHeight', true);

    pane.appendChild(view);
    pane.append();
  });

  setTimeout(function () {
    assert.ok(view.get('frame').width == 200, 'frame width is 200');
    assert.ok(view.get('layout').height > 200, 'height > 200');

    pane.destroy();
    pane.remove();

    // start();
    cb();
  }, 500);
});


test("Resize with transition plugin - no conflict", function (assert) {
  // stop(700);
  const cb = assert.async();

  var pane = Pane.create({
    layout: { top: 200, left: 0, width: 200, height: 200 }
  });

  view.set('transitionIn', View.SLIDE_IN);

  SC.run(function () {
    pane.appendChild(view);
    assert.equal(view.get('layout').width, 10, 'width is');
    assert.equal(view.get('layout').left, 0, 'left is');
    pane.append();
  });

  setTimeout(function () {
    assert.ok(view.get('layout').width > 2000, 'width is > 2000');
    assert.equal(view.get('layout').left, 0, 'left is');

    pane.destroy();
    pane.remove();

    // start();
    cb();
  }, 500);
});

test("Resize with transition plugin - conflict", function (assert) {
  // stop(2000);
  const cb = assert.async();

  var pane = Pane.create({
    layout: { top: 200, left: 0, width: 200, height: 200 }
  });

  view.set('transitionIn', {
    setup: function (view, options, finalLayout, finalFrame) {
      view.adjust({ width: 100 });
    },

    // Width transition plugin.
    run: function (view, options, finalLayout, finalFrame) {
      view.animate('width', finalFrame.width, { duration: 1 }, function (data) {
        this.didTransitionIn();
      });
    }
  });

  SC.run(function () {
    pane.appendChild(view);
    assert.equal(view.get('layout').width, 10, 'width is');
    pane.append();
  });

  setTimeout(function () {
    var jqEl = view.$();

    assert.ok(jqEl.width() > 10, 'width is > 10: %@'.fmt(jqEl.width()));
    assert.ok(jqEl.width() < 3000, 'width is < 3000: %@ (sometimes this fails, but will pass after reload or when run separately)'.fmt(jqEl.width()));
    assert.ok(view.get('layout').width > 3000, 'layout.width is > 3000: %@'.fmt(view.get('layout').width));
  }, 250);

  setTimeout(function () {
    var jqEl = view.$();
    assert.ok(jqEl.width() > 3000, 'width is > 3000: %@'.fmt(jqEl.width()));
    assert.ok(view.get('layout').width > 3000, 'width is > 3000: %@'.fmt(view.get('layout').width));

    SC.run(function () {
      pane.destroy();
      pane.remove();
    });

    // start();
    cb();
  }, 1250);
});

test("Resize with child view layout", function (assert) {
  var pane, view2;

  SC.run(function () {
    pane = Pane.create({
      childViews: ['a', 'b'],
      layout: { top: 200, left: 0, width: 200, height: 200 },
      childViewLayout: View.HORIZONTAL_STACK,

      a: LabelView.extend(AutoResize, {
        value: "XYZ"
      }),

      b: View.extend({
        layout: { width: 50 }
      })
    });

    pane.appendChild(view);
    assert.equal(view.get('layout').width, 10, 'width is');
    assert.equal(view.get('layout').left, 0, 'left is');
    pane.append();

    view2 = View.create({
      layout: { width: 100 }
    });
    pane.appendChild(view2);
  });

  var childViews = pane.get('childViews'),
      viewA = childViews.objectAt(0),
      viewB = childViews.objectAt(1);

  assert.ok(view.get('layout').width > 2000, 'width is > 2000');
  assert.equal(viewB.get('layout').left, viewA.get('frame').width, 'second view left is');
  assert.equal(view.get('layout').left, viewA.get('frame').width + 50, 'third view left is');
  assert.ok(view2.get('layout').left > 2000, 'left: %@ is > 2000'.fmt(view2.get('layout').left));

  pane.destroy();
  pane.remove();
});

/**
  For a TextFieldView where we set it to only resize its height every time its value changes
  we get the textareas width and set its max-width to this if no autoResizeLayer has been set.

  This test checks that every-time the value changes the max-width we set doesn't change the
  textarea width (i.e. takes padding into account when measuring).
 */
test("Resize height only for textarea where textarea has padding.", function (assert) {
  // stop(700);
  const cb = assert.async();

  var pane = Pane.create({
    layout: { top: 200, left: 0, width: 200, height: 200 }
  });

  // use a textarea for this test rather than label view
  var view = TextFieldView.create(AutoResize, {
    supportsAutoResize: true,
    shouldAutoResize: true,
    shouldResizeHeight: true,
    shouldResizeWidth: false,
    isTextArea: true,
    autoResizePadding: 10,

    layout: {minHeight: 60, height: 60},

    value: "Some text"
  });

  SC.run(function () {
    pane.appendChild(view);
    pane.append();
  });

  // add some padding to the element (generally done via css stylesheet)
  // and also set the box-sizing to border-box so the textarea has 100%
  // width including the padding.
  SC.run(function () {
    view.$('textarea').css({
      'padding': '10px',
      '-webkit-box-sizing': 'border-box',
      '-moz-box-sizing': 'border-box',
      'box-sizing': 'border-box'
    });
  });

  // now the css is applied measure the textareas width
  var origWidth = view.$('textarea').outerWidth();

  // now we update the value and check the width of the textarea
  // remains correct
  SC.run(function () {
    view.set('value', view.get('value') + "!");
  });

  setTimeout(function () {
    // check the frame and textarea have the expected dimensions
    assert.ok(view.get('frame').width == 200, 'frame width is 200');
    assert.equal(origWidth, view.$('textarea').outerWidth(), 'textarea width has not changed since update of value');

    pane.destroy();
    pane.remove();

    // start();
    cb();
  }, 500);
});

/*
  Test a TextFiledView with padding auto resizes text
 */
test("Resize text only for input where input has padding.", function (assert) {
  // stop(700);
  const cb = assert.async();

  var pane = Pane.create({
    layout: {top: 200, left: 0, width: 200, height: 200 }
  });

  // use a text input for this test rather than a label view
  var view = TextFieldView.create(AutoResize, {
    supportsAutoResize: true,
    shouldAutoResize: true,
    shouldResizeHeight: false,
    shouldResizeWidth: false,
    isTextArea: false,
    autoResizePadding: 10,

    layout: {minHeight: 60, height: 60},

    value: "Some text"
  });

  SC.run(function () {
    pane.appendChild(view);
    pane.append();
  });

  // add some padding to the element (generally done via css stylesheet)
  // and also set the box-sizing to border-box so the input element has 100%
  // width including the padding.
  SC.run(function () {
    view.$('input').css({
      'padding': '10px',
      '-webkit-box-sizing': 'border-box',
      '-moz-box-sizing': 'border-box',
      'box-sizing': 'border-box'
    });
  });

  // now the css is applied measure the input fields width
  var origWidth = view.$('input').outerWidth();

  // now we update the value and check the width of the input field
  // remains correct
  SC.run(function () {
    view.set('value', view.get('value') + "!");
  });

  setTimeout(function () {
    // check the frame and input field have the expected dimensions
    assert.ok(view.get('frame').width == 200, 'frame width is 200');
    assert.equal(origWidth, view.$('input').outerWidth(), 'input field width has not changed since update of value');

    pane.destroy();
    pane.remove();

    // start();
    cb();
  }, 500);
});

/**
  When resizing the height and/or width, we should restrict the max width given.
  This way, the height and width will grow appropriately to fit the target as
  text wraps within the maximum values.
  */
test("Resizing height and width will also respect max width.", function (assert) {
  // stop(700);
  const cb = assert.async();

  var pane = Pane.create({
    layout: { top: 200, left: 0, width: 50, height: 50 }
  });

  SC.run(function () {
    view.set('shouldResizeWidth', true);
    view.set('shouldResizeHeight', true);
    view.set('maxWidth', 200);

    pane.appendChild(view);
    pane.append();
  });

  setTimeout(function () {
    assert.equal(view.get('frame').width, 200, 'frame width is 200');
    assert.ok(view.get('layout').height > 200, 'height > 200');

    pane.destroy();
    pane.remove();

    // start();
    cb();
  }, 500);
});
