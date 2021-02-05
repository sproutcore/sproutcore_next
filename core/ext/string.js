// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { fmt, w, capitalize, camelize, decamelize, dasherize, mult, loc, locLayout, locMetric, locWithDefault, escapeCssIdForSelector } from '../system/string.js';

/**
  @see SC.String.fmt
  @memberof String 
  @returns {string}
*/
String.prototype.fmt = function (...args) {
  return fmt(this, args);
};

/**
  @see SC.String.w
  @memberof String 
  @returns {Array}
*/
String.prototype.w = function () {
  return w(this);
}

/**
 * @memberof String 
 * @returns {string}
 */
String.prototype.capitalize = function () {
  return capitalize(this);
}

String.prototype.camelize = function () {
  return camelize(this);
}

String.prototype.decamelize = function () {
  return decamelize(this);
}

String.prototype.dasherize = function () {
  return dasherize(this);
}

String.prototype.mult = function (value) {
  // @ts-ignore
  return mult(this, value);
}

String.prototype.loc = function(...args) {
  args.unshift(this);
  return loc(...args);
};

String.prototype.locWithDefault = function (...args) {
  args.unshift(this);
  locWithDefault(...args);
};
// /**
//   @see SC.String.locWithDefault
// */
// locWithDefault: function(def) {
//   var args = SC.$A(arguments);
//   args.unshift(this);
//   return SC.String.locWithDefault.apply(SC.String, args);
// },

// String.prototype.loc = function (str, ...args) {
//   return loc(this.toString(), args);
// };

// String.prototype.locMetric = function () {
//   return locMetric(this.toString());
// };

String.prototype.locLayout = function (obj) {
  return locLayout(this.toString(), obj);
}

String.prototype.locWithDefault = function (def, ...args) {
  return locWithDefault(this.toString(), def, ...args);
}

String.prototype.locMetric = function () {
  return locMetric(this.toString());
};

String.prototype.escapeCssIdForSelector = function () {
  return escapeCssIdForSelector(this);
}