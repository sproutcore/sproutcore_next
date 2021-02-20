// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*globals module, test, htmlbody, ok, equals, same, stop, start, Q$ */

import { SC } from '../../../core/core.js';
import { ControlTestPane } from '../test_support/control_test_pane.js';
import { TextFieldView, AUTOCAPITALIZE_NONE, AUTOCAPITALIZE_SENTENCES, AUTOCAPITALIZE_WORDS, AUTOCAPITALIZE_CHARACTERS, MainPane } from '../../../view/view.js';
import { SCEvent, browser } from '../../../event/event.js';
import { Responder, platform } from '../../../responder/responder.js';

import { CoreQuery } from '../../../event/event.js';
const Q$ = CoreQuery;

// note: need to test interaction with Validators here
// possibly move Validator support to TextFieldView specifically.

var pane, view, view1, view2;

module("TextFieldView",{
  beforeEach: function() {
      SC.RunLoop.begin();
      pane = MainPane.create({
        childViews: [
          TextFieldView.extend({
            hint:'First Name',
            value:'',
            title:'First Name'
          }),
          TextFieldView.extend({
            hint:'Name',
            value:'SproutCore',
            isEnabled: false
          }),
          TextFieldView.extend({
            layerId: 'fieldWithCustomId'
          })
        ]
    });
    pane.append(); // make sure there is a layer...
    SC.RunLoop.end();

    view  = pane.childViews[0];
    view1 = pane.childViews[1];
    view2 = pane.childViews[2];
  },

  afterEach: function() {
      pane.destroy();
      pane = view = null ;
    }
});

test("renders an text field input tag with appropriate attributes", function (assert) {
  assert.equal(view.get('value'), '', 'value should be empty');
  assert.equal(view1.get('value'), 'SproutCore', 'value should not be empty ');
  assert.equal(view.get('isEnabled'),true,'field enabled' );
  assert.equal(view1.get('isEnabled'),false,'field not enabled' );
  var q = Q$('input', view.get('layer'));
  assert.equal(q.attr('type'), 'text', 'should have type as text');
  assert.equal(q.attr('name'), view.get('layerId'), 'should have name as view_layerid');
});

test("renders an text field with a custom layerId with correct id and name html attributes", function (assert) {
  assert.equal(view2.$().attr('id'), 'fieldWithCustomId', 'label html element should have the custom id');
  assert.equal(view2.$input().attr('name'), 'fieldWithCustomId', 'input html element should have the custom name');
});

test("isEnabled=false should add disabled class", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', false);
  SC.RunLoop.end();
  assert.ok(view.$().hasClass('disabled'), 'should have disabled class');
});

test("isEnabled=false isEditable=false should add disabled attribute", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', false);
  view.set('isEditable', false);
  SC.RunLoop.end();
  assert.ok(view.$input().attr('disabled'), 'should have disabled attribute');
  assert.ok(view.$input().attr('readOnly'), 'should have readOnly attribute');
});

test("isEnabled=false isEditable=true should add disabled attribute", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', false);
  view.set('isEditable', true);
  SC.RunLoop.end();
  assert.ok(view.$input().attr('disabled'), 'should have disabled attribute');
  assert.ok(!view.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isEnabled=true isEditable=false should add readOnly attribute", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', true);
  view.set('isEditable', false);
  SC.RunLoop.end();
  assert.ok(!view.$input().attr('disabled'), 'should not have disabled attribute');
  assert.ok(view.$input().attr('readOnly'), 'should have readOnly attribute');
});

test("isEnabled=true isEditable=true should not add disable or readOnly attribute", function (assert) {
  SC.RunLoop.begin();
  view.set('isEnabled', true);
  view.set('isEditable', true);
  SC.RunLoop.end();
  assert.ok(!view.$input().attr('disabled'), 'should not have disabled attribute');
  assert.ok(!view.$input().attr('readOnly'), 'should not have readOnly attribute');
});

test("isBrowserFocusable should set tab index", function (assert) {
  SC.RunLoop.begin();
  view.set('isBrowserFocusable', true);
  SC.RunLoop.end();
  assert.ok(view.$input().attr('tabindex') !== "-1", 'focusable field should not have unfocusable tab index');
  SC.RunLoop.begin();
  view.set('isBrowserFocusable', false);
  SC.RunLoop.end();
  assert.ok(view.$input().attr('tabindex') === "-1", 'unfocusable field should have unfocusable tab index');
});

test("autoCapitalize=AUTOCAPITALIZE_NONE should add autocapitalize='none'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', AUTOCAPITALIZE_NONE);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "none", 'should have an autocapitalize attribute set to "none"');
});

test("autoCapitalize=AUTOCAPITALIZE_SENTENCES should add autocapitalize='sentences'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', AUTOCAPITALIZE_SENTENCES);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "sentences", 'should have an autocapitalize attribute set to "sentences"');
});

test("autoCapitalize=AUTOCAPITALIZE_WORDS should add autocapitalize='words'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', AUTOCAPITALIZE_WORDS);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "words", 'should have an autocapitalize attribute set to "words"');
});

test("autoCapitalize=AUTOCAPITALIZE_CHARACTERS should add autocapitalize='characters'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', AUTOCAPITALIZE_CHARACTERS);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "characters", 'should have an autocapitalize attribute set to "characters"');
});

test("autoCapitalize=true should add autocapitalize='sentences'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', true);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "sentences", 'should have an autocapitalize attribute set to "sentences"');
});

test("autoCapitalize=false should add autocapitalize='none'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', false);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocapitalize') === "none", 'should have an autocapitalize attribute set to "none"');
});

test("autoCapitalize=null should not add autocapitalize", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCapitalize', null);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(!view.$input().attr('autocapitalize'), 'should not have an autocapitalize attribute set');
});

test("autoCorrect=true should add autocorrect='on'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCorrect', true);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocorrect') === "on", 'should have an autocorrect attribute set to "on"');
});

test("autoCorrect=false should add autocorrect='off'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCorrect', false);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocorrect') === "off", 'should have an autocorrect attribute set to "off"');
});

test("autoCorrect=null should not add autocorrect", function (assert) {
  SC.RunLoop.begin();
  view.set('autoCorrect', null);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(!view.$input().attr('autocorrect'), 'should not have an autocorrect attribute set');
});

test("autoComplete=true should add autocomplete='on'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoComplete', true);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocomplete') === "on", 'should have an autocomplete attribute set to "on"');
});

test("autoComplete=false should add autocomplete='off'", function (assert) {
  SC.RunLoop.begin();
  view.set('autoComplete', false);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(view.$input().attr('autocomplete') === "off", 'should have an autocomplete attribute set to "off"');
});

test("autoComplete=null should not add autocomplete", function (assert) {
  SC.RunLoop.begin();
  view.set('autoComplete', null);
  view.displayDidChange();
  SC.RunLoop.end();
  assert.ok(!view.$input().attr('autocomplete'), 'should not have an autocomplete attribute set');
});

/**
 TextFieldView was extended to make use of interpretKeyEvents, which
 allows easy actions to be implemented based off of several key "keys".  This
 test checks that the expected actions are being captured.
 */
test("interpretKeyEvents should allow key command methods to be implemented.", function (assert) {
  var evt,
    layer,
    cancelFlag = false,
    deleteBackwardFlag = false,
    deleteForwardFlag = false,
    insertNewlineFlag = false,
    insertTabFlag = false,
    insertBacktabFlag = false,
    moveLeftFlag = false,
    moveRightFlag = false,
    moveUpFlag = false,
    moveDownFlag = false,
    moveToBeginningOfDocumentFlag = false,
    moveToEndOfDocumentFlag = false,
    pageDownFlag = false,
    pageUpFlag = false;

  view1.cancel = function() { cancelFlag = true; return true; };
  view1.deleteBackward = function() { deleteBackwardFlag = true; return true; };
  view1.deleteForward = function() { deleteForwardFlag = true; return true; };
  view1.insertNewline = function() { insertNewlineFlag = true; return true; };
  view1.insertTab = function() { insertTabFlag = true; return true; };
  view1.insertBacktab = function() { insertBacktabFlag = true; return true; };
  view1.moveLeft = function() { moveLeftFlag = true; return true; };
  view1.moveRight = function() { moveRightFlag = true; return true; };
  view1.moveUp = function() { moveUpFlag = true; return true; };
  view1.moveDown = function() { moveDownFlag = true; return true; };
  view1.moveToBeginningOfDocument = function() { moveToBeginningOfDocumentFlag = true; return true; };
  view1.moveToEndOfDocument = function() { moveToEndOfDocumentFlag = true; return true; };
  view1.pageUp = function() { pageUpFlag = true; return true; };
  view1.pageDown = function() { pageDownFlag = true; return true; };

  SC.RunLoop.begin();
  layer = view1.get('layer');
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_BACKSPACE, keyCode: SCEvent.KEY_BACKSPACE });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_TAB, keyCode: SCEvent.KEY_TAB });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_TAB, keyCode: SCEvent.KEY_TAB, shiftKey: true });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_RETURN, keyCode: SCEvent.KEY_RETURN });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_ESC, keyCode: SCEvent.KEY_ESC });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_LEFT, keyCode: SCEvent.KEY_LEFT });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_UP, keyCode: SCEvent.KEY_UP });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_DOWN, keyCode: SCEvent.KEY_DOWN });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_RIGHT, keyCode: SCEvent.KEY_RIGHT });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_DELETE, keyCode: SCEvent.KEY_DELETE });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_HOME, keyCode: SCEvent.KEY_HOME });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_END, keyCode: SCEvent.KEY_END });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_PAGEUP, keyCode: SCEvent.KEY_PAGEUP });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_PAGEDOWN, keyCode: SCEvent.KEY_PAGEDOWN });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_INSERT, keyCode: SCEvent.KEY_INSERT });
  view1.keyDown(evt);
  SC.RunLoop.end();

  // Test.
  assert.ok(deleteBackwardFlag, 'deleteBackward should have been triggered.');
  assert.ok(insertTabFlag, 'insertTab should have been triggered.');
  assert.ok(insertBacktabFlag, 'insertBacktab should have been triggered.');
  assert.ok(insertNewlineFlag, 'insertNewline should have been triggered.');
  assert.ok(cancelFlag, 'cancel should have been triggered.');
  assert.ok(moveLeftFlag, 'moveLeft should have been triggered.');
  assert.ok(moveUpFlag, 'moveUp should have been triggered.');
  assert.ok(moveDownFlag, 'moveDown should have been triggered.');
  assert.ok(moveRightFlag, 'moveRight should have been triggered.');
  assert.ok(deleteForwardFlag, 'deleteForward should have been triggered.');
  assert.ok(moveToBeginningOfDocumentFlag, 'moveToBeginningOfDocument should have been triggered.');
  assert.ok(moveToEndOfDocumentFlag, 'moveToEndOfDocument should have been triggered.');
  assert.ok(pageUpFlag, 'pageUp should have been triggered.');
  assert.ok(pageDownFlag, 'pageDown should have been triggered.');
});

test("tab should attempt to move focus", function (assert) {
  var nextValidKeyViewFlag = false,
      previousValidKeyViewFlag = false,
      evt,
      layer;

  view1.nextValidKeyView = function() { nextValidKeyViewFlag = true; return null; }.property();
  view1.previousValidKeyView = function() { previousValidKeyViewFlag = true; return null; }.property();

  SC.RunLoop.begin();
  layer = view1.get('layer');
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_TAB, keyCode: SCEvent.KEY_TAB });
  view1.keyDown(evt);
  evt = SCEvent.simulateEvent(layer, 'keydown', { which: SCEvent.KEY_TAB, keyCode: SCEvent.KEY_TAB, shiftKey: true });
  view1.keyDown(evt);
  SC.RunLoop.end();

  assert.ok(nextValidKeyViewFlag, 'nextValidKeyView should have been called.');
  assert.ok(previousValidKeyViewFlag, 'previousValidKeyView should have been called.');
});

// test("isEnabled=false should add disabled attr to input", function() {
//   SC.RunLoop.begin();
//   view1.set('isEnabled', false);
//   SC.RunLoop.end();
//   assert.ok(view1.$input().attr('disabled'), 'should have disabled attr');
//   view1.set('isEditing',true);
//   assert.ok(view1.get('value') === 'SproutCore', 'value cannot be changed');
//   });

