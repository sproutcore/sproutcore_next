// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { guidFor, clone } from "../system/base.js";
import { getSetting } from '../system/settings.js';


/**
 * @typedef { [Function, Function, Object, String|Array ] } ObserverSetMember
 */

let Logger;
// enable later
import('../system/logger.js').then(l => Logger = l.Logger);

// ........................................................................
// ObserverSet
//

/**
  @namespace

  This private class is used to store information about observers on a
  particular key.  Note that this object is not observable.  You create new
  instances by calling SC.beget(SC.ObserverSet) ;

  @private
  @since SproutCore 1.0
*/
export const ObserverSet = {

  /**
    Adds the named target/method observer to the set.  The method must be
    a function, not a string.
  */
  add: function (target, method, context, loggingInfo) {
    var targetGuid = guidFor(target),
      methodGuid = guidFor(method),
      targets = this._members,
      members = this.members,
      indexes = targets[targetGuid], // get the set of methods
      index, member;

    if (!indexes) indexes = targets[targetGuid] = {
      _size: 0
    };

    index = indexes[methodGuid];
    if (index === undefined) {
      indexes[methodGuid] = members.length;
      // Increase the size of the indexes for this target so that it can be cleaned up.
      indexes._size++;
      member = [target, method, context];

      //@if(debug)
      // If deferred call logging info was specified (i.e., in debug mode when
      // such logging is enabled), we need to add it to the enqueued target/
      // method.
      member[3] = loggingInfo;
      //@endif

      members.push(member);
    } else {
      //@if(debug)
      // If deferred call logging info was specified (i.e., in debug mode when
      // such logging is enabled), we need to add it to the enqueued target/
      // method.
      var memberLoggingInfo;

      if (loggingInfo) {
        member = members[index];
        memberLoggingInfo = member[3];
        if (!memberLoggingInfo) {
          member[3] = [loggingInfo];
        } else if (!(memberLoggingInfo instanceof Array)) {
          member[3] = [memberLoggingInfo, loggingInfo];
        } else {
          memberLoggingInfo.push(loggingInfo);
        }
      }
      //@endif
    }
  },

  /**
    removes the named target/method observer from the set.  If this is the
    last method for the named target, then the number of targets will also
    be reduced.

    returns true if the items was removed, false if it was not found.
  */
  remove: function (target, method) {
    var targetGuid = guidFor(target),
      methodGuid = guidFor(method);
    var indexes = this._members[targetGuid],
      members = this.members;

    if (!indexes) return false;

    var index = indexes[methodGuid];
    if (index === undefined) return false;

    if (index !== members.length - 1) {
      var entry = (members[index] = members[members.length - 1]);
      this._members[guidFor(entry[0])][guidFor(entry[1])] = index;
    }

    // Throw away the last member (it has been moved or is the member we are removing).
    members.pop();

    // Remove the method tracked for the target.
    delete this._members[targetGuid][methodGuid];

    // If there are no more methods tracked on the target, remove the target.
    if (--this._members[targetGuid]._size === 0) {
      delete this._members[targetGuid];
    }

    return true;
  },

  /**
    Invokes the target/method pairs in the receiver.  Used by SC.RunLoop
    Note: does not support context
  */
  invokeMethods: function () {
    var members = this.members,
      member;

    //@if(debug)
    var shouldLog = getSetting('LOG_DEFERRED_CALLS'),
      target, method, methodName, loggingInfo, loggingInfos,
      originatingTarget, originatingMethod, originatingMethodName,
      originatingStack, j, jLen;
    //@endif

    for (var i = 0, l = members.length; i < l; i++) {
      member = members[i];

      // Call the method (member[1]) on the target (member[0]) with the context (member[2])
      member[1].call(member[0], member[2]);

      //@if(debug)
      // If we have logging info specified for who scheduled the particular
      // invocation, and logging is enabled, then output it.
      if (shouldLog) {
        target = member[0];
        method = member[1];
        methodName = method.displayName || method;
        loggingInfo = member[3];
        if (loggingInfo) {
          // If the logging info is not an array, that means only one place
          // scheduled the invocation.
          if (!(loggingInfo instanceof Array)) {
            // We'll treat single-scheduler cases specially to make the output
            // better for the user, even if it means some essentially-duplicated
            // code.
            originatingTarget = loggingInfo.originatingTarget;
            originatingMethod = loggingInfo.originatingMethod;
            originatingStack = loggingInfo.originatingStack;
            originatingMethodName = (originatingMethod ? originatingMethod.displayName : "(unknown)") || originatingMethod;
            Logger.log("Invoking runloop-scheduled method %@ on %@.  Originated by target %@,  method %@,  stack: ".fmt(methodName, target, originatingTarget, originatingMethodName), originatingStack);
          } else {
            Logger.log("Invoking runloop-scheduled method %@ on %@, which was scheduled by multiple target/method pairs:".fmt(methodName, target));
            loggingInfos = loggingInfo;
            for (j = 0, jLen = loggingInfos.length; j < jLen; ++j) {
              loggingInfo = loggingInfos[j];
              originatingTarget = loggingInfo.originatingTarget;
              originatingMethod = loggingInfo.originatingMethod;
              originatingStack = loggingInfo.originatingStack;
              originatingMethodName = (originatingMethod ? originatingMethod.displayName : "(unknown)") || originatingMethod;
              Logger.log("  [%@]  originated by target %@,  method %@,  stack:".fmt(j, originatingTarget, originatingMethodName), originatingStack);
            }
          }
        } else {
          // If we didn't capture information for this invocation, just report
          // what we can.
          Logger.log("Invoking runloop-scheduled method %@ on %@, but we didn’t capture information about who scheduled it…".fmt(methodName, target));
        }
      }
      //@endif
    }
  },

  /**
    Returns a new instance of the set with the contents cloned.
  */
  clone: function () {
    var newSet = ObserverSet.create(),
      memberArray = this.members;

    newSet._members = clone(this._members);
    var newMembers = newSet.members;

    for (var i = 0, l = memberArray.length; i < l; i++) {
      newMembers[i] = clone(memberArray[i]);
      // just leave the length as is
      // newMembers[i].length = 3;
      //@if(debug)
      // newMembers[i].length = 4;
      //@endif
    }

    return newSet;
  },

  /**
    Creates a new instance of the observer set.
  */
  create: function () {
    return new ObserverSet.constructor();
  },

  getMembers: function () {
    return this.members.slice(0);
  },

  constructor: function () {
    this._members = {};
    /**@type ObserverSetMember[] */
    this.members = [];
  }

};

ObserverSet.constructor.prototype = ObserverSet;
ObserverSet.slice = ObserverSet.clone;
ObserverSet.copy = ObserverSet.clone;
