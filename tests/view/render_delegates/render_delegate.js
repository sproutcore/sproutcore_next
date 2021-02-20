// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
// ========================================================================
// RenderDelegate Base Tests
// ========================================================================

import { RenderDelegate } from '../../../view/view.js';

module("Render Delegates -- Inheritance");

test("Extending RenderDelegate should include helpers", function (assert) {
  var render_delegate = RenderDelegate.create({ });

  // we'll test to make sure the sizing helper is around.
  assert.ok(render_delegate.addSizeClassName, "Instantiated render delegate has helper method.");
});

test("sc_super works.", function (assert) {

  var tick = 0, base_called_on = -1, derived_called_on = -1;

  var base = RenderDelegate.create({
    aMethod: function() {
      base_called_on = tick;
      tick++;
    }
  });

  var derived = base.create({
    aMethod: function aMethod () {
      derived_called_on = tick;
      tick++;
      // sc_super();
      aMethod.base.apply(this, arguments);
    }
  });

  derived.aMethod();

  assert.equal(derived_called_on, 0, "Derived method called on tick 0");
  assert.equal(base_called_on, 1, "Base called on tick 1");
});

test("Function.prototype.enhance works.", function (assert) {

  var tick = 0, base_called_on = -1, derived_called_on = -1;

  var base = RenderDelegate.create({
    aMethod: function(arg1, arg2) {
      assert.equal(arg1, "ARG2", "First argument is swapped");
      assert.equal(arg2, "ARG1", "Second argument is swapped");


      base_called_on = tick;
      tick++;
    }
  });

  var derived = base.create({
    aMethod: function(orig, arg1, arg2) {
      assert.equal(arg1, "ARG1", "First argument is correct");
      assert.equal(arg2, "ARG2", "Second argument is correct");

      derived_called_on = tick;
      tick++;

      // swap arguments
      orig(arg2, arg1);
    }.enhance()
  });

  derived.aMethod("ARG1", "ARG2");

  assert.equal(derived_called_on, 0, "Derived method called on tick 0");
  assert.equal(base_called_on, 1, "Base called on tick 1");
});

