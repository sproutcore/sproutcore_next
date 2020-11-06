import { __runtimeDeps as obsRuntimeDeps } from './mixins/observable.js';
import { __runtimeDeps as aryRuntimeDeps } from './mixins/array.js';
import { __runtimeDeps as obsSetRuntimeDeps, ObserverSet } from './private/observer_set.js';

import global from "./system/global.js";
import { getSetting, setSetting } from "./system/settings.js";
import './ext/number.js';
import './ext/string.js';
import { Copyable } from './mixins/copyable.js';
import { Comparable } from './mixins/comparable.js';
import { Enumerable } from './mixins/enumerable.js';
import { SCObject, __runtimeDeps as objRuntimeDeps } from './system/object.js';
import { Observable, get, getPath } from './mixins/observable.js';
import { CoreArray, SCArray } from './mixins/array.js';
import './ext/array.js';
import { RunLoop, run } from './system/runloop.js';
import { Binding, __runtimeDeps as bindingRuntimeDeps } from './system/binding.js';
import { Logger } from './system/logger.js';
import { SCError } from './system/error.js';
import { SCSet } from './system/set.js';
import { typeOf, clone, hashFor, compare, guidFor, inspect, keys, isArray, none, isEqual, empty, makeArray, A, objectForPropertyPath, requiredObjectForPropertyPath, tupleForPropertyPath } from './system/base.js';
import { T_FUNCTION, T_NULL, T_UNDEFINED, T_ARRAY, T_OBJECT, T_HASH, T_NUMBER, T_STRING, T_BOOL, T_CLASS, T_DATE, T_ERROR } from './system/constants.js';





export const GLOBAL = global;

export const SC = {
  get LOG_BINDINGS () {
    return getSetting('LOG_BINDINGS');
  },
  set LOG_BINDINGS (val) {
    setSetting('LOG_BINDINGS', val);
  },
  get LOG_DUPLICATE_BINDINGS () {
    return getSetting('LOG_DUPLICATE_BINDINGS');
  },
  set LOG_DUPLICATE_BINDINGS (val) {
    setSetting('LOG_DUPLICATE_BINDINGS', val);
  },
  get LOG_OBSERVERS () {
    return getSetting('LOG_OBSERVERS');
  },
  set LOG_OBSERVERS (val) {
    setSetting('LOG_OBSERVERS', val);
  },
  Copyable,
  Comparable,
  Enumerable,
  Observable,
  get,
  getPath,
  Object: SCObject,
  Array: SCArray,
  Error: SCError,
  RunLoop,
  run,
  Binding,
  Logger,
  ObserverSet,
  Set: SCSet,
  typeOf,
  clone,
  copy: clone,
  compare,
  hashFor,
  guidFor,
  inspect,
  keys,
  isArray,
  none,
  empty,
  isEqual,
  makeArray,
  A,
  $A: A,
  objectForPropertyPath,
  requiredObjectForPropertyPath,
  tupleForPropertyPath,
  T_UNDEFINED,
  T_ARRAY,
  T_OBJECT,
  T_NUMBER,
  T_HASH,
  T_STRING,
  T_BOOL,
  T_CLASS,
  T_DATE,
  T_ERROR,
  T_NULL,
  T_FUNCTION
};

// there might be a more dynamic way to do this...
Promise.all([
  obsRuntimeDeps(),
  aryRuntimeDeps(),
  bindingRuntimeDeps(),
  obsSetRuntimeDeps(),
  objRuntimeDeps(),
]).then(r => {
  if (SC.onload && typeof SC.onload === 'function') {
    SC.onload();
  }  
})