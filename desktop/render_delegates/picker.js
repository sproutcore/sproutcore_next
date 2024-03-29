// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";
import { PICKER_MENU_POINTER, PICKER_POINTER } from '../panes/picker.js';

import './panel.js';

BaseTheme.pickerRenderDelegate = RenderDelegate.create({
  className: 'picker',

  render: function (dataSource, context) {
    var panelRenderDelegate = dataSource.get('theme').panelRenderDelegate;

    panelRenderDelegate.render(dataSource, context);

    var preferType = dataSource.get('preferType'),
      pointerPosition = dataSource.get('pointerPos');

    if (preferType == PICKER_POINTER || preferType == PICKER_MENU_POINTER) {
      context.push('<div class="sc-pointer ' + pointerPosition + '"></div>');
      context.addClass(pointerPosition);

      // Track the last pointerPosition used so that we can remove it when it changes.
      dataSource.renderState._lastPointerPosition = pointerPosition;
    }
  },

  update: function (dataSource, $) {
    var panelRenderDelegate = dataSource.get('theme').panelRenderDelegate;

    panelRenderDelegate.update(dataSource, $);

    var preferType = dataSource.get('preferType'),
      pointerPosition = dataSource.get('pointerPos');

    if (preferType == PICKER_POINTER || preferType == PICKER_MENU_POINTER) {
      var lastPointerPosition = dataSource.renderState._lastPointerPosition;

      if (lastPointerPosition !== pointerPosition) {
        var el = $.find('.sc-pointer');

        // Totally overwrite the pointer class.
        el.attr('class', "sc-pointer " + pointerPosition);

        // Update the view layer class
        $.removeClass(lastPointerPosition);
        $.addClass(pointerPosition);

        // Track the last pointerPosition used so that we can remove it when it changes.
        dataSource.renderState._lastPointerPosition = pointerPosition;
      }
    }

  }
});
