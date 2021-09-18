// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";

BaseTheme.workspaceRenderDelegate = RenderDelegate.create({
  className: 'workspace',
  
  render: function() {
    // No DOM to generate -- uses CSS3 to style.
  },

  update: function() {
    // No DOM to generate -- uses CSS3 to style.
  }
});