// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';


/** @class

  Provides common methods for sending events down a responder chain.
  Responder chains are used most often to deliver events to user interface
  elements in your application, but you can also use them to deliver generic
  events to any part of your application, including controllers.

  
  @since SproutCore 1.0
*/
export const Responder = SC.Object.extend( /** @scope Responder.prototype */ {

  isResponder: true,

  /** @property
    The pane this responder belongs to.  This is used to determine where you
    belong to in the responder chain.  Normally you should leave this property
    set to null.
  */
  pane: null,

  /** @property
    The app this responder belongs to.  For non-user-interface responder
    chains, this is used to determine the context.  Usually this
    is the property you will want to work with.
  */
  responderContext: null,

  /** @property
    This is the nextResponder in the responder chain.  If the receiver does
    not implement a particular event handler, it will bubble to the next
    responder.

    This can point to an object directly or it can be a string, in which case
    the path will be resolved from the responderContext root.
  */
  nextResponder: null,

  /** @property
    true if the view is currently first responder.  This property is always
    edited by the pane during its makeFirstResponder() method.
  */
  isFirstResponder: false,

  /** @property

    true the responder is somewhere in the responder chain.  This currently
    only works when used with a ResponderContext.

    @type {Boolean}
  */
  hasFirstResponder: false,

  /** @property
    Set to true if your view is willing to accept first responder status.  This is used when calculating key responder loop.
  */
  acceptsFirstResponder: true,

  becomingFirstResponder: false,

  /**
    Call this method on your view or responder to make it become first
    responder.

    @param {Event} [evt] event that caused this to be invoked. optional because there is not always an event that
                            triggers this to be called, but should be passed if available. will be passed through to
                            the [will|did]LoseKeyResponderTo/[will|did]BecomeKeyResponderFrom callbacks.
    @returns {Responder} receiver
  */
  becomeFirstResponder: function (evt) {
    var pane = this.get('pane') || this.get('responderContext') ||
              this.pane();
    if (pane && this.get('acceptsFirstResponder')) {
      if (pane.get('firstResponder') !== this) {
        pane.makeFirstResponder(this, evt);
      }
    }
    return this;
  },

  /**
    Call this method on your view or responder to resign your first responder
    status. Normally this is not necessary since you will lose first responder
    status automatically when another view becomes first responder.

    @param {Event} the original event that caused this method to be called
    @returns {Responder} receiver
  */
  resignFirstResponder: function (evt) {
    var pane = this.get('pane') || this.get('responderContext');
    if (pane && (pane.get('firstResponder') === this)) {
      pane.makeFirstResponder(null, evt);
    }
    // return true;
    return this;
  },

  /**
    Called just before the responder or any of its subresponder's are about to
    lose their first responder status.  The passed responder is the responder
    that is about to lose its status.

    Override this method to provide any standard teardown when the first
    responder changes.

    @param {Responder} responder the responder that is about to change
    @returns {void}
  */
  willLoseFirstResponder: function (responder) {},

  /**
    Called just after the responder or any of its subresponder's becomes a
    first responder.

    Override this method to provide any standard setup when the first
    responder changes.

    @param {Responder} responder the responder that changed
    @returns {void}
  */
  didBecomeFirstResponder: function (responder) {},

  /** Object.prototype.destroy */
  destroy: function destroy () {
    this.resignFirstResponder();

    // sc_super();
    destroy.base.apply(this, arguments);
  }

});
