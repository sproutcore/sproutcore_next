import { T_CLASS, T_ARRAY, T_BOOL, T_DATE, T_UNDEFINED, T_NULL, T_NUMBER, T_HASH, T_FUNCTION, VERSION, T_ERROR, T_OBJECT, T_STRING } from './constants.js';

/**
  @private

  Adds properties to a target object. You must specify whether
  to overwrite a value for a property or not.

  Used as a base function for the wrapper functions mixin and supplement.

  @param {Boolean} override if a target has a value for a property, this specifies
                  whether or not to overwrite that value with the copyied object's
                  property value.
  @param {Object[] } args The first item of args is the target object to extend,
                  any following arguments are objects with properties to copy.
  @returns {Object} the target object.
  @static
*/

const _baseMixin = (override, args) => {
  // Copy reference to target object
  var target = args[0] || {},
    idx = 1,
    length = args.length,
    options, copy, key;

  // Handle case where we have only one item...extend SC
  if (length === 1) {
    target = this || {};
    idx = 0;
  }

  for (; idx < length; idx++) {
    if (!(options = args[idx])) continue;
    for (key in options) {
      if (!options.hasOwnProperty(key)) continue;
      copy = options[key];
      if (target === copy) continue; // prevent never-ending loop
      if (copy !== undefined && (override || (target[key] === undefined))) target[key] = copy;
    }
    // Manually copy toString() because some JS engines do not enumerate it
    // (such as IE8)
    if (options.hasOwnProperty('toString')) target.toString = options.toString;
  }

  return target;
};

/**
  Adds properties to a target object.

  Takes the root object and adds the attributes for any additional
  arguments passed.
  @param {...Object} args Array of objects to mixin. The first object is the
                          target the target object to extend. Any following
                          items are objects with properties to copy.

  @returns {Object} the target object.
  @static
*/
export const mixin = (...args) => {
  return _baseMixin(true, args);
};

/**
  Adds properties to a target object.  Unlike mixin, however, if the target
  already has a value for a property, it will not be overwritten.

  Takes the root object and adds the attributes for any additional
  arguments passed.

  @param {...Object} args Array of objects to mixin. The first object is the
                          target the target object to extend. Any following
                          items are objects with properties to copy.
  @returns {Object} the target object.
  @static
*/
export const supplement = (...args) => {
  return _baseMixin(false, args);
};

/**
  Alternative to mixin.  Provided for compatibility with jQuery.
  @function
*/
export const extend = mixin;

// ..........................................................
// CORE FUNCTIONS
//
// Enough with the bootstrap code.  Let's define some core functions

// ........................................
// TYPING & ARRAY MESSAGING
//

// Inlined from jQuery to avoid dependency.
const _nativeToString = Object.prototype.toString;


// Inlined from jQuery's class2type to avoid dependency.
const _nativeTypeHash = {
  "[object Boolean]": "boolean",
  "[object Number]": "number",
  "[object String]": "string",
  "[object Function]": "function",
  "[object Array]": "array",
  "[object Date]": "date",
  "[object RegExp]": "regexp",
  "[object Object]": "object"
};

// Inlined from jQuery.type to avoid dependency.
const _nativeTypeOf = (item) => {
  if (item === undefined) return T_UNDEFINED;
  if (item === null) return T_NULL;

  var nativeType = typeof item,
    toString;
  if (nativeType === "object" || nativeType === "function") {
    toString = _nativeToString.call(item);
    return _nativeTypeHash[toString] || "object";
  } else {
    return nativeType;
  }
};




/**
  Returns a consistent type for the passed item.

  Use this instead of the built-in typeOf() to get the type of an item.
  It will return the same result across all browsers and includes a bit
  more detail.

  @param {Object} item the item to check
  @returns {String} One of the following, depending on the type of the item<br>
          T_STRING: String primitive,<br>
          T_NUMBER: Number primitive,<br>
          T_BOOLEAN: Boolean primitive,<br>
          T_NULL: Null value,<br>
          T_UNDEFINED: Undefined value,<br>
          T_FUNCTION: A function,<br>
          T_DATE: Date primitive,<br>
          T_REGEXP: RegExp primitive,<br>
          T_ARRAY: An instance of Array,<br>
          T_CLASS: A SproutCore class (created using SCObject.extend()),<br>
          T_OBJECT: A SproutCore object instance,<br>
          T_HASH: A JavaScript object not inheriting from SCObject, <br>
          T_ERROR: A SproutCore Error object <br>
*/
export const typeOf = (item) => {
  var nativeType = _nativeTypeOf(item);

  // Translate it into an SC type.
  if (nativeType === "function") {
    return item.isClass ? T_CLASS : T_FUNCTION;
  } else if (nativeType === "object") {

    // Note: typeOf() may be called before Error has had a chance to load
    // so this code checks for the presence of Error first just to make
    // sure.  No error instance can exist before the class loads anyway so
    // this is safe.
    if (item.isError && item._isSCError) {
      return T_ERROR;
    } else if (item.isObject && item._isSCObject) {
      return T_OBJECT;
    } else {
      return T_HASH;
    }
  }

  return nativeType;
};



/**
  Returns true if the passed value is null or undefined.  This avoids errors
  from JSLint complaining about use of ==, which can be technically
  confusing.

  @param {Object} obj value to test
  @returns {Boolean}
*/
export const none = (obj) => {
  /*jshint eqnull:true */
  return obj == null;
};

/**
  Verifies that a value is either null or an empty string. Return false if
  the object is not a string.

  @param {Object} obj value to test
  @returns {Boolean}
*/
export const empty = (obj) => {
  return obj === null || obj === undefined || obj === '';
};

/**
  Returns true if the passed object is an array or Array-like.

  SproutCore Array Protocol:
  * the object has an objectAt property; or
  * the object is a native Array; or
  * the object is an Object, and has a length property

  Unlike typeOf this method returns true even if the passed object is
  not formally array but appears to be array-like (i.e. has a length
  property, responds to .objectAt, etc.)

  @param {Object} obj the object to test
  @returns {Boolean}
*/
export const isArray = (obj) => {
  if (!obj || obj.setInterval) {
    return false;
  }
  if (Array.isArray && Array.isArray(obj)) {
    return true;
  }
  if (obj.objectAt) {
    return true;
  }
  if (obj.length !== undefined && _nativeTypeOf(obj) === "object") {
    return true;
  }

  return false;
};

/**
  Makes an object into an Array if it is not array or array-like already.
  Unlike A(), this method will not clone the object if it is already
  an array.

  @param {Object} obj object to convert
  @returns {Array} Actual array
*/
export const makeArray = (obj) => {
  return isArray(obj) ? obj : A(obj);
};

/**
  Converts the passed object to an Array.  If the object appears to be
  array-like, a new array will be cloned from it.  Otherwise, a new array
  will be created with the item itself as the only item in the array.

  @param {Object} obj any enumerable or array-like object.
  @returns {Array} Array of items
*/
export const A = (obj) => {
  // null or undefined -- fast path
  if (obj === null || obj === undefined) return [];

  // primitive -- fast path
  if (obj.slice instanceof Function) {
    // do we have a string?
    if (typeof (obj) === 'string') return [obj];
    else return obj.slice();
  }

  // enumerable -- fast path
  if (obj.toArray) return obj.toArray();

  // if not array-like, then just wrap in array.
  if (!isArray(obj)) return [obj];

  // when all else fails, do a manual convert...
  var ret = [],
    len = obj.length;
  while (--len >= 0) ret[len] = obj[len];
  return ret;
};

//
// GUIDS & HASHES
//

// Like jQuery.expando but without any risk of conflict
export const guidKey =  "SproutCore" + (VERSION + Math.random()).replace(/\D/g, "");

// Used for guid generation...
const _keyCache = {};
let _uuid = 0;

/**
  Returns a unique GUID for the object.  If the object does not yet have
  a guid, one will be assigned to it.  You can call this on any object,
  Object-based or not, but be aware that it will add a _guid property.

  You can also use this method on DOM Element objects.

  @param {Object} obj any object, string, number, Element, or primitive
  @returns {String} the unique guid for this instance.
*/
export const guidFor = (obj) => {
  switch (typeof obj) {
    case 'number': // T_NUMBER
    case 'string': // T_STRING
      // Don't allow prototype changes to String etc. to change the guidFor
      return '(' + obj + ')'; // E.g. '(Abc)' or '(123)'
      break;
    case 'boolean': // T_BOOLEAN
      return obj ? "(true)" : "(false)";
      break;
    case 'undefined': // T_UNDEFINED
      return "(undefined)";
      break;
    case 'object':
      if (obj === null) return "(null)";
      break;
  }

  if (obj[guidKey]) return obj[guidKey];

  // More special cases; not as common, so we check for them after the cache
  // lookup
  if (obj === Object) return '(Object)';
  if (obj === Array) return '(Array)';

  return generateGuid(obj, "sc");
};

/**
  Generates a new guid, optionally saving the guid to the object that you
  pass in.  You will rarely need to use this method.  Instead you should
  call guidFor(obj), which return an existing guid if available.

  @param {Object} obj the object to assign the guid to
  @param {String} prefix prefixes the generated guid
  @returns {String} the guid
*/
export const generateGuid = (obj, prefix) => {
  var ret = (prefix + (_uuid++));
  if (obj) obj[guidKey] = ret;
  return ret;
};

/**
  Returns a unique hash code for the object. If the object implements
  a hash() method, the value of that method will be returned. Otherwise,
  this will return the same value as guidFor().

  If you pass multiple arguments, hashFor returns a string obtained by
  concatenating the hash code of each argument.

  Unlike guidFor(), this method allows you to implement logic in your
  code to cause two separate instances of the same object to be treated as
  if they were equal for comparisons and other functions.

  <b>IMPORTANT</b>: If you implement a hash() method, it MUST NOT return a
  number or a string that contains only a number. Typically hash codes
  are strings that begin with a "%".

  @param {...Object} objects the object(s)
  @returns {String} the hash code for this instance.
*/
export const hashFor = (...objects) => {
  let h = '', f;
  for (let obj of objects) {
    h += (obj && (f = obj.hash) && (typeof f === T_FUNCTION)) ? f.call(obj) : guidFor(obj);
  }

  return h === '' ? null : h;
};

/**
  This will compare the two object values using their hash codes.

  @param {Object} a first value to compare
  @param {Object} b the second value to compare
  @returns {Boolean} true if the two have equal hash code values.

*/
export const isEqual = (a, b) => {
  // QUESTION: is there a compelling performance reason to special-case
  // undefined here?
  return hashFor(a) === hashFor(b);
};

/**
 This will compare two javascript values of possibly different types.
  It will tell you which one is greater than the other by returning
  -1 if the first is smaller than the second,
  0 if both are equal,
  1 if the first is greater than the second.

  The order is calculated based on ORDER_DEFINITION , if types are different.
  In case they have the same type an appropriate comparison for this type is made.

  @param {Object} v first value to compare
  @param {Object} w the second value to compare
  @returns {NUMBER} -1 if v < w, 0 if v = w and 1 if v > w.

*/

/** @private Used by compare */
const ORDER_DEFINITION = [T_ERROR,
  T_UNDEFINED,
  T_NULL,
  T_BOOL,
  T_NUMBER,
  T_STRING,
  T_ARRAY,
  T_HASH,
  T_OBJECT,
  T_FUNCTION,
  T_CLASS
];

const ORDER_DEFINITION_MAPPING = {};
for (let idx = 0, len = ORDER_DEFINITION.length; idx < len; ++idx) {
  ORDER_DEFINITION_MAPPING[ORDER_DEFINITION[idx]] = idx;
}

export const compare = function compare (v, w)  {
  // Doing a '===' check is very cheap, so in the case of equality, checking
  // this up-front is a big win.
  if (v === w) return 0;

  var type1 = typeOf(v);
  var type2 = typeOf(w);

  // If we haven't yet generated a reverse-mapping of ORDER_DEFINITION,
  // do so now.
  var mapping = ORDER_DEFINITION_MAPPING;

  var type1Index = mapping[type1];
  var type2Index = mapping[type2];

  if (type1Index < type2Index) return -1;
  if (type1Index > type2Index) return 1;

  // ok - types are equal - so we have to check values now
  switch (type1) {
    case T_BOOL:
    case T_NUMBER:
      if (v < w) return -1;
      if (v > w) return 1;
      return 0;

    case T_STRING:
      var comp = v.localeCompare(w);
      if (comp < 0) return -1;
      if (comp > 0) return 1;
      return 0;

    case T_ARRAY:
      var vLen = v.length;
      var wLen = w.length;
      var l = Math.min(vLen, wLen);
      var r = 0;
      var i = 0;
      while (r === 0 && i < l) {
        r = compare(v[i], w[i]);
        i++;
      }
      if (r !== 0) return r;

      // all elements are equal now
      // shorter array should be ordered first
      if (vLen < wLen) return -1;
      if (vLen > wLen) return 1;
      // arrays are equal now
      return 0;

    case T_OBJECT:
      if (v.constructor.isComparable === true) return v.constructor.compare(v, w);
      return 0;

    default:
      return 0;
  }
};

// ..........................................................
// OBJECT MANAGEMENT
//

/**
  Empty function.  Useful for some operations.
  Mainly used as temporary and anonymous constructor
*/
export const K = function () {
  // return this;
};

/**
  Empty array.  Useful for some optimizations.

  @type Array
*/
export const EMPTY_ARRAY = [];

/**
  Empty hash.  Useful for some optimizations.

  @type Object
*/
export const EMPTY_HASH = {};

/**
 * @typedef Range
 * @property {Number} start
 * @property {Number} length
 */

/**
  Empty range. Useful for some optimizations.

  @type Range
*/
export const EMPTY_RANGE = {
  start: 0,
  length: 0
};

/**
  Creates a new object with the passed object as its prototype.

  This method uses JavaScript's native inheritance method to create a new
  object.

  You cannot use beget() to create new Object-based objects, but you
  can use it to beget Arrays, Hashes, Sets and objects you build yourself.
  Note that when you beget() a new object, this method will also call the
  didBeget() method on the object you passed in if it is defined.  You can
  use this method to perform any other setup needed.

  In general, you will not use beget() often as Object is much more
  useful, but for certain rare algorithms, this method can be very useful.

  For more information on using beget(), see the section on beget() in
  Crockford's JavaScript: The Good Parts.

  @param {Object} obj the object to beget
  @returns {Object} the new object.
*/
export const beget = (obj) => {
  if (obj === null || obj === undefined) return null;
  K.prototype = obj;
  var ret = new K();
  K.prototype = null; // avoid leaks
  if (typeof obj.didBeget === "function") ret = obj.didBeget(ret);
  return ret;
};

/**
  Creates a clone of the passed object.  This function can take just about
  any type of object and create a clone of it, including primitive values
  (which are not actually cloned because they are immutable).

  If the passed object implements the clone() method, then this function
  will simply call that method and return the result.

  @param {Object} object the object to clone
  @param {Boolean} deep if true, a deep copy of the object is made
  @returns {Object} the cloned object
*/
export const copy = (object, deep = false) => {
  var ret = object,
    idx;

  // fast paths
  if (object) {
    if (object.isCopyable) return object.copy(deep);
    if (object.clone) return object.clone();
  }

  switch (_nativeTypeOf(object)) {
    case "array":
      ret = object.slice();

      if (deep) {
        idx = ret.length;
        while (idx--) {
          ret[idx] = copy(ret[idx], true);
        }
      }
      break;

    case "object":
      ret = {};
      for (var key in object) {
        ret[key] = deep ? copy(object[key], true) : object[key];
      }
  }

  return ret;
};

/**
  Returns a new object combining the values of all passed hashes.

  @param {...Object} objects one or more objects
  @returns {Object} new Object
*/
export const merge = function (...objects) {
  var ret = {};
  for (const arg of objects) {
    mixin(ret, arg);
  }
  return ret;
};

/**
  Returns all of the keys defined on an object or hash.  This is useful
  when inspecting objects for debugging.

  @param {Object} obj The Object
  @returns {Array} array of keys
*/
export const keys = (obj) => {
  console.warn("SCCore#keys is deprecated, use Object.keys instead");
  return Object.keys(obj);
};

/**
  Convenience method to inspect an object.  This method will attempt to
  convert the object into a useful string description.

  @param {Object} obj The object you want to inspect.

  @returns {String} A description of the object
*/
export const inspect = (obj) => {
  var v, ret = [];
  for (var key in obj) {
    v = obj[key];
    if (v === 'toString') continue; // ignore useless items
    if (typeOf(v) === T_FUNCTION) v = "function () { ... }";
    ret.push(key + ": " + v);
  }
  return "{ " + ret.join(", ") + " }";
};

/**
  Returns a tuple containing the object and key for the specified property
  path.  If no object could be found to match the property path, then
  returns null.

  This is the standard method used throughout SproutCore to resolve property
  paths.

  @param {String | Array} path the property path
  @param {Object} root optional parameter specifying the place to start
  @returns {Array} array with [object, property] if found or null
*/
export const tupleForPropertyPath = function (path, root) {
  /* jshint eqnull:true */
  // if passed nothing, return nothing.
  if (path == null) return null;

  // if the passed path is itself a tuple, return it
  if (typeof path === "object" && (path instanceof Array)) return path;

  // find the key.  It is the last . or first *
  var key;
  var stopAt = path.indexOf('*');
  if (stopAt < 0) stopAt = path.lastIndexOf('.');
  key = (stopAt >= 0) ? path.slice(stopAt + 1) : path;

  // convert path to object.
  var obj = objectForPropertyPath(path, root, stopAt);
  return (obj && key) ? [obj, key] : null;
};

/**
  Finds the object for the passed path or array of path components.  This is
  the standard method used in SproutCore to traverse object paths.

  @param {String|Array} path the path
  @param {Object} root optional root object.  window is used otherwise
  @param {Number} [stopAt] optional point to stop searching the path.
  @returns {Object} the found object or undefined.
*/
export const objectForPropertyPath = (path, root, stopAt) => {

  var loc, nextDotAt, key, max;

  // API change, we try to be modular, so no searching from window or global
  // simply provide an object
  //if (!root) root = window;
  if (!root) throw new Error("SCCore#objectForPropertyPath: no root provided");

  // faster method for strings
  if (typeof path === "string") {
    if (stopAt === undefined) stopAt = path.length;
    loc = 0;
    while ((root) && (loc < stopAt)) {
      nextDotAt = path.indexOf('.', loc);
      if ((nextDotAt < 0) || (nextDotAt > stopAt)) nextDotAt = stopAt;
      key = path.slice(loc, nextDotAt);
      root = root.get ? root.get(key) : root[key];
      loc = nextDotAt + 1;
    }
    if (loc < stopAt) root = undefined; // hit a dead end. :(

    // older method using an array
  } else {
    loc = 0;
    max = path.length;
    key = null;

    while ((loc < max) && root) {
      key = path[loc++];
      if (key) root = (root.get) ? root.get(key) : root[key];
    }
    if (loc < max) root = undefined;
  }

  return root;
};

/**
 Acts very similar to objectForPropertyPath(), the only difference is
  that it will throw an error when object can't be found.

  @param {String} path the path
  @param {Object} root optional root object.  window is used otherwise
  @param {Number} stopAt optional point to stop searching the path.
  @returns {Object} the found object or throws an error.
*/
export const requiredObjectForPropertyPath = (path, root, stopAt) => {
  var o = objectForPropertyPath(path, root, stopAt);
  if (!o) {
    throw new Error(path + " could not be found");
  }
  return o;
}


/** @private Alias for clone() */
export const clone = copy;

/** @private Alias for A() */
export const $A = A;

