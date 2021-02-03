// ==========================================================================
// Project:   Statechart - A Statechart Framework for SproutCore
// Copyright: ©2010, 2011 Michael Cohen, and contributors.
//            Portions @2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';

/**
  @class

  Represents a call that is intended to be asynchronous. This is
  used during a state transition process when either entering or
  exiting a state.

  
  @author Michael Cohen
*/
export const Async = SC.Object.extend(
  /** @scope Async.prototype */{

  func: null,

  arg1: null,

  arg2: null,

  /** @private
    Called by the statechart
  */
  tryToPerform: function(state) {
    var func = this.get('func'),
        arg1 = this.get('arg1'),
        arg2 = this.get('arg2'),
        funcType = SC.typeOf(func);

    if (funcType === SC.T_STRING) {
      state.tryToPerform(func, arg1, arg2);
    }
    else if (funcType === SC.T_FUNCTION) {
      func.apply(state, [arg1, arg2]);
    }
  }

});

/**
  Singleton
*/
Async.mixin(/** @scope Async */{

  /**
    Call in either a state's enterState or exitState method when you
    want a state to perform an asynchronous action, such as an animation.

    Examples:

      State.extend({

        enterState: function() {
          return Async.perform('foo');
        },

        exitState: function() {
          return Async.perform('bar', 100);
        }

        foo: function() { ... },

        bar: function(arg) { ... }

      });

    @param func {String|Function} the function to be invoked on a state
    @param arg1 Optional. An argument to pass to the given function
    @param arg2 Optional. An argument to pass to the given function
    @return {Async} a new instance of a Async
  */
  perform: function(func, arg1, arg2) {
    return Async.create({ func: func, arg1: arg1, arg2: arg2 });
  }

});
