// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { RenderDelegate, BaseTheme } from "../../view/view.js";

BaseTheme.disclosureRenderDelegate = RenderDelegate.create({
  className: 'disclosure',

  render: function(dataSource, context) {
    this.addSizeClassName(dataSource, context);

    var theme = dataSource.get('theme'),
        value = dataSource.get('value'),
        labelClassNames = ['sc-button-label', 'sc-disclosure-label'];

    var labelId = SC.guidFor(dataSource) + "-label";

    //addressing accessibility
    context.setAttr('aria-expanded', value);
    context.setAttr('aria-labelledby', labelId);

    if (dataSource.get('isSelected')) context.addClass('sel');

    var state = '';
    state += dataSource.get('isSelected') ? 'open' : 'closed';
    if (dataSource.get('isActive')) state += ' active';

    context.push('<div class="disclosure button ' + state + '"></div>');

    context = context.begin('span').addClass(labelClassNames).id(labelId);
    theme.labelRenderDelegate.render(dataSource, context);
    context = context.end();
  },

  update: function(dataSource, jquery) {
    this.updateSizeClassName(dataSource, jquery);

    var theme = dataSource.get('theme'),
        value = dataSource.get('value');

    //addressing accessibility
    jquery.attr('aria-expanded', value);

    if (dataSource.get('isSelected')) jquery.addClass('sel');

    jquery.find('.disclosure').setClass({
      open: dataSource.get('isSelected'),
      closed: !dataSource.get('isSelected'),
      active: dataSource.get('isActive')
    });

    theme.labelRenderDelegate.update(dataSource, jquery.find('span.sc-disclosure-label'));
  }
});

