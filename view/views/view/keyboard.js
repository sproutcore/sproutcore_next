// sc_require("views/view");

import { SC } from '../../../core/core.js';
import { BASE_KEY_BINDINGS, MODIFIED_KEY_BINDINGS } from "../../../responder/responder.js";

export const keyboardSupport = /** @scope View.prototype */ {
  // ..........................................................
  // KEY RESPONDER
  //

  /** @property
    true if the view is currently first responder and the pane the view belongs
    to is also key pane.  While this property is set, you should expect to
    receive keyboard events.
  */
  isKeyResponder: false,

  /**
    This method is invoked just before you lost the key responder status.
    The passed view is the view that is about to gain keyResponder status.
    This gives you a chance to do any early setup. Remember that you can
    gain/lose key responder status either because another view in the same
    pane is becoming first responder or because another pane is about to
    become key.

    @param {Responder} responder
  */
  willLoseKeyResponderTo: function(responder, evt) {},

  /**
    This method is invoked just before you become the key responder.  The
    passed view is the view that is about to lose keyResponder status.  You
    can use this to do any setup before the view changes.
    Remember that you can gain/lose key responder status either because
    another view in the same pane is becoming first responder or because
    another pane is about to become key.

    @param {Responder} responder
  */
  willBecomeKeyResponderFrom: function(responder, evt) {},

  /**
    Invokved just after the responder loses key responder status.
    @param {Responder} responder
  */
  didLoseKeyResponderTo: function(responder, evt) {},

  /**
    Invoked just after the responder gains key responder status.
    By default, it calls focus on the view root element. For accessibility
    purposes.

    @param {Responder} responder
  */
  didBecomeKeyResponderFrom: function(responder, evt) {},

  /**
    This method will process a key input event, attempting to convert it to
    an appropriate action method and sending it up the responder chain.  The
    event is converted using the key bindings hashes, (BASE_KEY_BINDINGS
    and MODIFIED_KEY_BINDINGS) which map key events to method names. If
    no key binding method is found, then the key event will be passed along
    to any insertText() method found.

    @param {Event} event
    @returns {Object} object that handled event, if any
  */
  interpretKeyEvents: function(event) {
    var codes = event.commandCodes(),
        cmd = codes[0],
        chr = codes[1],
        ret,
        match,
        methodName,
        target,
        pane,
        handler;

    if (!cmd && !chr) { return null ; } //nothing to do.

    // if this is a command key, try to do something about it.
    if (cmd) {
      match = cmd.match(/[^_]+$/);
      methodName = MODIFIED_KEY_BINDINGS[cmd];
      if (!methodName && match && match.length > 0) {
        methodName = BASE_KEY_BINDINGS[match[0]];
      }
      if (methodName) {
        target = this;
        pane = this.get('pane');
        handler = null;
        while(target && !(handler = target.tryToPerform(methodName, event))){
          target = (target===pane)? null: target.get('nextResponder') ;
        }
        return handler ;
      }
    }

    if (chr && this.respondsTo('insertText')) {
      // if we haven't returned yet and there is plain text, then do an insert
      // of the text.  Since this is not an action, do not send it up the
      // responder chain.
      ret = this.insertText(chr, event);
      return ret ? (ret===true ? this : ret) : null ; // map true|false => this|nil
    }

    return null ; //nothing to do.
  },

  /**
    This method is invoked by interpretKeyEvents() when you receive a key
    event matching some plain text.  You can use this to actually insert the
    text into your application, if needed.

    @param {Event} event
    @returns {Object} receiver or object that handled event
  */
  insertText: function(chr) {
    return false ;
  },

  /**
    Recursively travels down the view hierarchy looking for a view that
    implements the key equivalent (returning to true to indicate it handled
    the event).  You can override this method to handle specific key
    equivalents yourself.

    The keystring is a string description of the key combination pressed.
    The evt is the event itself. If you handle the equivalent, return true.
    Otherwise, you should just return sc_super.

    @param {String} keystring
    @param {Event} evt
    @returns {Boolean}
  */
  performKeyEquivalent: function(keystring, evt) {
    var ret = false,
        childViews = this.get('childViews'),
        len = childViews.length,
        idx = -1, view ;
    while (!ret && (++idx < len)) {
      view = childViews[idx];

      ret = view.tryToPerform('performKeyEquivalent', keystring, evt);
    }

    return ret ;
  },

  /**
    The first child of this view for the purposes of tab ordering. If not
    provided, the first element of childViews is used. Override this if
    your view displays its child views in an order different from that
    given in childViews.

    @type View
    @default null
  */
  firstKeyView: null,

  /**
    @private

    Actually calculates the firstKeyView as described in firstKeyView.

    @returns {View}
  */
  _getFirstKeyView: function() {
    // if first was given, just return it
    var firstKeyView = this.get('firstKeyView');
    if(firstKeyView) return firstKeyView;

    // otherwise return the first childView
    var childViews = this.get('childViews');
    if(childViews) return childViews[0];
  },

  /**
    The last child of this view for the purposes of tab ordering. If not set, can be generated two different ways:
    1. If firstKeyView is provided, it will be generated by starting from firstKeyView and traversing the childViews nextKeyView properties.
    2. If firstKeyView is not provided, it will simply return the last element of childViews.

    The first way is not very efficient, so if you provide firstKeyView you should also provide lastKeyView.

    @type View
    @default null
  */
  lastKeyView: null,

  /**
    @private

    Actually calculates the lastKeyView as described in lastKeyView.

    @returns {View}
  */
  _getLastKeyView: function() {
    // if last was given, just return it
    var lastKeyView = this.get('lastKeyView');
    if(lastKeyView) return lastKeyView;

    var view,
    prev = this.get('firstKeyView');

    // if first was given but not last, build by starting from first and
    // traversing until we hit the end. this is obviously the least efficient
    // way
    if(prev) {
      while(view = prev._getNextKeyView()) {
        prev = view;
      }

      return prev;
    }

    // if neither was given, it's more efficient to just return the last
    // childView
    else {
      var childViews = this.get('childViews');

      if(childViews) return childViews[childViews.length - 1];
    }
  },

  /**
    Optionally points to the next key view that should gain focus when tabbing
    through an interface.  If this is not set, then the next key view will
    be set automatically to the next sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a firstKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets nextKeyView should also set previousKeyView.

    @type View
    @default null
  */

  nextKeyView: undefined,

  /**
    @private

    Gets the next key view by checking if the user set it and otherwise just
    getting the next by index in childViews.

    @return {View}
  */
  _getNextKeyView: function() {
    var pv = this.get('parentView'),
    nextKeyView = this.get('nextKeyView');

    // if the parent defines lastKeyView, it takes priority over this views
    // nextKeyView
    if(pv && pv.get('lastKeyView') === this) return null;

    // if this view defines a nextKeyView, use it
    if(nextKeyView !== undefined) return nextKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) + 1];
    }
  },

  /**
    Computes the next valid key view. This is the next key view that
    acceptsFirstResponder. Computed using depth first search. If the current view
    is not valid, it will first traverse its children before trying siblings. If
    the current view is the only valid view, the current view will be returned. Will
    return null if no valid view can be found.

    @property
    @type View
  */
  nextValidKeyView: function() {
    var cur = this, next;
    while(next !== this) {
      next = null;

      // only bother to check children if we are visible
      if(cur.get('isVisibleInWindow')) next = cur._getFirstKeyView();

      // if we have no children, check our sibling
      if(!next) next = cur._getNextKeyView();

      // if we have no children or siblings, unroll up closest parent that has a
      // next sibling
      if(!next) {
        while(cur = cur.get('parentView')) {
          if(next = cur._getNextKeyView()) break;
        }
      }

      // if no parents have a next sibling, start over from the beginning
      if(!next) {
        if(!SC.getSetting('TABBING_ONLY_INSIDE_DOCUMENT')) break;
        else next = this.get('pane');
      }

      // if it's a valid firstResponder, we're done!
      if(next.get('isVisibleInWindow') && next.get('acceptsFirstResponder')) {
        return next;
      }
      // otherwise keep looking
      cur = next;
    }
    // this will only happen if no views are visible and accept first responder
    return null;
  }.property('nextKeyView'),

  /**
    Optionally points to the previous key view that should gain focus when tabbing
    through an interface.  If this is not set, then the previous key view will
    be set automatically to the previous sibling as defined by its parent's
    childViews property.

    If any views define this, all of their siblings should define it as well,
    otherwise undefined behavior may occur. Their parent view should also define
    a lastKeyView.

    This may also be set to a view that is not a sibling, but once again all
    views in the chain must define it or undefined behavior will occur.

    Likewise, any view that sets previousKeyView should also set nextKeyView.

    @type View
    @default null
  */
  previousKeyView: undefined,

  /**
    @private

    Gets the previous key view by checking if the user set it and otherwise just
    getting the previous by index in childViews.

    @return {View}
  */
  _getPreviousKeyView: function() {
    var pv = this.get('parentView'),
    previousKeyView = this.get('previousKeyView');

    // if the parent defines firstKeyView, it takes priority over this views
    // previousKeyView
    if(pv && pv.get('firstKeyView') === this) return null;

    // if this view defines a previousKeyView, use it
    if(previousKeyView !== undefined) return previousKeyView;

    // otherwise generate one based on parent view's childViews
    if(pv) {
      var childViews = pv.get('childViews');
      return childViews[childViews.indexOf(this) - 1];
    }
  },

  /**
    Computes the previous valid key view. This is the previous key view that
    acceptsFirstResponder. Traverse views in the opposite order from
    nextValidKeyView. If the current view is the pane, tries deepest child. If the
    current view has a previous view, tries its last child. If this view is the
    first child, tries the parent. Will return null if no valid view can be
    found.

    @property
    @type View
  */
  // TODO: clean this up
  previousValidKeyView: function() {
    var cur = this, prev;

    while(prev !== this) {
      // normally, just try to get previous view's last child
      if(cur.get('parentView')) prev = cur._getPreviousKeyView();

      // if we are the pane and address bar tabbing is enabled, trigger it now
      else if(!SC.getSetting('TABBING_ONLY_INSIDE_DOCUMENT')) break;

      // if we are the pane, get our own last child
      else prev = cur;

      // loop down to the last valid child
      if(prev) {
        do {
          cur = prev;
          prev = prev._getLastKeyView();
        } while(prev && prev.get('isVisibleInWindow'));

        // if we ended on a null, unroll to the last one
        // we don't unroll if we ended on a hidden view because we need
        // to traverse to its previous view next iteration
        if(!prev) prev = cur;
      }

      // if there is no previous view, traverse to the parent
      else prev = cur.get('parentView');

      // if the view is valid, return it
      if(prev.get('isVisibleInWindow') && prev.get('acceptsFirstResponder')) return prev;

      // otherwise, try to find its previous valid keyview
      cur = prev;
    }

    // if none of the views accept first responder and we make it back to where
    // we started, just return null
    return null;
  }.property('previousKeyView')
};
