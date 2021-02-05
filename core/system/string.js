// ==========================================================================
// Project:   SproutCore Costello - Property Observing Library
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { $A, none, typeOf } from "./base.js";
import { T_NUMBER, T_STRING } from "./constants.js";
import { Locale } from "./locale.js";
import { error } from "./logger.js";


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

/**
  Escapes the given string to make it safe to use as a jQuery selector.
  jQuery will interpret '.' and ':' as class and pseudo-class indicators.

  @see http://learn.jquery.com/using-jquery-core/faq/how-do-i-select-an-element-by-an-id-that-has-characters-used-in-css-notation/

  @param {String} str the string to escape
  @returns {String} the escaped string
*/
export const escapeCssIdForSelector = function (str) {
  return str.replace(STRING_CSS_ESCAPED_REGEXP, '\\$1');
};

  /**
    Localizes the string.  This will look up the receiver string as a key
    in the current Strings hash.  If the key matches, the loc'd value will be
    used.  The resulting string will also be passed through fmt() to insert
    any variables.

    @param str {String} String to localize
    @param args {Object...} optional arguments to interpolate also
    @returns {String} the localized and formatted string.
  */
export const loc = function (str) {
  // NB: This could be implemented as a wrapper to locWithDefault() but
  // it would add some overhead to deal with the arguments and adds stack
  // frames, so we are keeping the implementation separate.
  if (!Locale.currentLocale) { Locale.createCurrentLocale(); }

  var localized = Locale.currentLocale.locWithDefault(str);
  if (typeOf(localized) !== T_STRING) { localized = str; }

  var args = $A(arguments);
  args.shift(); // remove str param
  //to extend String.prototype
  if (args.length > 0 && args[0] && args[0].isSCArray) { args = args[0]; }

  // I looked up the performance of try/catch. IE and FF do not care so
  // long as the catch never happens. Safari and Chrome are affected rather
  // severely (10x), but this is a one-time cost per loc (the code being
  // executed is likely as expensive as this try/catch cost).
  //
  // Also, .loc() is not called SO much to begin with. So, the error handling
  // that this gives us is worth it.
  try {
    return fmt(localized, args);      
  } catch (e) {
      error("Error processing string with key: " + str);
      error("Localized String: " + localized);
      error("Error: " + e);
  }

};

/**
  Returns the localized metric value for the specified key.  A metric is a
  single value intended to be used in your interface’s layout, such as
  "Button.Confirm.Width" = 100.

  If you would like to return a set of metrics for use in a layout hash, you
  may prefer to use the locLayout() method instead.

  @param {String} key
  @returns {Number} the localized metric
*/
export const locMetric = function (key) {
  let K             = Locale,
      currentLocale = K.currentLocale;

  if (!currentLocale) {
    K.createCurrentLocale();
    currentLocale = K.currentLocale;
  }
  return currentLocale.locMetric(key);
};

/**
  Creates and returns a new hash suitable for use as an View’s 'layout'
  hash.  This hash will be created by looking for localized metrics following
  a pattern based on the “base key” you specify.

  For example, if you specify "Button.Confirm", the following metrics will be
  used if they are defined:

    Button.Confirm.left
    Button.Confirm.top
    Button.Confirm.right
    Button.Confirm.bottom
    Button.Confirm.width
    Button.Confirm.height
    Button.Confirm.midWidth
    Button.Confirm.minHeight
    Button.Confirm.centerX
    Button.Confirm.centerY

  Additionally, you can optionally specify a hash which will be merged on top
  of the returned hash.  For example, if you wish to allow a button’s width
  to be configurable per-locale, but always wish for it to be centered
  vertically and horizontally, you can call:

    locLayout("Button.Confirm", {centerX:0, centerY:0})

  …so that you can combine both localized and non-localized elements in the
  returned hash.  (An exception will be thrown if there is a locale-specific
  key that matches a key specific in this hash.)


  For example, if your locale defines:

    Button.Confirm.left
    Button.Confirm.top
    Button.Confirm.right
    Button.Confirm.bottom


  …then these two code snippets will produce the same result:

    layout: {
      left:   "Button.Confirm.left".locMetric(),
      top:    "Button.Confirm.top".locMetric(),
      right:  "Button.Confirm.right".locMetric(),
      bottom: "Button.Confirm.bottom".locMetric()
    }

    layout: "Button.Confirm".locLayout()

  The former is slightly more efficient because it doesn’t have to iterate
  through the possible localized layout keys, but in virtually all situations
  you will likely wish to use the latter.

  @param str {String} key
  @param {str} (optional) additionalHash
  @param {String} (optional) additionalHash
  @returns {Number} the localized metric
*/
export const locLayout = function (key, additionalHash) {
  let K             = Locale,
      currentLocale = K.currentLocale;

  if (!currentLocale) {
    K.createCurrentLocale();
    currentLocale = K.currentLocale;
  }
  return currentLocale.locLayout(key, additionalHash);
};

/**
  Works just like loc() except that it will return the passed default
  string if a matching key is not found.

  @param {String} str the string to localize
  @param {String} def the default to return
  @param {Object...} args optional formatting arguments
  @returns {String} localized and formatted string
*/
export const locWithDefault = function (str, def) {
  if (!Locale.currentLocale) { Locale.createCurrentLocale(); }

  var localized = Locale.currentLocale.locWithDefault(str, def);
  if (typeOf(localized) !== T_STRING) { localized = str; }

  var args = $A(arguments);
  args.shift(); // remove str param
  args.shift(); // remove def param

  return fmt(localized, args);
};



export const SCString = {
  fmt,
  w,
  capitalize,
  camelize,
  decamelize,
  dasherize,
  mult,
  escapeCssIdForSelector,
  loc,
  locMetric,
  locLayout,
  locWithDefault
}