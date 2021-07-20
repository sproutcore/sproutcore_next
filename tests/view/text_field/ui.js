// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            portions copyright @2011 Apple Inc.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
/*global module, test, ok, equals, stop, start */

import { SC } from '../../../core/core.js';
import { ControlTestPane } from '../test_support/control_test_pane.js';
import { TextFieldView, TextSelection, View } from '../../../view/view.js';
import { SCEvent, browser } from '../../../event/event.js';
import { Responder, platform, ResponderContext } from '../../../responder/responder.js';

(function () {
  var pane = ControlTestPane.design()
  .add("empty", TextFieldView, {
    hint: "Full Name",
    value: ''
  })

  .add("empty - no hint on focus", TextFieldView, {
    hint: "Full Name",
    hintOnFocus: false,
    value: ''
  })

  .add("with value", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe'
  })

  .add("password", TextFieldView, {
    type: "password",
    value: "I'm so secret"
  })

  .add("password-hint", TextFieldView, {
    hint: "Passwerd",
    type: "password",
    value: "I'm so secret"
  })

  .add("disabled - empty", TextFieldView, {
    hint: "Full Name",
    value: null,
    isEnabled: false,
    isEditable: false
  })

  .add("disabled - with value", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isEnabled: false,
    isEditable: false
  })

  .add("enabled - not editable - with value", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isEnabled: true,
    isEditable: false
  })

  .add("textarea - empty", TextFieldView, {
    hint: "Full Name",
    value: '',
    isTextArea: true
  })

  .add("textarea - with value", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isTextArea: true
  })

  .add("textarea - disabled - empty", TextFieldView, {
    hint: "Full Name",
    value: '',
    isTextArea: true,
    isEnabled: false
  })

  .add("textarea - disabled - with value", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isTextArea: true,
    isEnabled: false
  })


  .add("aria-readonly", TextFieldView, {
    hint: "Full Name",
    value: 'John Doe',
    isTextArea: true,
    isEnabled: true,
    isEditable: false
  });

  // ..........................................................
  // VERIFY STANDARD STATES
  //
  pane.verifyEmpty = function verifyEmpty(view, expectedHint) {
    var input = view.$('input');
    var layer = view.$();

    assert.ok(!layer.hasClass('not-empty'), 'layer should not have not-empty class');

    assert.equal(input.val(), '', 'input should have empty value');

    if (expectedHint) {
      var hint = view.$('.hint');
      if (hint.length === 1) {
        hint = hint.text();
      } else {
        hint = view.$('input');
        hint = hint.attr('placeholder');
      }
      assert.equal(hint, expectedHint, 'hint span should have expected hint');
    }

  };

  pane.verifyNotEmpty = function verifyNotEmpty(view, expectedValue, expectedHint) {
    var input = view.$('input');
    var layer = view.$();

    assert.ok(layer.hasClass('not-empty'), 'layer should have not-empty class');
    assert.equal(input.val(), expectedValue, 'input should have value');

    if (expectedHint) {
      var hint = view.$('.hint');
      if (hint.length === 1) {
        hint = hint.text();
      } else {
        hint = view.$('input');
        hint = hint.attr('placeholder');
      }
      assert.equal(hint, expectedHint, 'hint span should have expected hint');
    }

  };

  pane.verifyDisabled = function verifyDisabled(view, isDisabled) {
    var layer = view.$();
    var input = view.$('input');

    if (isDisabled) {
      assert.ok(layer.hasClass('disabled'), 'layer should have disabled class');
      assert.ok(input.attr('disabled'), 'input should have disabled attr');
    } else {
      assert.ok(!layer.hasClass('disabled'), 'layer should not have disabled class');
      assert.ok(!input.attr('disabled'), 'input should not have disabled attr');
    }
  };

  pane.verifyReadOnly = function verifyReadonly(view, isReadOnly) {
    var input = view.$('input');

    if (isReadOnly) {
      assert.ok(input.attr('readOnly'), 'input should have readOnly attr');
    } else {
      assert.ok(!input.attr('readOnly'), 'input should not have readOnly attr');
    }
  };

  // ..........................................................
  // TEST INITIAL STATES
  //

  module('TextFieldView: Initial States', pane.standardSetup());

  test("empty", function (assert) {
    var view = pane.view('empty');
    pane.verifyEmpty(view, 'Full Name');
    pane.verifyDisabled(view, false);
  });

  test("empty - no hint on focus", function (assert) {
    var view = pane.view('empty - no hint on focus');

    pane.verifyEmpty(view, 'Full Name');
    pane.verifyDisabled(view, false);
  });

  test("with value", function (assert) {
    var view = pane.view('with value');
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
    pane.verifyDisabled(view, false);
  });

  test("password", function (assert) {
    var view = pane.view('password');
    pane.verifyNotEmpty(view, 'I\'m so secret');
    pane.verifyDisabled(view, false);
  });

  test("password with hint", function (assert) {
    var view = pane.view('password-hint');
    pane.verifyNotEmpty(view, 'I\'m so secret', 'Passwerd');
    pane.verifyDisabled(view, false);
  });

  test("disabled - empty", function (assert) {
    var view = pane.view('disabled - empty');
    pane.verifyEmpty(view, 'Full Name');
    pane.verifyDisabled(view, true);
  });

  test("disabled - with value", function (assert) {
    var view = pane.view('disabled - with value');
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
    pane.verifyDisabled(view, true);
  });

  test("enabled - not editable - with value", function (assert) {
    var view = pane.view('enabled - not editable - with value');
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
    pane.verifyReadOnly(view, true);
  });

  test("textarea - empty", function (assert) {
    var view = pane.view('empty');
    pane.verifyEmpty(view, 'Full Name');
    pane.verifyDisabled(view, false);
  });

  test("textarea - with value", function (assert) {
    var view = pane.view('with value');
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
    pane.verifyDisabled(view, false);
  });

  test("textarea - disabled - empty", function (assert) {
    var view = pane.view('disabled - empty');
    pane.verifyEmpty(view, 'Full Name');
    pane.verifyDisabled(view, true);
  });

  test("textarea - disabled - with value", function (assert) {
    var view = pane.view('disabled - with value');
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
    pane.verifyDisabled(view, true);
  });

  // ..........................................................
  // TEST CHANGING VIEWS
  //

  module('TextFieldView: Changing Values', pane.standardSetup());

  test("changing value from empty -> value", function (assert) {
    var view = pane.view('empty');

    // test changing value updates like it should
    SC.run(function () {
      view.set('value', 'John Doe');
    });
    pane.verifyNotEmpty(view, 'John Doe', 'Full Name');
  });

  test("disabling view", function (assert) {
    var view = pane.view('empty');

    // test changing enabled state updates like it should
    SC.run(function () {
      view.set('isEnabled', false);
    });
    pane.verifyDisabled(view, true);
  });

  test("changing value to null", function (assert) {
    var view = pane.view('with value');

    // test changing value updates like it should
    SC.run(function () {
      view.set('value', null);
    });
    assert.equal(view.get('fieldValue'), null, 'should have empty fieldValue');
    pane.verifyEmpty(view, 'Full Name');
  });

  test("enabling disabled view", function (assert) {
    var view = pane.view('disabled - empty');

    // test changing enabled state updates like it should
    SC.run(function () {
      view.set('isEnabled', true);
    });
    pane.verifyDisabled(view, false);
  });

  test("changing isEditable", function (assert) {
    var view = pane.view('enabled - not editable - with value');

    // test changing isEditable state updates like it should
    SC.run(function () {
      view.set('isEditable', true);
    });
    pane.verifyReadOnly(view, false);

    // test changing isEditable state updates like it should
    SC.run(function () {
      view.set('isEditable', false);
    });
    pane.verifyReadOnly(view, true);
  });

  test("changing value from not a textarea to a textarea", function (assert) {
    // test the the Event for 'change' gets wired up properly to the DOM element when it changes from input to textarea
    var view = pane.view('empty');
    SC.run(function () {
      view.set('value', 'Original');
      view.set('isTextArea', true);
    });

    var $textarea = view.$('textarea');

    SCEvent.trigger($textarea, 'focus');

    // simulate typing a letter
    SCEvent.trigger($textarea, 'keydown');
    $textarea.val("My New Value");
    SCEvent.trigger($textarea, 'keyup');
    SCEvent.trigger($textarea, 'change');
    SC.run(function () {
      view.fieldValueDidChange();
    });

    // wait a little bit to let text field propogate changes
    // stop();
    const cb = assert.async();

    setTimeout(function () {
      // start();
      cb();
      assert.equal(view.get("value"), "My New Value", "Event for change should get wired up properly");
    }, 100);

    SC.run(function () {
    });
  });

  /**
    There was a bug that when a text field view has a value before it is appended,
    the hint line-height gets set to 0px. So if the value is removed, the hint is
    in the wrong spot.
    */
  test("When a manual hint is visible, the line-height of the hint should be correct", function (assert) {
    var view1 = pane.view('empty'),
      view2 = pane.view('with value'),
      hint = view1.$('.hint');

    assert.equal(hint.css('line-height'), "14px", "The line-height of the hint of an empty text field should be");

    SC.run(function () {
      view2.set('value', null);
    });

    hint = view2.$('.hint');
    assert.equal(hint.css('line-height'), "14px", "The line-height of the hint of a non-empty text field should be");
  });

  test("Changing maxLength", function (assert) {
    var view = pane.view('with value'),
        input = view.$input();

    assert.equal(input.attr('maxLength'), 5096, 'Max length should begin at')

    SC.run(function () {
      view.set('maxLength', 1234);
    });

    assert.equal(input.attr('maxLength'), 1234, 'Max length should now be');
  });


  if (!browser.isIE && !platform.input.placeholder) {
    test("Changing value to null -- password field", function (assert) {
      var view = pane.view('password-hint'),
          input = view.$('input');

      SC.run(function () {
        view.set('value', null);
      });

      assert.equal(input.attr('type'), 'text', "When nulled out, field was converted to type text");
      assert.equal(input.val(), view.get('hint'), "When nulled out, field was given value equal to hint");
    });
  }

  // ..........................................................
  // TEST SELECTION SUPPORT
  //

  module('TextFieldView: Selection Support', pane.standardSetup());

  test("Setting the selection to a null value should fail", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var thrownException = null;
    try {
      view.set('selection', null);
    } catch (e) {
      thrownException = e.message;
    }
    assert.ok(thrownException.indexOf !== undefined, 'an exception should have been thrown');
    if (thrownException.indexOf !== undefined) {
      assert.ok(thrownException.indexOf('must specify an TextSelection instance') !== -1, 'the exception should be about not specifying an TextSelection instance');
    }
  });

  test("Setting the selection to a non-TextSelection value should fail", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var thrownException = null;
    try {
      view.set('selection', {start: 0, end: 0});
    } catch (e) {
      thrownException = e.message;
    }
    assert.ok(thrownException.indexOf !== undefined, 'an exception should have been thrown');
    if (thrownException.indexOf !== undefined) {
      assert.ok(thrownException.indexOf('must specify an TextSelection instance') !== -1, 'the exception should be about not specifying an TextSelection instance');
    }
  });

  test("Setting and then getting back the selection", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var newSelection = TextSelection.create({start: 2, end: 5});
    view.set('selection', newSelection);

    var fetchedSelection = view.get('selection');
    assert.ok(fetchedSelection.get('start') === 2, 'the selection should start at index 2');
    assert.ok(fetchedSelection.get('end') === 5, 'the selection should end at index 4');
    assert.ok(fetchedSelection.get('length') === 3, 'the selection should have length 3');
  });

  test("Setting no selection direction", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var newSelection = TextSelection.create({ start: 2, end: 5, direction: 'none' });
    view.set('selection', newSelection);

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'none',
        'the selection direction should be none');
  });

  test("Setting forward selection direction", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var newSelection = TextSelection.create({ start: 2, end: 5, direction: 'forward' });
    view.set('selection', newSelection);

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'forward',
        'the selection direction should be forward');
  });

  test("Setting backward selection direction", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    var newSelection = TextSelection.create({ start: 2, end: 5, direction: 'backward' });
    view.set('selection', newSelection);

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'backward',
        'the selection direction should be backward');
  });

  test("Getting forward selection direction", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    fieldElement.setSelectionRange(2, 5, 'forward');

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'forward',
        'the selection direction should be forward');
  });

  test("Getting backward selection direction", function (assert) {
    var view = pane.view('with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();
    fieldElement.size = 10;     // Avoid Firefox 3.5 issue

    fieldElement.setSelectionRange(2, 5, 'backward');

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'backward',
        'the selection direction should be backward');
  });

  test("Setting textarea selection direction", function (assert) {
    var view = pane.view('textarea - with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();

    var newSelection = TextSelection.create({ start: 2, end: 5, direction: 'backward' });
    view.set('selection', newSelection);

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'backward',
        'the selection direction should be backward');
  });

  test("Getting textarea selection direction", function (assert) {
    var view = pane.view('textarea - with value');
    var fieldElement = view.$input()[0];
    fieldElement.focus();

    fieldElement.setSelectionRange(2, 5, 'backward');

    var fetchedSelection = view.get('selection');
    assert.ok(!platform.input.selectionDirection || fetchedSelection.get('direction') === 'backward',
        'the selection direction should be backward');
  });

  // ..........................................................
  // TEST ACCESSORY VIEWS
  //

  module('TextFieldView: Accessory Views', pane.standardSetup());

  test("Adding left accessory view", function (assert) {
    var view = pane.view('with value'),
      accessoryView;

    // test adding accessory view adds the view like it should
    SC.run(function () {
      accessoryView = View.create({
        layout:  { top: 1, left: 2, width: 16, height: 16 }
      });
      view.set('leftAccessoryView', accessoryView);
    });

    assert.ok(view.get('leftAccessoryView') === accessoryView, 'left accessory view should be set to ' + accessoryView.toString());
    assert.ok(view.get('childViews').length === 1, 'there should only be one child view');
    assert.ok(view.get('childViews')[0] === accessoryView, 'first child view should be set to ' + accessoryView.toString());


    // The hint and padding elements should automatically have their 'left'
    // values set to the accessory view's offset + width
    // (18 = 2 left offset + 16 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.left === '18px', 'padding element should get 18px left');

    // Test removing the accessory view.
    SC.run(function () {
      view.set('leftAccessoryView', null);
    });
    assert.ok(view.get('childViews').length === 0, 'after removing the left accessory view there should be no child views left');
    assert.ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
  });

  test("Adding left accessory view changes style -- using design()", function (assert) {
    var view = pane.view('with value');

    // test adding accessory view adds the view like it should
    SC.run(function () {
      var accessoryView = View.design({
        layout:  { top: 1, left: 2, width: 16, height: 16 }
      });
      view.set('leftAccessoryView', accessoryView);
    });

    // The hint and padding elements should automatically have their 'left'
    // values set to the accessory view's offset + width
    // (18 = 2 left offset + 16 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.left === '18px', 'padding element should get 18px left');

    // Test removing the accessory view.
    SC.run(function () {
      view.set('leftAccessoryView', null);
    });
    assert.ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
  });

  test("Adding right accessory view", function (assert) {
    var view = pane.view('with value'),
      accessoryView;

    // test adding accessory view adds the view like it should
    SC.run(function () {
      accessoryView = View.create({
        layout:  { top: 1, right: 3, width: 17, height: 16 }
      });
      view.set('rightAccessoryView', accessoryView);
    });

    assert.ok(view.get('rightAccessoryView') === accessoryView, 'right accessory view should be set to ' + accessoryView.toString());
    assert.ok(view.get('childViews').length === 1, 'there should only be one child view');
    assert.ok(view.get('childViews')[0] === accessoryView, 'first child view should be set to ' + accessoryView.toString());


    // The hint and padding elements should automatically have their 'right'
    // values set to the accessory view's offset + width
    // (20 = 3 right offset + 17 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.right === '20px', 'padding element should get 20px right');


    // If a right accessory view is set with only 'left' (and not 'right')
    // defined in its layout, 'left' should be cleared out and 'right' should
    // be set to 0.
    SC.run(function () {
      accessoryView = View.create({
        layout:  { top: 1, left: 2, width: 16, height: 16 }
      });
      view.set('rightAccessoryView', accessoryView);
    });

    assert.ok(SC.none(view.get('rightAccessoryView').get('layout').left), "right accessory view created with 'left' rather than 'right' in layout should not have a value for layout.left");
    assert.ok(view.get('rightAccessoryView').get('layout').right === 0, "right accessory view created with 'left' rather than 'right' in layout should have layout.right set to 0");


    // Test removing the accessory view.
    SC.run(function () {
      view.set('rightAccessoryView', null);
    });
    assert.ok(view.get('childViews').length === 0, 'after removing the right accessory view there should be no child views left');
    assert.ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
  });

  test("Adding right accessory view changes style -- using design()", function (assert) {
    var view = pane.view('with value');

    // test adding accessory view adds the view like it should
    SC.run(function () {
      var accessoryView = View.design({
        layout:  { top: 1, right: 3, width: 17, height: 16 }
      });
      view.set('rightAccessoryView', accessoryView);
    });

    // The hint and padding elements should automatically have their 'right'
    // values set to the accessory view's offset + width
    // (20 = 3 right offset + 17 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.right === '20px', 'padding element should get 20px right');

    // Test removing the accessory view.
    SC.run(function () {
      view.set('rightAccessoryView', null);
    });
    assert.ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
  });


  test("Adding both left and right accessory views", function (assert) {
    var view = pane.view('with value');

    // test adding accessory view adds the view like it should
    SC.run(function () {
      var leftAccessoryView = View.create({
        layout:  { top: 1, left: 2, width: 16, height: 16 }
      });
      view.set('leftAccessoryView', leftAccessoryView);
      var rightAccessoryView = View.create({
        layout:  { top: 1, right: 3, width: 17, height: 16 }
      });
      view.set('rightAccessoryView', rightAccessoryView);
    });

    assert.ok(view.get('childViews').length === 2, 'we should have two child views since we added both a left and a right accessory view');


    // The hint and padding elements should automatically have their 'left' and
    // 'right' values set to the accessory views' offset + width
    //   *  left:   18 = 2 left offset + 16 width)
    //   *  right:  20 = 3 left offset + 17 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
    assert.ok(paddingElement.style.right === '20px', 'padding element should get 20px right');


    // Test removing the accessory views.
    SC.run(function () {
      view.set('rightAccessoryView', null);
    });
    assert.ok(view.get('childViews').length === 1, 'after removing the right accessory view there should be one child view left (the left accessory view)');
    assert.ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
    SC.run(function () {
      view.set('leftAccessoryView', null);
    });
    assert.ok(view.get('childViews').length === 0, 'after removing both accessory views there should be no child views left');
    assert.ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
  });

  test("Adding both left and right accessory views changes style -- using design()", function (assert) {
    var view = pane.view('with value');

    // test adding accessory view adds the view like it should
    SC.run(function () {
      var leftAccessoryView = View.design({
        layout:  { top: 1, left: 2, width: 16, height: 16 }
      });
      view.set('leftAccessoryView', leftAccessoryView);
      var rightAccessoryView = View.design({
        layout:  { top: 1, right: 3, width: 17, height: 16 }
      });
      view.set('rightAccessoryView', rightAccessoryView);
    });

    // The hint and padding elements should automatically have their 'left' and
    // 'right' values set to the accessory views' offset + width
    //   *  left:   18 = 2 left offset + 16 width)
    //   *  right:  20 = 3 left offset + 17 width)
    var paddingElement = view.$('.padding')[0];
    assert.ok(paddingElement.style.left === '18px', 'padding element should get 18px left');
    assert.ok(paddingElement.style.right === '20px', 'padding element should get 20px right');


    // Test removing the accessory views.
    SC.run(function () {
      view.set('rightAccessoryView', null);
    });
    assert.ok(!paddingElement.style.right, 'after removing the right accessory view the padding element should have no right style');
    SC.run(function () {
      view.set('leftAccessoryView', null);
    });
    assert.ok(!paddingElement.style.left, 'after removing the left accessory view the padding element should have no left style');
  });

  test("Accessory views should only be instantiated once", function (assert) {
    var view = pane.view('with value');
    var leftAccessoryViewInitCount = 0;
    var rightAccessoryViewInitCount = 0;

    // Test the left accessory view
    SC.run(function () {
      var leftAccessoryView = View.design({
        layout:  { top: 1, left: 2, width: 16, height: 16 },
        init: function init () {
          init.base.apply(this, arguments);
          leftAccessoryViewInitCount++;
        }
      });
      view.set('leftAccessoryView', leftAccessoryView);
    });

    // Check it
    assert.equal(leftAccessoryViewInitCount, 1, 'the left accessory view should only be initialized once');

    // Reset to null so it isn't created a second time when rightAccessoryView is set
    SC.run(function () {
      view.set('leftAccessoryView', null);
    });

    // Test the right accessory view
    SC.run(function () {
      var rightAccessoryView = View.design({
        layout:  { top: 1, right: 3, width: 17, height: 16 },
        init: function init () {
          init.base.apply(this, arguments);
          rightAccessoryViewInitCount++;
        }
      });
      view.set('rightAccessoryView', rightAccessoryView);
    });

    // Check it
    assert.equal(rightAccessoryViewInitCount, 1, 'the right accessory view should only be initialized once');
  });


  // ..........................................................
  // TEST EVENTS
  //

  module('TextFieldView: Events', pane.standardSetup());

  test("focus and blurring text field", function (assert) {
    var view = pane.view('empty');
    var input = view.$('input');

    // attempt to focus...
    SCEvent.trigger(input, 'focus');

    // verify editing state changed...
    assert.ok(view.get('isEditing'), 'view.isEditing should be true');
    assert.ok(view.$().hasClass('focus'), 'view layer should have focus class');

    // simulate typing a letter
    SCEvent.trigger(input, 'keydown');
    SCEvent.trigger(input, 'keyup');
    input.val('f');
    SCEvent.trigger(input, 'change');

    // wait a little bit to let text field propagate changes
    // stop();
    const cb = assert.async();

    setTimeout(function () {
      // start();
      cb();

      assert.equal(view.get('value'), 'f', 'view should have new value');
      assert.ok(view.$().hasClass('not-empty'), 'should have not-empty class');

      // attempt to blur...
      SCEvent.trigger(input, 'blur');

      // verify editing state changed...
      assert.ok(!view.get('isEditing'), 'view.isEditing should be false');
      assert.ok(!view.$().hasClass('focus'), 'view layer should NOT have focus class');
    }, 100);

  });

  test("focus and blur an empty text field", function (assert) {
    var view = pane.view('empty');
    var input = view.$('input');

    // verify the field is empty and the hint is properly set
    pane.verifyEmpty(view, 'Full Name');

    // focus and blur the text field
    SCEvent.trigger(input, 'focus');
    SCEvent.trigger(input, 'blur');

    // field should still be still be empty with hint properly set
    pane.verifyEmpty(view, 'Full Name');
  });

  test("losing first responder should blur", function (assert) {
    var view = pane.view('empty');
    var input = view.$('input');
    var testResponder = Responder.create(ResponderContext, {});

    // preliminary setup
    view.get('pane').becomeKeyPane();
    SCEvent.trigger(input, 'focus');

    // verify it did receive focus
    assert.ok(view.get('focused'), 'view should have focus');

    // tell the pane to make our test responder the first responder
    view.get('pane').makeFirstResponder(testResponder);

    // verify it no longer has focus
    assert.ok(!view.get('focused'), 'view should no longer have focus (Warning: this test will fail if the browser window doesn\'t have focus)');
  });

  test("editing a field should not change the cursor position", function (assert) {
    var textField = pane.view('empty');
    var input = textField.$('input');
    input.val('John Doe');
    textField.set('selection', TextSelection.create({start: 2, end: 3}));
    SCEvent.trigger(input, 'change');

    assert.ok(input.val() === 'John Doe', 'input value should be \'John Doe\'');
    var selection = textField.get('selection');
    assert.ok(selection.get('start') == 2 && selection.get('end') == 3, 'cursor position should be unchanged');
  });

})();
