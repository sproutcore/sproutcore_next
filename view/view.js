import { SC } from '../core/core.js';
import { viewManager } from './views/view_manager.js';

export { ResponderContext } from './mixins/responder_context.js';
export { View } from './views/view.js';
export { CoreView } from './views/core_view.js';
export { Theme } from './theme/theme.js';
export { RenderContext } from './render_context/render_context.js';
export { LAYOUT_AUTO } from './views/view/layout.js'
export { Pane } from './panes/pane.js';
export { MainPane }  from './panes/main.js';
export * from './views/utils/rect.js';
export * from './views/utils/utils.js';
export { viewManager } from './views/view_manager.js';
export { LayoutState } from './views/view/animation.js'; 

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

  // ..........................................................
  // LOCALIZATION SUPPORT
  //

  /**
    Known loc strings

    @type Object
  */
export const STRINGS = {};

  /**
    This is a simplified handler for installing a bunch of strings.  This
    ignores the language name and simply applies the passed strings hash.

    @param {String} lang the language the strings are for
    @param {Object} strings hash of strings
    @returns {SC} The receiver, useful for chaining calls to the same object.
  */
export const stringsFor = function(lang, strings) {
  SC.mixin(STRINGS, strings);
  return SC;
}

  /**
    Returns the View instance managing the given element.

    If no instance is found, returns `null`.

    @param {DOMElement} element The element to check.
    @returns {View} The view managing the element or null if none found.
  */
export const viewFor = function (element) {
  //@if(debug)
  if (arguments.length > 1) {
    SC.warn("Developer Warning: viewFor() is meant to be used with only one argument: element");
  }
  //@endif

  // Ensure the element argument is correct.
  if (!(element instanceof Element)) {
    SC.error("Attempt to retrieve the View instance for a non-element in viewFor(): %@".fmt(element));
    return null;
  }

  // Search for the view for the given element.
  var viewCache = viewManager.views,
    view = viewCache[element.getAttribute('id')];

  // If the element itself is not managed by an View, walk up its element chain searching for an
  // element that is.
  if (!view) {
    var parentNode;

    while (!view && (parentNode = element.parentNode) && (parentNode !== document)) {
      var id;

      // Ensure that the parent node is an Element and not some other type of Node.
      // Note: while `instanceOf Element` is the most accurate determiner, performance tests show
      // that it's much quicker to check for the existence of either the `nodeType` property or
      // the `querySelector` method.
      // See http://jsperf.com/nodetype-1-vs-instanceof-htmlelement/4
      // if (parentNode.querySelector && (id = parentNode.getAttribute('id'))) {
      if ((id = parentNode.getAttribute('id'))) {
        view = viewCache[id];
      }

      // Check the parent node.
      element = parentNode;
    }

    // Avoid memory leaks (i.e. IE).
    element = parentNode = null;
  }

  // If view isn't found, return null rather than undefined.
  return view || null;
};



