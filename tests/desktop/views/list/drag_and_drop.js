// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../../core/core.js";
import { SCArray } from "../../../../core/mixins/array.js";
import { IndexSet } from "../../../../core/system/index_set.js";
import { run, RunLoop } from "../../../../core/system/runloop.js";
import { CollectionViewDelegate, ListView, ScrollView } from "../../../../desktop/desktop.js";
import { DRAG_ANY, DRAG_MOVE } from "../../../../desktop/system/drag.js";
import { SCEvent } from "../../../../event/event.js";
import { offset } from "../../../../view/view.js";
import { ControlTestPane } from '../../../view/test_support/control_test_pane.js';

/*
  This test evaluates drag and drop support for ListView
*/

const BORDER_NONE = null;

// Create a fake content array.  Generates a list with whatever length you
// want of objects with a title based on the index.  Cannot mutate.
var ContentArray = SC.Object.extend(SCArray, {

  length: 0,

  objectAt: function(idx) {
    if (idx >= this.get('length')) { return undefined; }

    var content = this._content, ret ;
    if (!content) { content = this._content = []; }

    ret = content[idx];
    if (!ret) {
      ret = content[idx] = SC.Object.create({
        title: "ContentItem %@".fmt(idx),
        isDone: (idx % 3)===0,
        unread: (Math.random() > 0.5) ? Math.floor(Math.random() * 100) : 0
      });
    }

    return ret ;
  }
});

var pane = ControlTestPane.design()
  .add("basic", ScrollView.design({
    borderStyle: BORDER_NONE,
    layout: { left: 0, right: 0, top: 0, height: 300 },
    hasHorizontalScroller: false,
    contentView: ListView.design({
      content: ContentArray.create({ length: 5 }),
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      rowHeight: 20,
      _didCallDragEnded: false,
      dragEnded: function de () {
        de.base.apply(this, arguments);
        this._didCallDragEnded = true;
      }
    })
  }))
  .add("empty", ScrollView.design({
    borderStyle: BORDER_NONE,
    layout: { left: 0, right: 0, top: 0, height: 300 },
    hasHorizontalScroller: false,
    contentView: ListView.design({
      contentValueKey: "title",
      contentCheckboxKey: "isDone",
      contentUnreadCountKey: "unread",
      rowHeight: 20,
      _didCallDragEnded: false,
      dragEnded: function dre () {
        dre.base.apply(this, arguments);
        this._didCallDragEnded = true;
      }
    })
  }));


module("ListView - drag and drop", pane.standardSetup());

test("drag on default list view", function (assert) {
  var ev,
    itemView,
    frame,
    layer,
    listView = pane.view("basic").get('contentView');

  itemView = listView.itemViewForContentIndex(0);
  frame = itemView.get('frame');
  layer = itemView.get('layer');
  ev = SCEvent.simulateEvent(layer, 'mousedown', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mousedown', [ev]);

  ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mousemove', [ev]);

  assert.equal(listView.get('dragContent'), null, 'dragContent should not be set, because the default implementation should prevent dragging');

  // Clean up
  ev = SCEvent.simulateEvent(layer, 'mouseup', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mouseup', [ev]);
});


test("drag on list view with DROP_ON support", function (assert) {
  var ev,
    itemView,
    frame,
    layer,
    listView = pane.view("basic").get('contentView');

  const done = assert.async();
  // Configure the view to accept drop on.
  listView.set('canReorderContent', true);
  listView.set('isDropTarget', true);
  listView.set('delegate', SC.Object.create(CollectionViewDelegate, {
     collectionViewValidateDragOperation: function(view, drag, op, proposedInsertionIndex, proposedDropOperation) {
      return DRAG_ANY;
    }
  }));

  itemView = listView.itemViewForContentIndex(0);
  layer = itemView.get('layer');
  frame = itemView.get('frame');
  ev = SCEvent.simulateEvent(layer, 'mousedown', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mousedown', [ev]);

  var f = function() {
    var itemView2,
      point;

    RunLoop.begin();
    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: frame.x, pageY: frame.y });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    assert.equal(listView.get('dragContent').content, listView.get('content'), "dragContent.content should be equal to the ListView's content");
    assert.ok(listView.get('dragContent').indexes.isEqual(IndexSet.create(0)), "dragContent.indexes should be equal to indexes equal to [{0}]");
    RunLoop.end();

    // Drag over 2nd item
    itemView2 = listView.itemViewForContentIndex(1);
    layer = itemView2.get('layer');
    point = offset(layer);

    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mousemove', [ev]);


    assert.ok(itemView2.get('isDropTarget'), "second list item should have isDropTarget set to true");

    // This test only works because ListItemView supports adding the class to match the property.
    assert.ok(itemView2.$().hasClass('drop-target'), "second list item should add drop-target class");

    // Drag over 3rd item
    itemView = listView.itemViewForContentIndex(2);
    layer = itemView.get('layer');
    point = offset(layer);

    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    assert.ok(itemView.get('isDropTarget'), "third list item should have isDropTarget set to true");
    assert.ok(!itemView2.get('isDropTarget'), "second list item should not have isDropTarget set to true");

    // This test only works because ListItemView supports adding the class to match the property.
    assert.ok(itemView.$().hasClass('drop-target'), "third list item should add drop-target class");
    assert.ok(!itemView2.$().hasClass('drop-target'), "second list item should not add drop-target class");

    // Clean up
    ev = SCEvent.simulateEvent(layer, 'mouseup', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mouseup', [ev]);

    done();
  };

  setTimeout(f, 200);
});

test("insertion point when drag on list view", function (assert) {
  const done = assert.async();

  var ev,
    itemView,
    layer,
    frame,
    listView = pane.view("basic").get('contentView');

  listView.set('canReorderContent', true);

  itemView = listView.itemViewForContentIndex(0);
  frame = itemView.get('frame');
  layer = itemView.get('layer');
  ev = SCEvent.simulateEvent(layer, 'mousedown', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mousedown', [ev]);

  var f = function() {
    var itemView2,
      point;

    RunLoop.begin();
    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: frame.x, pageY: frame.y });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    // Drag over 2nd item
    itemView2 = listView.itemViewForContentIndex(1);
    layer = itemView2.get('layer');
    point = offset(layer);

    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    assert.ok(listView._sc_insertionPointView, "An insertion point should have been added");

    assert.equal(listView._sc_insertionPointView.get('layout').top, 20, "The drag having been over item 2, the insertion point should be located at the top of item 2");

    // Clean up
    ev = SCEvent.simulateEvent(layer, 'mouseup', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mouseup', [ev]);

    assert.equal(listView._sc_insertionPointView, null, "The insertion point should have been destroyed");

    done();
  };

  setTimeout(f, 200);
});

test("insertion point when cancel drag on list view", function (assert) {
  const done = assert.async();
  var ev,
    itemView,
    frame,
    layer,
    listView = pane.view("basic").get('contentView');

  listView.set('canReorderContent', true);

  itemView = listView.itemViewForContentIndex(0);
  frame = itemView.get('frame');
  layer = itemView.get('layer');
  ev = SCEvent.simulateEvent(layer, 'mousedown', { pageX: frame.x, pageY: frame.y });
  SCEvent.trigger(layer, 'mousedown', [ev]);

  var f = function() {
    var itemView2,
      point;

    RunLoop.begin();
    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: frame.x, pageY: frame.y });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    // Drag over 2nd item
    itemView2 = listView.itemViewForContentIndex(1);
    layer = itemView2.get('layer');
    point = offset(layer);

    ev = SCEvent.simulateEvent(layer, 'mousemove', { pageX: point.x + 1, pageY: point.y + 1 });
    SCEvent.trigger(layer, 'mousemove', [ev]);

    assert.ok(listView._sc_insertionPointView, "An insertion point should have been added");

    // cancel drag
    ev = SCEvent.simulateEvent(layer, 'keydown', { keyCode: 27 });
    SCEvent.trigger(layer, 'keydown', [ev]);

    assert.equal(listView._sc_insertionPointView, null, "The insertion point should have been destroyed");
    assert.equal(listView._didCallDragEnded, true, "dragEnded should have been call");

    done();
  };


  setTimeout(f, 200);
});

test("insertion point on empty list", function (assert) {
  var listView = pane.view('empty').get('contentView'),
      didError = false;

  try {
    run(function() {
      listView.showInsertionPoint(null, DRAG_MOVE);
    });
  } catch (e) {
    didError = true;
  }

  assert.ok(!didError, "An insertion point was added onto no item view without incident.");
});
