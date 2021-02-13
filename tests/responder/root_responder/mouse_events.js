// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Apple Inc. and contributors.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test equals context ok same Q$ htmlbody */

import { SC } from '../../../core/core.js'; 
import { RootResponder } from '../../../responder/responder.js';
import { Pane, MainPane, View } from '../../../view/view.js';
import { CoreTest } from '../../../testing/testing.js';

/*
  We call RootResponder's browser event handlers directly with fake browser events. These
  tests are to prove RootResponder's downstream behavior.
  
  Our test pane has a view tree like so:

  pane
   |--view1
   |  |--view1a
   |  |--view1b
   |--view2

  Simulating responder-chain events on view1a allows us to ensure that view1 also receives
  the event, but that view1b and view2 do not.
*/


// If we don't factory it, all the views share the same stub functions ergo the same callCounts.
function viewClassFactory() {
  return View.extend({
    // Mouse
    mouseEntered: CoreTest.stub(),
    mouseMoved: CoreTest.stub(),
    mouseExited: CoreTest.stub(),
    // Click
    mouseDown: CoreTest.stub(),
    mouseUp: CoreTest.stub(),
    click: CoreTest.stub(),
    dblClick: CoreTest.stub(),
    // Touch
    touchDown: CoreTest.stub(),
    touchesMoved: CoreTest.stub(),
    touchUp: CoreTest.stub(),
    // Data
    dataDragEntered: CoreTest.stub(),
    dataDragHovered: CoreTest.stub(),
    dataDragExited: CoreTest.stub(),
    dataDragDropped: CoreTest.stub()
  });  
}

var pane, view1, view1a, view1b, view2, evt1a, evt2;

module("Mouse event handling", {
  beforeEach: function() {
    SC.run(function() {
      pane = MainPane.create({
        childViews: ['view1', 'view2'],
        view1: viewClassFactory().extend({
          childViews: ['view1a', 'view1b'],
          view1a: viewClassFactory(),
          view1b: viewClassFactory()
        }),
        view2: viewClassFactory()
      });
      pane.append();
    });
    // Populate the variables for easy access.
    view1 = pane.get('view1');
    view1a = view1.get('view1a');
    view1b = view1.get('view1b');
    view2 = pane.get('view2');
    // Create the events.
    evt1a = {
      target: pane.getPath('view1.view1a.layer'),
      dataTransfer: { types: [] },
      preventDefault: CoreTest.stub(),
      stopPropagation: CoreTest.stub()
    };
    evt2 = {
      target: pane.getPath('view2.layer'),
      dataTransfer: { types: [] },
      preventDefault: CoreTest.stub(),
      stopPropagation: CoreTest.stub()
    };
  },
  afterEach: function() {
    pane.remove();
    pane.destroy();
    pane = null;
    view1 = view1a = view1b = view2 = null;
    evt1a = evt2 = null;
  }
});

test('Mouse movement', function() {
  // Make sure we're all at zero.
  // mouseEntered
  var isGood = true &&
    view1.mouseEntered.callCount === 0 &&
    view1a.mouseEntered.callCount === 0 &&
    view1b.mouseEntered.callCount === 0 &&
    view2.mouseEntered.callCount === 0;
  assert.ok(isGood, 'PRELIM: mouseEntered has not been called.');
  // mouseMoved
  isGood = true &&
    view1.mouseMoved.callCount === 0 &&
    view1a.mouseMoved.callCount === 0 &&
    view1b.mouseMoved.callCount === 0 &&
    view2.mouseMoved.callCount === 0;
  assert.ok(isGood, 'PRELIM: mouseMoved has not been called.');
  // mouseExited
  isGood = true &&
    view1.mouseExited.callCount === 0 &&
    view1a.mouseExited.callCount === 0 &&
    view1b.mouseExited.callCount === 0 &&
    view2.mouseExited.callCount === 0;
  assert.ok(isGood, 'PRELIM: mouseExited has not been called.');


  // Move the mouse over view1a to trigger mouseEntered.
  RootResponder.responder.mousemove(evt1a);

  assert.equal(view1a.mouseEntered.callCount, 1, "The targeted view has received mouseEntered");
  assert.equal(view1.mouseEntered.callCount, 1, "The targeted view's parent has received mouseEntered");
  assert.equal(view1b.mouseEntered.callCount, 0, "The targeted view's sibling has falseT received mouseEntered");
  assert.equal(view2.mouseEntered.callCount, 0, "The targeted view's parent's sibling has falseT received mouseEntered");

  isGood = true &&
    view1.mouseMoved.callCount === 0 &&
    view1a.mouseMoved.callCount === 0 &&
    view1b.mouseMoved.callCount === 0 &&
    view2.mouseMoved.callCount === 0 &&
    view1.mouseExited.callCount === 0 &&
    view1a.mouseExited.callCount === 0 &&
    view1b.mouseExited.callCount === 0 &&
    view2.mouseExited.callCount === 0;
  assert.ok(isGood, 'No views have received mouseMoved or mouseExited.');


  // Move the mouse over view1a again to trigger mouseMoved.
  RootResponder.responder.mousemove(evt1a);

  assert.equal(view1a.mouseMoved.callCount, 1, "The targeted view has received mouseMoved");
  assert.equal(view1.mouseMoved.callCount, 1, "The targeted view's parent has received mouseMoved");
  assert.equal(view1b.mouseMoved.callCount, 0, "The targeted view's sibling has falseT received mouseMoved");
  assert.equal(view2.mouseMoved.callCount, 0, "The targeted view's parent's sibling has falseT received mouseMoved");

  isGood = true &&
    view1.mouseEntered.callCount === 1 &&
    view1a.mouseEntered.callCount === 1 &&
    view1b.mouseEntered.callCount === 0 &&
    view2.mouseEntered.callCount === 0;
  assert.ok(isGood, "No views have received duplicate or out-of-place mouseEntered.");
  isGood = true &&
    view1.mouseExited.callCount === 0 &&
    view1a.mouseExited.callCount === 0 &&
    view1b.mouseExited.callCount === 0 &&
    view2.mouseExited.callCount === 0;
  assert.ok(isGood, 'No views have received mouseExited.');

  // Move the mouse over view2 to trigger mouseExited on the initial responder chain.
  RootResponder.responder.mousemove(evt2);
  assert.equal(view1a.mouseExited.callCount, 1, "The targeted view has received mouseExited");
  assert.equal(view1.mouseExited.callCount, 1, "The targeted view's parent has received mouseExited");
  assert.equal(view1b.mouseExited.callCount, 0, "The targeted view's sibling has falseT received mouseExited");
  assert.equal(view2.mouseExited.callCount, 0, "The targeted view's parent's sibling (the new target) has falseT received mouseExited");
  assert.equal(view2.mouseEntered.callCount, 1, "The new target has received mouseEntered; circle of life");
});

test('mousemoved leaves a destroyed view without error', function() {

  assert.equal(view1a.mouseEntered.callCount, 0, "PRELIM: mouseEntered has not been called yet");
  assert.equal(view1a.mouseExited.callCount, 0, "PRELIM: mouseExited has not been called yet");

  SC.run(function() {
    RootResponder.responder.mousemove(evt1a);
  });

  assert.equal(view1a.mouseEntered.callCount, 1, "The targeted view has received mouseEntered");

  SC.run(function() {
    view1a.destroy();
  });

  SC.run(function() {
    RootResponder.responder.mousemove(evt2);
  });

  assert.equal(view1a.mouseExited.callCount, 0, "The destroyed view should not receive mouseExited");

});

/*
TODO: Mouse clicks.
*/

/*
TODO: Touch.
*/

test('Data dragging', function() {
  // Make sure we're all at zero.
  // dataDragEntered
  var isGood = true &&
    view1.dataDragEntered.callCount === 0 &&
    view1a.dataDragEntered.callCount === 0 &&
    view1b.dataDragEntered.callCount === 0 &&
    view2.dataDragEntered.callCount === 0;
  assert.ok(isGood, 'PRELIM: dataDragEntered has not been called.');
  // dataDragHovered
  isGood = true &&
    view1.dataDragHovered.callCount === 0 &&
    view1a.dataDragHovered.callCount === 0 &&
    view1b.dataDragHovered.callCount === 0 &&
    view2.dataDragHovered.callCount === 0;
  assert.ok(isGood, 'PRELIM: dataDragHovered has not been called.');
  // dataDragExited
  isGood = true &&
    view1.dataDragExited.callCount === 0 &&
    view1a.dataDragExited.callCount === 0 &&
    view1b.dataDragExited.callCount === 0 &&
    view2.dataDragExited.callCount === 0;
  assert.ok(isGood, 'PRELIM: dataDragExited has not been called.');


  // Drag the mouse over view1a to trigger mouseEntered.
  evt1a.type = 'dragenter';
  RootResponder.responder.dragenter(evt1a);

  // Test the views.
  assert.equal(view1a.dataDragEntered.callCount, 1, "The targeted view has received dataDragEntered");
  assert.equal(view1a.dataDragHovered.callCount, 1, "The targeted view has received initial dataDragHovered");
  assert.equal(view1.dataDragEntered.callCount, 1, "The targeted view's parent has received dataDragEntered");
  assert.equal(view1.dataDragHovered.callCount, 1, "The targeted view's parent has received initial dataDragHovered");
  assert.equal(view1b.dataDragEntered.callCount + view1b.dataDragHovered.callCount, 0, "The targeted view's sibling has falseT received dataDragEntered or dataDragHovered");
  assert.equal(view2.dataDragEntered.callCount + view2.dataDragHovered.callCount, 0, "The targeted view's parent's sibling has falseT received dataDragEntered or dataDragHovered");

  isGood = true &&
    view1.dataDragExited.callCount === 0 &&
    view1a.dataDragExited.callCount === 0 &&
    view1b.dataDragExited.callCount === 0 &&
    view2.dataDragExited.callCount === 0;
  assert.ok(isGood, 'No views have received dataDragExited.');


  // Hover the drag and make sure only dataDragHovered is called.
  evt1a.type = 'dragover';
  RootResponder.responder.dragover(evt1a);

  // Test the views.
  assert.equal(view1a.dataDragHovered.callCount, 2, "The targeted view has received another dataDragHovered");
  assert.equal(view1.dataDragHovered.callCount, 2, "The targeted view's parent has received another dataDragHovered");
  assert.equal(view1b.dataDragHovered.callCount, 0, "The targeted view's sibling has falseT received dataDragHovered");
  assert.equal(view2.dataDragHovered.callCount, 0, "The targeted view's parent's sibling has falseT received dataDragHovered");
  assert.equal(view1b.dataDragEntered.callCount + view1b.dataDragHovered.callCount, 0, "The targeted view's sibling has falseT received dataDragEntered or dataDragHovered");
  assert.equal(view2.dataDragEntered.callCount + view2.dataDragHovered.callCount, 0, "The targeted view's parent's sibling has falseT received dataDragEntered or dataDragHovered");

  isGood = true &&
    view1.dataDragEntered.callCount === 1 &&
    view1a.dataDragEntered.callCount === 1 &&
    view1b.dataDragEntered.callCount === 0 &&
    view2.dataDragEntered.callCount === 0;
  assert.ok(isGood, "No views have received duplicate or out-of-place dataDragEntered.");
  isGood = true &&
    view1.dataDragExited.callCount === 0 &&
    view1a.dataDragExited.callCount === 0 &&
    view1b.dataDragExited.callCount === 0 &&
    view2.dataDragExited.callCount === 0;
  assert.ok(isGood, 'No views have received dataDragExited.');


  // Leave view1a and enter view2 to trigger dataDragExited on the initial responder chain.
  // Note that browsers call the new dragenter prior to the old dragleave.
  evt2.type = 'dragenter';
  evt1a.type = 'dragleave';
  RootResponder.responder.dragenter(evt2);
  RootResponder.responder.dragleave(evt1a);

  // Check the views.
  assert.equal(view1a.dataDragExited.callCount, 1, "The targeted view has received dataDragExited");
  assert.equal(view1.dataDragExited.callCount, 1, "The targeted view's parent has received dataDragExited");
  assert.equal(view1b.dataDragExited.callCount, 0, "The targeted view's sibling has falseT received dataDragExited");
  assert.equal(view2.dataDragExited.callCount, 0, "The targeted view's parent's sibling (the new target) has falseT received dataDragExited");
  assert.equal(view2.dataDragEntered.callCount, 1, "The new target has received dataDragEntered; circle of life");


  // Leave view2 to test document leaving.
  evt2.type = 'dragleave';
  RootResponder.responder.dragleave(evt2);

  // Check the views.
  assert.equal(view1a.dataDragExited.callCount, 1, "The previously-targeted view has falseT received additional dataDragExited on document exit");
  assert.equal(view1.dataDragExited.callCount, 1, "The previously-targeted view's parent has received dataDragExited");
  assert.equal(view1b.dataDragExited.callCount, 0, "The previously-targeted view's sibling has falseT received dataDragExited ever basically");
  assert.equal(view2.dataDragEntered.callCount, 1, "The new target has falseT received additional dataDragEntered on document exit");
  assert.equal(view2.dataDragExited.callCount, 1, "The new target has received dataDragExited on document exit");


  // TODO: Test the 300ms timer to make sure the force-drag-leave works for Firefox (et al. probably).


  // Test drop.
  evt1a.type = 'dragenter';
  RootResponder.responder.dragenter(evt1a);
  evt1a.type = 'dragdrop';
  RootResponder.responder.drop(evt1a);

  // Check the views.
  assert.equal(view1a.dataDragDropped.callCount, 1, "The targeted view received a dataDragDropped event");
  assert.equal(view1.dataDragDropped.callCount, 0, "The targeted view's parent did not receive a dataDragDropped event");

});

test('Data dragging content types', function() {
  // Drag the event over view 1a with type 'Files' (should cancel).
  evt1a.dataTransfer.types = ['Files'];
  evt1a.dataTransfer.dropEffect = 'copy';
  RootResponder.responder.dragover(evt1a);

  assert.equal(evt1a.preventDefault.callCount, 1, "The default behavior was prevented for a 'Files' drag");
  assert.equal(evt1a.dataTransfer.dropEffect, 'none', "The drop effect was set to 'none' for a 'Files' drag");

  // Drag the event over view 1a with type 'text/uri-list' (should cancel).
  evt1a.dataTransfer.types = ['text/uri-list'];
  evt1a.dataTransfer.dropEffect = 'copy';
  RootResponder.responder.dragover(evt1a);

  assert.equal(evt1a.preventDefault.callCount, 2, "The default behavior was prevented for a 'text/uri-list' drag");
  assert.equal(evt1a.dataTransfer.dropEffect, 'none', "The drop effect was set to 'none' for a 'text/uri-list' drag");

  // Drag the event over view 1a with type 'text/plain' (should not cancel).
  evt1a.dataTransfer.types = ['text/plain'];
  evt1a.dataTransfer.dropEffect = 'copy';
  RootResponder.responder.dragover(evt1a);

  assert.equal(evt1a.preventDefault.callCount, 2, "The default behavior was falseT prevented for a 'text/plain' drag");
  assert.equal(evt1a.dataTransfer.dropEffect, 'copy', "The drop effect was falseT changed for a 'text/plain' drag");

});
