// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

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

export const ALIGN_JUSTIFY = "justify";

/**
  Indicates that the content should be aligned to the left.
*/
export const ALIGN_LEFT = 'left';

/**
  Indicates that the content should be aligned to the right.
*/
export const ALIGN_RIGHT = 'right';

/**
  Indicates that the content should be aligned to the center.
*/
export const ALIGN_CENTER = 'center';

/**
  Indicates that the content should be aligned to the top.
*/
export const ALIGN_TOP = 'top';

/**
  Indicates that the content should be aligned to the middle.
*/
export const ALIGN_MIDDLE = 'middle';

/**
  Indicates that the content should be aligned to the bottom.
*/
export const ALIGN_BOTTOM = 'bottom';

/**
  Indicates that the content should be aligned to the top and left.
*/
export const ALIGN_TOP_LEFT = 'top-left';

/**
  Indicates that the content should be aligned to the top and right.
*/
export const ALIGN_TOP_RIGHT = 'top-right';

/**
  Indicates that the content should be aligned to the bottom and left.
*/
export const ALIGN_BOTTOM_LEFT = 'bottom-left';

/**
  Indicates that the content should be aligned to the bottom and right.
*/
export const ALIGN_BOTTOM_RIGHT = 'bottom-right';

/**
  Indicates that the content does not specify its own alignment.
*/
export const ALIGN_DEFAULT = 'default';

/**
  Indicates that the content should be positioned to the right.
*/
export const POSITION_RIGHT = 0;

/**
  Indicates that the content should be positioned to the left.
*/
export const POSITION_LEFT = 1;

/**
  Indicates that the content should be positioned above.
*/
export const POSITION_TOP = 2;

/**
  Indicates that the content should be positioned below.
*/
export const POSITION_BOTTOM = 3;


export const IMAGE_STATE_NONE = 'none';
export const IMAGE_STATE_LOADING = 'loading';
export const IMAGE_STATE_LOADED = 'loaded';
export const IMAGE_STATE_FAILED = 'failed';

export const IMAGE_TYPE_NONE = 'falseNE';
export const IMAGE_TYPE_URL = 'URL';
export const IMAGE_TYPE_CSS_CLASS = 'CSS_CLASS';

/**
  URL to a transparent GIF.  Used for spriting.
*/
export const BLANK_IMAGE_DATAURL = "data:image/gif;base64,R0lGODlhAQABAJAAAP///wAAACH5BAUQAAAALAAAAAABAAEAAAICBAEAOw==";

export const BLANK_IMAGE_URL = BLANK_IMAGE_DATAURL; // skipping IE support here

/**
  @type String
  @constant
*/
export const SCALE_NONE = "none";

/**
  Stretch/shrink the shape to fill the frame

  @type String
  @constant
*/
export const FILL = "fill";

/**
  Stretch/shrink the shape to fill the frame while maintaining aspect ratio, such
  that the shortest dimension will just fit within the frame and the longest dimension will
  overflow and be cropped.

  @type String
  @constant
*/
export const BEST_FILL = "best-fill";
export const FILL_PROPORTIONALLY = BEST_FILL;

/**
  Stretch/shrink the shape to fit the frame while maintaining aspect ratio, such that the
  longest dimension will just fit within the frame

  @type String
  @constant
*/
export const BEST_FIT = "best-fit";

/**
  Shrink the shape to fit the frame while maintaining aspect ratio, such that
  the longest dimension will just fit within the frame.  Do not stretch the shape if the shape's
  width is less than the frame's width.

  @type String
  @constant
*/
export const BEST_FIT_DOWN_ONLY = "best-fit-down";

/**
  Indicates a value has a mixed state of both on and off.

  @type String
*/
export const MIXED_STATE = '__MIXED__' ;

export const VALIDATE_OK = true;
export const VALIDATE_NO_CHANGE = false;

export const AUTOCAPITALIZE_NONE = 'none';
export const AUTOCAPITALIZE_SENTENCES = 'sentences';
export const AUTOCAPITALIZE_WORDS = 'words';
export const AUTOCAPITALIZE_CHARACTERS = 'characters';


/**
  Option for controls to automatically calculate their size (should be default
  on controls that use renderers).

  @type String
  @constant
*/
export const AUTO_CONTROL_SIZE = '__AUTO__';

/**
  Option for HUGE control size.

  @type String
  @constant
*/
export const JUMBO_CONTROL_SIZE = 'sc-jumbo-size';

/**
  Option for HUGE control size.

  @type String
  @constant
*/
export const HUGE_CONTROL_SIZE = 'sc-huge-size';

/**
  Option for large control size.

  @type String
  @constant
*/
export const LARGE_CONTROL_SIZE = 'sc-large-size';

/**
  Option for standard control size.

  @type String
  @constant
*/
export const REGULAR_CONTROL_SIZE = 'sc-regular-size';

/**
  Option for small control size.

  @type String
  @constant
*/
export const SMALL_CONTROL_SIZE = 'sc-small-size';

/**
  Option for tiny control size

  @type String
  @constant
*/
export const TINY_CONTROL_SIZE = 'sc-tiny-size';

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_HORIZONTAL = [0, 180];

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_VERTICAL = [90, -90];

/**
  @static
  @type String
  @constant
*/
export const SWIPE_ANY = null;

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_LEFT = [180];

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_RIGHT = [0];

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_UP = [-90];

/**
  @static
  @type Array
  @constant
*/
export const SWIPE_DOWN = [90];

// standard browser cursor definitions
// TODO: remove extra constants in next version
// TODO: consider adding theme cursors for custom behaviors like drag & drop
export const SYSTEM_CURSOR = 'default';
export const DEFAULT_CURSOR = "default";
export const AUTO_CURSOR = 'auto';
export const CROSSHAIR_CURSOR = 'crosshair';
export const HAND_CURSOR = 'pointer';
export const POINTER_CURSOR = 'pointer';
export const MOVE_CURSOR = 'move';
export const E_RESIZE_CURSOR = 'e-resize';
export const NE_RESIZE_CURSOR = 'ne-resize';
export const NW_RESIZE_CURSOR = 'nw-resize';
export const N_RESIZE_CURSOR = 'n-resize';
export const SE_RESIZE_CURSOR = 'se-resize';
export const SW_RESIZE_CURSOR = 'sw-resize';
export const S_RESIZE_CURSOR = 's-resize';
export const W_RESIZE_CURSOR = 'w-resize';
export const IBEAM_CURSOR = 'text';
export const TEXT_CURSOR = IBEAM_CURSOR;
export const WAIT_CURSOR = 'wait';
export const HELP_CURSOR = 'help';