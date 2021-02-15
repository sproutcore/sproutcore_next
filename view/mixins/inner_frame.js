// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


import { SC } from '../../core/core.js';
import { ALIGN_BOTTOM, ALIGN_BOTTOM_LEFT, ALIGN_BOTTOM_RIGHT, ALIGN_CENTER, ALIGN_LEFT, ALIGN_MIDDLE, ALIGN_RIGHT, ALIGN_TOP, ALIGN_TOP_LEFT, ALIGN_TOP_RIGHT, BEST_FILL, BEST_FIT, BEST_FIT_DOWN_ONLY, FILL, SCALE_NONE } from "../system/constants.js";



/**
  @namespace

  InnerFrame provides the innerFrameForSize function, which will return a frame for the given size adjusted
  to fit within the given outer size, according to the align and scale properties.

  View's that render images will find this mixin particularly useful for fitting their images.
 */
export const InnerFrame = {

  /**
    Align the shape within its frame. Possible values:

      - ALIGN_TOP_LEFT
      - ALIGN_TOP
      - ALIGN_TOP_RIGHT
      - ALIGN_LEFT
      - ALIGN_CENTER
      - ALIGN_RIGHT
      - ALIGN_BOTTOM_LEFT
      - ALIGN_BOTTOM
      - ALIGN_BOTTOM_RIGHT

    @type String
    @default ALIGN_CENTER
  */
  align: ALIGN_CENTER,

  /**
    Returns a frame (x, y, width, height) fitting the source size (sourceWidth & sourceHeight) within the
    destination size (destWidth & destHeight) according to the align and scale properties.  This is essential to
    positioning child views or elements within parent views or elements in elegant ways.

    @param {Number} sourceWidth
    @param {Number} sourceHeight
    @param {Number} destWidth
    @param {Number} destHeight
    @returns {Object} the inner frame with properties: {x: value, y: value, width: value, height: value }
  */
  innerFrameForSize: function(sourceWidth, sourceHeight, destWidth, destHeight) {
    var align = this.get('align'),
        scale = this.get('scale'),
        scaleX,
        scaleY,
        result;

    // Fast path
    result = { x: 0, y: 0, width: destWidth, height: destHeight };
    if (scale === FILL) return result;

    // Determine the appropriate scale
    scaleX = destWidth / sourceWidth;
    scaleY = destHeight / sourceHeight;

    switch (scale) {
      case BEST_FILL:
        scale = scaleX > scaleY ? scaleX : scaleY;
        break;
      case BEST_FIT:
        scale = scaleX < scaleY ? scaleX : scaleY;
        break;
      case BEST_FIT_DOWN_ONLY:
        if ((sourceWidth > destWidth) || (sourceHeight > destHeight)) {
          scale = scaleX < scaleY ? scaleX : scaleY;
        } else {
          scale = 1.0;
        }
        break;
      case SCALE_NONE:
        scale = 1.0;
        break;
      default: // Number
        if (isNaN(parseFloat(scale)) || (parseFloat(scale) <= 0)) {
          SC.Logger.warn("InnerFrame: The scale '%@' was not understood.  Scale must be one of FILL, BEST_FILL, BEST_FIT, BEST_FIT_DOWN_ONLY or a positive number greater than 0.00.".fmt(scale));

          // Don't attempt to scale or offset the image
          return result;
        }
    }

    sourceWidth *= scale;
    sourceHeight *= scale;
    result.width = Math.round(sourceWidth);
    result.height = Math.round(sourceHeight);

    // Align the image within its frame
    switch (align) {
      case ALIGN_LEFT:
        result.x = 0;
        result.y = (destHeight / 2) - (sourceHeight / 2);
        break;
      case ALIGN_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = (destHeight / 2) - (sourceHeight / 2);
        break;
      case ALIGN_TOP:
        result.x = (destWidth / 2) - (sourceWidth / 2);
        result.y = 0;
        break;
      case ALIGN_BOTTOM:
        result.x = (destWidth / 2) - (sourceWidth / 2);
        result.y = destHeight - sourceHeight;
        break;
      case ALIGN_TOP_LEFT:
        result.x = 0;
        result.y = 0;
        break;
      case ALIGN_TOP_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = 0;
        break;
      case ALIGN_BOTTOM_LEFT:
        result.x = 0;
        result.y = destHeight - sourceHeight;
        break;
      case ALIGN_BOTTOM_RIGHT:
        result.x = destWidth - sourceWidth;
        result.y = destHeight - sourceHeight;
        break;
      default: // ALIGN_CENTER || ALIGN_MIDDLE
        //@if(debug)
        if (align !== ALIGN_CENTER && align !== ALIGN_MIDDLE) {
          SC.Logger.warn("InnerFrame: The align '%@' was not understood.  Align must be one of ALIGN_CENTER/ALIGN_MIDDLE, ALIGN_LEFT, ALIGN_RIGHT, ALIGN_TOP, ALIGN_BOTTOM, ALIGN_TOP_LEFT, ALIGN_TOP_RIGHT, ALIGN_BOTTOM_LEFT or ALIGN_BOTTOM_RIGHT.".fmt(align));
        }
        //@endif
        result.x = (destWidth / 2) - (sourceWidth / 2);
        result.y = (destHeight / 2) - (sourceHeight / 2);
    }

    return result;
  },

  /**
    Determines how the shape will scale to fit within its containing space. Possible values:

      - SCALE_falseNE
      - FILL
      - BEST_FILL
      - BEST_FIT
      - BEST_FIT_DOWN_ONLY

    @type String
    @default FILL
  */
  scale: FILL
};
