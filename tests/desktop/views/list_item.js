// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from "../../../core/core.js";
import { BRANCH_CLOSED, BRANCH_OPEN, LEAF_NODE } from "../../../core/system/constants.js";
import { RunLoop } from "../../../core/system/runloop.js";
import { MIXED_STATE } from "../../../datastore/datastore.js";
import { ListItemView } from "../../../desktop/views/list_item.js";
import { CoreTest } from "../../../testing/core.js";
import { ActionSupport } from "../../../view/view.js";
import { ControlTestPane } from "../../view/test_support/control_test_pane.js";

// import { BaseTheme } from "../../../view/view.js";

// window.BASETHEME = BaseTheme;

/*global module, test, htmlbody, ok, equals, same, stop, start */

var pane = ControlTestPane.design({ height: 32 })
  .add("basic", ListItemView.design({
    content: "List Item"
  }))

  .add("full", ListItemView.design({
    content: SC.Object.create({
      icon: "sc-icon-folder-16",
      rightIcon: "sc-icon-help-16",
      title: "List Item",
      checkbox: true,
      count: 23,
      branch: true
    }),

    hasContentIcon:  true,
    hasContentRightIcon:  true,
    hasContentBranch: true,

    contentValueKey: "title",
    contentCheckboxKey: 'checkbox',
    contentIconKey:  "icon",
    contentRightIconKey:  "rightIcon",
    contentUnreadCountKey: 'count',
    contentIsBranchKey: 'branch',

    disclosureState: BRANCH_OPEN

  }))

  .add("full - sel", ListItemView.design({
    content: SC.Object.create({
      icon: "sc-icon-folder-16",
      rightIcon: "sc-icon-help-16",
      title: "List Item",
      checkbox: true,
      count: 23,
      branch: true
    }),

    isSelected: true,

    hasContentIcon:  true,
    hasContentRightIcon:  true,
    hasContentBranch: true,

    contentValueKey: "title",
    contentLeftActionKey: 'checkbox',
    leftAction: 'checkbox',

    contentRightActionKey: 'isLoading',

    contentCheckboxKey: 'checkbox',
    contentIconKey:  "icon",
    contentRightIconKey:  "rightIcon",
    contentUnreadCountKey: 'count',
    contentIsBranchKey: 'branch',

    disclosureState: BRANCH_OPEN

  }))

  .add("icon", ListItemView.design({
    content: SC.Object.create({
      title: "List Item",
      icon: "sc-icon-folder-16"
    }),

    contentValueKey: "title",

    contentIconKey:  "icon",
    hasContentIcon:  true

  }))

  .add("icon - noIcon", ListItemView.design({
    content: SC.Object.create({
      title: "List Item"
    }),
    contentValueKey: "title",
    contentIconKey:  "icon",
    hasContentIcon:  true
  }))

  .add("icon - contentandview", ListItemView.design({
    content: SC.Object.create({
      title: "List Item",
      icon: "sc-icon-folder-16"
    }),

    icon: "sc-icon-info-16",

    contentValueKey: "title",

    contentIconKey:  "icon",
    hasContentIcon:  true

  }))

  .add("icon - view", ListItemView.design({
    content: SC.Object.create({
      title: "List Item"
    }),

    icon: "sc-icon-info-16",

    contentValueKey: "title"
  }))

  .add("rightIcon", ListItemView.design({
    content: SC.Object.create({
      title: "List Item",
      rightIcon: "sc-icon-help-16"
    }),

    contentValueKey: "title",

    contentRightIconKey:  "rightIcon",
    hasContentRightIcon:  true

  }))

  .add("rightIcon - noRightIcon", ListItemView.design({
    content: SC.Object.create({
      title: "List Item"
    }),
    contentValueKey: "title",
    contentRightIconKey:  "rightIcon",
    hasContentRightIcon:  true
  }))

  .add("rightIcon - contentAndView", ListItemView.design({
    content: SC.Object.create({
      title: "List Item",
      rightIcon: "sc-icon-help-16"
    }),

    rightIcon: "sc-icon-favorite-16",

    contentValueKey: "title",

    contentRightIconKey:  "rightIcon",
    hasContentRightIcon:  true

  }))

  .add("rightIcon - view", ListItemView.design({
    content: SC.Object.create({
      title: "List Item"
    }),

    rightIcon: "sc-icon-favorite-16",

    contentValueKey: "title"
  }))

  .add("disclosure - true", ListItemView.design({
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    disclosureState: BRANCH_OPEN
  }))

  .add("disclosure - false", ListItemView.design({
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    disclosureState: BRANCH_CLOSED
  }))

  .add("checkbox - true", ListItemView.design({
    content: SC.Object.create({ title: "List Item", checkbox: true }),
    contentValueKey: "title",
    contentCheckboxKey:  "checkbox"
  }))

  .add("checkbox - false", ListItemView.design({
    content: SC.Object.create({ title: "List Item", checkbox: false }),
    contentValueKey: "title",
    contentCheckboxKey:  "checkbox"
  }))

  .add("count - 0", ListItemView.design({
    content: SC.Object.create({ title: "List Item", count: 0 }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count"
  }))

  .add("count - 10", ListItemView.design({
    content: SC.Object.create({ title: "List Item", count: 10 }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count"
  }))

  .add("outline - 1", ListItemView.design({
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count",
    outlineLevel: 1
  }))

  .add("outline - 2", ListItemView.design({
    content: SC.Object.create({ title: "List Item" }),
    contentValueKey: "title",
    contentUnreadCountKey:  "count",
    outlineLevel: 2
  }))

  .add("right icon", ListItemView.design(ActionSupport,{
    content: SC.Object.create({
      title: "List Item",
      icon: "sc-icon-folder-16"
    }),
    contentValueKey: "title",
    hasContentRightIcon: true,
    contentRightIconKey: "icon",
    rightIconAction: "doOnRightIconAction",
    rightIconTarget: "onRightIconTarget"
  }));

// ..........................................................
// DETECTORS
//
// The functions below test the presence of a particular part of the view.  If
// you pass the second param then it expects the part to be in the view.  If
// you pass null, then it expects the part to NOT be in the view.

function basic(view, sel, disabled) {
  var cq = view.$();
  assert.ok(cq.hasClass('sc-list-item-view'), 'should have sc-list-item-view class');

  assert.equal(cq.hasClass('sel'), !!sel, 'expect sel class');
  assert.equal(cq.hasClass('disabled'), !!disabled, 'expect disabled class');

  var idx = view.get('contentIndex');
  var evenOrOdd = (idx % 2 === 0) ? 'even' : 'odd';
  assert.ok(cq.hasClass(evenOrOdd), 'should have an %@ class'.fmt(evenOrOdd));
}

function label(view, labelText) {
  if (labelText === null) {
    assert.equal(view.$('label').length, 0, 'should not have label');
  } else {
    assert.equal(view.$('label').text(), labelText, 'should have label text');
  }
}

function icon(view, spriteName) {
  var cq = view.$(), iconCQ = cq.find('.icon');
  if (spriteName === null) {
    assert.ok(!cq.hasClass('has-icon'), "should not have has-icon class");
    assert.equal(iconCQ.length, 0, 'should not have image');
  } else {
    assert.ok(cq.hasClass('has-icon'), "should have has-icon class");
    assert.equal(iconCQ.length, 1, 'should have icon');
    assert.ok(iconCQ.hasClass(spriteName), 'icon should have class name %@'.fmt(spriteName));
  }
}

function rightIcon(view, spriteName) {
  var cq = view.$(), iconCQ = cq.find('img.right-icon');
  if (spriteName === null) {
    assert.ok(!cq.hasClass('has-right-icon'), "should not have has-right-icon class");
    assert.equal(iconCQ.length, 0, 'should not have image');
  } else {
    assert.ok(cq.hasClass('has-right-icon'), "should have has-right-icon class");
    assert.equal(iconCQ.length, 1, 'should have right-icon');
    assert.ok(iconCQ.hasClass(spriteName), 'icon should have class name %@'.fmt(spriteName));
  }
}

function disclosure(view, state) {
  var cq = view.$(), disclosureCQ = cq.find('.sc-disclosure-view');

  if (state === null) {
    assert.ok(!cq.hasClass('has-disclosure'), "should not have has-disclosure class");
    assert.equal(disclosureCQ.length, 0, "should not have disclosure");
  } else {
    assert.ok(cq.hasClass('has-disclosure'), "should have has-disclosure class");
    assert.equal(disclosureCQ.length, 1, "should have disclosure element");
    assert.equal(disclosureCQ.hasClass('sel'), state === true, "disclosure expects sel class");
  }
}

function checkbox(view, state) {
  var cq = view.$(), checkboxCQ = cq.find('.sc-checkbox-view');
  if (state === null) {
    assert.ok(!cq.hasClass('has-checkbox'), "should not have has-checkbox class");
    assert.equal(checkboxCQ.length, 0, 'should not have checkbox');
  } else {
    assert.ok(cq.hasClass('has-checkbox'), "should have has-checkbox class");
    assert.equal(checkboxCQ.length, 1, 'should have checkbox element');
    assert.equal(checkboxCQ.hasClass('sel'), state === true, 'expects sel class');
    assert.equal(checkboxCQ.hasClass('mixed'), state === MIXED_STATE, 'expects mixed class');
  }
}

function count(view, cnt) {
  var cq = view.$(), countCQ = cq.find('.count');
  if (cnt === null) {
    assert.ok(!cq.hasClass('has-count'), "should not have has-count class");
    assert.equal(countCQ.length, 0, 'should not have count');
  } else {
    assert.ok(cq.hasClass('has-count'), "should have has-count class");
    assert.equal(countCQ.length, 1, 'should have count');
    assert.equal(countCQ.text(), cnt.toString(), 'should have count text');
  }
}

function branch(view, visible) {
  var cq = view.$(), branchCQ = cq.find('.branch');
  if (visible === null) {
    assert.ok(!cq.hasClass('has-branch'), "should not have has-branch class");
    assert.equal(branchCQ.length, 0, 'should not have branch');
  } else {
    assert.ok(cq.hasClass('has-branch'), "should have has-branch class");
    assert.equal(branchCQ.length, 1, 'should have branch');
    assert.equal(branchCQ.hasClass('branch-visible'), visible, 'is visible');
  }
}

function rightIcon2(view, hasIt) {
  var cq = view.$(), rightIconCQ = cq.find('.right-icon');
  if (hasIt) {
    assert.ok(cq.hasClass('has-right-icon'), "should have has-right-icon class");
    assert.equal(rightIconCQ.length, 1, 'should have right icon');
  } else {
    assert.ok(!cq.hasClass('has-right-icon'), "should not have has-right-icon class");
    assert.equal(rightIconCQ.length, 0, 'should not have branch') ;
  }
}


// ..........................................................
// Test Basic Setup
//

module("ListItemView UI", pane.standardSetup());

test("basic", function (assert) {
  var view = pane.view('basic');

  basic(view, false, false);
  icon(view, null);
  rightIcon2(view, null);
  label(view, 'List Item');
  disclosure(view, null);
  checkbox(view, null);
  count(view, null);
  branch(view, null);
});

test("full", function (assert) {
  var view = pane.view('full');
  basic(view, false, false);
  icon(view, 'sc-icon-folder-16');
  rightIcon2(view, 'sc-icon-help-16');
  label(view, 'List Item');
  disclosure(view, true);
  checkbox(view, true);
  count(view, 23);
  branch(view, true);
});

test("full - sel", function (assert) {
  var view = pane.view('full - sel');
  basic(view, true, false);
  icon(view, 'sc-icon-folder-16');
  rightIcon2(view, 'sc-icon-help-16');
  label(view, 'List Item');
  disclosure(view, true);
  checkbox(view, true);
  count(view, 23);
  branch(view, true);
});

test("icon", function (assert) {
  var view = pane.view('icon');
  icon(view, 'sc-icon-folder-16');
});

test("icon defined but not in view or content", function (assert) {
  var view = pane.view('icon - noIcon');
  icon(view, null);
});

test("icon defined in view and in content", function (assert) {
  var view = pane.view('icon - contentandview');
  icon(view, 'sc-icon-folder-16');
});

test("icon defined only in view", function (assert) {
  var view = pane.view('icon - view');
  icon(view, 'sc-icon-info-16');
});

test("rightIcon", function (assert) {
  var view = pane.view('rightIcon');
  rightIcon2(view, 'sc-icon-help-16');
});

test("rightIcon defined but not in view or content", function (assert) {
  var view = pane.view('rightIcon - noRightIcon');
  rightIcon2(view, null);
});

test("rightIcon defined in view and in content", function (assert) {
  var view = pane.view('rightIcon - contentAndView');
  rightIcon2(view, 'sc-icon-help-16');
});

test("rightIcon defined only in view", function (assert) {
  var view = pane.view('rightIcon - view');
  rightIcon2(view, 'sc-icon-favorite-16');
});

test('disclosure', function (assert) {
  disclosure(pane.view('disclosure - true'), true);
  disclosure(pane.view('disclosure - false'), false);
});

test('checkbox', function (assert) {
  checkbox(pane.view('checkbox - true'), true);
  checkbox(pane.view('checkbox - false'), false);
});

test('count', function (assert) {
  // no count should show when count = 0;
  count(pane.view('count - 0'), 0);
  count(pane.view('count - 10'), 10);
});

test("outline - 1", function (assert) {
  var v = pane.view('outline - 1'),
      indent = v.get('outlineIndent');

  assert.ok(indent > 0, 'precond - outlineIndent property should be > 0 (actual: %@)'.fmt(indent));

  assert.equal(v.$('.sc-outline').css('left'), indent * 1 + 16 + "px", 'sc-outline div should be offset by outline ammount');
});

test("outline - 2", function (assert) {
  var v = pane.view('outline - 2'),
      indent = v.get('outlineIndent');

  assert.ok(indent > 0, 'precond - outlineIndent property should be > 0 (actual: %@)'.fmt(indent));

  assert.equal(v.$('.sc-outline').css('left'), indent * 2 + 16 + "px", 'sc-outline div should be offset by outline ammount');
});

// ..........................................................
// EDITING CONTENT
//

function adjustView(view, key, value) {
  RunLoop.begin();
  view.set(key, value);
  RunLoop.end();
}

// gets the view content and adjusts the value inside of a runloop, ensuring
// the UI gets an update also.
function adjustContent(view, key, value) {
  var content = view.get('content');
  RunLoop.begin();
  content.set(key, value);
  RunLoop.end();
}

test("changing label should change display", function (assert) {
  var view = pane.view('full');
  adjustContent(view, 'title', 'FOO');
  label(view, 'FOO'); // verify change
});


test("changing disclosure value should update display", function (assert) {
  var view = pane.view('full');
  adjustView(view, 'disclosureState', BRANCH_CLOSED);
  disclosure(view, false);

  // changing to leaf node should remove disclosure view
  adjustView(view, 'disclosureState', LEAF_NODE);
  disclosure(view, null);

  // changing back to open/closed should add the disclosure back
  adjustView(view, 'disclosureState', BRANCH_OPEN);
  disclosure(view, true);
});

test("changing checkbox value should update display", function (assert) {
  var view = pane.view('full');
  adjustContent(view, 'checkbox', false);
  checkbox(view, false); // verify change

  // changing to null should remove checkbox view
  adjustContent(view, 'checkbox', null);
  checkbox(view, null);

  // changing back to true should add the checkbox back
  adjustContent(view, 'checkbox', true);
  checkbox(view, true);
});

test("changing count value should update display", function (assert) {
  var view = pane.view('full');

  adjustContent(view, 'count', 100);
  count(view, 100); // verify change

  adjustContent(view, 'count', null);
  count(view, null); // verify change
});

test("right icon action dom", function (assert) {
  // basic does not have right icon and action
  var view = pane.view('basic');
  rightIcon2(view, false);

  // has right icon and action
  view = pane.view('right icon');
  rightIcon2(view, true);
});

test("right icon action event", function (assert) {
  var spiedRootResponder = { sendAction: function(){} };
  var sendActionSpy = CoreTest.spyOn(spiedRootResponder, 'sendAction');

  var view = pane.view('right icon'),
      spyPane = SC.Object.create({
        rootResponder: spiedRootResponder
      });

  view.pane=spyPane;

  var expectedAction = view.get("rightIconAction");
  var expectedTarget = view.get("rightIconTarget");
  var target = view.$('.right-icon').get(0);
  var evt = { target: target, which: 1 };
  view.mouseDown(evt);
  view.mouseUp(evt);

  assert.ok(expectedAction === "doOnRightIconAction", 'expectedAction should have been doOnRightIconAction');
  assert.ok(sendActionSpy.wasCalled, 'action should have been called');
  assert.ok(sendActionSpy.wasCalledWith(expectedAction,expectedTarget,view,spyPane), 'should have triggered the action with these arguments');
});
