// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { MenuPane } from '../panes/menu.js';
import { ButtonView } from './button.js';

/**
 * @class
 * @version 1.6
 * @author Alex Iskander
 */
export const PopupButtonView = ButtonView.extend({
  /** @scope PopupButtonView.prototype */

  /**
    @type Array
    @default ['sc-popup-button-view']
    @see View#classNames
  */
  classNames: ['sc-popup-button-view'],

  /**
    The render delegate to use to render and update the HTML for the PopupButton.

    @type String
    @default 'popupButtonRenderDelegate'
  */
  renderDelegateName: 'popupButtonRenderDelegate',

  /**
    The menu that will pop up when this button is clicked. This can be a class or
    an instance.

    @type {MenuPane}
    @default MenuPane
  */
  menu: MenuPane,

  /**
    If true, a menu instantiation task will be placed in SproutCore's
    `backgroundTaskQueue` so the menu will be instantiated before
    the user taps the button, improving response time.

    @type Boolean
    @default false
    @property
  */
  shouldLoadInBackground: false,

  /**
   * @private
   * If true, the menu has been instantiated; if false, the 'menu' property
   * still has a class instead of an instance.
  */
  _menuIsLoaded: false,

  /** @private
    isActive is false, but when the menu is instantiated, it is bound to the menu's isVisibleInWindow property.
  */
  isActive: false,

  acceptsFirstResponder: true,


  /**
    @private
  */
  init: function init() {
    init.base.apply(this, arguments);

    // keep track of the current instantiated menu separately from
    // our property. This allows us to destroy it when the property
    // changes, and to track if the property change was initiated by
    // us (since we set `menu` to the instantiated menu).
    this._currentMenu = null;
    this.invokeOnce('scheduleMenuSetupIfNeeded');
  },

  /**
    Adds menu instantiation to the background task queue if the menu
    is not already instantiated and if shouldLoadInBackground is true.

    @method
    @private
   */
  scheduleMenuSetupIfNeeded: function() {
    var menu = this.get('menu');

    if (menu && menu.isClass && this.get('shouldLoadInBackground')) {
      SC.backgroundTaskQueue.push(PopupButtonView.InstantiateMenuTask.create({ popupButton: this }));
    }
  },

  /** @private if the menu changes, it must be set up again. */
  menuDidChange: function() {
    // first, check if we are the ones who changed the property
    // by setting it to the instantiated menu
    var menu = this.get('menu');
    if (menu === this._currentMenu) {
      return;
    }

    this.invokeOnce('scheduleMenuSetupIfNeeded');
  }.observes('menu'),

  /**
   Instantiates the menu if it exists and is not already instantiated.
   If another menu is already instantiated, it will be destroyed.
  */
  setupMenu: function() {
    var menu = this.get('menu');

    // handle our existing menu, if any
    if (menu === this._currentMenu) { return; }
    if (this._currentMenu) {
      this.isActiveBinding.disconnect();

      this._currentMenu.destroy();
      this._currentMenu = null;
    }

    // do not do anything if there is nothing to do.
    if (menu && menu.isClass) {
      menu = this.createMenu(menu);
    }

    this._currentMenu = menu;
    this.set('menu', menu);

    this.isActiveBinding = this.bind('isActive', menu, 'isVisibleInWindow');
  },

  /**
    Called to instantiate a menu. You can override this to set properties
    such as the menu's width or the currently selected item.

    @param {MenuPane} menu The MenuPane class to instantiate.
  */
  createMenu: function(menu) {
    return menu.create();
  },


  /**
    Shows the PopupButton's menu. You can call this to show it manually.

    NOTE: The menu will not be shown until the end of the Run Loop.
  */
  showMenu: function() {
    // problem: menu's bindings may not flush
    this.setupMenu();

    // solution: pop up the menu later. Ugly-ish, but not too bad:
    this.invokeLast('_showMenu');
  },

  /**
    Hides the PopupButton's menu if it is currently showing.
  */
  hideMenu: function() {
    var menu = this.get('menu');
    if (menu && !menu.isClass) {
      menu.remove();
    }
  },

  /**
    The prefer matrix (positioning information) to use to pop up the new menu.

    @property
    @type Array
    @default null
  */
  menuPreferMatrix: null,

  /**
    @private
    The actual showing of the menu is delayed because bindings may need
    to flush.
  */
  _showMenu: function() {
    var menu = this.get('menu');

    if (menu) menu.popup(this, this.get('menuPreferMatrix'));
  },

  /** @private */
  mouseDown: function(evt) {
    // If disabled, handle mouse down but ignore it.
    if (!this.get('isEnabled')) return true ;

    this.set('_mouseDown', true);

    this.showMenu();

    this._mouseDownTimestamp = null;

    // Some nutty stuff going on here. If the number of menu items is large, and
    // it takes over 400 ms to create, then invokeLater will not return control
    // to the browser, thereby causing the menu pane to dismiss itself
    // instantly. Using setTimeout will guarantee that control goes back to the
    // browser.
    var self = this;

    // there is a bit of a race condition: we could get mouse up immediately.
    // In that case, we will take note that the timestamp is 0 and treat it
    // as if it were Date.now() at the time of checking.
    self._mouseDownTimestamp = 0;

    setTimeout(function() {
      self._mouseDownTimestamp = Date.now();
    }, 1);

    this.becomeFirstResponder();

    return true;
  },

  /** @private */
  mouseUp: function(evt) {
    var menu = this.get('menu'), targetMenuItem, success;

    if (menu && this.get('_mouseDown')) {
      targetMenuItem = menu.getPath('rootMenu.targetMenuItem');

      // normalize the mouseDownTimestamp: it may not have been set yet.
      if (this._mouseDownTimestamp === 0) {
        this._mouseDownTimestamp = Date.now();
      }

      // If the user waits more than 400ms between mouseDown and mouseUp,
      // we can assume that they are clicking and dragging to the menu item,
      // and we should close the menu if they mouseup anywhere not inside
      // the menu.
      if(evt.timeStamp - this._mouseDownTimestamp > 400) {
        if (targetMenuItem && menu.get('mouseHasEntered') && this._mouseDownTimestamp) {
          // Have the menu item perform its action.
          // If the menu returns false, it had no action to
          // perform, so we should close the menu immediately.
          if (!targetMenuItem.performAction()) {
            menu.remove();
          }
        }

        else {
          menu.remove();
        }
      }
    }

    this._mouseDownTimestamp = undefined;
    return true;
  },

  /**
    @private

    Shows the menu when the user presses Enter. Otherwise, hands it off to button
    to decide what to do.
  */
  keyDown: function kd (event) {
    if (event.which == 13) {
      this.showMenu();
      return true;
    }

    return kd.base.apply(this,arguments);
  },

  /** @private */
  touchStart: function(evt) {
    return this.mouseDown(evt);
  },

  /** @private */
  touchEnd: function(evt) {
    return this.mouseUp(evt);
  }
});

/**
  @class

  An Task that handles instantiating a PopupButtonView's menu. It is used
  by PopupButtonView to instantiate the menu in the backgroundTaskQueue.
*/
PopupButtonView.InstantiateMenuTask = SC.Task.extend(
  /**@scope PopupButtonView.InstantiateMenuTask.prototype */ {

  /**
    The popupButton whose menu should be instantiated.

    @property
    @type {PopupButtonView}
    @default null
  */
  popupButton: null,

  /** Instantiates the menu. */
  run: function(queue) {
    var isDestroyed = this.popupButton.get('isDestroyed');
    if (!isDestroyed) this.popupButton.setupMenu();
  }
});
