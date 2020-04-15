// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { fmt, w, capitalize, camelize, decamelize, dasherize, mult } from '../system/string.js';

/**
  @see SC.String.fmt
*/
String.prototype.fmt = function (...args) {
  return fmt(this, args);
};

/**
  @see SC.String.w
  @returns {Array}
*/
String.prototype.w = function () {
  return w(this);
}

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
