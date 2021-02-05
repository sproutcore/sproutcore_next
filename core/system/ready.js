// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { setSetting, getSetting } from './settings.js';
import global from './global.js';
import { APP_MODE, T_STRING } from './constants.js';
import { typeOf } from './base.js';
import { RunLoop } from './runloop.js';

setSetting('BENCHMARK_LOG_READY', true);

setSetting('isReady', false);
setSetting('suppressOnReady', false);
setSetting('suppressMain', false);

let _readyQueue = [];


export const readyMixin = {

  get isReady () {
    return getSetting('isReady');
  },

  set isReady (val) {
    setSetting('isReady', val);
  },

  /**
    Allows apps to avoid automatically attach the ready handlers if they
    want to by setting this flag to true

    @type Boolean
  */
  get suppressOnReady () {
    return getSetting('suppressOnReady');
  },

  set suppressOnReady (val) {
    setSetting('suppressOnReady', val);
  },

  /**
    Allows apps to avoid automatically invoking main() when onReady is called

    @type Boolean
  */
  get suppressMain () {
    return getSetting('suppressMain');
  },

  set suppressMain (val) {
    setSetting('suppressMain', val);
  },


  get mode () {
    return getSetting('mode');
  },

  set mode (val) {
    setSetting('mode', val);
  },

  /**
    Add the passed target and method to the queue of methods to invoke when
    the document is ready.  These methods will be called after the document
    has loaded and parsed, but before the main() function is called.

    Methods are called in the order they are added.

    If you add a ready handler when the main document is already ready, then
    your handler will be called immediately.

    @param target {Object} optional target object
    @param method {Function} method name or function to execute
    @returns {SC}
  */
  ready: function (target, method) {
    var queue = _readyQueue;

    // normalize
    if (method === undefined) {
      method = target;
      target = null;
    } else if (typeOf(method) === T_STRING) {      
      method = target[method];
    }

    if (getSetting('isReady')) {
      if (global.jQuery) {
        jQuery(document).ready(function () { method.call(target); });
      }
      else {
        method.call(target);
      }
    } else {
      _readyQueue.push(function () { method.call(target); });
    }

    return this;
  },

  onReady: {

    Locale: null, // to be set by the Locale later

    done: function () {
      if (getSetting('isReady')) return;

      setSetting('isReady', true);

      RunLoop.begin();

      if (this.Locale) {
        this.Locale.createCurrentLocale();
        var loc = this.Locale.currentLanguage.toLowerCase();
        jQuery("body").addClass(loc);
  
        jQuery("html").attr("lang", loc);
  
        jQuery("#loading").remove();  
      }

      var queue = _readyQueue, idx, len;

      if (queue) {
        for (idx = 0, len = queue.length; idx < len; idx++) {
          queue[idx].call();
        }
        _readyQueue = null;
      }

      if (global.main && !getSetting('suppressMain') && (getSetting('mode') === APP_MODE)) { global.main(); }
      RunLoop.end();
    }
  }

};

if (global.jQuery) {
  // let apps ignore the regular onReady handling if they need to
  if (!getSetting('suppressOnReady')) {
    global.$(document).ready(readyMixin.onReady.done);
  }
}


// default to app mode.  When loading unit tests, this will run in test mode

setSetting('mode', APP_MODE);
