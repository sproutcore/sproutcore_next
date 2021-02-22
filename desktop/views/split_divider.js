// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('mixins/split_child');
// sc_require('mixins/split_thumb');

import { LAYOUT_HORIZONTAL, propertyFromRenderDelegate, View } from '../../view/view.js';
import { SplitChild } from '../mixins/split_child.js';
import { SplitThumb } from '../mixins/split_thumb.js';
import { MOVES_CHILD } from '../system/constants.js';

/**
  @class

  A SplitDividerView sits between any two other views in a SplitView.
  The SplitDivider mixes in SplitThumb to allow the user to drag
  it around. The dragging process will cause SplitView to adjust
  other children as needed.

  
  @author Alex Iskander
*/
export const SplitDividerView = View.extend(SplitChild, SplitThumb,
/** @scope SplitDividerView.prototype */ {

  /** @private */
  classNames: ['sc-split-divider-view'],

  /** @private */
  classNameBindings: ['layoutDirection'],
  
  /**
    Walks like a duck. Used and maintained by SplitView to keep track
    of which of its childViews are dividers.

    @type Boolean
  */
  isSplitDivider: true,

  /**
    The layout direction of the parent SplitView. May be LAYOUT_VERTICAL
    or LAYOUT_HORIZONTAL. This property is also added as a class on this
    view.
    
    You generally will not set this property yourself; it is managed by the
    parent SplitView.

    @type String
    @default LAYOUT_HORIZONTAL
   */
  layoutDirection: LAYOUT_HORIZONTAL,

  /** @private
    This indicates that the view should not resize while being dragged; this
    is generally the desired behavior.

    (NOTE: FIXED_SIZE is hard-coded here. It is defined on SplitView,
    which requires this file.)
   */
  autoResizeStyle: 'sc-fixed-size',

  movesSibling: MOVES_CHILD,
  
  size: propertyFromRenderDelegate('dividerSize', 10),

  renderDelegateName: 'splitDividerRenderDelegate'
});
