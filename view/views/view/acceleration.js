// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require("views/view");
// sc_require("views/view/layout");
// sc_require("views/view/layout_style");

import { platform } from '../../../responder/responder.js';

export const accelerationSupport = {

  /**
    Setting wantsAcceleratedLayer to true will use transforms to move the
    layer when available. On some platforms transforms are hardware accelerated.
  */
  wantsAcceleratedLayer: false,

  /**
    Specifies whether transforms can be used to move the layer.
  */
  hasAcceleratedLayer: function () {
    return (platform.supportsCSSTransforms && this.get('wantsAcceleratedLayer') && this.get('isFixedLayout'));
  }.property('wantsAcceleratedLayer', 'isFixedLayout').cacheable()

};
