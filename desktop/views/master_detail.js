// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { AUTO_CONTROL_SIZE, propertyFromRenderDelegate, View } from "../../view/view.js";
import { ButtonView } from "./button.js";
import { ToolbarView } from "./toolbar.js";
import { WorkspaceView } from "./workspace.js";
import { platform } from "../../responder/responder.js";
import { HORIZONTAL_ORIENTATION, VERTICAL_ORIENTATION } from "../system/constants.js";
import { PickerPane, PICKER_POINTER } from "../panes/picker.js";

/** @class
  Master/Detail view is a simple view which manages a master view and a detail view.
  This is not all that different from a SplitView, except that, for the moment (this
  will hopefully change when SplitView becomes more palatable) the split point is not
  actually changeable and the split is always vertical.

  So, why use it when it is limited? Well, simple: it can hide the left side. Completely.
  As in, there will be no split divider anymore. There will be no nothing. It will be gone.
  Removed from DOM. Gone on to meet its maker, bereft of life, it rests in peace. If it weren't
  for the possibility of opening it up in a picker it would be pushing up the daisies!

  Yes, it has a built-in option for opening the master portion in a PickerPane. This is THE KILLER
  FEATURES. It is a command on the view: popupMasterPicker. And it is really really easy to call:
  make a toolbar button with an action "popupMasterPicker". That's it.

  An interesting feature is that it sets the master and detail views' masterIsVisible settings,
  allowing them to know if the master is visible.

  @since SproutCore 1.2
*/
export const MasterDetailView = View.extend(
/** @scope MasterDetailView.prototype */ {

  /**
    @type Array
    @default ['sc-master-detail-view']
    @see View#classNames
  */
  classNames: ["sc-master-detail-view"],

  /**
    @type String
    @default 'masterDetailRenderDelegate'
  */
  renderDelegateName: 'masterDetailRenderDelegate',


  // ..........................................................
  // Properties
  //

  /**
    The master view. For your development pleasure, it defaults to a
    WorkspaceView with a top toolbar.

    @type View
    @default WorkspaceView
  */
  masterView: WorkspaceView.extend({
    topToolbar: ToolbarView.extend({
    }),
    contentView: View.extend({ backgroundColor: "white" })
  }),

  /**
    The detail view. For your development experience, it defaults to holding
    a top toolbar view with a button that closes/shows master. Come take a peek at
    the code to see what it looks like--it is so simple.

    @type View
    @default WorkspaceView
  */
  detailView: WorkspaceView.extend({
    topToolbar: ToolbarView.extend({
      childViews: ["showHidePicker"],
      showHidePicker: ButtonView.extend({
        layout: { left: 7, centerY: 0, height: 30, width: 100 },
        controlSize: AUTO_CONTROL_SIZE,
        title: "Picker",
        action: "toggleMasterPicker",
        isVisible: false,
        isVisibleBinding: ".parentView.masterIsHidden"
      })
    })
  }),

  /**
    Whether to automatically hide the master panel in portrait orientation.

    By default, this property is a computed property based on whether the browser is a touch
    browser. Your purpose in overriding it is either to disable it from automatically
    disappearing on iPad and other touch devices, or force it to appear when a desktop
    browser changes.

    @field
    @type Boolean
    @default false
  */
  autoHideMaster: function() {
    if (platform.touch) return true;
    return false;
  }.property().cacheable(),

  /**
    The width of the 'master' side of the master/detail view.

    @type Number
    @default 250
  */
  masterWidth: 250,

  /**
    The width of the divider between the master and detail views.

    @type Number
    @default From theme, or 1.
  */
  dividerWidth: propertyFromRenderDelegate('dividerWidth', 1),

  /**
    A property (computed) that says whether the master view is hidden.

    @field
    @type Boolean
    @default false
    @observes autoHideMaster
    @observes orientation
  */
  masterIsHidden: function() {
    if (!this.get("autoHideMaster")) return false;
    if (this.get("orientation") === HORIZONTAL_ORIENTATION) return false;
    return true;
  }.property("autoHideMaster", "orientation"),

  /**
    Tracks the orientation of the view. Possible values:

      - VERTICAL_ORIENTATION
      - HORIZONTAL_ORIENTATION

    @type String
    @default VERTICAL_ORIENTATION
  */
  orientation: VERTICAL_ORIENTATION,

  /** @private */
  _scmd_frameDidChange: function() {
    var f = this.get("frame"), ret;
    if (f.width > f.height) ret = HORIZONTAL_ORIENTATION;
    else ret = VERTICAL_ORIENTATION;

    this.setIfChanged('orientation', ret);
  }.observes('frame'),

  /** @private */
  init: function init () {
    init.base.apply(this, arguments);
    this._scmd_frameDidChange();
    this._scmd_masterIsHiddenDidChange();
  },

  /**
    If the master is hidden, this toggles the master picker pane.
    Of course, since pickers are modal, this actually only needs to handle showing.

    @param {View} view The view to anchor the picker to
  */
  toggleMasterPicker: function(view) {
    if (!this.get("masterIsHidden")) return;
    if (this._picker && this._picker.get("isVisibleInWindow")) {
      this.hideMasterPicker();
    } else {
      this.showMasterPicker(view);
    }
  },

  /**
    @param {View} view The view to anchor the picker to
  */
  showMasterPicker: function(view) {
    if (this._picker && this._picker.get("isVisibleInWindow")) return;
    if (!this._picker) {
      var pp = this.get("pickerPane");
      this._picker = pp.create({ });
    }

    this._picker.set("contentView", this.get("masterView"));
    this._picker.set("extraRightOffset", this.get("pointerDistanceFromEdge"));

    this.showPicker(this._picker, view);
  },

  hideMasterPicker: function() {
    if (this._picker && this._picker.get("isVisibleInWindow")) {
      this.hidePicker(this._picker);
    }
  },

  /**
    @param {PickerPane} picker The picker to popup
    @param {View} view The view to anchor the picker to
  */
  showPicker: function(picker, view) {
    picker.popup(view, PICKER_POINTER, [3, 0, 1, 2, 3], [9, -9, -18, 18]);
  },

  /**
    @param {PickerPane} picker The picker to popup
  */
  hidePicker: function(picker) {
    picker.remove();
  },

  /**
    The picker pane class from which to create a picker pane.

    This defaults to one with a special theme.

    @type PickerPane
    @default PickerPane
  */
  pickerPane: PickerPane.extend({
    layout: { width: 250, height: 480 },
    themeName: 'popover'
  }),


  // ..........................................................
  // Internal Support
  //

  /** @private */
  _picker: null,

  /** @private */
  pointerDistanceFromEdge: 46,

  /** @private
    Updates masterIsHidden in child views.
  */
  _scmd_masterIsHiddenDidChange: function() {
    var mih = this.get("masterIsHidden");
    this.get("masterView").set("masterIsHidden", mih);
    this.get("detailView").set("masterIsHidden", mih);
  }.observes("masterIsHidden"),

  /** @private
    When the frame changes, we don't need to do anything. We use smart positioning.
    However, if the orientation were to change, well, then we might need to do something.
  */
  _scmd_orientationDidChange: function() {
    this.invokeOnce("_scmd_tile");
  }.observes("orientation"),

  /** @private
    Observes properties which require retiling.
  */
  _scmd_retileProperties: function() {
    this.invokeOnce("_scmd_tile");
  }.observes("masterIsHidden", "masterWidth"),

  /** @private
    Instantiates master and detail views.
  */
  createChildViews: function() {
    var master = this.get("masterView");
    master = this.masterView = this.createChildView(master);

    var detail = this.get("detailView");
    detail = this.detailView = this.createChildView(detail);
    this.appendChild(detail);

    this.invokeOnce("_scmd_tile");
  },

  /** @private */
  _masterIsDrawn: false, // whether the master is in the view

  /** @private
    Tiles the views as necessary.
  */
  _scmd_tile: function() {
    // first, determine what is and is not visible.
    var masterIsVisible = !this.get('masterIsHidden');

    // now, tile
    var masterWidth = this.get('masterWidth'),
        master = this.get('masterView'),
        detail = this.get('detailView');

    if (masterIsVisible) {
      // hide picker if needed
      this.hideMasterPicker();

      // draw master if needed
      if (!this._masterIsDrawn) {
        if (this._picker) this._picker.set('contentView', null);
        this.appendChild(master);
        this._masterIsDrawn = true;
      }

      // set master layout
      master.set('layout', {
        left: 0, top: 0, bottom: 0, width: masterWidth
      });

      // and child, naturally
      var extra = this.get('dividerWidth');
      detail.set("layout", { left: masterWidth + extra, right: 0, top: 0, bottom: 0 });
    } else {
      // remove master if needed
      if (this._masterIsDrawn) {
        // Removes the child from the document, but doesn't destroy it or its layer.
        this.removeChild(master);
        this._masterIsDrawn = false;
      }

      // and child, naturally
      detail.set('layout', { left: 0, right: 0, top: 0, bottom: 0 });
    }
  }

});
