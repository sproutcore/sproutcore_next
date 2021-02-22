// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { TOGGLE_BEHAVIOR } from "../system/constants.js";
import { ButtonView } from "./button.js";

/**
  @class
  
  Disclosure triangle button. As a subclass of ButtonView, this view
  takes a lot of the same properties as a button:
  
    - isEnabled: whether disclosure triangle is clickable or not
    - value: `true` or `false` (where `true` implies expanded/open)
  
  A disclosure view also supports expanding and collapsing via
  the keyboard.
  
  
  @since SproutCore 1.0
*/
export const DisclosureView = ButtonView.extend(
/** @scope DisclosureView.prototype */ {
  
  /**
    @type Array
    @default ['sc-disclosure-view']
    @see View#classNames
  */
  classNames: ['sc-disclosure-view'],

  /**
    @type String
    @default 'disclosureRenderDelegate'
  */
  renderDelegateName: 'disclosureRenderDelegate',

  /**
    @type String
    @default TOGGLE_BEHAVIOR
    @see ButtonView#buttonBehavior
  */
  buttonBehavior: TOGGLE_BEHAVIOR,
  
  /**
    This is the value that will be set when the disclosure triangle is toggled
    open.
    
    @type Boolean
    @default true
  */
  toggleOnValue: true,
  
  /**
    The value that will be set when the disclosure triangle is toggled closed.
    
    @type Boolean
    @default true
  */
  toggleOffValue: false,
  
  /** @private */
  valueBindingDefault: SC.Binding.bool(),

  /** @private

    Allows toggling of the value with the right and left arrow keys.
    Extends the behavior inherited from ButtonView.
    @param evt
  */
  keyDown: function keyDown (evt) {
    if (evt.which === 37 || evt.which === 38) {
      this.set('value', this.get('toggleOffValue')) ;
      return true;
    }

    if (evt.which === 39 || evt.which === 40) {
      this.set('value', this.get('toggleOnValue')) ;
      return true;
    }
    // sc_super();
    keyDown.base.apply(this, arguments);
  }

});
