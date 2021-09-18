// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { View } from '../../view/view.js';
import { CoreQuery } from '../../event/event.js';
import { RootResponder, platform } from '../../responder/responder.js';
import { ResponderContext } from '../../responder/mixins/responder_context.js';  // importing it separately prevents use before declaration errors
import { bodyOverflowArbitrator } from './body_overflow.js';
import { browser } from '../../event/event.js';



/** @class
  A Pane is like a regular view except that it does not need to live within a
  parent view.  You usually use a Pane to form the root of a view hierarchy in
  your application, such as your main application view or for floating
  palettes, popups, menus, etc.

  Usually you will not work directly with the Pane class, but with one of
  its subclasses such as MainPane, Panel, or PopupPane.

  ## Showing a Pane

  To make a pane visible, you need to add it to your HTML document.  The
  simplest way to do this is to call the append() method:

      myPane = Pane.create();
      myPane.append(); // adds the pane to the document

  This will insert your pane into the end of your HTML document body, causing
  it to display on screen.  It will also register your pane with the
  RootResponder for the document so you can start to receive keyboard,
  mouse, and touch events.

  If you need more specific control for where you pane appears in the
  document, you can use several other insertion methods such as appendTo(),
  prependTo(), before() and after().  These methods all take a an element to
  indicate where in your HTML document you would like you pane to be inserted.

  Once a pane is inserted into the document, it will be sized and positioned
  according to the layout you have specified.  It will then automatically
  resize with the window if needed, relaying resize notifications to children
  as well.

  ## Hiding a Pane

  When you are finished with a pane, you can hide the pane by calling the
  remove() method.  This method will actually remove the Pane from the
  document body, as well as deregistering it from the RootResponder so that it
  no longer receives events.

  The isVisibleInWindow method will also change to false for the Pane and all of
  its childViews and the views will no longer have their updateDisplay methods
  called.

  You can readd a pane to the document again any time in the future by using
  any of the insertion methods defined in the previous section.

  ## Receiving Events

  Your pane and its child views will automatically receive any mouse or touch
  events as long as it is on the screen.  To receive keyboard events, however,
  you must focus the keyboard on your pane by calling makeKeyPane() on the
  pane itself.  This will cause the RootResponder to route keyboard events to
  your pane.  The pane, in turn, will route those events to its current
  keyView, if there is any.

  Note that all Views (anything that implements ClassicResponder,
  really) will be notified when it is about or gain or lose keyboard focus.
  These notifications are sent both when the view is made keyView of a
  particular pane and when the pane is made keyPane for the entire
  application.

  You can prevent your Pane from becoming key by setting the acceptsKeyPane
  to false on the pane.  This is useful when creating palettes and other popups
  that should not steal keyboard control from another view.

  @since SproutCore 1.0
*/
export const Pane = View.extend(ResponderContext,
/** @scope Pane.prototype */ {

  // -----------------------------------------------------------------------------------------------
  // Properties
  //

  /**
    If true, this pane can become the key pane.  You may want to set this to false
    for certain types of panes.  For example, a palette may never want to
    become key.  The default value is true.

    @type Boolean
  */
  acceptsKeyPane: true,

  /** @private */
  classNames: ['sc-pane'],

  /*
    Last known window size.

    @type Rect
  */
  currentWindowSize: null,

  /*
    The first responder.  This is the first view that should receive action
    events.  Whenever you click on a view, it will usually become
    firstResponder.

    @property {Responder}
  */
  firstResponder: null,

  /**
    Returns true if wantsTouchIntercept and this is a touch platform.
  */
  hasTouchIntercept: function (){
    return this.get('wantsTouchIntercept') && platform.touch;
  }.property('wantsTouchIntercept').cacheable(),

  /**
    This is set to true when your pane is currently the target of key events.

    @type Boolean
  */
  isKeyPane: false,

  /**
    Returns true whenever the pane has been set as the main pane for the
    application.

    @type Boolean
  */
  isMainPane: false,

  /**
    Returns true for easy detection of when you reached the pane.
    @type Boolean
  */
  isPane: true,

  /**
    Pane's never have a next responder.

    @property {Responder}
    @readOnly
  */
  nextResponder: function() {
    return null;
  }.property().cacheable(),

  /**
    Set to the current page when the pane is instantiated from a page object.
    @property {Page}
  */
  page: null,

  /**
    The rootResponder for this pane.  Whenever you add a pane to a document,
    this property will be set to the rootResponder that is now forwarding
    events to the pane.

    @property {Responder}
  */
  rootResponder: null,

  /**
    The amount over the pane's z-index that the touch intercept should be.
  */
  touchZ: 99,

  /**
    If true, a touch intercept pane will be added above this pane when on
    touch platforms.
  */
  wantsTouchIntercept: false,

  /**
    The Z-Index of the pane. Currently, you have to match this in CSS.
    TODO: ALLOW THIS TO AUTOMATICALLY SET THE Z-INDEX OF THE PANE (as an option).
    ACTUAL TODO: Remove this because z-index is evil.
  */
  zIndex: 0,

  // -----------------------------------------------------------------------------------------------
  // Methods
  //

  /** @private */
  _executeDoAttach: function executeDoAttach () {
    // hook into root responder
    var responder = (this.rootResponder = RootResponder.responder);
    responder.panes.add(this);

    // Update the currentWindowSize cache.
    this.set('currentWindowSize', responder.currentWindowSize);

    // Set the initial design mode.  The responder will update this if it changes.
    this.updateDesignMode(this.get('designMode'), responder.get('currentDesignMode'));

    executeDoAttach.base.apply(this, arguments);

    // Legacy?
    this.recomputeDependentProperties();

    // handle intercept if needed
    this._sc_addIntercept();

    // If the layout is flexible (dependent on the window size), then the view
    // will resize when appended.
    if (!this.get('isFixedSize')) {
      // We call viewDidResize so that it calls parentViewDidResize on all child views.
      this.viewDidResize();
    }
  },

  /** @private */
  _executeDoDetach: function executeDoDetach () {
    executeDoDetach.base.apply(this, arguments);

    // remove intercept
    this._sc_removeIntercept();

    // remove the pane
    var rootResponder = this.rootResponder;
    rootResponder.panes.remove(this);
    this.rootResponder = null;
  },

  /** @private */
  _sc_addIntercept: function () {
    if (this.get('hasTouchIntercept')) {
      var div = document.createElement("div");
      var divStyle = div.style;
      divStyle.position = "absolute";
      divStyle.left = "0px";
      divStyle.top = "0px";
      divStyle.right = "0px";
      divStyle.bottom = "0px";
      divStyle[browser.experimentalStyleNameFor('transform')] = "translateZ(0px)";
      divStyle.zIndex = this.get("zIndex") + this.get("touchZ");
      div.className = "touch-intercept";
      div.id = "touch-intercept-" + guidFor(this);
      this._touchIntercept = div;
      document.body.appendChild(div);
    }
  },

  /** @private Method forwards status changes in a generic way. */
  _sc_forwardKeyChange: function (shouldForward, methodName, pane, isKey) {
    var keyView, responder, newKeyView;
    if (shouldForward && (responder = this.get('firstResponder'))) {
      newKeyView = (pane) ? pane.get('firstResponder') : null ;
      keyView = this.get('firstResponder') ;
      if (keyView && keyView[methodName]) { keyView[methodName](newKeyView); }

      if ((isKey !== undefined) && responder) {
        responder.set('isKeyResponder', isKey);
      }
    }
  },

  /** @private */
  _sc_removeIntercept: function () {
    if (this._touchIntercept) {
      document.body.removeChild(this._touchIntercept);
      this._touchIntercept = null;
    }
  },

  /**
    Inserts the pane at the end of the document.  This will also add the pane
    to the rootResponder.

    @param {RootResponder} rootResponder
    @returns {Pane} receiver
  */
  append: function () {
    return this.appendTo(document.body) ;
  },

  /**
    Inserts the pane into the DOM.

    @param {DOMElement|CoreQuery|String} elem the element to append the pane's layer to.
      This is passed to `CoreQuery()`, so any value supported by `CoreQuery()` will work.
    @returns {Pane} receiver
  */
  appendTo: function (elem) {
    var self = this;

    return this.insert(function () {
      self._doAttach(CoreQuery(elem)[0]);
    });
  },

  /**
    Make the pane receive key events.  Until you call this method, the
    keyView set for this pane will not receive key events.

    @returns {Pane} receiver
  */
  becomeKeyPane: function () {
    if (this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(this) ;

    return this ;
  },

  /**
    Invoked when the view is about to lose its mainPane status.  The default
    implementation will also remove the pane from the document since you can't
    have more than one mainPane in the document at a time.

    @param {Pane} pane
    @returns {void}
  */
  blurMainTo: function (pane) {
    this.set('isMainPane', false) ;
  },

  /**
    Invoked when the the pane is about to lose its focused pane status.
    Override to implement your own custom handling

    @param {Pane} pane the pane that will receive focus next
    @returns {void}
  */
  blurTo: function (pane) {},

  /**
    The parent dimensions are always the last known window size.

    @returns {Rect} current window size
  */
  computeParentDimensions: function computeParentDimensions (frame) {
    if (this.get('designer') && SC.getSetting('suppressMain')) { return computeParentDimensions.base.apply(this, arguments); }

    var wDim = {x: 0, y: 0, width: 1000, height: 1000},
        layout = this.get('layout');

    // There used to be a whole bunch of code right here to calculate
    // based first on a stored window size, then on root responder, then
    // from document... but a) it is incorrect because we don't care about
    // the window size, but instead, the clientWidth/Height of the body, and
    // b) the performance benefits are not worth complicating the code that much.
    if (document && document.body) {
      wDim.width = document.body.clientWidth;
      wDim.height = document.body.clientHeight;

      // IE7 is the only browser which reports clientHeight _including_ scrollbar.
      if (SC.browser.name === SC.BROWSER.ie &&
          SC.browser.compare(SC.browser.version, "7") === 0) {

        var scrollbarSize = platform.get('scrollbarSize');
        if (document.body.scrollWidth > wDim.width) {
          wDim.width -= scrollbarSize;
        }
        if (document.body.scrollHeight > wDim.height) {
          wDim.height -= scrollbarSize;
        }
      }
    }

    // If there is a minWidth or minHeight set on the pane, take that
    // into account when calculating dimensions.

    if (layout.minHeight || layout.minWidth) {
      if (layout.minHeight) {
        wDim.height = Math.max(wDim.height, layout.minHeight);
      }
      if (layout.minWidth) {
        wDim.width = Math.max(wDim.width, layout.minWidth);
      }
    }
    return wDim;
  },

  /**
    Called just after the keyPane focus has changed to the receiver.  Notifies
    the keyView of its new status.  The keyView should use this method to
    update its display and actually set focus on itself at the browser level
    if needed.

    @param {Pane} pane
    @returns {Pane} receiver

  */
  didBecomeKeyPaneFrom: function (pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', true);
    this._sc_forwardKeyChange(!isKeyPane, 'didBecomeKeyResponderFrom', pane, true);
    return this ;
  },

  didBecomeKeyResponderFrom: function (responder, evt) {},

  /**
    Called just after the pane has lost its keyPane status.  Notifies the
    current keyView of the change.  The keyView can use this method to do any
    final cleanup and changes its own display value if needed.

    @param {Pane} pane
    @returns {Pane} receiver
  */
  didLoseKeyPaneTo: function (pane) {
    var isKeyPane = this.get('isKeyPane');
    this.set('isKeyPane', false);
    this._sc_forwardKeyChange(isKeyPane, 'didLoseKeyResponderTo', pane);
    return this ;
  },

  /**
    Invoked when the pane is about to become the focused pane.  Override to
    implement your own custom handling.

    @param {Pane} pane the pane that currently have focus
    @returns {void}
  */
  focusFrom: function (pane) {},

  /**
    Invokes when the view is about to become the new mainPane.  The default
    implementation simply updates the isMainPane property.  In your subclass,
    you should make sure your pane has been added to the document before
    trying to make it the mainPane.  See MainPane for more information.

    @param {Pane} pane
    @returns {void}
  */
  focusMainFrom: function (pane) {
    this.set('isMainPane', true);
  },

  /** @private */
  hideTouchIntercept: function () {
    if (this._touchIntercept) this._touchIntercept.style.display = "none";
  },

  /** @private */
  init: function init () {
    // Backwards compatibility
    //@if(debug)
    // TODO: REMOVE THIS
    if (this.hasTouchIntercept === true) {
      SC.error("Developer Error: Do not set `hasTouchIntercept` on a pane directly. Please use `wantsTouchIntercept` instead.");
    }
    //@endif

    // if a layer was set manually then we will just attach to existing HTML.
    var hasLayer = !!this.get('layer');

    init.base.apply(this, arguments);

    if (hasLayer) {
      this._attached();
    }
  },

  /**
    Inserts the current pane into the page. The actual DOM insertion is done
    by a function passed into `insert`, which receives the layer as a
    parameter. This function is responsible for making sure a layer exists,
    is not already attached.

        pane = Pane.create();
        pane.insert(function (layer) {
          CoreQuery(layer).insertBefore("#otherElement");
        });

    @param {Function} fn function which performs the actual DOM manipulation
      necessary in order to insert the pane's layer into the DOM.
    @returns {Pane} receiver
   */
  insert: function (fn) {
    // Render the layer.
    this.createLayer();

    // Pass the layer to the callback (TODO: why?)
    var layer = this.get('layer');
    fn(layer);

    return this;
  },

  /*
    If the user presses the tab key and the pane does not have a first responder, try to give it to
    the next eligible responder.

    If the keyDown event reaches the pane, we can assume that no responders in the responder chain,
    nor the default responder, handled the event.
  */
  keyDown: function (evt) {
    var nextValidKeyView;

    // When the Tab key is pressed and we don't have first responder, we assign the first responder.
    // Note, once a first responder is set, it will be responsible to handle the Tab key, including
    // passing it to the next/previous valid key view.
    if (evt.keyCode === 9 && !this.get('firstResponder')) {
      // Cycle forwards by default, backwards if the shift key is held.
      if (evt.shiftKey) {
        nextValidKeyView = this.get('previousValidKeyView');
      } else {
        nextValidKeyView = this.get('nextValidKeyView');
      }

      if (nextValidKeyView) {
        this.makeFirstResponder(nextValidKeyView, evt);

        return true;
      } else if (!SC.getSetting('TABBING_ONLY_INSIDE_DOCUMENT')) {
        evt.allowDefault();
      }
    }

    return false;
  },

  /**
    Makes the passed view (or any object that implements Responder) into
    the new firstResponder for this pane.  This will cause the current first
    responder to lose its responder status and possibly keyResponder status as
    well.

    @param {View} view
    @param {Event} evt that cause this to become first responder
    @returns {Pane} receiver
  */
  makeFirstResponder: function (view, evt) {
    // firstResponder should never be null
    if (!view) view = this;

    var current = this.get('firstResponder'),
        isKeyPane = this.get('isKeyPane');

    if (current === view) return this; // nothing to do

    // if we are currently key pane, then notify key views of change also
    if (isKeyPane) {
      if (current) { current.tryToPerform('willLoseKeyResponderTo', view, evt); }
      if (view) {
        view.tryToPerform('willBecomeKeyResponderFrom', current, evt);
      }
    }

    if (current) {
      current.beginPropertyChanges();
      current.set('isKeyResponder', false);
    }

    if (view) {
      view.beginPropertyChanges();
      view.set('isKeyResponder', isKeyPane);
    }

    // Run normal makeFirstResponder code.
    ResponderContext.makeFirstResponder.apply(this, [view, evt]);

    if (current) current.endPropertyChanges();
    if (view) view.endPropertyChanges();

    // and notify again if needed.
    if (isKeyPane) {
      if (view) {
        view.tryToPerform('didBecomeKeyResponderFrom', current, evt);
      }
      if (current) {
        current.tryToPerform('didLoseKeyResponderTo', view, evt);
      }
    }

    return this ;
  },


  /* View.prototype.performKeyEquivalent
    When the user presses a key-combination event, this will be called so you
    can run the command.

    @param charCode {String} the character code
    @param evt {Event} the keydown event
    @returns {Boolean} true if you handled the method; false otherwise
  */
  performKeyEquivalent: function performKeyEquivalent (keystring, evt) {
    var ret = performKeyEquivalent.base.apply(this, arguments); // try normal view behavior first

    if (!ret) {
      var defaultResponder = this.get('defaultResponder') ;
      if (defaultResponder) {
        // try default responder's own performKeyEquivalent method,
        // if it has one...
        if (defaultResponder.performKeyEquivalent) {
          ret = defaultResponder.performKeyEquivalent(keystring, evt) ;
        }

        // even if it does have one, if it doesn't handle the event, give
        // methodName-style key equivalent handling a try
        if (!ret && defaultResponder.tryToPerform) {
          ret = defaultResponder.tryToPerform(keystring, evt) ;
        }
      }
    }
    return ret ;
  },

  /**
    Inserts the pane's layer as the first child of the passed element.

    @param {DOMElement|CoreQuery|String} elem the element to prepend the pane's layer to.
      This is passed to `CoreQuery()`, so any value supported by `CoreQuery()` will work.
    @returns {Pane} receiver
  */
  prependTo: function (elem) {
    var self = this;

    return this.insert(function () {
      var el = CoreQuery(elem)[0];
      self._doAttach(el, el.firstChild);
    });
  },

  /**
    This method is called after the pane is attached and before child views
    are notified that they were appended to the document. Override this
    method to recompute properties that depend on the pane's existence
    in the document but must be run prior to child view notification.
   */
  recomputeDependentProperties: function () {
    // Does nothing.  Left here so that subclasses that implement the method
    // and call recomputeDependentProperties.base.apply(this, arguments) won't fail.
  },

  /**
    Removes the pane from the document.

    This will *not* destroy the pane's layer or destroy the pane itself.

    @returns {Pane} receiver
  */
  remove: function () {
    if (this.get('isAttached')) {
      this._doDetach();
    }

    return this ;
  },

  /**
    This method has no effect in the pane.  Instead use remove().

    @returns {void}
  */
  removeFromParent: function () {
    //@if(debug)
    throw("Developer Error: Pane cannot be removed from a parent, since it has none. Did you mean `remove()`?");
    //@endif
  },

  /**
    Remove the pane view status from the pane.  This will simply set the
    keyPane on the rootResponder to null.

    @returns {Pane} receiver
  */
  resignKeyPane: function () {
    if (!this.get('isKeyPane')) return this ;
    if (this.rootResponder) this.rootResponder.makeKeyPane(null);

    return this ;
  },

  /**
    Attempts to send the specified event up the responder chain for this pane. This
    method is used by the RootResponder to correctly delegate mouse, touch and keyboard
    events. You can also use it to send your own events to the pane's responders, though
    you will usually not do this.

    A responder chain is a linked list of responders - mostly views - which are each
    sequentially given an opportunity to handle the event. The responder chain begins with
    the event's `target` view, and proceeds up the chain of parentViews (via the customizable
    nextResponder property) until it reaches the pane and its defaultResponder. You can
    specify the `target` responder; by default, it is the pane's current `firstResponder`
    (see View keyboard event documentation for more on the first responder).

    Beginning with the target, each responder is given the chance to handle the named event.
    In order to handle an event, a responder must implement a method with the name of the
    event. For example, to handle the mouseDown event, expose a `mouseDown` method. If a
    responder handles a method, then the event will stop bubbling up the responder chain.
    (If your responder exposes a handler method but you do not always want to handle that
    method, you can signal that the method should continue bubbling up the responder chain by
    returning false from your handler.)

    In some rare cases, you may want to only alert part of the responder chain. For example,
    ScrollView uses this to capture a touch to give the user a moment to begin scrolling
    on otherwise-tappable controls. To accomplish this, pass a view (or responder) as the
    `untilResponder` argument. If the responder chain includes this view, it will break the
    chain there and not proceed. (Note that the `untilResponder` object will not be given a
    chance to respond to the event.)

    @param {String} action The name of the event (i.e. the method name) to invoke.
    @param {Event} [evt] The event object.
    @param {Responder} [responder] The first responder in the chain to check. If not specified, then the pane's currently designated `firstResponder` will be used instead.
    @param {Responder} [untilResponder] If specified, the responder chain will break when this object is reached preventing it and subsequent responders in the chain from receiving the event.
    @returns {Responder} The responder that handled the event
  */
  sendEvent: function (action, evt, responder, untilResponder) {

    // Walk up our own responder chain looking for a responder to handle the event.
    // If no responder is given, use our designated first responder or fallback to ourself.
    if (!responder) {
      responder = this.get('firstResponder') || this;
    }

    // Cycle through all responders in our chain...
    while (responder) {

      // ...unless we've reached the until responder, at which point, we have to give up.
      if (responder === untilResponder) {
        responder = null;

        break;

      // ... or unless we've reached ourself, at which point we do a couple more attempts and stop looking.
      } else if (responder === this) {
        var defaultResponder = this.get('defaultResponder');

        // If no responder was found in the responder chain, try a default responder (if set).
        if (defaultResponder) {
          // Coerce String default responders to actual Objects.
          if (typeof defaultResponder === SC.T_STRING) {
            defaultResponder = SC.objectForPropertyPath(defaultResponder);
          }

          responder = defaultResponder.tryToPerform(action, evt) ? defaultResponder : null;
        }

        // Finally, if the default responder was missing or failed, try ourself.
        if (responder === null || responder !== defaultResponder) {
          responder = this.tryToPerform(action, evt) ? this : null;
        }

        break;

      // Try the responder.
      } else {

        if (action === 'touchStart') {
          // first, we must check that the target is not already touch responder
          // if it is, we don't want to have "found" it; that kind of recursion is sure to
          // cause really severe and odd bugs.
          if (evt.touchResponder === responder) {
            responder = null;
            break;
          }

          // now, only pass along if the target does not already have any touches, or is
          // capable of accepting multitouch.
          if (!responder.get("hasTouch") || responder.get("acceptsMultitouch")) {
            // The responder implemented the action, we're done.
            if (responder.tryToPerform("touchStart", evt)) break;
          }
        } else if (action === 'touchEnd' && !responder.get("acceptsMultitouch")) {
          if (!responder.get("hasTouch")) {
            // The responder implemented the action, we're done.
            if (responder.tryToPerform("touchEnd", evt)) break;
          }
        } else {
          // The responder implemented the action, we're done.
          if (responder.tryToPerform(action, evt)) break;
        }

        // Nothing was implemented, get the next responder in the chain.
        responder = responder.get('nextResponder');
      }
    }

    return responder;
  },

  /**
    Changes the body overflow according to whether minWidth or minHeight
    are present in the layout hash. If there are no minimums, nothing
    is done unless true is passed as the first argument. If so, then
    overflow:hidden; will be used.

    It's possible to call this manually and pass true to remove overflow
    if setting layout to a hash without minWidth and minHeight, but it's
    probably not a good idea to do so unless you're doing it from the main
    pane. There's only one body tag, after all, and if this is called from
    multiple different panes, the panes could fight over whether it gets
    an overflow if care isn't taken!

    @param {Boolean} [force=false] force a style to be set even if there are no minimums.
    @returns {void}
  */
  setBodyOverflowIfNeeded: function (force) {
    //Code to get rid of Lion rubberbanding.
    var layout = this.get('layout'),
        size = this.get('currentWindowSize');

    if (!layout || !size || !size.width || !size.height) return;

    var minW = layout.minWidth,
      minH = layout.minHeight;

    if (force === true || minW || minH) {
      if ((minH && size.height < minH) || (minW && size.width < minW)) {
        bodyOverflowArbitrator.requestVisible(this);
      } else {
        bodyOverflowArbitrator.requestHidden(this);
      }
    }
  },

  /** @private */
  showTouchIntercept: function () {
    if (this._touchIntercept) this._touchIntercept.style.display = "block";
  },

  /**
    Stops controlling the body overflow according to the needs of this pane.

    @returns {void}
  */
  unsetBodyOverflowIfNeeded: function () {
    bodyOverflowArbitrator.withdrawRequest(this);
  },

  /**
    Called just before the pane becomes keyPane.  Notifies the current keyView
    that it is about to gain focus.  The keyView can use this opportunity to
    prepare itself, possibly stealing any value it might need to steal from
    the current key view.

    @param {Pane} pane
    @returns {Pane} receiver
  */
  willBecomeKeyPaneFrom: function (pane) {
    this._sc_forwardKeyChange(!this.get('isKeyPane'), 'willBecomeKeyResponderFrom', pane, true);
    return this ;
  },

  /**
    Called just before the pane loses it's keyPane status.  This will notify
    the current keyView, if there is one, that it is about to lose focus,
    giving it one last opportunity to save its state.

    @param {Pane} pane
    @returns {Pane} receiver
  */
  willLoseKeyPaneTo: function (pane) {
    this._sc_forwardKeyChange(this.get('isKeyPane'), 'willLoseKeyResponderTo', pane, false);
    return this ;
  },

  /**
    Invoked by the root responder whenever the window resizes.  This should
    simply begin the process of notifying children that the view size has
    changed, if needed.

    @param {Rect} oldSize the old window size
    @param {Rect} newSize the new window size
    @returns {Pane} receiver
  */
  windowSizeDidChange: function (oldSize, newSize) {
    this.set('currentWindowSize', newSize);
    this.setBodyOverflowIfNeeded();
    this.parentViewDidResize(newSize); // start notifications.
    return this;
  }

});
