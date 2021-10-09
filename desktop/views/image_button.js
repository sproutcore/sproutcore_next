// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { ButtonView } from "./button.js";

/** @class

  Provides a button that displays an image instead of the standard button
  user interface.

  It behaves the same as an ButtonView, but has an image property that
  should be set to a unique class name.

  For example:

      ImageButtonView.create({
        action: 'imageButtonWasClicked',

        image: 'my-image-button-icon'
      });

  You could then add some CSS rule for a normal state:

      #{$theme}.image-button .my-image-button-icon {
        background-image: url('my-image-button-image.png');

        // and an active state:
        &.active {
          background-image: url('my-image-button-image-active.png');
        }
      }

  Note: in addition to using SCSS, you can use normal CSS syntax and sc_static.

  @since SproutCore 1.5
*/
export const ImageButtonView = ButtonView.extend(
/** @scope ImageButtonView.prototype */ {

  /**
    @type Array
    @default ['sc-image-button-view']
    @see View#classNames
  */
  classNames: ['sc-image-button-view'],

  /**
    Unlike ButtonView, ImageButtonView does not have a default theme
    that needs to be applied for backwards compatibility.

    @type String
    @default null
  */
  themeName: null,

  /**
    @type String
    @default 'imageButtonRenderDelegate'
  */
  renderDelegateName: 'imageButtonRenderDelegate',

  /**
    @type Array
    @default ['image']
  */
  displayProperties: ['image'],

  /**
    A class name that will be applied to the img tag of the button.

    @type String
    @default null
  */
  image: null

});
