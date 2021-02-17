// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2009 Sprout Systems, Inc. and contributors.
//            Portions ©2010-2011 Strobe Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('render_delegates/render_delegate');

import { IMAGE_TYPE_CSS_CLASS, IMAGE_TYPE_URL } from '../../system/constants.js';
import { RenderDelegate } from './render_delegate.js';

/**
  @class
  Renders and updates DOM representations of an image.

  Parameters
  --------------------------
  Expects these properties on the data source:

  - image: An Image object which has completed loading

  If any of these are not present in the data source, the render delegate
  will throw an error.

  Optional Parameters:
  ---------------------------
  If present, these properties will be used.

  - width: Used on the canvas element. If not provided, 0 is used and the canvas
            will not be visible.
  - height: Used on the canvas element. If not provided, 0 is used and the canvas
            will not be visible.
  - scale: If provided, the image will maintain aspect ratio as specified by this
          property. One of
            - SCALE_falseNE
            - FILL
            - BEST_FILL
            - BEST_FIT
            - BEST_FIT_DOWN_ONLY
            - percentage {Number}
          If not provided, FILL will be the default (ie. expected image behaviour)
  - align: If provided, the image will align itself within its frame.  One of
            - ALIGN_CENTER
            - ALIGN_TOP_LEFT
            - ALIGN_TOP
            - ALIGN_TOP_RIGHT
            - ALIGN_RIGHT
            - ALIGN_BOTTOM_RIGHT
            - ALIGN_BOTTOM
            - ALIGN_BOTTOM_LEFT
            - ALIGN_LEFT
  - backgroundColor: If provided, the canvas will render a backgroundColor
*/

export const canvasImageRenderDelegate = RenderDelegate.create({
  className: 'canvasImage',

  /** @private
    We don't have an element yet, so we do the minimal necessary setup
    here.
  */
  render: function (dataSource, context) {
    var width = dataSource.get('width') || 0,
        height = dataSource.get('height') || 0,
        type = dataSource.get('type') || IMAGE_TYPE_URL,
        value = dataSource.get('value');

    // Support for CSS sprites (TODO: Remove this)
    if (value && type === IMAGE_TYPE_CSS_CLASS) {
      context.addClass(value);
      dataSource.renderState._last_class = value;
    }

    context.setAttr('width', width);
    context.setAttr('height', height);
  },

  update: function (dataSource, jquery) {
    var elem = jquery[0],
        image = dataSource.get('image'),
        frame = dataSource.get('frame'),
        frameWidth = frame.width,
        frameHeight = frame.height,
        innerFrame = dataSource.get('innerFrame'),
        backgroundColor = dataSource.get('backgroundColor'),
        renderState = dataSource.get('renderState'),
        context,
        lastClass = dataSource.renderState._last_class,
        type = dataSource.get('type') || IMAGE_TYPE_URL,
        value = dataSource.get('value');

    // Support for CSS sprites
    if (lastClass) jquery.removeClass(lastClass);
    if (value && type === IMAGE_TYPE_CSS_CLASS) {
      jquery.addClass(value);
      dataSource.renderState._last_class = value;

      // Clear the context in case there was a URL previously
      if (elem && elem.getContext) {
        context = elem.getContext('2d');
        context.clearRect(0, 0, frameWidth, frameHeight);
      }
    } else {

      // We only care about specific values, check specifically for what matters
      var innerFrameDidChange = ![innerFrame.x, innerFrame.y, innerFrame.width, innerFrame.height].isEqual(renderState._lastInnerFrameValues),
          elemSizeDidChange = ![elem.width, elem.height].isEqual(renderState._lastElemSizeValues),
          backgroundDidChange = dataSource.didChangeFor('canvasImageRenderDelegate', 'backgroundColor'),
          imageDidChange = dataSource.didChangeFor('canvasImageRenderDelegate', 'image') || (image && image.complete) !== renderState._lastImageComplete;

      if (elemSizeDidChange || innerFrameDidChange || backgroundDidChange || imageDidChange) {

        if (elem && elem.getContext) {
          elem.height = frameHeight;
          elem.width = frameWidth;

          context = elem.getContext('2d');

          context.clearRect(0, 0, frameWidth, frameHeight);

          if (backgroundColor) {
            context.fillStyle = backgroundColor;
            context.fillRect(0, 0, frameWidth, frameHeight);
          }

          if (image && image.complete) {
            context.drawImage(image, Math.floor(innerFrame.x), Math.floor(innerFrame.y), Math.floor(innerFrame.width), Math.floor(innerFrame.height));
          }
        }

        // Update caches
        renderState._lastInnerFrameValues = [innerFrame.x, innerFrame.y, innerFrame.width, innerFrame.height];
        renderState._lastElemSizeValues = [elem.width, elem.height];
        renderState._lastImageComplete = image && image.complete;
      }
    }
  }

});
