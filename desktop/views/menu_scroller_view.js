// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { HUGE_CONTROL_SIZE, LARGE_CONTROL_SIZE, REGULAR_CONTROL_SIZE, SMALL_CONTROL_SIZE, TINY_CONTROL_SIZE } from "../../view/view.js";
import { ScrollerView } from "./scroller.js";


/** @class

  Implements a complete scroller view for menus.  This class implements the
  arrows displayed in a menu to scroll.

  The main difference with ScrollerView is that there is only vertical
  scrollers. Value Syncing between MenuScrollView and MenuScrollerView
  is done using valueBinding.

  @since SproutCore 1.0
*/
export const MenuScrollerView = ScrollerView.extend(
/** @scope MenuScrollerView.prototype */ {

  // ---------------------------------------------------------------------------------------------
  // Properties
  //

  /**
    @type Array
    @default ['sc-menu-scroller-view']
    @see View#classNames
  */
  classNames: ['sc-menu-scroller-view'],

  /**
    Used to set the scrolling direction of the scroller.

    @type Boolean
    @default false
  */
  scrollDown: false,

  /**
     Amount to scroll one vertical line.

     @type Number
     @default 20
  */
  verticalLineScroll: 20,


  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function init () {
    // Set the scrollerThickness based on controlSize
    switch (this.get('controlSize')) {
    case TINY_CONTROL_SIZE:
      this.set('scrollerThickness', MenuScrollerView.TINY_SCROLLER_THICKNESS);
      break;
    case SMALL_CONTROL_SIZE:
      this.set('scrollerThickness', MenuScrollerView.SMALL_SCROLLER_THICKNESS);
      break;
    case REGULAR_CONTROL_SIZE:
      this.set('scrollerThickness', MenuScrollerView.REGULAR_SCROLLER_THICKNESS);
      break;
    case LARGE_CONTROL_SIZE:
      this.set('scrollerThickness', MenuScrollerView.LARGE_SCROLLER_THICKNESS);
      break;
    case HUGE_CONTROL_SIZE:
      this.set('scrollerThickness', MenuScrollerView.HUGE_SCROLLER_THICKNESS);
      break;
    }

    return init.base.apply(this, arguments);
  },

  /** @private */
  render: function (context, firstTime) {
    context.addClass('sc-vertical');
    context.addClass(this.get('controlSize'));
    if (firstTime) {
      var direction = this.get('scrollDown') ? 'arrowDown' : 'arrowUp';
      context.push('<span class="scrollArrow ' + direction + '">&nbsp;</span>');
    }
  },

  /** @private */
  mouseEntered: function (evt) {
    this.set('isMouseOver', true);
    this._invokeScrollOnMouseOver();
  },

  /** @private */
  mouseExited: function (evt) {
    this.set('isMouseOver', false);
  },

  /** @private
    Scroll the menu if it is is an up or down arrow. This is called by
    the function that simulates mouseOver.
  */
  _scrollMenu: function () {
    var value = this.get('value');

    if (this.get('scrollDown')) {
      value = value + this.verticalLineScroll;
      value = Math.min(value, this.get('maximum'));
    } else {
      value = value - this.verticalLineScroll;
      value = Math.max(value, this.get('minimum'));
    }

    this.set('value', value);

    return true;
  },

  /** @private

    We use this function to simulate mouseOver. It checks for the flag
    isMouseOver which is turned on when mouseEntered is called and turned off
    when mouseExited is called.
  */
  _invokeScrollOnMouseOver: function () {
    this._scrollMenu();
    if (this.get('isMouseOver')) {
      this.invokeLater(this._invokeScrollOnMouseOver, 50);
    }
  }

});


/**
  @static
  @type Number
  @default 18
*/
MenuScrollerView.REGULAR_SCROLLER_THICKNESS = 18;

/**
  @static
  @type Number
  @default 10
*/
MenuScrollerView.TINY_SCROLLER_THICKNESS    = 10;

/**
  @static
  @type Number
  @default 14
*/
MenuScrollerView.SMALL_SCROLLER_THICKNESS   = 14;

/**
  @static
  @type Number
  @default 23
*/
MenuScrollerView.LARGE_SCROLLER_THICKNESS   = 23;

/**
  @static
  @type Number
  @default 26
*/
MenuScrollerView.HUGE_SCROLLER_THICKNESS    = 26;
