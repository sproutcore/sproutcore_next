// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";

/**
  @class
  Renders and updates the DOM representation of a SelectView.
*/
BaseTheme.selectRenderDelegate = BaseTheme.buttonRenderDelegate.create({
  menuLeftOffset: -3,
  menuTopOffset: 2,
  menuMinimumWidthOffset: -18
});
