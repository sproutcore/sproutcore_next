// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { Pane } from './pane.js';


/** @class

  Most SproutCore applications have a main pane, which dominates the
  application page.  You can extend from this view to implement your own main
  pane.  This class will automatically make itself main whenever you append it
  to a document, removing any other main pane that might be currently in
  place.  If you do have another already focused as the keyPane, this view
  will also make itself key automatically.  The default way to use the main
  pane is to simply add it to your page like this:

      MainPane.create().append();

  This will cause your root view to display.  The default layout for a
  MainPane is to cover the entire document window and to resize with the
  window.

  @since SproutCore 1.0
*/
export const MainPane = Pane.extend({
  /** @private */
  layout: { minHeight: 200, minWidth: 200 },

  /**
    Called when the pane is attached.  Takes on main pane status.
   */
  didAppendToDocument: function () {
    var responder = this.rootResponder;

    responder.makeMainPane(this);
    this.becomeKeyPane();

    // Update the body overflow on attach.
    this.setBodyOverflowIfNeeded();
  },

  /**
    Called when the pane is detached.  Resigns main pane status.
  */
  willRemoveFromDocument: function () {
    var responder = this.rootResponder;

    // Stop controlling the body overflow on detach.
    this.unsetBodyOverflowIfNeeded();

    responder.makeMainPane(null);
    this.resignKeyPane();
  },

  /** @private The 'updatedLayout' event. */
  _updatedLayout: function updatedLayout () {
    updatedLayout.base.apply(this, arguments);

    // If by chance the minHeight or minWidth changed we would need to alter the body overflow request.
    this.setBodyOverflowIfNeeded();
  },

  /** @private */
  acceptsKeyPane: true,

  /** @private */
  classNames: ['sc-main']
});
