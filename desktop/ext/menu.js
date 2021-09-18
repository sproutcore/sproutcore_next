// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2010 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { propertyFromRenderDelegate } from "../../view/view.js";
import { MenuPane } from "../panes/menu.js";
import { AutoResizingMenuItemView } from "./menu_item.js";



/**
  @class
  Extends MenuPane to add support for automatic resizing.
*/

export const AutoResizingMenuPane = MenuPane.extend(
/** @scope AutoResizingMenuPane.prototype */ {

  /**
    If true, the menu should automatically resize its width to fit its items.

    This will swap out the default MenuItemView. If you are using a custom
    exampleView, you will need to mix AutoResize into your exampleView
    and set shouldAutoResize to false (the actual resizing will be handled
    by MenuPane).

    This property must be set before instantiation; any changes after instantiation
    will not function properly.

    @property
    @type {Boolean}
    @default true
  */
  shouldAutoResize: true,

  /**
    The minimum width for this menu if it is to be automatically resized.

    If no value is specified, it will be determined from the controlSize.

    @type Number
    @default minimumMenuWidth from render delegate, or 0.
  */
  minimumMenuWidth: propertyFromRenderDelegate('minimumMenuWidth', 0),

  /**
    The amount to add to any calculated width.

    If no value is specified, it will be determined from the controlSize.

    @type Number
    @default menuWidthPadding from render delegate, or 0
  */
  menuWidthPadding: propertyFromRenderDelegate('menuWidthPadding', 0),

  /**
    The view class to use when creating new menu item views.

    The menu pane will automatically create an instance of the view class you
    set here for each item in the `items` array. You may provide your own
    subclass for this property to display the customized content.

    @type View
    @default AutoResizingMenuItemView
  */
  exampleView: AutoResizingMenuItemView,

  /**
    @private
    In addition to the normal init, we need to schedule an automatic resize.
  */
  init: function init () {
    init.base.apply(this, arguments);

    if (this.get('shouldAutoResize')) {
      this.invokeOnce('_updateMenuWidth');
    }
  },

  /**
    The array of child menu item views that compose the menu.

    This computed property parses @displayItems@ and constructs an MenuItemView (or whatever class you have set as the @exampleView@) for every item.

    @property
    
    @readOnly
    @private
  */
  createMenuItemViews: function cmiv () {
    // EXTENDED to set shouldMeasureSize to its initial value and to
    // observe the measured size.
    var views = cmiv.base.apply(this,arguments);

    var idx, len = views.length, view;
    if (this.get('shouldAutoResize')) {
      for (idx = 0; idx < len; idx++) {
        view = views[idx];

        // set up resizing if we want
        view.set('shouldMeasureSize', true);
        view.addObserver('measuredSize', this, this._menuItemMeasuredSizeDidChange);
      }
    }

    return views;
  },

  _menuItemViewsDidChange: function() {
    if (this.get('shouldAutoResize')) this.invokeOnce('_updateMenuWidth');
  }.observes('menuItemViews'),

  _menuItemMeasuredSizeDidChange: function(menuItem) {
    this.invokeOnce('_updateMenuWidth');
  },

  _menuMinimumMenuWidthDidChange: function() {
    this.invokeOnce('_updateMenuWidth');
  }.observes('minimumMenuWidth'),

  _updateMenuWidth: function() {
    var menuItemViews = this.get('menuItemViews');
    if (!menuItemViews) return;

    var len = menuItemViews.length, idx, view,
        width = this.get('minimumMenuWidth');

    for (idx = 0; idx < len; idx++) {
      view = menuItemViews[idx];
      width = Math.max(width, view.get('measuredSize').width + this.get('menuWidthPadding'));
    }


    this.adjust({ 'width': width, height: this.get('menuHeight') });
    this.positionPane();
  }
});
