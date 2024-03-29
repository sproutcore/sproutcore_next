// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { RootResponder } from "../../responder/responder.js";
import { Pane, View } from "../../view/view.js";


/** @class

  A modal pane is used to capture mouse events inside a pane that is modal.
  You normally will not work with modal panes directly, though you may set
  the modalPane property to a subclass of this pane when designing custom
  panes.

  A modal pane is automatically appended when a pane with isModal set to
  `true` is made visible and removed when the same pane is hidden.  The only
  purpose of the `ModalPane` is to absorb mouse events so that they cannot
  filter through to the underlying content.

  
  @since SproutCore 1.0
*/
export const ModalPane = Pane.extend(
/** @scope ModalPane.prototype */{

  /**
    @type Array
    @default ['sc-modal']
    @see View#classNames
  */
  classNames: 'sc-modal',

  /** @private */
  _openPaneCount: 0,

  /** @private
    Called by a pane just before it appends itself.   The modal pane can
    make itself visible first if needed.

    @param {Pane} pane the pane
    @returns {ModalPane} receiver
  */
  paneWillAppend: function(pane) {
    var _tmpPane;
    this._openPaneCount++;
    if (!this.get('isVisibleInWindow')) {
      // before appending the modal pane, need to figure out if the pane
      // is visible or not so we can know where to attach the picker pane.
      
      if (pane.get('isVisibleInWindow')) {
        // if the pane is already visible, make sure the modal pane is
        // append below the pane
        var self = this;
        this.insert(function () {
          self._doAttach(document.body, pane.get('layer'));
        });
      }
      else {
        // if the pane is not visible, just do a simple append
        this.append();
      }
    }
    var panes = RootResponder.responder.panes;
    for(var i=0, iLen=panes.length; i<iLen; i++ ){
      _tmpPane = panes[i];
      if(_tmpPane!==pane) {
        //_tmpPane.set('ariaHidden', true);
        this._hideShowTextfields(_tmpPane, false);
      }
    }
    return this ;
  },

  /** @private
    Called by a pane just after it removes itself.  The modal pane can remove
    itself if needed.   Modal panes only remove themselves when an equal
    number of `paneWillAppend()` and `paneDidRemove()` calls are received.

    @param {Pane} pane the pane
    @returns {ModalPane} receiver
  */
  paneDidRemove: function(pane) {
    var _tmpPane;
    this._openPaneCount--;
    var panes = RootResponder.responder.panes;
    for(var i=0, iLen=panes.length; i<iLen; i++ ){
      _tmpPane = panes[i];
      if(_tmpPane!==pane) {
        //_tmpPane.set('ariaHidden', false);
        this._hideShowTextfields(_tmpPane, true);
      }
    }
    if (this._openPaneCount <= 0) {
      this._openPaneCount = 0 ;
      if (this.get('isVisibleInWindow')) this.remove();
    }
  },

  /** @private
    If `focusable` is false all TextFieldViews not belonging to the given
    pane will have isBrowserFocusable set to false.  If `focusable` is true, then
    all TextFieldViews not belonging to the given pane will have
    isBrowserFocusable set to true, unless they previously had it set explictly
    to false.
  */
  _hideShowTextfields: function(pane, focusable){
    var view;

    for (view in View.views) {
      view = View.views[view];
      if (view.get('isTextField') && view !== pane && view.get('pane') === pane) {
        if (focusable) {
          // Setting isBrowserFocusable back to true. If we cached the previous
          // value, use that instead.
          if (view._scmp_isBrowserFocusable !== undefined) {
            focusable = view._scmp_isBrowserFocusable;

            // Clean up entirely.
            delete view._scmp_isBrowserFocusable;
          }
        } else {
          // Cache the value of isBrowserFocusable. If the text field
          // already had isBrowserFocusable: false, we don't want to
          // set it back to true.
          view._scmp_isBrowserFocusable = view.get('isBrowserFocusable');
        }
        view.set('isBrowserFocusable', focusable);
      }
    }
  },

  /** @private */
  mouseDown: function(evt) {
    var owner = this.get('owner');
    if (owner && owner.modalPaneDidClick) owner.modalPaneDidClick(evt);
  },

  /** @private */
  touchStart: function(evt) {
    this.mouseDown(evt);
  }
});
