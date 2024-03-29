// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { $A } from '../system/base.js';
import { property, cacheable, idempotent, enhance, observes } from '../system/function.js';

/**
  Indicates that the function should be treated as a computed property.

  Computed properties are methods that you want to treat as if they were
  static properties.  When you use get() or set() on a computed property,
  the object will call the property method and return its value instead of
  returning the method itself.  This makes it easy to create "virtual
  properties" that are computed dynamically from other properties.

  Consider the following example:

        contact = SC.Object.create({

          firstName: "Charles",
          lastName: "Jolley",

          // This is a computed property!
          fullName: function() {
            return this.getEach('firstName','lastName').compact().join(' ') ;
          }.property('firstName', 'lastName'),

          // this is not
          getFullName: function() {
            return this.getEach('firstName','lastName').compact().join(' ') ;
          }
        });

        contact.get('firstName') ;
        --> "Charles"

        contact.get('fullName') ;
        --> "Charles Jolley"

        contact.get('getFullName') ;
        --> function()

  Note that when you get the fullName property, SproutCore will call the
  fullName() function and return its value whereas when you get() a property
  that contains a regular method (such as getFullName above), then the
  function itself will be returned instead.

  Using Dependent Keys
  ----

  Computed properties are often computed dynamically from other member
  properties.  Whenever those properties change, you need to notify any
  object that is observing the computed property that the computed property
  has changed also.  We call these properties the computed property is based
  upon "dependent keys".

  For example, in the contact object above, the fullName property depends on
  the firstName and lastName property.  If either property value changes,
  any observer watching the fullName property will need to be notified as
  well.

  You inform SproutCore of these dependent keys by passing the key names
  as parameters to the property() function.  Whenever the value of any key
  you name here changes, the computed property will be marked as changed
  also.

  You should always register dependent keys for computed properties to
  ensure they update.

  Sometimes you may need to depend on keys that are several objects deep. In
  that case, you can provide a path to property():

      capitalizedName: function() {
        return this.getPath('person.fullName').toUpper();
      }.property('person.fullName')

  This will cause observers of +capitalizedName+ to be fired when either
  +fullName+ _or_ +person+ changes.

  Using Computed Properties as Setters
  ---

  Computed properties can be used to modify the state of an object as well
  as to return a value.  Unlike many other key-value system, you use the
  same method to both get and set values on a computed property.  To
  write a setter, simply declare two extra parameters: key and value.

  Whenever your property function is called as a setter, the value
  parameter will be set.  Whenever your property is called as a getter the
  value parameter will be undefined.

  For example, the following object will split any full name that you set
  into a first name and last name components and save them.

        contact = SC.Object.create({

          fullName: function(key, value) {
            if (value !== undefined) {
              var parts = value.split(' ') ;
              this.beginPropertyChanges()
                .set('firstName', parts[0])
                .set('lastName', parts[1])
              .endPropertyChanges() ;
            }
            return this.getEach('firstName', 'lastName').compact().join(' ');
          }.property('firstName','lastName')

        }) ;

  Why Use The Same Method for Getters and Setters?
  ---

  Most property-based frameworks expect you to write two methods for each
  property but SproutCore only uses one. We do this because most of the time
  when you write a setter is is basically a getter plus some extra work.
  There is little added benefit in writing both methods when you can
  conditionally exclude part of it. This helps to keep your code more
  compact and easier to maintain.

  @param {...String} dependentKeys optional set of dependent keys
  @returns {Function} the declared function instance
*/
Function.prototype.property = function (...dependentKeys) {
  return property(this, dependentKeys);
};

/**
  You can call this method on a computed property to indicate that the
  property is cacheable (or not cacheable).  By default all computed
  properties are not cached.  Enabling this feature will allow SproutCore
  to cache the return value of your computed property and to use that
  value until one of your dependent properties changes or until you
  invoke propertyDidChange() and name the computed property itself.

  If you do not specify this option, computed properties are assumed to be
  not cacheable.

  @param {Boolean} [aFlag] optionally indicate cacheable or no, default true
  @returns {Function} receiver, useful for chaining calls.
*/
Function.prototype.cacheable = function (aFlag) {
  return cacheable(this, aFlag);
};

/**
  Indicates that the computed property is volatile.  Normally SproutCore
  assumes that your computed property is idempotent.  That is, calling
  set() on your property more than once with the same value has the same
  effect as calling it only once.

  All non-computed properties are idempotent and normally you should make
  your computed properties behave the same way.  However, if you need to
  make your property change its return value every time your method is
  called, you may chain this to your property to make it volatile.

  If you do not specify this option, properties are assumed to be
  non-volatile.

  @param {Boolean} [aFlag] optionally indicate state, default to true
  @returns {Function} receiver, useful for chaining calls.
*/
Function.prototype.idempotent = function (aFlag) {
  return idempotent(this, aFlag);
};

Function.prototype.enhance = function () {
  return enhance(this);
};

/**
  Declare that a function should observe an object or property at the named
  path.  Note that the path is used only to construct the observation one time.

  @param {...String} propertyPaths A list of strings which indicate the
    properties being observed

  @returns {import('../../typings/core.js').SCObserverMethod} receiver, useful for chaining calls.
*/
Function.prototype.observes = function (...propertyPaths) {
  return observes(this, propertyPaths);
};


// // wrap the function in a runloop
let RunLoop;
import('../system/runloop.js').then(r => {
  RunLoop = r.RunLoop;
});

Function.prototype.runloop = function (thisParam = this) {
  const fn = this;
  return (...args) => {
    RunLoop.begin();
    fn.apply(thisParam, args);
    RunLoop.end();
  }
}

/**
 * Import Timer async. It might be that this needs orchestration through the same mechamism as the other 
 * async imports (such as in system/object.js etc).
 * Basic idea is that if this causes race conditions, it should be orchestrated.
 */

let Timer;

import('../system/timer.js').then(r => {
  Timer = r.Timer;
});


/**
  Creates a timer that will execute the function after a specified 
  period of time.
  
  If you pass an optional set of arguments, the arguments will be passed
  to the function as well.  Otherwise the function should have the 
  signature:
  
      function functionName(timer)

  @param target {Object} optional target object to use as this
  @param interval {Number} the time to wait, in msec
  @returns {SC.Timer} scheduled timer
*/

Function.prototype.invokeLater = function (target, interval) {
  if (interval === undefined) interval = 1;
  var f = this;
  if (arguments.length > 2) {
    var args = $A(arguments).slice(2, arguments.length);
    args.unshift(target);
    // f = f.bind.apply(f, args) ;
    var func = f;
    // Use "this" in inner func because it get its scope by 
    // outer func f (=target). Could replace "this" with target for clarity.
    f = function () { return func.apply(this, args.slice(1)); };
  }
  return Timer.schedule({ target: target, action: f, interval: interval });
}