// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { none, typeOf } from "./base.js";
import { T_NUMBER } from "./constants.js";


const STRING_TITLEIZE_REGEXP = (/([\s|\-|\_|\n])([^\s|\-|\_|\n]?)/g);
const STRING_DECAMELIZE_REGEXP = (/([a-z])([A-Z])/g);
const STRING_DASHERIZE_REGEXP = (/[ _]/g);
const STRING_DASHERIZE_CACHE = {};
const STRING_TRIM_LEFT_REGEXP = (/^\s+/g);
const STRING_TRIM_RIGHT_REGEXP = (/\s+$/g);
const STRING_CSS_ESCAPED_REGEXP = (/(:|\.|\[|\])/g);

  /**
    This finds the value for a key in a formatting string.

    Keys take the form:

        key[:argument to formatter]
  */
const _scs_valueForKey = function (key, data, /* for debugging purposes: */ string) {
  var arg, value, formatter, argsplit = key.indexOf(':');
  if (argsplit > -1) {
    arg = key.substr(argsplit + 1);
    key = key.substr(0, argsplit);
  }

  value = data.get ? data.get(key) : data[key];
  formatter = data[key + 'Formatter'];

  // formatters are optional
  if (formatter) value = formatter(value, arg);
  else if (arg) {
    throw new Error("String.fmt was given a formatting string, but key `" + key + "` has no formatter! String: " + string);
  }

  return value;
};

/**
  Formats a string. You can format either with named parameters or
  indexed, but not both.

  Indexed Parameters
  --------------------
  Indexed parameters are just arguments you pass into format. For example:

      "%@1 %@3 %@2".fmt(1, 2, 3)

      // -> "1 3 2"

  If you don't supply a number, it will use them in the order you supplied. For example:

      "%@, %@".fmt("Iskander", "Alex")

      // -> "Iskander, Alex"

  Named Paramters
  --------------------
  You can use named parameters like this:

      "Value: %{key_name}".fmt({ key_name: "A Value" })

      // -> "Value: A Value"

  You can supply formatters for each field. A formatter is a method to get applied
  to the parameter:

      Currency = function(v) { return "$" + v; };
      "Value: %{val}".fmt({ val: 12.00, valFormatter: Currency })

      // -> $12.00

  Formatters can also use arguments:

      Currency = function(v, sign) { return sign + v; };
      "Value: %{val:£}".fmt({ val: 12.00, valFormatter: Currency })

      // -> £12.00

  You can supply a different formatter for each named parameter. Formatters can ONLY be
  used with named parameters (not indexed parameters).

*/
export const fmt = (string, args) => {
  var i = 0,
    data, hasHadNamedArguments;
  if (args) {
    data = args[0];
  }

  return string.replace(/%\{(.*?)\}/g, function (match, propertyPath) {
    hasHadNamedArguments = true;
    if (!data) {
      throw new Error("Cannot use named parameters with `fmt` without a data hash. String: '" + string + "'");
    }

    var ret = _scs_valueForKey(propertyPath, data, string);
    // If a value was found, return that; otherwise return the original matched text to retain it in the string
    // for future formatting.
    if (!none(ret)) {
      return ret;
    } else {
      return match;
    }
  }).replace(/%@([0-9]+)?/g, function (match, index) {
    if (hasHadNamedArguments) {
      throw new Error("Invalid attempt to use both named parameters and indexed parameters. String: '" + string + "'");
    }
    index = index ? parseInt(index, 10) - 1 : i++;
    if (args[index] !== undefined) return args[index];
    else return "";
  });
};

/**
  Splits the string into words, separated by spaces. Empty strings are
  removed from the results.

  @returns {Array} An array of non-empty strings
*/
export const w = function (str) {
  var ary = [],
    ary2 = str.split(' '),
    len = ary2.length,
    string, idx = 0;
  for (idx = 0; idx < len; ++idx) {
    string = ary2[idx];
    if (string.length !== 0) ary.push(string); // skip empty strings
  }
  return ary;
};

  /**
    Capitalizes a string.

    ## Examples

        capitalize('my favorite items') // 'My favorite items'
        capitalize('css-class-name')    // 'Css-class-name'
        capitalize('action_name')       // 'Action_name'
        capitalize('innerHTML')         // 'InnerHTML'

    @return {String} capitalized string
  */
export const capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
  Camelizes a string.  This will take any words separated by spaces, dashes
  or underscores and convert them into camelCase.

  ## Examples

      camelize('my favorite items') // 'myFavoriteItems'
      camelize('css-class-name')    // 'cssClassName'
      camelize('action_name')       // 'actionName'
      camelize('innerHTML')         // 'innerHTML'

  @returns {String} camelized string
*/
export const camelize = function (str) {
  var ret = str.replace(STRING_TITLEIZE_REGEXP, function (str, separater, character) {
    return character ? character.toUpperCase() : '';
  });

  var first = ret.charAt(0),
    lower = first.toLowerCase();

  return first !== lower ? lower + ret.slice(1) : ret;
};

/**
  Converts a camelized string into all lower case separated by underscores.

  ## Examples

  decamelize('my favorite items') // 'my favorite items'
  decamelize('css-class-name')    // 'css-class-name'
  decamelize('action_name')       // 'action_name'
  decamelize('innerHTML')         // 'inner_html'

  @returns {String} the decamelized string.
*/
export const decamelize = function (str) {
  return str.replace(STRING_DECAMELIZE_REGEXP, '$1_$2').toLowerCase();
};

/**
  Converts a camelized string or a string with spaces or underscores into
  a string with components separated by dashes.

  ## Examples

  | *Input String* | *Output String* |
  dasherize('my favorite items') // 'my-favorite-items'
  dasherize('css-class-name')    // 'css-class-name'
  dasherize('action_name')       // 'action-name'
  dasherize('innerHTML')         // 'inner-html'

  @returns {String} the dasherized string.
*/
export const dasherize = function (str) {
  var cache = STRING_DASHERIZE_CACHE,
    ret = cache[str];

  if (ret) {
    return ret;
  } else {
    ret = decamelize(str).replace(STRING_DASHERIZE_REGEXP, '-');
    cache[str] = ret;
  }

  return ret;
};

/**
  Mulitplies a given string. For instance if you have a string "xyz"
  and multiply it by 2 the result is "xyzxyz".

  @param {string} str the string to multiply
  @param {Number} value the number of times to multiply the string
  @returns {string} the mulitiplied string
*/
export const mult = function (str, value) {
  if (typeOf(value) !== T_NUMBER || value < 1) return null;

  var ret = "";
  for (var i = 0; i < value; i += 1) {
    ret += str;
  }

  return ret;
}

export const SCString = {
  fmt,
  w,
  capitalize,
  camelize,
  decamelize,
  dasherize,
  mult
}