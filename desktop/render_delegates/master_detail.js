// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";
import { platform } from '../../responder/responder.js'

/**
  Border between the two panes of the MasterDetail.

  Note that the border does *NOT* include any space on the sides. Space
  on left or right sides of MasterDetail, if any, should be handled by
  its layout.
 */
BaseTheme.MASTER_DETAIL_DIVIDER_WIDTH = 1;

BaseTheme.masterDetailRenderDelegate = RenderDelegate.create({
  className: 'master-detail',
  dividerWidth: 1,
  
  render: function(dataSource, context) {
    context.setClass('round-toolbars', platform.touch);
  },
  
  update: function(dataSource, jquery) {
    jquery.setClass('round-toolbars', platform.touch);    
  }
  
});
