// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { DraggablePaneSupport } from "./draggable.js";
import { ModalPane } from "./modal.js";
import { PanelPane } from "./panel.js";


/** @class
  Displays a non-modal, default positioned, drag&drop-able palette pane.

  The simplest way to use the palette pane is to define it in an Page like this:

        myPalettePane: PalettePane.create({
          layout: { width: 400, height: 200, right: 0, top: 0 },
          contentView: View.extend({
          })
        })

  Then get it from your page and append like this:

        MyApp.myPage.get('myPalettePane').append();

  This will cause your palette pane to instantiate lazily and display.

  Palette pane is a simple way to provide non-modal messaging that won't
  blocks the user's interaction with your application.  Palette panes are
  useful for showing important detail information with flexible position.
  They provide a better user experience than modal panel.

  @since SproutCore 1.0
*/
export const PalettePane = PanelPane.extend(DraggablePaneSupport,
/** @scope PalettePane.prototype */ {

  /**
    @type Array
    @default ['sc-palette']
    @see View#classNames
  */
  classNames: ['sc-palette'],

  /**
    Palettes are not modal by default

    @type Boolean
    @default false
  */
  isModal: false,

  /**
    @type View
    @default ModalPane
  */

  modalPane: ModalPane
});
