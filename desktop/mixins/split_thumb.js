// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2010 Sprout Systems, Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { LAYOUT_HORIZONTAL } from "../../view/view.js";
import { MOVES_AUTOMATIC_CHILD, MOVES_NEXT_CHILD, MOVES_PREVIOUS_CHILD } from "../system/constants.js";
import { NeedsSplitParent } from "./split_child.js";

/**
  @namespace
  A SplitThumb may be placed inside any view in a SplitView, and can even
  be a direct child of the SplitView. It forwards its events to the SplitView
  to control the movement of a divider or another child of the SplitView.

  Using a view that mixes in SplitThumb, you can place a handle that moves the
  divider anywhere inside the SplitView's view tree.

  SplitThumb will automatically choose which divider to move. It's choice will
  almost always be correct for 2-pane layouts. However, in 3-pane layouts, you
  may want to adjust the way it chooses.

  You can adjust the behavior by setting the movesSibling property to
  MOVES_NEXT_CHILD or MOVES_PREVIOUS_CHILD. If your ThumbView is inside
  the middle pane, for instance, this would tell it whether the ThumbView
  should move the divider to the left, or the divider to the right.
*/
export const SplitThumb = {

  /**
   * The child which should be moved by any mouse or touch events. Should usually
   * be a divider view.
   *
   * The default implementation calculates the child by first finding
   * the ancestor of this view that is a direct child of the SplitView,
   * and then either returning it or one of its immediate siblings, depending
   * on the value of the movesSibling property.
   *
   * @property View
  */
  movesChild: function () {
    var view = this, child, splitView = this.get('splitView'),
        sibling = this.get('movesSibling');
    while (view && view !== splitView) {
      child = view;
      view = view.get('parentView');
    }

    if (sibling === MOVES_NEXT_CHILD) return child.nextView;
    if (sibling === MOVES_PREVIOUS_CHILD) return child.previousView;

    if (sibling === MOVES_AUTOMATIC_CHILD) {
      if (!child.nextView) return child.previousView;
      if (!child.previousView) return child.nextView;
    }

    return child;
  }.property('splitView', 'movesSibling').cacheable(),

  /**
   * Decides whether an ancestor of this SplitThumb view or one of its
   * siblings is to be moved in response to events.
   *
   * Usually, you want events to move a divider. If the SplitThumb is inside
   * a view which is _not_ a divider, you probably want to move one of the
   * view's siblings-one that _is_ a divider.
   *
   * You can tell SplitThumb to:
   *
   * - MOVES_AUTOMATIC_CHILD: if the SplitView child is either first or last,
   *   moves the adjacent child (likely a divider). Otherwise moves the child itself.
   *
   * - MOVES_CHILD: moves the child itself, not one of its siblings. Divider
   *   views could use this setting.
   *
   * - MOVES_PREVIOUS_CHILD: moves the previous child. For instance, in a
   *   two-pane setup, if the SplitThumb is in the rightmost child, this will
   *   move the divider between the two children.
   *
   * - MOVES_NEXT_CHILD: moves the next child.
   *
   * @type TYPE
  */
  movesSibling: MOVES_AUTOMATIC_CHILD,

  /**
   * The SplitView that contains the child views to be adjusted.
   *
   * This is computed to be the first SplitView found in a search
   * up the view hierarchy. You can substitute your own SplitView
   *
   * @property SplitView
  */
  // splitView: function () {
  //   var view = this;
  //   while (view && !view.isSplitView) view = view.get('parentView');
  //   return view;
  // }.property('parentView').cacheable(),

  /**
   * The layoutDirection of the SplitView. This is observed so that we
   * can update positioning if the layoutDirection changes but the position
   * and size properties do not.
   *
   * NOTE: duplicated in SplitChild because both this and SplitChild use it.
   *
   * @type {LayoutDirection}
  */
  // NOTE: While an edge case, this is implemented because it makes it _much_
  // easier to write the sample in the Test Controls app.
  // splitViewLayoutDirection: null,
  // splitViewLayoutDirectionBinding: Binding.oneWay('*splitView.layoutDirection'),

  /**
   * The name of the CSS cursor that should be used for splitting.
   * The containing SplitView will adopt this cursor if and when this
   * view is dragged.
   *
   * Computed based on the SplitView's layoutDirection.
   *
   * @type {String}
  */
  splitCursorStyle: function () {
    if (this.get('splitViewLayoutDirection') === LAYOUT_HORIZONTAL) {
      return 'ew-resize';
    } else {
      return 'ns-resize';
    }
  }.property('splitViewLayoutDirection').cacheable(),

  splitCursorStyleDidChange: function () {
    if (this._isDragging) {
      this.get('splitView').set('splitChildCursorStyle', this.get('splitCursorStyle'));
    }

    this.$().css('cursor', this.get('splitCursorStyle'));
  }.observes('splitCursorStyle'),

  /** @private Include NeedsSplitParent if it hasn't already been included. */
  initMixin: function () {
    if (!this.splitView) {
      this.mixin(NeedsSplitParent);
    }
  },

  /**
   * @private
   * Renders the cursor for the view as defined by this view's splitCursor
   * property.
  */
  renderMixin: function (context) {
    context.setStyle('cursor', this.get('splitCursorStyle'));
  },

  //
  // EVENT HANDLING
  //
  touchStart: function (touch) {
    this._isDragging = true;

    var splitView = this.get('splitView');
    splitView.beginLiveResize();

    this._scst_mouseStartPosition = splitView.get('layoutDirection') === LAYOUT_HORIZONTAL ?
      touch.pageX : touch.pageY;

    this._scst_childStartPosition = splitView.getPositionForChild(this.get('movesChild'));

    return true;
  },

  touchesDragged: function (evt) {
    var splitView = this.get('splitView');

    var mousePosition = splitView.get('layoutDirection') === LAYOUT_HORIZONTAL ?
      evt.pageX : evt.pageY;

    var diff = mousePosition - this._scst_mouseStartPosition,
        start = this._scst_childStartPosition;

    splitView.adjustPositionForChild(this.get('movesChild'), start + diff);

    return true;
  },

  touchEnd: function (touch) {
    this._isDragging = false;

    var splitView = this.get('splitView');

    var mousePosition = splitView.get('layoutDirection') === LAYOUT_HORIZONTAL ?
      touch.pageX : touch.pageY;

    var diff = mousePosition - this._scst_mouseStartPosition,
        start = this._scst_childStartPosition;

    splitView.adjustPositionForChild(this.get('movesChild'), start + diff);

    splitView.set('splitChildCursorStyle', null);
    splitView.endLiveResize();
    return true;
  },

  mouseDown: function (evt) {
    var splitView = this.get('splitView');
    splitView.set('splitChildCursorStyle', this.get('splitCursorStyle'));

    return this.touchStart(evt);
  },

  mouseDragged: function (evt) {
    return this.touchesDragged(evt);
  },

  mouseUp: function (evt) {
    this.get('splitView').set('splitChildCursorStyle', null);

    return this.touchEnd(evt);
  }

};
