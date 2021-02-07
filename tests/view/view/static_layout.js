// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { View } from '../../../view/view.js';


module("View - Static Layout functionality");

test("Static layout", function (assert) {
  var view = View.create({
    useStaticLayout: true
  });

  view.createLayer();

  assert.ok(view.$().is('.sc-static-layout'), "views with useStaticLayout get the sc-static-layout class");
});
