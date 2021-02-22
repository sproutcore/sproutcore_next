// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { BaseTheme, LAYOUT_HORIZONTAL, LAYOUT_VERTICAL, RenderDelegate } from '../../view/view.js';

BaseTheme.splitRenderDelegate = RenderDelegate.create({
  className: 'split',

  // Returns { SC.LAYOUT_VERTICAL: true/false, SC.LAYOUT_HORIZONTAL: true/false }
  // for use in setClass.
  _classesForDataSource: function(dataSource) {
    var classes = {},
      layoutDirection = dataSource.get('layoutDirection');
    classes[LAYOUT_VERTICAL] = layoutDirection === LAYOUT_VERTICAL;
    classes[LAYOUT_HORIZONTAL] = layoutDirection === LAYOUT_HORIZONTAL;
    return classes;
  },

  render: function(dataSource, context) {
    context.setClass(this._classesForDataSource(dataSource));
  },

  update: function(dataSource, jquery) {
    jquery.setClass(this._classesForDataSource(dataSource));
  }
});
