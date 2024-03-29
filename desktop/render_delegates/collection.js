// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";

// collections don't need their own rendering; however, in future, constants
// like the row height will likely be specified on the render delegate.
BaseTheme.collectionRenderDelegate = RenderDelegate.create({
  className: 'collection',

  render: function(dataSource, context) {
    context.setClass('active', dataSource.get('isActive'));
  },

  update: function(dataSource, jquery) {
    jquery.setClass('active', dataSource.get('isActive'));
  }
});
