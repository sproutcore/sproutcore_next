// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../core/core.js';

/**
  If set to `NO`, then pressing backspace will NOT navigate to the previous
  page in the browser history, which is the default behavior in most browsers.
  
  Usually it is best to leave this property set to `NO` in order to prevent the
  user from inadvertently losing data by pressing the backspace key.

  @static
  @type Boolean
  @default NO
*/

// SC.allowsBackspaceToPreviousPage = NO;
SC.setSetting('allowsBackspaceToPreviousPage', false);

export { ScrollerView, OverlayScrollerView } from './views/scroller.js';
export { ButtonView } from './views/button.js';
export { CheckboxView} from './views/checkbox.js';
export * from './system/constants.js';
export { SplitChild, NeedsSplitParent } from './mixins/split_child.js';
export { SplitThumb } from './mixins/split_thumb.js';
export { Drag } from './system/drag.js';
export { SplitDividerView } from './views/split_divider.js';
export { SplitView } from './views/split.js';
export { ScrollView } from './views/scroll_view.js';
export { SourceListView } from './views/source_list.js';
export { ListView } from './views/list.js';
export { ToolbarView } from './views/toolbar.js';
export { WebView } from './views/web.js';
