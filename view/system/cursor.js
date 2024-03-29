// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { DEFAULT_CURSOR } from './constants.js';


/**
  @class Cursor

  A Cursor object is used to synchronize the cursor used by multiple views at
  the same time. For example, thumb views within a split view acquire a cursor
  instance from the split view and set it as their cursor. The split view is
  able to update its cursor object to reflect the state of the split view.
  Because cursor objects are implemented internally with CSS, this is a very
  efficient way to update the same cursor for a group of view objects.

  Note: This object creates an anonymous CSS class to represent the cursor.
  The anonymous CSS class is automatically added by SproutCore to views that
  have the cursor object set as "their" cursor. Thus, all objects attached to
  the same cursor object will have their cursors updated simultaneously with a
  single DOM call.

*/
export const Cursor = SC.Object.extend(
/** @scope Cursor.prototype */ {

  /** @private */
  init: function init () {
    init.base.apply(this, arguments);

    // create a unique style rule and add it to the shared cursor style sheet
    var cursorStyle = this.get('cursorStyle') || DEFAULT_CURSOR,
      ss = this.constructor.sharedStyleSheet(),
      guid = SC.guidFor(this);

    if (ss.insertRule) { // WC3
      ss.insertRule(
        '.' + guid + ' {cursor: ' + cursorStyle + ';}',
        ss.cssRules ? ss.cssRules.length : 0
      );
    } else if (ss.addRule) { // IE
      ss.addRule('.' + guid, 'cursor: ' + cursorStyle);
    }

    this.cursorStyle = cursorStyle;
    this.className = guid; // used by cursor clients...
    return this;
  },

  /**
    This property is the connection between cursors and views. The default
    View behavior is to add this className to a view's layer if it has
    its cursor property defined.

    @readOnly
    @type String the css class name updated by this cursor
  */
  className: null,

  /**
    @type String the cursor value, can be 'url("path/to/cursor")'
  */
  cursorStyle: DEFAULT_CURSOR,

  /** @private */
  cursorStyleDidChange: function () {
    var cursorStyle, rule, selector, ss, rules, idx, len;
    cursorStyle = this.get('cursorStyle') || DEFAULT_CURSOR;
    rule = this._rule;
    if (rule) {
      rule.style.cursor = cursorStyle; // fast path
      return;
    }

    // slow path, taken only once
    selector = '.' + this.get('className');
    ss = this.constructor.sharedStyleSheet();
    rules = (ss.cssRules ? ss.cssRules : ss.rules) || [];

    // find our rule, cache it, and update the cursor style property
    for (idx = 0, len = rules.length; idx < len; ++idx) {
      rule = rules[idx];
      if (rule.selectorText === selector) {
        this._rule = rule; // cache for next time
        rule.style.cursor = cursorStyle; // update the cursor
        break;
      }
    }
  }.observes('cursorStyle')

  // TODO implement destroy

});


/** @private */
Cursor.sharedStyleSheet = function () {
  var ssEl,
    head,
    ss = this._styleSheet;

  if (!ss) {
    // create the stylesheet object the hard way (works everywhere)
    ssEl = document.createElement('style');
    head = document.getElementsByTagName('head')[0];
    if (!head) head = document.documentElement; // fix for Opera
    head.appendChild(ssEl);

    // Get the actual stylesheet object, not the DOM element.  We expect it to
    // be the last stylesheet in the document, but test to make sure no other
    // stylesheet has appeared.
    for (var i = document.styleSheets.length - 1; i >= 0; i--) {
      ss = document.styleSheets[i];

      if (ss.ownerNode === ssEl) {
        // We've found the proper stylesheet.
        this._styleSheet = ss;
        break;
      }
    }
  }

  return ss;
};
