// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('system/core_query');
// sc_require('system/ready');
// sc_require('system/root_responder');
// sc_require('system/platform');

import { SC } from '../../core/core.js';
import { SCEvent } from '../../event/event.js';
import { RootResponder } from './root_responder.js';
import { platform } from './platform.js';

export const PORTRAIT_ORIENTATION = 'portrait';
export const LANDSCAPE_ORIENTATION = 'landscape';
export const NO_ORIENTATION = 'desktop'; // value 'desktop' for backwards compatibility

/**
  The device object allows you to check device specific properties such as
  orientation and if the device is offline, as well as observe when they change
  state.

  ## Orientation
  When a touch device changes orientation, the orientation property will be
  set accordingly which you can observe

  ## Offline support
  In order to build a good offline-capable web application, you need to know
  when your app has gone offline so you can for instance queue your server
  requests for a later time or provide a specific UI/message.

  Similarly, you also need to know when your application has returned to an
  'online' state again, so that you can re-synchronize with the server or do
  anything else that might be needed.

  By observing the 'isOffline' property you can be notified when this state
  changes. Note that this property is only connected to the navigator.onLine
  property, which is available on most modern browsers.

*/
export const device = SC.Object.create({

  /**
    Sets the orientation for devices, either LANDSCAPE_ORIENTATION
    or PORTRAIT_ORIENTATION.

    @type String
    @default PORTRAIT_ORIENTATION
  */
  orientation: PORTRAIT_ORIENTATION,

  /**
    Indicates whether the device is currently online or offline. For browsers
    that do not support this feature, the default value is false.

    Is currently inverse of the navigator.onLine property. Most modern browsers
    will update this property when switching to or from the browser's Offline
    mode, and when losing/regaining network connectivity.

    @type Boolean
    @default false
  */
  isOffline: false,

  /**
    Returns a Point containing the last known X and Y coordinates of the
    mouse, if present.

    @type Point
  */
  mouseLocation: function() {
    var responder = RootResponder.responder,
        lastX = responder._lastMoveX,
        lastY = responder._lastMoveY;

    if (SC.empty(lastX) || SC.empty(lastY)) {
      return null;
    }

    return { x: lastX, y: lastY };
  }.property(),

  /**
    Initialize the object with some properties up front
  */
  init: function init () {
    init.base.apply(this, arguments);

    if (navigator && navigator.onLine === false) {
      this.set('isOffline', true);
    }
  },

  /**
    As soon as the DOM is up and running, make sure we attach necessary
    event handlers
  */
  setup: function() {
    var responder = RootResponder.responder;
    responder.listenFor(['online', 'offline'], window, this);

    this.orientationHandlingShouldChange();
  },

  // ..........................................................
  // ORIENTATION HANDLING
  //

  /**
    Determines which method to use for orientation changes.
    Either detects orientation changes via the current size
    of the window, or by the window.onorientationchange event.
  */
  orientationHandlingShouldChange: function() {
    if (platform.windowSizeDeterminesOrientation) {
      SCEvent.remove(window, 'orientationchange', this, this.orientationchange);
      this.windowSizeDidChange(RootResponder.responder.get('currentWindowSize'));
    } else if (platform.supportsOrientationChange) {
      SCEvent.add(window, 'orientationchange', this, this.orientationchange);
      this.orientationchange();
    }
  },

  /**
    @param {Object} newSize The new size of the window
    @returns true if the method altered the orientation, false otherwise
  */
  windowSizeDidChange: function(newSize) {
    if (platform.windowSizeDeterminesOrientation) {
      if (newSize.height >= newSize.width) {
        device.set('orientation', PORTRAIT_ORIENTATION);
      } else {
        device.set('orientation', LANDSCAPE_ORIENTATION);
      }

      return true;
    }
    return false;
  },

  /**
    Called when the window.onorientationchange event is fired.
  */
  orientationchange: function(evt) {
    SC.run(function() {
      if (window.orientation === 0 || window.orientation === 180) {
        device.set('orientation', PORTRAIT_ORIENTATION);
      } else {
        device.set('orientation', LANDSCAPE_ORIENTATION);
      }
    });
  },

  /** @private */
  orientationObserver: function () {
    var body = $(document.body),
        orientation = this.get('orientation');

    if (orientation === PORTRAIT_ORIENTATION) {
      body.addClass('sc-portrait');
    } else {
      body.removeClass('sc-portrait');
    }

    if (orientation === LANDSCAPE_ORIENTATION) {
      body.addClass('sc-landscape');
    } else {
      body.removeClass('sc-landscape');
    }
  }.observes('orientation'),


  // ..........................................................
  // CONNECTION HANDLING
  //

  online: function(evt) {
    SC.run(function () {
      this.set('isOffline', false);
    }, this);
  },

  offline: function(evt) {
    SC.run(function () {
      this.set('isOffline', true);
    }, this);
  }

});

/*
  Invoked when the document is ready, but before main is called.  Creates
  an instance and sets up event listeners as needed.
*/
SC.ready(function() {
  device.setup();
});
