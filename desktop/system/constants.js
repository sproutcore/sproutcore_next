/**
  @type String
  @static
  @constant
*/
export const HORIZONTAL_ORIENTATION = 'horizontal';

/**
  @type String
  @static
  @constant
*/
export const VERTICAL_ORIENTATION = 'vertical' ;


/**
  @static
  @constant
  @type String
*/
export const TOGGLE_BEHAVIOR = 'toggle';

/**
  @static
  @constant
  @type String
*/
export const PUSH_BEHAVIOR = 'push';

/**
  @static
  @constant
  @type String
*/
export const TOGGLE_ON_BEHAVIOR = 'on';

/**
  @static
  @constant
  @type String
*/
export const TOGGLE_OFF_BEHAVIOR = 'off';

/**
  @static
  @constant
  @type String
*/
export const HOLD_BEHAVIOR = 'hold';


/**
  Tells the SplitThumb to automatically choose which child of the SplitView
  to move in response to touch or mouse events in an SplitThumb.
*/
export const MOVES_AUTOMATIC_CHILD = 'moves-automatic-child';

/**
  Tells the SplitThumb to move the child of the SplitView that is
  either the SplitThumb or a parent of it.
*/
export const MOVES_CHILD = 'moves-child';

/**
  Tells the SplitThumb to move the child of the SplitView that
  preceeds the child that is either the SplitThumb or a parent of it.
*/
export const MOVES_PREVIOUS_CHILD = 'moves-previous-child';

/**
  Tells the SplitThumb to move the child of the SplitVie that
  comes after the child that is either the SplitThumb or a parent of it.
*/
export const MOVES_NEXT_CHILD = 'moves-next-child';


/**
  Prevents the view from getting resized when the SplitView is resized,
  or the user resizes or moves an adjacent child view.
*/
export const FIXED_SIZE = 'sc-fixed-size';

/**
  Prevents the view from getting resized when the SplitView is resized
  (unless the SplitView has resized all other views), but allows it to
  be resized when the user resizes or moves an adjacent child view.
*/
export const RESIZE_MANUAL = 'sc-manual-size';

/**
  Allows the view to be resized when the SplitView is resized or due to
  the user resizing or moving an adjacent child view.
*/
export const RESIZE_AUTOMATIC = 'sc-automatic-resize';

/**
  Special drag operation passed to delegate if the collection view proposes
  to perform a reorder event.

  @static
  @constant
*/
export const DRAG_REORDER = 0x0010;
