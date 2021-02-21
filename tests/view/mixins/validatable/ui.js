// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/*global module test htmlbody ok equals same stop start */

import { SC } from '../../../../core/core.js';
import { View, Validatable, InlineEditable  } from '../../../../view/view.js';
import { ControlTestPane } from '../../test_support/control_test_pane.js';

(function() {
  var pane = ControlTestPane.design()
  .add("with valid value", View.extend(Validatable), {
    value: SC.Object.create({ data: 'here is some data' })
  })

  .add("with error value", View.extend(Validatable), {
    value: SC.Error.create({ errorValue: 'bad data', message: 'Input is bad' })
  });

pane.verifyInvalid = function(view, isInvalid) {
  var layer = view.$();
  if (isInvalid) {
    assert.ok(layer.hasClass('invalid'), 'layer should have invalid class');
  }
  else {
    assert.ok(!layer.hasClass('invalid'), 'layer should not have invalid class');
  }
};


// ..........................................................
// TEST INITIAL STATES
//

module('Validatable ui', pane.standardSetup());

test("with valid value", function (assert) {
  var view = pane.view('with valid value');
  pane.verifyInvalid(view, false);
});

test("with invalid value", function (assert) {
  var view = pane.view('with error value');
  pane.verifyInvalid(view, true);
});


// ..........................................................
// TEST CHANGING VIEWS
//

test("changing from invalid to valid", function (assert) {
  var view = pane.view('with error value');

  SC.RunLoop.begin();
  view.set('value', 'not an Error instance');
  SC.RunLoop.end();

  pane.verifyInvalid(view, false);
});

test("changing from valid to invalid", function (assert) {
  var view = pane.view('with valid value');

  SC.RunLoop.begin();
  view.set('value', SC.Error.create());
  SC.RunLoop.end();

  pane.verifyInvalid(view, true);
});

})();
