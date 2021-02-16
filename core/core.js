
import { ObserverSet } from './private/observer_set.js';

import global from "./system/global.js";
import { getSetting, setSetting } from "./system/settings.js";
import { SCString } from "./system/string.js";
import './ext/number.js';
import './ext/string.js';
import { Copyable } from './mixins/copyable.js';
import { Comparable } from './mixins/comparable.js';
import { Enumerable } from './mixins/enumerable.js';
import { SCObject, kindOf, instanceOf, _object_className } from './system/object.js';
import { Observable, get, getPath } from './mixins/observable.js';
import { CoreArray, SCArray } from './mixins/array.js';
import { ObserverQueue } from './private/observer_queue.js';
import './ext/array.js';
import { RunLoop, run } from './system/runloop.js';
import { Binding } from './system/binding.js';
import { IndexSet } from './system/index_set.js';
import { Logger, warn, error } from './system/logger.js';
import { SCError, ok, val, $throw, $error, $ok, $val } from './system/error.js';
import { SCSet } from './system/set.js';
import { RangeObserver } from './system/range_observer.js';
import { typeOf, clone, hashFor, compare, guidFor, inspect, keys, isArray, none, isEqual, empty, makeArray, A, objectForPropertyPath, requiredObjectForPropertyPath, tupleForPropertyPath, mixin, beget, merge } from './system/base.js';
import { T_FUNCTION, T_NULL, T_UNDEFINED, T_ARRAY, T_OBJECT, T_HASH, T_NUMBER, T_STRING, T_BOOL, T_CLASS, T_DATE, T_ERROR, FROZEN_ERROR, UNSUPPORTED } from './system/constants.js';
import { Controller } from './controllers/controller.js';
import { ObjectController } from './controllers/object_controller.js';
import { ArrayController } from './controllers/array_controller.js';
import { SCProxy } from './system/proxy.js';
import { ENV } from './system/env.js';
import { scWorker } from './system/scworker.js';
import { Builder } from './system/builder.js';
import { DelegateSupport } from './mixins/delegate_support.js';
import { CoreSet } from './system/core_set.js';

import { detectedBrowser, OS, CLASS_PREFIX, CSS_PREFIX, BROWSER, ENGINE, DEVICE, DOM_PREFIX } from './system/browser.js';
import { readyMixin } from './system/ready.js';

import { Locale, metricsFor, stringsFor, methodForLocale,  hashesForLocale, loadLangFiles } from './system/locale.js';
import { Timer } from './system/timer.js';
import { ZERO_RANGE, RANGE_NOT_FOUND, valueInRange, minRange, maxRange, unionRanges, intersectRanges, subtractRanges, rangesEqual, cloneRange } from './system/utils/range.js';
import { SparseArray } from './system/sparse_array.js';
import { DateTime } from './system/datetime/datetime.js';
import { dateTimeBinding } from './system/datetime/datetime_binding.js';

// add dateTimeBinding to Binding
Binding.dateTime = dateTimeBinding;


export const GLOBAL = global;

console.log('COREJS, executed...');

// /** @type {import('../typings/core').SC} */

export const SC = {
  getSetting,
  setSetting,
  
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
  beget,
  String: SCString,
  Copyable,
  Comparable,
  Enumerable,
  Observable,
  get,
  getPath,
  Object: SCObject,
  _object_className,
  Array: SCArray,
  Error: SCError,
  RunLoop,
  Timer,
  IndexSet,
  run,
  Binding,
  Logger,
  CoreSet,
  ObserverSet,
  RangeObserver,
  ObserverQueue,
  // Observers: ObserverQueue, // backwards compat
  Set: SCSet,
  typeOf,
  clone,
  copy: clone,
  merge,
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
  kindOf,
  instanceOf,
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
  T_FUNCTION,
  FROZEN_ERROR,
  UNSUPPORTED,
  $error,
  $ok,
  $throw,
  $val,
  val,
  ok,
  warn,
  error,
  json: {
    encode (root) {
      return JSON.stringify(root);
    },
    decode (root) {
      return JSON.parse(root);
    }
  },
  Controller,
  ObjectController,
  ArrayController,
  Proxy: SCProxy,
  ENV,
  scWorker,
  mixin,
  Builder,
  browser: detectedBrowser,
  OS,
  CLASS_PREFIX,
  CSS_PREFIX,
  BROWSER,
  ENGINE,
  DEVICE,
  DOM_PREFIX,
  DelegateSupport,
  Locale,
  methodForLocale,
  stringsFor,
  metricsFor,
  hashesForLocale,
  ZERO_RANGE,
  RANGE_NOT_FOUND,
  valueInRange,
  minRange,
  maxRange,
  unionRanges,
  intersectRanges,
  subtractRanges,
  cloneRange,
  rangesEqual,
  SparseArray,
  DateTime,
  loadLangFiles
};

mixin(SC, readyMixin);

