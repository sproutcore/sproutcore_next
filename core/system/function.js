// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { guidFor, $A } from './base.js';


/**
  @param { SCMethod } fn
  @param { String[] } keys
  @returns { SCMethod }
*/
export const property = (fn, keys) => {
  fn.dependentKeys = $A(keys);
  var guid = guidFor(fn);
  fn.cacheKey = "__cache__" + guid;
  fn.lastSetValueKey = "__lastValue__" + guid;
  fn.isProperty = true;
  return fn;
};

  /**
    @see Function.prototype.cacheable
    @param { SCMethod } fn
    @param { Boolean } [aFlag]
  */
export const cacheable = (fn, aFlag) => {
  fn.isProperty = true; // also make a property just in case
  if (!fn.dependentKeys) fn.dependentKeys = [];
  fn.isCacheable = (aFlag === undefined) ? true : aFlag;
  return fn;
};

/**
  @see Function.prototype.idempotent
  @param { SCMethod } fn
  @param { Boolean } [aFlag]
  @returns { SCMethod }
*/
export const idempotent = (fn, aFlag) => {
  fn.isProperty = true; // also make a property just in case
  if (!fn.dependentKeys) fn.dependentKeys = [];
  fn.isVolatile = (aFlag === undefined) ? true : aFlag;
  return fn;
};

/**
  @see Function.prototype.enhance
  @param { SCMethod } fn
  @returns { SCMethod }

*/
export const enhance = (fn) => {
  fn.isEnhancement = true;
  return fn;
};

/**
  @see Function.prototype.observes
  @param { SCMethod } fn
  @param { String[] } propertyPaths
*/
export const observes = function (fn, propertyPaths) {
  // sort property paths into local paths (i.e just a property name) and
  // full paths (i.e. those with a . or * in them)
  var loc = propertyPaths.length,
    local = null,
    paths = null;
  while (--loc >= 0) {
    var path = propertyPaths[loc];
    // local
    if ((path.indexOf('.') < 0) && (path.indexOf('*') < 0)) {
      if (!local) local = fn.localPropertyPaths = [];
      local.push(path);

      // regular
    } else {
      if (!paths) paths = fn.propertyPaths = [];
      paths.push(path);
    }
  }
  return fn;
}


