import { SC } from '../core/core.js';

import { viewManager } from './views/view_manager.js';

export { View } from './views/view.js';
export { CoreView, outlet } from './views/core_view.js';
export { BaseTheme, Theme } from './theme/theme.js'
export { RenderContext } from './render_context/render_context.js';
export { LAYOUT_AUTO, LAYOUT_HORIZONTAL, LAYOUT_VERTICAL } from './views/view/layout.js'
export { Pane } from './panes/pane.js';
export { MainPane }  from './panes/main.js';
export * from './views/utils/rect.js';
export * from './views/utils/utils.js';
export { viewManager } from './views/view_manager.js';
export { LayoutState } from './views/view/animation.js'; 
export { ContainerView } from './views/container.js';
export { ImageView } from './views/image.js';
export { Validator } from './validators/index.js';
export { FieldView } from './views/field.js';
export { TextFieldView } from './views/text_field.js';
export { InlineTextFieldView } from './views/inline_text_field.js';
export { InlineTextFieldDelegate } from './delegates/inline_text_field.js';
export { LabelView } from './views/label.js';
export { imageQueue } from './system/image_queue.js';
export { TextSelection } from './system/text_selection.js';
export { offset } from './views/utils/utils.js';

export * from './system/constants.js';
export { RenderDelegate } from './views/render_delegates/render_delegate.js';
export { AutoResize, AutoResizeManager } from './mixins/auto_resize.js';
export { ContentDisplay } from './mixins/content_display.js';
export { ContentValueSupport } from './mixins/content_value_support.js';
export { Gesturable } from './mixins/gesturable.js';
export { Gesture } from './system/gesture.js';
export { Control } from './mixins/control.js';
export { ActionSupport } from './mixins/action_support.js';
export { FlowedLayout } from './mixins/flowed_layout.js';
export { InlineEditor } from './mixins/inline_editor.js';
export { InlineEditable } from './mixins/inline_editable.js';
export { Validatable } from './mixins/validatable.js';
export { PinchGesture } from './gestures/pinch_gesture.js';
export { SwipeGesture } from './gestures/swipe_gesture.js';
export { TapGesture } from './gestures/tap_gesture.js';
export { Page } from './system/page.js';
export { propertyFromRenderDelegate } from './views/view/theming.js';
export { Cursor } from './system/cursor.js';
export { easingCurve, CubicBezierEquation } from './system/bezier_curves.js';
export { bodyOverflowArbitrator } from './panes/body_overflow.js';


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



