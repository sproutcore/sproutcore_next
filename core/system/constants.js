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
  A constant indicating an unsupported method; property or other.
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

// while these constants are originally Record only; they also make sense in different applications
// so add to Core

  // ..........................................................
  // CONSTANTS
  //

  /**
    Generic state for records with no local changes.

    Use a logical AND (single `&`) to test record status

    @static
    @constant
    @type Number
    @default 0x0001
  */
export const CLEAN =          0x0001; // 1

 /**
   Generic state for records with local changes.

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0002
 */
export const DIRTY =          0x0002; // 2

 /**
   State for records that are still loaded.

   A record instance should never be in this state.  You will only run into
   it when working with the low-level data hash API on `Store`. Use a
   logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0100
 */
export const EMPTY =          0x0100; // 256

 /**
   State for records in an error state.

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x1000
 */
export const ERROR =          0x1000; // 4096

 /**
   Generic state for records that are loaded and ready for use

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0200
 */
export const READY =          0x0200; // 512

 /**
   State for records that are loaded and ready for use with no local changes

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0201
 */
export const READY_CLEAN =    0x0201; // 513


 /**
   State for records that are loaded and ready for use with local changes

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0202
 */
export const READY_DIRTY =    0x0202; // 514


 /**
   State for records that are new - not yet committed to server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0203
 */
export const READY_NEW =      0x0203; // 515


 /**
   Generic state for records that have been destroyed

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0400
 */
export const DESTROYED =      0x0400; // 1024


 /**
   State for records that have been destroyed and committed to server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0401
 */
export const DESTROYED_CLEAN =0x0401; // 1025


 /**
   State for records that have been destroyed but not yet committed to server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0402
 */
export const DESTROYED_DIRTY =0x0402; // 1026


 /**
   Generic state for records that have been submitted to data source

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0800
 */
export const BUSY =           0x0800; // 2048


 /**
   State for records that are still loading data from the server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0804
 */
export const BUSY_LOADING =   0x0804; // 2052


 /**
   State for new records that were created and submitted to the server;
   waiting on response from server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0808
 */
export const BUSY_CREATING = 0x0808; // 2056


 /**
   State for records that have been modified and submitted to server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0810
 */
export const BUSY_COMMITTING = 0x0810; // 2064


 /**
   State for records that have requested a refresh from the server.

   Use a logical AND (single `&`) to test record status.

   @static
   @constant
   @type Number
   @default 0x0820
 */
export const BUSY_REFRESH = 0x0820; // 2080


 /**
   State for records that have requested a refresh from the server.

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0821
 */
export const BUSY_REFRESH_CLEAN = 0x0821; // 2081

 /**
   State for records that have requested a refresh from the server.

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0822
 */
export const BUSY_REFRESH_DIRTY = 0x0822; // 2082

 /**
   State for records that have been destroyed and submitted to server

   Use a logical AND (single `&`) to test record status

   @static
   @constant
   @type Number
   @default 0x0840
 */
export const BUSY_DESTROYING = 0x0840; // 2112