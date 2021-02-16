// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { fmt, w, capitalize, camelize, decamelize, dasherize, mult, loc, locLayout, locMetric, locWithDefault, escapeCssIdForSelector, singularize, pluralize, trimRight, trimLeft, removeDiacritics, escapeForRegExp, humanize, classify, titleize, capitalizeEach } from '../system/string.js';

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
};


  /**
    @see SC.String.capitalizeEach
  */
String.prototype.capitalizeEach = function() {
  return capitalizeEach(this, arguments);
};

/**
  @see SC.String.titleize
*/
String.prototype.titleize = function(str) {
  return titleize(this, arguments);
};

/**
  @see SC.String.classify
*/
String.prototype.classify = function(str) {
  return classify(this, arguments);
};

/**
  @see SC.String.humanize
*/
String.prototype.humanize = function(str) {
  return humanize(this, arguments);
};

/**
  @see SC.String.escapeForRegExp
*/
String.prototype.escapeForRegExp = function(str) {
  return escapeForRegExp(this, arguments);
};

/**
  @see SC.String.removeDiacritics
*/
String.prototype.removeDiacritics = function(str) {
  return removeDiacritics(this, arguments);
};

// /**
//   @see SC.String.trim
// */
// trim: function(str) {
//   return SC.String.trim(this, arguments);
// },

/**
  @see SC.String.trimLeft
*/
if (!String.prototype.trimLeft) {
  String.prototype.trimLeft = function (str) {
    return trimLeft(this, arguments);
  }
}

/**
  @see SC.String.trimRight
*/
if (!String.prototype.trimRight) {
  String.prototype.trimRight = function (str) {
    return trimRight(this, arguments);
  }
}

/**
  @see SC.String.pluralize
*/
String.prototype.pluralize = function(str) {
  return pluralize(this, arguments);
};

/**
  @see SC.String.singularize
*/
String.prototype.singularize = function(str) {
  return singularize(this, arguments);
}