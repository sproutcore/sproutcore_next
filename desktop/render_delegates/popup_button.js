// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";


/**
 * Renders and updates the HTML representation of a popup button.
 */
BaseTheme.popupButtonRenderDelegate = BaseTheme.buttonRenderDelegate.create({
  render: function render (dataSource, context) {
    context.setAttr('aria-haspopup', 'true');
    render.base.apply(this, arguments);
  },

  update: function update(dataSource, jQuery) {
    // sc_super();
    update.base.apply(this, arguments);
  }
});
