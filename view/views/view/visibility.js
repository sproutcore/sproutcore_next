// sc_require("views/view");
import { SC } from '../../../core/core.js';

export const visibilitySupport = /** @scope View.prototype */ {

  /**
    Set to true to indicate the view has visibility support added.

    @deprecated Version 1.10
  */
  hasVisibility: true,

  /**
   By default we don't disable the context menu. Overriding this property
   can enable/disable the context menu per view.
  */
  isContextMenuEnabled: function () {
    return SC.getSetting('CONTEXT_MENU_ENABLED');
  }.property(),

};
