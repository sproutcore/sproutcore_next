export const VERSION = '3.0.0';
  // ........................................
  // GLOBAL CONSTANTS
  //
export const T_ERROR = 'error';
export const T_OBJECT = 'object';
export const T_NULL = 'null';
export const T_CLASS = 'class';
export const T_HASH = 'hash';
export const T_FUNCTION = 'function';
export const T_UNDEFINED = 'undefined';
export const T_NUMBER = 'number';
export const T_BOOL = 'boolean';
export const T_ARRAY = 'array';
export const T_STRING = 'string';
export const T_DATE = 'date';
export const T_REGEXP = 'regexp';


/**
  Standard Error that should be raised when you try to modify a frozen object.
  @type String
*/
export const FROZEN_ERROR = "Cannot modify a frozen object";

/**
  A constant indicating an unsupported method, property or other.
*/
export const UNSUPPORTED = '_sc_unsupported';

export const APP_MODE = "APP_MODE";
export const TEST_MODE = "TEST_MODE";