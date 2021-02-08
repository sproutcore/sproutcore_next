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

import { __runtimeDeps as obsRuntimeDeps } from '../mixins/observable.js';
import { __runtimeDeps as aryRuntimeDeps } from '../mixins/array.js';
import { __runtimeDeps as obsSetRuntimeDeps } from '../private/observer_set.js';
import { __runtimeDeps as objRuntimeDeps } from './object.js';
import { __runtimeDeps as bindingRuntimeDeps } from './binding.js';
import { __runtimeDeps as scWorkerRuntimeDeps } from './scworker.js';


setSetting('BENCHMARK_LOG_READY', true);

setSetting('isReady', false);
setSetting('suppressOnReady', false);
setSetting('suppressMain', false);

if (!getSetting('_readyQueue')) {
  setSetting('_readyQueue', []);
}

const runtimeDeps = [
  scWorkerRuntimeDeps(),
  obsRuntimeDeps(),
  aryRuntimeDeps(),
  bindingRuntimeDeps(),
  obsSetRuntimeDeps(),
  objRuntimeDeps(),
];

// if (global.jQuery) {
//   // let apps ignore the regular onReady handling if they need to
//   if (!getSetting('suppressOnReady')) {
//     // global.$(document).ready(readyMixin.onReady.done.bind(readyMixin.onReady));
//     global.jQuery(readyMixin.onReady.done.bind(readyMixin.onReady));
//   }
// }

// there might be a more dynamic way to do this...
// Promise.all(runtimeDeps).then(r => {
//   console.log("PROMISE OF imports");
//   if (SC.onload && typeof SC.onload === 'function') {
//     SC.onload();
//   }  
//   // if (!global.jQuery) {
//   //   SC.onReady.done();
//   // }
//   // trigger SC.onReady?
//   // SC.onReady.done();
// })



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

  _readyQueue: null,

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
    
    var queue = getSetting('_readyQueue');
    
    // normalize
    if (method === undefined) {
      method = target;
      target = null;
    } else if (typeOf(method) === T_STRING) {      
      method = target[method];
    }

    if (getSetting('isReady')) {
      if (global.jQuery) {
        console.log('we have jquery queue, use jquery');
        jQuery(function () { method.call(target); });
      }
      else {
        method.call(target);
      }
    } else {
      // console.log('pushing method to queue');
      const idx = queue.push(function () { method.call(target); });
      // console.log('function pushed to ', idx);
    }

    return this;
  },

  onReady: {

    Locale: null, // to be set by the Locale later

    done: function () {
      console.log("SPROUTCORE_READY_DONE_FUNCTION");
      // first wait till the promises are resolved
      if (getSetting('isReady')) return;

      Promise.all(runtimeDeps).then( () => {  
      
        setSetting('isReady', true);
  
        RunLoop.begin();
  
        if (this.Locale) {
          this.Locale.createCurrentLocale();
          var loc = this.Locale.currentLanguage.toLowerCase();
          jQuery("body").addClass(loc);
    
          jQuery("html").attr("lang", loc);
    
          jQuery("#loading").remove();  
        }
        // debugger;
        var queue = getSetting('_readyQueue'), idx, len;
        
        if (queue) {
          for (idx = 0, len = queue.length; idx < len; idx++) {
            // console.log('calling', idx);
            // debugger;
            queue[idx].call();
          }
          // _readyQueue = null;
        }
  
        if (global.main && !getSetting('suppressMain') && (getSetting('mode') === APP_MODE)) { global.main(); }
        RunLoop.end();
      
      })
    }
  }

};

if (global.jQuery) {
  // let apps ignore the regular onReady handling if they need to
  if (!getSetting('suppressOnReady')) {
    // global.$(document).ready(readyMixin.onReady.done.bind(readyMixin.onReady));
    jQuery(readyMixin.onReady.done);
    // jQuery(readyMixin.onReady.done.bind(readyMixin.onReady));
  }
}


// default to app mode.  When loading unit tests, this will run in test mode

setSetting('mode', APP_MODE);


/** The onReady has to be revised here... it needs to be promise based somehow.
 * it also can only start running the ready calls whenever the import promises have resolved...
 */