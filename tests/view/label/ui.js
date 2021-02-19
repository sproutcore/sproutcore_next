// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same */

import { ControlTestPane } from '../test_support/control_test_pane.js';
import { LabelView, TINY_CONTROL_SIZE, REGULAR_CONTROL_SIZE, SMALL_CONTROL_SIZE } from '../../../view/view.js';
import { htmlbody, clearHtmlbody } from '../../../testing/testing.js';

var iconURL= "http://www.freeiconsweb.com/Icons/16x16_people_icons/People_046.gif";
(function() {
var pane = ControlTestPane.design()
  .add("basic", LabelView, {
    value:'hello'
  })

  .add("disabled", LabelView, {
    value:'hello',
    isEnabled: false
  })

  .add("hint", LabelView, {
    hint: 'Get on with it!',
    isEditable: true
  })

  .add("selectable", LabelView, {
    value:'hello',
    isTextSelectable: true
  })

  .add("iconclass", LabelView, {
    icon: 'icon-class',
    value: "hello"
  })

  .add("icon", LabelView, {
     value: "hello",
     icon: iconURL
  })

  .add("regular size", LabelView, {
     value: "hello",
     controlSize: REGULAR_CONTROL_SIZE
  })

  .add("small size", LabelView, {
     value: "hello",
     controlSize: SMALL_CONTROL_SIZE
  })

  .add("tiny size", LabelView, {
     value: "hello",
     controlSize: TINY_CONTROL_SIZE
  })

  .add("editable", LabelView, {
     value: "double click me",
     isEditable: true
  })

  .add("null value", LabelView, {
     value: null
  })

  .add("undefined value", LabelView, {
     value: undefined
  });


module('LabelView ui', {
  beforeEach: function() {
    htmlbody('<style> .sc-static-layout { border: 1px red dotted; } </style>');
    pane.standardSetup().beforeEach();
  },
  afterEach: function(){
    pane.standardSetup().afterEach();
    clearHtmlbody();
  }
});

test("Check that all Label are visible", function (assert) {
  assert.ok(pane.view('basic').get('isVisibleInWindow'), 'basic.isVisibleInWindow should be true');
  assert.ok(pane.view('disabled').get('isVisibleInWindow'), 'title.isVisibleInWindow should be true');
  assert.ok(pane.view('selectable').get('isVisibleInWindow'), 'icon.isVisibleInWindow should be true');
  assert.ok(pane.view('icon').get('isVisibleInWindow'), 'title,icon,disabled.isVisibleInWindow should be true');
  assert.ok(pane.view('regular size').get('isVisibleInWindow'), 'title,icon,default.isVisibleInWindow should be true');
  assert.ok(pane.view('small size').get('isVisibleInWindow'), 'title.icon,selected.isVisibleInWindow should be true');
  assert.ok(pane.view('tiny size').get('isVisibleInWindow'), 'title,toolTip.isVisibleInWindow should be true');
  assert.ok(pane.view('editable').get('isVisibleInWindow'), 'title,toolTip.isVisibleInWindow should be true');
  assert.ok(pane.view('null value').get('isVisibleInWindow'), 'null value.isVisibleInWindow should be true');
});


test("Check that all labels have the right classes and styles set", function (assert) {
  var viewElem=pane.view('basic').$();
  assert.ok(viewElem.hasClass('sc-view'), 'basic.hasClass(sc-view) should be true');
  assert.ok(viewElem.hasClass('sc-label-view'), 'basic.hasClass(sc-label-view) should be true');
  assert.ok(!viewElem.hasClass('icon'), 'basic.hasClass(icon) should be false');
  assert.ok(!viewElem.hasClass('disabled'), 'basic.hasClass(disabled) should be true');

  viewElem=pane.view('disabled').$();
  assert.ok(viewElem.hasClass('sc-view'), 'title.hasClass(sc-view) should be true');
  assert.ok(viewElem.hasClass('sc-label-view'), 'title.hasClass(sc-label-view) should be true');
  assert.ok(!viewElem.hasClass('icon'), 'title.hasClass(icon) should be false');
  assert.ok(viewElem.hasClass('disabled'), 'title.hasClass(disabled) should be false');

  viewElem=pane.view('selectable').$();
  assert.ok(viewElem.hasClass('sc-view'), 'icon.hasClass(sc-view) should be true');
  assert.ok(viewElem.hasClass('sc-label-view'), 'icon.hasClass(sc-label-view) should be true');
  assert.ok(viewElem.hasClass('sc-regular-size'), 'icon.hasClass(sc-regular-size) should be true');
  assert.ok(!viewElem.hasClass('icon'), 'icon.hasClass(icon) should be true');
  assert.ok(!viewElem.hasClass('sel'), 'icon.hasClass(sel) should be false');
  assert.ok(!viewElem.hasClass('disabled'), 'icon.hasClass(disabled) should be false');

  viewElem = pane.view('iconclass').$();
  assert.ok(viewElem.hasClass('icon'), 'view element should have "icon" class');
  assert.ok(viewElem.find('div').hasClass('icon'), 'image inside view should have "icon" class');

  viewElem=pane.view('icon').$();
  assert.ok(viewElem.hasClass('sc-view'), 'title,icon,disabled.hasClass(sc-view) should be true');
  assert.ok(viewElem.hasClass('sc-label-view'), 'title,icon,disabled.hasClass(sc-label-view) should be true');
  assert.ok(viewElem.hasClass('icon'), 'title,icon,disabled.hasClass(icon) should be true');
  assert.ok(!viewElem.hasClass('disabled'), 'title,icon,disabled.hasClass(disabled) should be true');

  viewElem=pane.view('regular size').$();
  assert.ok(viewElem.hasClass('sc-view'), 'title,icon,default.hasClass(sc-view) should be true');
  assert.ok(viewElem.hasClass('sc-label-view'), 'title,icon,default.hasClass(sc-label-view) should be true');
  assert.ok(viewElem.hasClass('sc-regular-size'), 'title,icon,default.hasClass(sc-regular-size) should be true');
  assert.ok(!viewElem.hasClass('disabled'), 'title,icon,default.hasClass(disabled) should be false');
});


test("Check that the title is set or not and if it is in the appropriate element", function (assert) {
  var viewElem=pane.view('basic').$();
  assert.equal(viewElem.text(), 'hello', 'has a value set');

  viewElem=pane.view('icon').$('img');
  assert.ok((viewElem!==null), 'should have an image corresponding to an icon');

  viewElem=pane.view('null value').$();
  assert.equal(viewElem.text(), '', 'has correct empty value set');

  viewElem=pane.view('undefined value').$();
  assert.equal(viewElem.text(), '', 'has correct empty value set');
});

test("The hint property should appear if the label is editable and has no value.", function (assert) {
  var viewElem = pane.view('hint').$();

  viewElem = viewElem.find('.sc-hint');
  assert.equal(viewElem.length, 1, "has an .sc-hint span inside");
  assert.equal(viewElem.text(), 'Get on with it!', 'has correct hint value set');
});

})();
