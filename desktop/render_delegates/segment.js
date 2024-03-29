// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme, LAYOUT_HORIZONTAL } from "../../view/view.js";

/**
  Renders and updates the HTML representation of a segment child view within
  SegmentedView.
*/
BaseTheme.segmentRenderDelegate = RenderDelegate.create({
  className: 'segment',

  render: function (dataSource, context) {
    var theme = dataSource.get('theme'),
        buttonDelegate,
        classes;

    // Segment specific additions
    classes = {
      'sc-first-segment': dataSource.get('isFirstSegment'),
      'sc-middle-segment': dataSource.get('isMiddleSegment'),
      'sc-last-segment': dataSource.get('isLastSegment'),
      'sc-overflow-segment': dataSource.get('isOverflowSegment'),
      'vertical': dataSource.get('layoutDirection') !== LAYOUT_HORIZONTAL
    };

    if (!SC.none(dataSource.get('index'))) classes['sc-segment-' + dataSource.get('index')] = true;
    context.setClass(classes);

    // Use the ButtonView render delegate for the current theme to render the segment as a button
    buttonDelegate = theme.buttonRenderDelegate;
    buttonDelegate.render(dataSource, context);
  },

  update: function (dataSource, jquery) {
    var theme = dataSource.get('theme'),
        buttonDelegate,
        classes = {};

    // Segment specific additions
    classes = {
      'sc-first-segment': dataSource.get('isFirstSegment'),
      'sc-middle-segment': dataSource.get('isMiddleSegment'),
      'sc-last-segment': dataSource.get('isLastSegment'),
      'sc-overflow-segment': dataSource.get('isOverflowSegment') || false,
      'vertical': dataSource.get('layoutDirection') !== LAYOUT_HORIZONTAL
    };
    if (!SC.none(dataSource.get('index'))) classes['sc-segment-' + dataSource.get('index')] = true;
    jquery.setClass(classes);

    // Use the ButtonView render delegate for the current theme to update the segment as a button
    buttonDelegate = theme.buttonRenderDelegate;
    buttonDelegate.update(dataSource, jquery);
  }

});
