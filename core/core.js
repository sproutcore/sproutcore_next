import { __runtimeDeps as obsRuntimeDeps } from './mixins/observable.js';
import { __runtimeDeps as aryRuntimeDeps } from './mixins/array.js';
import { __runtimeDeps as obsSetRuntimeDeps } from './private/observer_set.js';
import { Copyable } from './mixins/copyable.js';
// import { Enumerable } from './mixins/enumerable.js';
import { SCObject } from './system/object.js';
import { CoreArray } from './mixins/array.js';
import { RunLoop } from './system/runloop.js';
import { Binding, __runtimeDeps as bindingRuntimeDeps } from './system/binding.js';
import { Logger } from './system/logger.js';
import { SCError } from './system/error.js';
import { typeOf, clone, hashFor, compare, guidFor, inspect, keys, isArray, none, isEqual, empty, makeArray, A, objectForPropertyPath, requiredObjectForPropertyPath, tupleForPropertyPath } from './system/base.js';
import { T_FUNCTION, T_NULL, T_UNDEFINED, T_ARRAY, T_OBJECT, T_HASH, T_NUMBER, T_STRING, T_BOOL, T_CLASS, T_DATE, T_ERROR } from './system/constants.js';

// there might be a more dynamic way to do this...
obsRuntimeDeps();
aryRuntimeDeps();
bindingRuntimeDeps();
obsSetRuntimeDeps();

export const SC = {
  Copyable,
  // Enumerable,
  Object: SCObject,
  Array: CoreArray,
  Error: SCError,
  RunLoop,
  Binding,
  Logger,
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
}