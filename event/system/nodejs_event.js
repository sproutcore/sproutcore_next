// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

/**
 * This is a kind of stub, to make the reponder and more specifically the state chart system
 * run inside NodeJS
 */
import { SC } from '../../core/core.js';



/**
  The event class provides a simple cross-platform library for capturing and
  delivering events on DOM elements and other objects.  While this library
  is based on code from both jQuery and Prototype.js, it includes a number of
  additional features including support for handler objects and event
  delegation.

  Since native events are implemented very unevenly across browsers,
  SproutCore will convert all native events into a standardized instance of
  this special event class.

  SproutCore events implement the standard W3C event API as well as some
  additional helper methods.

  @constructor
  @param {Event} originalEvent
  @returns {SCEvent} event instance

  @since SproutCore 1.0
*/
export const SCEvent = function(originalEvent) {
  // this._sc_updateNormalizedEvent(originalEvent);

  return this;
};

SC.mixin(SCEvent, /** @scope SCEvent */ {

 
  /**
    Standard method to create a new event.  Pass the native browser event you
    wish to wrap if needed.
  */
  create: function(e) { return new SCEvent(e); },

  // the code below was borrowed from jQuery, Dean Edwards, and Prototype.js

  /**
    Bind an event to an element.

    This method will cause the passed handler to be executed whenever a
    relevant event occurs on the named element.  This method supports a
    variety of handler types, depending on the kind of support you need.

    ## Simple Function Handlers

        SCEvent.add(anElement, "click", myClickHandler) ;

    The most basic type of handler you can pass is a function.  This function
    will be executed every time an event of the type you specify occurs on the
    named element.  You can optionally pass an additional context object which
    will be included on the event in the event.data property.

    When your handler function is called, the function's "this" property
    will point to the element the event occurred on.

    The click handler for this method must have a method signature like:

        function(event) { return true|false; }

    ## Method Invocations

        SCEvent.add(anElement, "click", myObject, myObject.aMethod) ;

    Optionally you can specify a target object and a method on the object to
    be invoked when the event occurs.  This will invoke the method function
    with the target object you pass as "this".  The method should have a
    signature like:

        function(event, targetElement) { return true|false; }

    Like function handlers, you can pass an additional context data paramater
    that will be included on the event in the event.data property.

    ## Handler Return Values

    Both handler functions should return YES if you want the event to
    continue to propagate and NO if you want it to stop.  Returning NO will
    both stop bubbling of the event and will prevent any default action
    taken by the browser.  You can also control these two behaviors separately
    by calling the stopPropagation() or preventDefault() methods on the event
    itself, returning YES from your method.

    ## Limitations

    Although SproutCore's event implementation is based on jQuery, it is
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.

    If you need more advanced event handling, consider the SC.ClassicResponder
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type you want to respond to
    @param {Object} target The target object for a method call or a function.
    @param {Object} method optional method or method name if target passed
    @param {Object} context optional context to pass to the handler as event.data
    @returns {Object} receiver
  */
  add: function(elem, eventType, target, method, context, useCapture) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.add(e, eventType, target, method, context);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

		if (!useCapture) {
			useCapture = false;
		}

    // cannot register events on text nodes, etc.
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SCEvent;

    // For whatever reason, IE has trouble passing the window object
    // around, causing it to be cloned in the process
    if (SC.browser.name === SC.BROWSER.ie && elem.setInterval) elem = window;

    // if target is a function, treat it as the method, with optional context
    if (SC.typeOf(target) === SC.T_FUNCTION) {
      context = method;
      method = target;
      target = null;

    // handle case where passed method is a key on the target.
    } else if (target && SC.typeOf(method) === SC.T_STRING) {
      method = target[method];
    }

    // Get the handlers queue for this element/eventType.  If the queue does
    // not exist yet, create it and also setup the shared listener for this
    // eventType.
    var events = SC.data(elem, "sc_events") || SC.data(elem, "sc_events", {}),
        handlers = events[eventType];

    if (!handlers) {
      handlers = events[eventType] = {};
      this._addEventListener(elem, eventType, useCapture);
    }

    // Build the handler array and add to queue
    handlers[SC.hashFor(target, method)] = [target, method, context];
    SCEvent._global[eventType] = true ; // optimization for global triggers

    // Nullify elem to prevent memory leaks in IE
    elem = events = handlers = null ;
    return this ;
  },

  /**
    Removes a specific handler or all handlers for an event or event+type.

    To remove a specific handler, you must pass in the same function or the
    same target and method as you passed into SCEvent.add().  See that method
    for full documentation on the parameters you can pass in.

    If you omit a specific handler but provide both an element and eventType,
    then all handlers for that element will be removed.  If you provide only
    and element, then all handlers for all events on that element will be
    removed.

    ## Limitations

    Although SproutCore's event implementation is based on jQuery, it is
    much simpler in design.  Notably, it does not support namespaced events
    and you can only pass a single type at a time.

    If you need more advanced event handling, consider the SC.ClassicResponder
    functionality provided by SproutCore or use your favorite DOM library.

    @param {Element} elem a DOM element, window, or document object
    @param {String} eventType the event type to remove
    @param {Object} target The target object for a method call.  Or a function.
    @param {Object} method optional name of method
    @returns {Object} receiver
  */
  remove: function(elem, eventType, target, method) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.remove(e, eventType, target, method);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return SCEvent;

    var handlers, key, events = SC.data(elem, "sc_events") ;
    if (!events) return this ; // nothing to do if no events are registered

    // if no type is provided, remove all types for this element.
    if (eventType === undefined) {
      for (var anEventType in events) this.remove(elem, anEventType) ;

    // otherwise, remove the handler for this specific eventType if found
    } else if ((handlers = events[eventType])) {

      var cleanupHandlers = false ;

      // if a target/method is provided, remove only that one
      if (target || method) {

        // normalize the target/method
        if (SC.typeOf(target) === SC.T_FUNCTION) {
          method = target; target = null ;
        } else if (SC.typeOf(method) === SC.T_STRING) {
          method = target[method] ;
        }

        delete handlers[SC.hashFor(target, method)];

        // check to see if there are handlers left on this event/eventType.
        // if not, then cleanup the handlers.
        key = null ;
        for(key in handlers) break ;
        if (key===null) cleanupHandlers = true ;

      // otherwise, just cleanup all handlers
      } else cleanupHandlers = true ;

      // If there are no more handlers left on this event type, remove
      // eventType hash from queue.
      if (cleanupHandlers) {
        delete events[eventType] ;
        this._removeEventListener(elem, eventType) ;
      }

      // verify that there are still events registered on this element.  If
      // there aren't, cleanup the element completely to avoid memory leaks.
      key = null ;
      for (key in events) break;
      if (!key) {
        SC.removeData(elem, "sc_events") ;
        delete this._elements[SC.guidFor(elem)]; // important to avoid leaks

        // Clean up the cached listener to prevent a memory leak.
        SC.removeData(elem, 'listener');
      }

    }

    elem = events = handlers = null ; // avoid memory leaks
    return this ;
  },

  false_BUBBLE: ['blur', 'focus', 'change'],

  /**
    Generates a simulated event object.  This is mostly useful for unit
    testing.  You can pass the return value of this property into the
    trigger() method to actually send the event.

    @param {Element} elem the element the event targets
    @param {String} eventType event type.  mousedown, mouseup, etc
    @param {Hash} attrs optional additional attributes to apply to event.
    @returns {Hash} simulated event object
  */
  simulateEvent: function(elem, eventType, attrs) {
    var ret = SCEvent.create({
      type: eventType,
      target: elem,
      preventDefault: function(){ this.cancelled = true; },
      stopPropagation: function(){ this.bubbles = false; },
      allowDefault: function() { this.hasCustomEventHandling = true; },
      timeStamp: Date.now(),
      bubbles: (this.false_BUBBLE.indexOf(eventType)<0),
      cancelled: false,
      normalized: true,
      simulated: true
    });
    if (attrs) SC.mixin(ret, attrs) ;
    return ret ;
  },

  /**
    Trigger an event execution immediately.  You can use this method to
    simulate arbitrary events on arbitrary elements.

    ## Limitations

    Note that although this is based on the jQuery implementation, it is
    much simpler.  Notably namespaced events are not supported and you cannot
    trigger events globally.

    If you need more advanced event handling, consider the SC.Responder
    functionality provided by SproutCore or use your favorite DOM library.

    ## Example

        SCEvent.trigger(view.get('layer'), 'mousedown');

    @param elem {Element} the target element
    @param eventType {String} the event type
    @param event {SCEvent} [event] pre-normalized event to pass to handler
    @param donative ??
    @returns {Boolean} Return value of trigger or undefined if not fired
  */
  trigger: function(elem, eventType, event, donative) {

    // if a CQ object is passed in, either call add on each item in the
    // matched set, or simply get the first element and use that.
    if (elem && elem.isCoreQuery) {
      if (elem.length > 0) {
        elem.forEach(function(e) {
          this.trigger(e, eventType, event, donative);
        }, this);
        return this;
      } else elem = elem[0];
    }
    if (!elem) return this; // nothing to do

    // don't do events on text and comment nodes
    if ( elem.nodeType === 3 || elem.nodeType === 8 ) return undefined;

    // Backwards-compatibility. Normalize from an Array.
    if (SC.typeOf(event) === SC.T_ARRAY) { event = event[0]; }

    var ret, fn = SC.typeOf(elem[eventType] || null) === SC.T_FUNCTION ,
        current, onfoo, isClick;

    // Get the event to pass, creating a fake one if necessary
    if (!event || !event.preventDefault) {
      event = this.simulateEvent(elem, eventType);
    }

    event.type = eventType;

    // Trigger the event - bubble if enabled
    current = elem;
    do {
      ret = SCEvent.handle.call(current, event);
      current = (current===document) ? null : (current.parentNode || document);
    } while(!ret && event.bubbles && current);
    current = null ;

    // Handle triggering native .onfoo handlers
    onfoo = elem["on" + eventType] ;
    isClick = elem.nodeName && (elem.nodeName === 'A') && eventType === 'click';
    if ((!fn || isClick) && onfoo && onfoo.call(elem, event) === false) ret = false;

    // Trigger the native events (except for clicks on links)
    if (fn && donative !== false && ret !== false && !isClick) {
      this.triggered = true;
      try {
        elem[ eventType ]();
      // prevent IE from throwing an error for some hidden elements
      } catch (e) {}
    }

    this.triggered = false;

    return ret;
  },

  /**
    This method will handle the passed event, finding any registered listeners
    and executing them.  If you have an event you want handled, you can
    manually invoke this method.  This function expects it's "this" value to
    be the element the event occurred on, so you should always call this
    method like:

        SCEvent.handle.call(element, event) ;

    Note that like other parts of this library, the handle function does not
    support namespaces.

    @param event {DOMEvent} the event to handle
    @returns {Boolean}
  */
  handle: function (event) {

    // ignore events triggered after window is unloaded or if double-called
    // from within a trigger.
    if ((typeof SC === "undefined") || SCEvent.triggered) return true;

    // returned undefined or false
    var val, ret, handlers, method, target;

    // get the handlers for this event type
    handlers = (SC.data(this, "sc_events") || {})[event.type];

    // no handlers for the event
    if (!handlers) {
      val = false; // nothing to do

    } else {
      // normalize event across browsers.  The new event will actually wrap the real event with a normalized API.
      event = SCEvent.normalizeEvent(event || window.event);

      // invoke all handlers
      for (var key in handlers) {
        var handler = handlers[key];

        method = handler[1];

        // Pass in a reference to the handler function itself so that we can remove it later.
        event.handler = method;
        event.data = event.context = handler[2];

        target = handler[0] || this;
        ret = method.call(target, event);

        if (val !== false) val = ret;

        // if method returned false, do not continue.  Stop propagation and
        // return default.  Note that we test explicitly for false since
        // if the handler returns no specific value, we do not want to stop.
        if ( ret === false ) {
          event.preventDefault();
          event.stopPropagation();
        }
      }

      // Clean up the cached normalized SCEvent so that it's not holding onto extra memory.
      if (event.originalEvent && !event.originalEvent.simulated) { event._sc_clearNormalizedEvent(); }
    }

    return val;
  },

  /**
    This method is called just before the window unloads to unhook all
    registered events.
  */
  unload: function() {
    var key, elements = this._elements ;
    for(key in elements) this.remove(elements[key]) ;

    // just in case some book-keeping was screwed up.  avoid memory leaks
    for(key in elements) delete elements[key] ;
    delete this._elements ;
  },

  /**
    This hash contains handlers for special or custom events.  You can add
    your own handlers for custom events here by simply naming the event and
    including a hash with the following properties:

     - setup: this function should setup the handler or return false
     - teardown: this function should remove the event listener

  */
  special: {

    ready: {
      setup: function() {
        // Make sure the ready event is setup
        SC._bindReady() ;
        return;
      },

      teardown: function() { return; }

    },

    /** @private
        Implement support for mouseenter on browsers other than IE */
    mouseenter: {
      setup: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return false;
        SCEvent.add(this, 'mouseover', SCEvent.special.mouseenter.handler);
        return true;
      },

      teardown: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return false;
        SCEvent.remove(this, 'mouseover', SCEvent.special.mouseenter.handler);
        return true;
      },

      handler: function (event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SCEvent._withinElement(event, this) ) return true;
        // Execute the right handlers by setting the event type to mouseenter
        event.type = "mouseenter";

        return SCEvent.handle.call(this, event);
      }
    },

    /** @private
        Implement support for mouseleave on browsers other than IE */
    mouseleave: {
      setup: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return false;
        SCEvent.add(this, "mouseout", SCEvent.special.mouseleave.handler);
        return true;
      },

      teardown: function() {
        if ( SC.browser.name === SC.BROWSER.ie ) return false;
        SCEvent.remove(this, "mouseout", SCEvent.special.mouseleave.handler);
        return true;
      },

      handler: function (event) {
        // If we actually just moused on to a sub-element, ignore it
        if ( SCEvent._withinElement(event, this) ) return true;
        // Execute the right handlers by setting the event type to mouseleave
        event.type = "mouseleave";
        return SCEvent.handle.call(this, event);
      }
    }
  },

  KEY_BACKSPACE: 8,
  KEY_TAB:       9,
  KEY_RETURN:   13,
  KEY_ESC:      27,
  KEY_SPACE:    32,
  KEY_LEFT:     37,
  KEY_UP:       38,
  KEY_RIGHT:    39,
  KEY_DOWN:     40,
  KEY_DELETE:   46,
  KEY_HOME:     36,
  KEY_END:      35,
  KEY_PAGEUP:   33,
  KEY_PAGEDOWN: 34,
  KEY_INSERT:   45,

  _withinElement: function(event, elem) {
    // Check if mouse(over|out) are still within the same parent element
    var parent = event.relatedTarget;

    // Traverse up the tree
    while ( parent && parent !== elem ) {
      try { parent = parent.parentNode; } catch(error) { parent = elem; }
    }

    // Return true if we actually just moused on to a sub-element
    return parent === elem;
  },

  /** @private
    Adds the primary event listener for the named type on the element.

    If the event type has a special handler defined in SCEvent.special,
    then that handler will be used.  Otherwise the normal browser method will
    be used.

    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _addEventListener: function(elem, eventType, useCapture) {
    var listener,
        special = this.special[eventType] ;

		if (!useCapture) {
			useCapture = false;
		}

    // Check for a special event handler
    // Only use addEventListener/attachEvent if the special
    // events handler returns false
    if ( !special || special.setup.call(elem) === false) {

      // Save element in cache.  This must be removed later to avoid
      // memory leaks.
      var guid = SC.guidFor(elem) ;
      this._elements[guid] = elem;

      // Either retrieve the previously cached listener or cache a new one.
      listener = SC.data(elem, "listener") || SC.data(elem, "listener",
        function handle_event (event) {
          return SCEvent.handle.call(SCEvent._elements[guid], event);
        });

      // Bind the global event handler to the element
      if (elem.addEventListener) {
        if (SC.platform.supportsPassiveEventlisteners) {
          elem.addEventListener(eventType, listener, {
            capture: useCapture,
            passive: false
          });
        }
        else {
          elem.addEventListener(eventType, listener, useCapture);
        }
      } else if (elem.attachEvent) {
        // attachEvent is not working for IE8 and xhr objects
        // there is currently a hack in request , but it needs to fixed here.
        elem.attachEvent("on" + eventType, listener);
      }
    }

    elem = special = listener = null; // avoid memory leak
  },

  /** @private
    Removes the primary event listener for the named type on the element.

    If the event type has a special handler defined in SCEvent.special,
    then that handler will be used.  Otherwise the normal browser method will
    be used.

    Note that this will not clear the _elements hash from the element.  You
    must call SCEvent.unload() on unload to make sure that is cleared.

    @param elem {Element} the target element
    @param eventType {String} the event type
  */
  _removeEventListener: function(elem, eventType) {
    var listener, special = SCEvent.special[eventType] ;
    if (!special || (special.teardown.call(elem)===false)) {
      // Retrieve the cached listener.
      listener = SC.data(elem, "listener") ;
      if (listener) {
        if (elem.removeEventListener) {
          elem.removeEventListener(eventType, listener, false);
        } else if (elem.detachEvent) {
          elem.detachEvent("on" + eventType, listener);
        }
      }
    }

    elem = special = listener = null ;
  },

  _elements: {},

  _sc_normalizedEvents: null,

  // implement preventDefault() in a cross platform way

  /** @private Take an incoming event and convert it to a normalized event. */
  normalizeEvent: function (event) {
    var ret;

    // Create the cache the first time.
    if (!this._sc_normalizedEvents) { this._sc_normalizedEvents = {}; }
    ret = this._sc_normalizedEvents[event.type];

    // Create a new normalized SCEvent.
    if (!ret) {
      if (event === window.event) {
        // IE can't do event.normalized on an Event object
        ret = SCEvent.create(event) ;
      } else {
        ret = event.normalized ? event : SCEvent.create(event) ;
      }

    // When passed an SCEvent, don't re-normalize it.
    // TODO: This is hacky nonsense left over from a whole pile of bad decisions in SC.Event—
    } else if (event.normalized) {
      ret = event;

    // Update the cached normalized SCEvent with the new DOM event.
    } else {
      ret._sc_updateNormalizedEvent(event);
    }

    // Cache the normalized event object for this type of event. This allows us to avoid recreating
    // SCEvent objects constantly for noisy events such as 'mousemove' or 'mousewheel'.
    this._sc_normalizedEvents[event.type] = ret;

    return ret;
  },

  _global: {},

  /** @private properties to copy from native event onto the event */
  // TODO: Remove this needless copy.
  _props: ['altKey', 'attrChange', 'attrName', 'bubbles', 'button', 'cancelable', 'charCode', 'clientX', 'clientY', 'ctrlKey', 'currentTarget', 'data', 'detail', 'fromElement', 'handler', 'keyCode', 'metaKey', 'newValue', 'originalTarget', 'pageX', 'pageY', 'prevValue', 'relatedNode', 'relatedTarget', 'screenX', 'screenY', 'shiftKey', 'srcElement', 'target', 'timeStamp', 'toElement', 'type', 'view', 'which', 'touches', 'targetTouches', 'changedTouches', 'animationName', 'elapsedTime', 'dataTransfer']

});

SCEvent.prototype = {

  /**
    Set to true if you have called either preventDefault() or stopPropagation().
    This allows a generic event handler to notice if you want to provide
    detailed control over how the browser handles the real event.

    @type Boolean
  */
  hasCustomEventHandling: false,

  /** @private Clear out the originalEvent from the SCEvent instance. */
  _sc_clearNormalizedEvent: function () {
    // Remove the original event.
    this.originalEvent = null;

    // Reset the custom event handling and normalized flag.
    this.hasCustomEventHandling = false;
    this.normalized = false;

    // Remove non-primitive properties copied over from the original event. While these will
    // be overwritten, it's best to quickly null them out to avoid any issues.
    var props = SCEvent._props,
      idx;

    idx = props.length;
    while(--idx >= 0) {
      var key = props[idx];
      this[key] = null;
    }

    // Remove the custom properties associated with the previous original event. While these will
    // be overwritten, it's best to quickly null them out to avoid any issues.
    this.timeStamp = null;
    this.target = null;
    this.relatedTarget = null;
    this.pageX = null;
    this.pageY = null;
    this.which = null;
    this.metaKey = null;
    this.wheelDelta = null;
    this.wheelDeltaY = null;
    this.wheelDeltaX = null;
  },

  /** @private Update the SCEvent instance with the new originalEvent. */
  _sc_updateNormalizedEvent: function (originalEvent) {
    var idx, len;

    // Flag.
    this.normalized = true;

    // copy properties from original event, if passed in.
    if (originalEvent) {
      this.originalEvent = originalEvent ;
      var props = SCEvent._props,
        key;

      len = props.length;
      idx = len;
      while(--idx >= 0) {
        key = props[idx] ;
        this[key] = originalEvent[key] ;
      }
    }

    // Fix timeStamp
    this.timeStamp = this.timeStamp || Date.now();

    // Fix target property, if necessary
    // Fixes #1925 where srcElement might not be defined either
    if (!this.target) this.target = this.srcElement || document;

    // check if target is a textnode (safari)
    if (this.target.nodeType === 3 ) this.target = this.target.parentNode;

    // Add relatedTarget, if necessary
    if (!this.relatedTarget && this.fromElement) {
      this.relatedTarget = (this.fromElement === this.target) ? this.toElement : this.fromElement;
    }

    // Calculate pageX/Y if missing and clientX/Y available
    if (SC.none(this.pageX) && !SC.none(this.clientX)) {
      var doc = document.documentElement, body = document.body;
      this.pageX = this.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0);
      this.pageY = this.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0);
    }

    // Add which for key events
    if (!this.which && ((this.charCode || originalEvent.charCode === 0) ? this.charCode : this.keyCode)) {
      this.which = this.charCode || this.keyCode;
    }

    // Add metaKey to non-Mac browsers (use ctrl for PC's and Meta for Macs)
    if (!this.metaKey && this.ctrlKey) this.metaKey = this.ctrlKey;

    // Add which for click: 1 == left; 2 == middle; 3 == right
    // Note: button is not normalized, so don't use it
    if (!this.which && this.button) {
      this.which = ((this.button & 1) ? 1 : ((this.button & 2) ? 3 : ( (this.button & 4) ? 2 : 0 ) ));
    }

    // Normalize wheel delta values for mousewheel events.
    /*
      Taken from https://developer.mozilla.org/en-US/docs/Web/Events/mousewheel
      IE and Opera (Presto) only support wheelDelta attribute and do not support horizontal scroll.

      The wheelDeltaX attribute value indicates the wheelDelta attribute value along the horizontal axis. When a user operates the device for scrolling to right, the value is negative. Otherwise, i.e., if it's to left, the value is positive.

      The wheelDeltaY attribute value indicates the wheelDelta attribute value along the vertical axis. The sign of the value is the same as the wheelDelta attribute value.

      IE

      The value is the same as the delta value of WM_MOUSEWHEEL or WM_MOUSEHWHEEL. It means that if the mouse wheel doesn't support high resolution scroll, the value is 120 per notch. The value isn't changed even if the scroll amount of system settings is page scroll.

      ## Chrome

      On Windows, the value is the same as the delta value of WM_MOUSEWHEEL or WM_MOUSEHWHEEL. And also, the value isn't changed even if the scroll amount of system settings is page scroll, i.e., the value is the same as IE on Windows.

      On Linux, the value is 120 or -120 per native wheel event. This makes the same behavior as IE and Chrome for Windows.

      On Mac, the value is complicated. The value is changed if the device that causes the native wheel event supports continuous scroll.

      If the device supports continuous scroll (e.g., trackpad of MacBook or mouse wheel which can be turned smoothly), the value is computed from accelerated scroll amount. In this case, the value is the same as Safari.

      If the device does not support continuous scroll (typically, old mouse wheel which cannot be turned smoothly), the value is computed from non-accelerated scroll amount (120 per notch). In this case, the value is different from Safari.

      This difference makes a serious issue for web application developers. That is, web developers cannot know if mousewheel event is caused by which device.

      See WebInputEventFactory::mouseWheelEvent of the Chromium's source code for the detail.

      ## Safari

      The value is always computed from accelerated scroll amount. This is really different from other browsers except Chrome with continuous scroll supported device.

      Note: tested with the Windows package, the earliest available version was Safari 3.0 from 2007. It could be that earlier versions (on Mac) support the properties too.

      ## Opera (Presto)

      The value is always the detail attribute value ✕ 40.

      On Windows, since the detail attribute value is computed from actual scroll amount, the value is different from other browsers except the scroll amount per notch is 3 lines in system settings or a page.

      On Linux, the value is 80 or -80 per native wheel event. This is different from other browsers.

      On Mac, the detail attribute value is computed from accelerated scroll amout of native event. The value is usually much bigger than Safari's or Chrome's value.
    */
    if (this.type === 'mousewheel' || this.type === 'DOMMouseScroll' || this.type === 'MozMousePixelScroll') {
      var deltaMultiplier = SCEvent.MOUSE_WHEEL_MULTIPLIER;

      // normalize wheelDelta, wheelDeltaX, & wheelDeltaY for Safari
      if (SC.browser.isWebkit && originalEvent.wheelDelta !== undefined) {
        this.wheelDelta = 0 - (originalEvent.wheelDeltaY || originalEvent.wheelDeltaX);
        this.wheelDeltaY = 0 - (originalEvent.wheelDeltaY || 0);
        this.wheelDeltaX = 0 - (originalEvent.wheelDeltaX || 0);

      // normalize wheelDelta for Firefox (all Mozilla browsers)
      // note that we multiple the delta on FF to make it's acceleration more natural.
      } else if (!SC.none(originalEvent.detail) && SC.browser.isMozilla) {
        if (originalEvent.axis && (originalEvent.axis === originalEvent.HORIZONTAL_AXIS)) {
          this.wheelDeltaX = originalEvent.detail;
          this.wheelDelta = this.wheelDeltaY = 0;
        } else {
          this.wheelDelta = this.wheelDeltaY = originalEvent.detail;
          this.wheelDeltaX = 0;
        }

      // handle all other legacy browser
      } else {
        this.wheelDelta = this.wheelDeltaY = SC.browser.isIE || SC.browser.isOpera ? 0 - originalEvent.wheelDelta : originalEvent.wheelDelta;
        this.wheelDeltaX = 0;
      }

      this.wheelDelta *= deltaMultiplier;
      this.wheelDeltaX *= deltaMultiplier;
      this.wheelDeltaY *= deltaMultiplier;
    }
  },

  /**
    Returns the touches owned by the supplied view.

    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForView: function(view) {
    if (this.touchContext) return this.touchContext.touchesForView(view);
  },

  /**
    Same as touchesForView, but sounds better for responders.

    @param {SC.RootResponder}
    @returns {Array} touches an array of SC.Touch objects
  */
  touchesForResponder: function(responder) {
    if (this.touchContext) return this.touchContext.touchesForView(responder);
  },

  /**
    Returns average data--x, y, and d (distance)--for the touches owned by the
    supplied view.

    @param {SC.View}
    @returns {Array} touches an array of SC.Touch objects
  */
  averagedTouchesForView: function(view) {
    if (this.touchContext) return this.touchContext.averagedTouchesForView(view);
    return null;
  },

  /**
    Indicates that you want to allow the normal default behavior.  Sets
    the hasCustomEventHandling property to true but does not cancel the event.

    @returns {SCEvent} receiver
  */
  allowDefault: function() {
    this.hasCustomEventHandling = true ;
    return this ;
  },

  /**
    Implements W3C standard.  Will prevent the browser from performing its
    default action on this event.

    @returns {SCEvent} receiver
  */
  preventDefault: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.preventDefault) evt.preventDefault() ;
      else evt.returnValue = false ; // IE8
    }
    this.hasCustomEventHandling = true ;
    return this ;
  },

  /**
    Implements W3C standard.  Prevents further bubbling of the event.

    @returns {SCEvent} receiver
  */
  stopPropagation: function() {
    var evt = this.originalEvent ;
    if (evt) {
      if (evt.stopPropagation) evt.stopPropagation() ;
      evt.cancelBubble = true ; // IE
    }
    this.hasCustomEventHandling = true ;
    return this ;
  },

  /**
    Stops both the default action and further propagation.  This is more
    convenient than calling both.

    @returns {SCEvent} receiver
  */
  stop: function() {
    return this.preventDefault().stopPropagation();
  },

  /**
    Always true to indicate the event was normalized.

    @type Boolean
  */
  normalized: true,



};

// Also provide a Prototype-like API so that people can use either one.

/** Alias for add() method.  This provides a Prototype-like API. */
SCEvent.observe = SCEvent.add ;

/** Alias for remove() method.  This provides a Prototype-like API */
SCEvent.stopObserving = SCEvent.remove ;

/** Alias for trigger() method.  This provides a Prototype-like API */
SCEvent.fire = SCEvent.trigger;

