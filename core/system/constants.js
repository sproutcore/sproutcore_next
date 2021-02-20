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

/**
  Used for contentIndexDisclosureState().  Indicates open branch node.

  @type Number
  @constant
*/
export const BRANCH_OPEN = 0x0011;

/**
  Used for contentIndexDisclosureState().  Indicates closed branch node.

  @type Number
  @constant
*/
export const BRANCH_CLOSED = 0x0012;

/**
  Used for contentIndexDisclosureState().  Indicates leaf node.

  @type Number
  @constant
*/
export const LEAF_NODE = 0x0020;

// ALSO PRESENT IN VIEW
/**
  Indicates that the collection view expects to accept a drop ON the specified
  item.

  @type Number
*/
export const DROP_ON = 0x01 ;

/**
  Indicates that the collection view expects to accept a drop BEFORE the
  specified item.

  @type Number
*/
export const DROP_BEFORE = 0x02 ;

/**
  Indicates that the collection view expects to accept a drop AFTER the
  specified item.  This is treated just like DROP_BEFORE is most views
  except for tree lists.

  @type Number
*/
export const DROP_AFTER = 0x04 ;

/**
  Indicates that the collection view want's to know which operations would
  be allowed for either drop operation.

  @type Number
*/
export const DROP_ANY = 0x07 ;