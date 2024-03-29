// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { CoreQuery } from '../../event/event.js';
import { RenderContext } from '../render_context/render_context.js';

import { Responder } from '../../responder/responder.js';
import { viewStates, viewStatechart } from './view/statechart.js'
import { coreViewEnabledSupport } from './view/enabled.js';
import { viewManager } from './view_manager.js';
import { intersectRects } from './utils/rect.js';
import { offset } from './utils/utils.js';


// sc_require('system/browser');
// sc_require('system/event');
// sc_require('system/cursor');
// sc_require('system/responder');
// sc_require('system/theme');

// sc_require('system/string');
// sc_require('views/view/statechart');

/**
  Default property to disable or enable by default the contextMenu
*/
SC.setSetting("CONTEXT_MENU_ENABLED", true);


/**
  Default property to disable or enable if the focus can jump to the address
  bar or not.
*/
SC.setSetting("TABBING_ONLY_INSIDE_DOCUMENT", false);

/**
  Tells the property (when fetched with themed()) to get its value from the renderer (if any).
*/
SC.setSetting("FROM_THEME", "__FROM_THEME__"); // doesn't really matter what it is, so long as it is unique. Readability is a plus.

/** @private - custom array used for child views */
const EMPTY_CHILD_VIEWS_ARRAY = [];
EMPTY_CHILD_VIEWS_ARRAY.needsClone = true;

/**
  @class

*/
export const CoreView = Responder.extend(SC.DelegateSupport, viewStatechart, 
/** @scope View.prototype */ {

  /**
    An array of the properties of this class that will be concatenated when
    also present on subclasses.

    @type Array
    @default ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings']
  */
  concatenatedProperties: ['outlets', 'displayProperties', 'classNames', 'renderMixin', 'didCreateLayerMixin', 'willDestroyLayerMixin', 'classNameBindings', 'attributeBindings'],

  /**
    The WAI-ARIA role of the control represented by this view. For example, a
    button may have a role of type 'button', or a pane may have a role of
    type 'alertdialog'. This property is used by assistive software to help
    visually challenged users navigate rich web applications.

    The full list of valid WAI-ARIA roles is available at:
    http://www.w3.org/TR/wai-aria/roles#roles_categorization

    @type String
    @default null
  */
  ariaRole: null,

  /**
    The aria-hidden role is managed appropriately by the internal view's
    statechart.  When the view is not currently displayed the aria-hidden
    attribute will be set to true.

    @type String
    @default null
    @deprecated Version 1.10
  */
  ariaHidden: null,

  /**
    Whether this view was created by its parent view or not.

    Several views are given child view classes or instances to automatically
    append and remove.  In the case that the view was provided an instance,
    when it removes the instance and no longer needs it, it should not destroy
    the instance because it was created by someone else.

    On the other hand if the view was given a class that it creates internal
    instances from, then it should destroy those instances properly to avoid
    memory leaks.

    This property should be set by any view that is creating internal child
    views so that it can properly remove them later.  Note that if you use
    `createChildView`, this property is set automatically for you.

    @type Boolean
    @see View#createChildView
    @default false
  */
  createdByParent: false,

  /** @deprecated Version 1.11.0 Please use parentView instead. */
  owner: function () {
    //@if(debug)
    SC.warn("Developer Warning: The `owner` property of View has been deprecated in favor of the `parentView`, which is the same value. Please use `parentView`.");
    //@endif
    return this.get('parentView');
  }.property('parentView').cacheable(),

  /**
    The current pane.

    @field
    @type Pane
    @default null
  */
  pane: function () {
    var view = this;

    while (view && !view.isPane) { view = view.get('parentView'); }

    return view;
  }.property('parentView').cacheable(),

  /**
    The page this view was instantiated from.  This is set by the page object
    during instantiation.

    @type Page
    @default null
  */
  page: null,

  /**
    If the view is currently inserted into the DOM of a parent view, this
    property will point to the parent of the view.

    @type View
    @default null
  */
  parentView: null,

  /**
    The isVisible property determines if the view should be displayed or not.

    If you also set a transitionShow or transitionHide plugin, then when
    isVisible changes, the appropriate transition will execute as the view's
    visibility changes.

    Note that isVisible can be set to true and the view may still not be
    "visible" in the window.  This can occur if:

      1. the view is not attached to the document.
      2. the view has a view ancestor with isVisible set to false.

    @type Boolean
    @see View#viewState
    @default true
  */
  isVisible: true,
  isVisibleBindingDefault: SC.Binding.bool(),

  // ..........................................................
  // CHILD VIEW SUPPORT
  //

  /**
    Array of child views.  You should never edit this array directly unless
    you are implementing createChildViews().  Most of the time, you should
    use the accessor methods such as appendChild(), insertBefore() and
    removeChild().

    @type Array
    @default []
  */
  childViews: EMPTY_CHILD_VIEWS_ARRAY,

  /**
    Use this property to automatically mix in a collection of mixins into all
    child views created by the view. This collection is applied during createChildView
    @property

    @type Array
    @default null
  */
  autoMixins: null,

  // ..........................................................
  // LAYER SUPPORT
  //

  /**
    Returns the current layer for the view.  The layer for a view is only
    generated when the view first becomes visible in the window and even
    then it will not be computed until you request this layer property.

    If the layer is not actually set on the view itself, then the layer will
    be found by calling this.findLayerInParentLayer().

    You can also set the layer by calling set on this property.

    @type DOMElement the layer
  */
  layer: function (key, value) {
    if (value !== undefined) {
      this._view_layer = value;

    // no layer...attempt to discover it...
    } else {
      value = this._view_layer;
      if (!value) {
        var parent = this.get('parentView');
        if (parent) { parent = parent.get('layer'); }
        this._view_layer = value = this.findLayerInParentLayer(parent);
      }
    }
    return value;
  }.property('isVisibleInWindow').cacheable(),

  /**
    Get a CoreQuery object for this view's layer, or pass in a selector string
    to get a CoreQuery object for a DOM node nested within this layer.

    @param {String} sel a CoreQuery-compatible selector string
    @returns {CoreQuery} the CoreQuery object for the DOM node
  */
  $: function (sel) {
    var layer = this.get('layer');

    if (!layer) { return CoreQuery(); }
    else if (sel === undefined) { return CoreQuery(layer); }
    else { return CoreQuery(sel, layer); }
  },

  /**
    Returns the DOM element that should be used to hold child views when they
    are added/remove via DOM manipulation.  The default implementation simply
    returns the layer itself.  You can override this to return a DOM element
    within the layer.

    @type DOMElement the container layer
  */
  containerLayer: function () {
    return this.get('layer');
  }.property('layer').cacheable(),

  /**
    The ID to use when trying to locate the layer in the DOM.  If you do not
    set the layerId explicitly, then the view's GUID will be used instead.
    This ID must be set at the time the view is created.

    @type String
    @readOnly
  */
  layerId: function (key, value) {
    if (value) { this._layerId = value; }
    if (this._layerId) { return this._layerId; }
    return SC.guidFor(this);
  }.property().cacheable(),

  /**
    Attempts to discover the layer in the parent layer.  The default
    implementation looks for an element with an ID of layerId (or the view's
    guid if layerId is null).  You can override this method to provide your
    own form of lookup.  For example, if you want to discover your layer using
    a CSS class name instead of an ID.

    @param {DOMElement} parentLayer the parent's DOM layer
    @returns {DOMElement} the discovered layer
  */
  findLayerInParentLayer: function (parentLayer) {
    var id = "#" + this.get('layerId').escapeCssIdForSelector();
    return CoreQuery(id, parentLayer)[0] || CoreQuery(id)[0];
  },

  /**
    Returns true if the receiver is a subview of a given view or if it's
    identical to that view. Otherwise, it returns false.

    @property {View} view
  */
  isDescendantOf: function (view) {
    var parentView = this.get('parentView');

    if (this === view) { return true; }
    else if (parentView) { return parentView.isDescendantOf(view); }
    else { return false; }
  },

  /**
    This method is invoked whenever a display property changes and updates
    the view's content once at the end of the run loop before any invokeLast
    functions run.

    To cause the view to be updated you can call this method directly and
    if you need to perform additional setup whenever the display changes, you
    can override this method as well.

    @returns {View} receiver
  */
  displayDidChange: function () {
    //@if (debug)
    if (SC.getSetting('LOG_VIEW_STATES')) {
      SC.Logger.log('%c%@:%@ — displayDidChange()'.fmt(this, this.get('viewState')), LOG_VIEW_STATES_STYLE[this.get('viewState')]);
    }
    //@endif

    // Don't run _doUpdateContent needlessly, because the view may render
    // before it is invoked, which would result in a needless update.
    if (this.get('_isRendered')) {
      // Legacy.
      this.set('layerNeedsUpdate', true);

      this.invokeOnce(this._doUpdateContent);
    }

    return this;
  },

  /**
    This property has no effect and is deprecated.

    To cause a view to update immediately, you should just call updateLayer or
    updateLayerIfNeeded.  To cause a view to update at the end of the run loop
    before any invokeLast functions run, you should call displayDidChange.

    @deprecated Version 1.10
    @type Boolean
    @test in updateLayer
  */
  layerNeedsUpdate: false,

  /**
    Updates the view's layer if the view is in a shown state.  Otherwise, the
    view will be updated the next time it enters a shown state.

    This is the same behavior as `displayDidChange` except that calling
    `updateLayerIfNeeded` will attempt to update each time it is called,
    while `displayDidChange` will only attempt to update the layer once per run
    loop.

    @returns {View} receiver
    @test in updateLayer
  */
  updateLayerIfNeeded: function (skipIsVisibleInWindowCheck) {
    //@if(debug)
    if (skipIsVisibleInWindowCheck) {
      warn("Developer Warning: The `skipIsVisibleInWindowCheck` argument of updateLayerIfNeeded is not supported and will be ignored.");
    }
    //@endif
    this._doUpdateContent(false);

    return this;
  },

  /**
    This is the core method invoked to update a view layer whenever it has
    changed.  This method simply creates a render context focused on the
    layer element and then calls your render() method.

    You will not usually call or override this method directly.  Instead you
    should set the layerNeedsUpdate property to true to cause this method to
    run at the end of the run loop, or you can call updateLayerIfNeeded()
    to force the layer to update immediately.

    Instead of overriding this method, consider overriding the render() method
    instead, which is called both when creating and updating a layer.  If you
    do not want your render() method called when updating a layer, then you
    should override this method instead.

    @returns {View} receiver
  */
  updateLayer: function () {
    this._doUpdateContent(true);

    return this;
  },

  /** @private */
  parentViewDidResize: function () {
    if (!this.get('hasLayout')) { this.notifyPropertyChange('frame'); }
    this.viewDidResize();
  },

  /**
    Override this in a child class to define behavior that should be invoked
    when a parent's view was resized.
   */
  viewDidResize: function () {},

  /**
    Creates a new renderContext with the passed tagName or element.  You
    can override this method to provide further customization to the context
    if needed.  Normally you will not need to call or override this method.

    @returns {RenderContext}
  */
  renderContext: function (tagNameOrElement) {
    return RenderContext.call(RenderContext, tagNameOrElement); 
  },

  /**
    Creates the layer by creating a renderContext and invoking the view's
    render() method.  This will only create the layer if the layer does not
    already exist.

    When you create a layer, it is expected that your render() method will
    also render the HTML for all child views as well.  This method will
    notify the view along with any of its childViews that its layer has been
    created.

    @returns {View} receiver
  */
  createLayer: function () {
    if (!this.get('_isRendered')) {
      this._doRender();
    }

    return this;
  },

  /**
    Destroys any existing layer along with the layer for any child views as
    well.  If the view does not currently have a layer, then this method will
    do nothing.

    If you implement willDestroyLayer() on your view or if any mixins
    implement willDestroLayerMixin(), then this method will be invoked on your
    view before your layer is destroyed to give you a chance to clean up any
    event handlers, etc.

    If you write a willDestroyLayer() handler, you can assume that your
    didCreateLayer() handler was called earlier for the same layer.

    Normally you will not call or override this method yourself, but you may
    want to implement the above callbacks when it is run.

    @returns {View} receiver
  */
  destroyLayer: function () {
    // We allow you to call destroy layer, but you should really detach first.
    if (this.get('isAttached')) {
      this._doDetach();
    }

    if (this.get('_isRendered')) {
      this._doDestroyLayer();
    }

    return this;
  },

  /**
    Destroys and recreates the current layer.  Doing this on a parent view can
    be more efficient than modifying individual child views independently.

    @returns {View} receiver
  */
  replaceLayer: function () {
    var layer, parentNode;

    // If attached, detach and track our parent node so we can re-attach.
    if (this.get('isAttached')) {
      layer = this.get('layer');
      parentNode = layer.parentNode;

      this._doDetach();
    }

    this.destroyLayer().createLayer();

    // Reattach our layer (if we have a parentView this is done automatically).
    if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }

    return this;
  },

  /**
    If the parent view has changed, we need to insert this
    view's layer into the layer of the new parent view.
  */
  parentViewDidChange: function () {
    //@if(debug)
    warn("Developer Warning: parentViewDidChange has been deprecated.  Please use the notification methods willAddChild, didAddChild, willRemoveChild or didRemoveChild on the parent or willAddToParent, didAddToParent, willRemoveFromParent or didRemoveFromParent on the child to perform updates when the parent/child status changes.");
    //@endif
  },

  /**
    Set to true when the view's layer location is dirty.  You can call
    updateLayerLocationIfNeeded() to clear this flag if it is set.

    @deprecated Version 1.10
    @type Boolean
  */
  layerLocationNeedsUpdate: false,

  /**
    Calls updateLayerLocation(), but only if the view's layer location
    currently needs to be updated.

    @deprecated Version 1.10
    @returns {View} receiver
    @test in updateLayerLocation
  */
  updateLayerLocationIfNeeded: function () {
    //@if(debug)
    warn("View.prototype.updateLayerLocationIfNeeded is no longer used and has been deprecated.  See the View statechart code for more details on attaching and detaching layers.");
    //@endif

    return this;
  },

  /**
    This method is called when a view changes its location in the view
    hierarchy.  This method will update the underlying DOM-location of the
    layer so that it reflects the new location.

    @deprecated Version 1.10
    @returns {View} receiver
  */
  updateLayerLocation: function () {
    //@if(debug)
    warn("View.prototype.updateLayerLocation is no longer used and has been deprecated.  See the View statechart code for more details on attaching and detaching layers.");
    //@endif

    return this;
  },

  /**
    @private

    Renders to a context.
    Rendering only happens for the initial rendering. Further updates happen in updateLayer,
    and are not done to contexts, but to layers.
    Note: You should not generally override nor directly call this method. This method is only
    called by createLayer to set up the layer initially, and by renderChildViews, to write to
    a context.

    @param {RenderContext} context the render context.
  */
  renderToContext: function (context) {
    var mixins, idx, len;

    this.beginPropertyChanges();

    context.id(this.get('layerId'));
    context.setAttr('role', this.get('ariaRole'));

    // Set up the classNameBindings and attributeBindings observers.
    // TODO: CLEAN UP!!
    this._applyClassNameBindings();
    this._applyAttributeBindings(context);

    context.addClass(this.get('classNames'));

    if (this.get('isTextSelectable')) { context.addClass('allow-select'); }

    if (!this.get('isVisible')) {
      context.addClass('sc-hidden');
      context.setAttr('aria-hidden', 'true');
    }

    // Call applyAttributesToContext so that subclasses that override it can
    // insert further attributes.
    this.applyAttributesToContext(context);

    // We pass true for the second argument to support the old style of render.
    this.render(context, true);

    // If we've made it this far and renderChildViews() was never called,
    // render any child views now.
    if (!this._didRenderChildViews) { this.renderChildViews(context); }
    // Reset the flag so that if the layer is recreated we re-render the child views.
    this._didRenderChildViews = false;

    if (mixins = this.renderMixin) {
      len = mixins.length;
      for (idx = 0; idx < len; ++idx) { mixins[idx].call(this, context, true); }
    }

    this.endPropertyChanges();
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function (context) {

  },

  /**
    @private

    Iterates over the view's `classNameBindings` array, inserts the value
    of the specified property into the `classNames` array, then creates an
    observer to update the view's element if the bound property ever changes
    in the future.
  */
  _applyClassNameBindings: function () {
    var classBindings = this.get('classNameBindings'),
        classNames = this.get('classNames'),
        dasherizedClass;

    if (!classBindings) { return; }

    // Loop through all of the configured bindings. These will be either
    // property names ('isUrgent') or property paths relative to the view
    // ('content.isUrgent')
    classBindings.forEach(function (property) {

      // Variable in which the old class value is saved. The observer function
      // closes over this variable, so it knows which string to remove when
      // the property changes.
      var oldClass;

      // Set up an observer on the context. If the property changes, toggle the
      // class name.
      var observer = function () {
        // Get the current value of the property
        var newClass = this._classStringForProperty(property);
        var elem = this.$();

        // If we had previously added a class to the element, remove it.
        if (oldClass) {
          elem.removeClass(oldClass);
          classNames.removeObject(oldClass);
        }

        // If necessary, add a new class. Make sure we keep track of it so
        // it can be removed in the future.
        if (newClass) {
          elem.addClass(newClass);
          classNames.push(newClass);
          oldClass = newClass;
        } else {
          oldClass = null;
        }
      };

      this.addObserver(property.split(':')[0], this, observer);

      // Get the class name for the property at its current value
      dasherizedClass = this._classStringForProperty(property);

      if (dasherizedClass) {
        // Ensure that it gets into the classNames array
        // so it is displayed when we render.
        classNames.push(dasherizedClass);

        // Save a reference to the class name so we can remove it
        // if the observer fires. Remember that this variable has
        // been closed over by the observer.
        oldClass = dasherizedClass;
      }

    }, this);
  },

  /**
    Iterates through the view's attribute bindings, sets up observers for each,
    then applies the current value of the attributes to the passed render buffer.

    @param {RenderBuffer} buffer
  */
  _applyAttributeBindings: function (context) {
    var attributeBindings = this.get('attributeBindings'),
        attributeValue, elem, type;

    if (!attributeBindings) { return; }

    attributeBindings.forEach(function (attribute) {
      // Create an observer to add/remove/change the attribute if the
      // JavaScript property changes.
      var observer = function () {
        elem = this.$();
        var currentValue = elem.attr(attribute);
        attributeValue = this.get(attribute);

        type = typeof attributeValue;

        if ((type === 'string' || type === 'number') && attributeValue !== currentValue) {
          elem.attr(attribute, attributeValue);
        } else if (attributeValue && type === 'boolean') {
          elem.attr(attribute, attribute);
        } else if (attributeValue === false) {
          elem.removeAttr(attribute);
        }
      };

      this.addObserver(attribute, this, observer);

      // Determine the current value and add it to the render buffer
      // if necessary.
      attributeValue = this.get(attribute);
      type = typeof attributeValue;

      if (type === 'string' || type === 'number') {
        context.setAttr(attribute, attributeValue);
      } else if (attributeValue && type === 'boolean') {
        // Apply boolean attributes in the form attribute="attribute"
        context.setAttr(attribute, attribute);
      }
    }, this);
  },

  /**
    @private

    Given a property name, returns a dasherized version of that
    property name if the property evaluates to a non-falsy value.

    For example, if the view has property `isUrgent` that evaluates to true,
    passing `isUrgent` to this method will return `"is-urgent"`.
  */
  _classStringForProperty: function (property) {
    var split = property.split(':'), className = split[1];
    property = split[0];

    var val = SC.getPath(this, property);

    // If value is a Boolean and true, return the dasherized property
    // name.
    if (val === true) {
      if (className) { return className; }

      // Normalize property path to be suitable for use
      // as a class name. For exaple, content.foo.barBaz
      // becomes bar-baz.
      return SC.String.dasherize(property.split('.').get('lastObject'));

    // If the value is not false, undefined, or null, return the current
    // value of the property.
    } else if (val !== false && val !== undefined && val !== null) {
      return val;

    // Nothing to display. Return null so that the old class is removed
    // but no new class is added.
    } else {
      return null;
    }
  },

  /**
    Your render method should invoke this method to render any child views,
    especially if this is the first time the view will be rendered.  This will
    walk down the childView chain, rendering all of the children in a nested
    way.

    @param {RenderContext} context the context
    @returns {RenderContext} the render context
    @test in render
  */
  renderChildViews: function (context) {
    var cv = this.get('childViews'), len = cv.length, idx, view;
    for (idx = 0; idx < len; ++idx) {
      view = cv[idx];
      if (!view) { continue; }
      context = context.begin(view.get('tagName'));
      view.renderToContext(context);
      context = context.end();
    }

    // Track that renderChildViews was called in case it was called directly
    // in a render method.
    this._didRenderChildViews = true;

    return context;
  },

  /** @private -
    override to add support for theming or in your view
  */
  render: function () { },

  // ..........................................................
  // STANDARD RENDER PROPERTIES
  //

  /**
    A list of properties on the view to translate dynamically into attributes on
    the view's layer (element).

    When the view is rendered, the value of each property listed in
    attributeBindings will be inserted in the element.  If the value is a
    Boolean, the attribute name itself will be inserted.  As well, as the
    value of any of these properties changes, the layer will update itself
    automatically.

    This is an easy way to set custom attributes on the View without
    implementing it through a render or update function.

    For example,

        // ...  MyApp.MyView

        attributeBindings: ['aria-valuenow', 'disabled'],

        'aria-valuenow': function () {
          return this.get('value');
        }.property('value').cacheable(), // adds 'aria-valuenow="{value}"' attribute

        disabled: true, // adds 'disabled="disabled"' attribute

        // ...

    @type Array
    @default null
  */
  attributeBindings: null,


  /**
    Tag name for the view's outer element.  The tag name is only used when
    a layer is first created.  If you change the tagName for an element, you
    must destroy and recreate the view layer.

    @type String
    @default 'div'
  */
  tagName: 'div',

  /**
    Standard CSS class names to apply to the view's outer element.  These class
    names are used in addition to any defined on the view's superclass.

    @type Array
    @default []
  */
  classNames: [],

  /**
    A list of local property names to translate dynamically into standard
    CSS class names on your view's layer (element).

    Each entry in the array should take the form "propertyName:css-class".
    For example, "isRed:my-red-view" will cause the class "my-red-view" to
    be appended if the property "isRed" is (or becomes) true, and removed
    if it later becomes false (or null/undefined).

    Optionally, you may provide just the property name, in which case it will
    be dasherized and used as the class name.  For example, including
    "isUpsideDown" will cause the view's isUpsideDown property to mediate the
    class "is-upside-down".

    Instead of a boolean value, your property may return a string, which will
    be used as the class name for that entry.  Use caution when returning other
    values; numbers will be appended verbatim and objects will be stringified,
    leading to unintended results such as class="4" or class="Object object".

    Class names mediated by these bindings are used in addition to any that
    you've listed in the classNames property.

    @type Array
  */
  classNameBindings: null,

  /**
    Tool tip property that will be set to the title attribute on the HTML
    rendered element.

    @type String
  */
  toolTip: null,

  /**
    The computed tooltip.  This is generated by localizing the toolTip
    property if necessary.

    @type String
  */
  displayToolTip: function () {
    var ret = this.get('toolTip');
    return (ret && this.get('localize')) ? SC.String.loc(ret) : (ret || '');
  }.property('toolTip', 'localize').cacheable(),

  /**
    Determines if the user can select text within the view.  Normally this is
    set to false to disable text selection.  You should set this to true if you
    are creating a view that includes editable text.  Otherwise, settings this
    to true will probably make your controls harder to use and it is not
    recommended.

    @type Boolean
    @readOnly
  */
  isTextSelectable: false,

  /**
    You can set this array to include any properties that should immediately
    invalidate the display.  The display will be automatically invalidated
    when one of these properties change.

    These are the properties that will be visible to any Render Delegate.
    When the RenderDelegate asks for a property it needs, the view checks the
    displayProperties array. It first looks for the property name prefixed
    by 'display'; for instance, if the render delegate needs a 'title',
    the view will attempt to find 'displayTitle'. If there is no 'displayTitle'
    in displayProperties, the view will then try 'title'. If 'title' is not
    in displayProperties either, an error will be thrown.

    This allows you to avoid collisions between your view's API and the Render
    Delegate's API.

    Implementation note:  'isVisible' is also effectively a display property,
    but it is not declared as such because it is observed separately in
    order to manage the view's internal state.

    @type Array
    @readOnly
  */
  displayProperties: [],

  // .......................................................
  // RESPONDER SUPPORT
  //

  /** @property
    The nextResponder is usually the parentView.
  */
  nextResponder: function () {
    return this.get('parentView');
  }.property('parentView').cacheable(),


  /** @property
    Set to true if your view is willing to accept first responder status.  This
    is used when calculating key responder loop.
  */
  acceptsFirstResponder: false,

  // .......................................................
  // CORE DISPLAY METHODS
  //

  /** @private
    Caches the layerId to detect when it changes.
    */
  _lastLayerId: null,

  /** @private
    Setup a view, but do not finish waking it up.

     - configure childViews
     - Determine the view's theme
     - Fetch a render delegate from the theme, if necessary
     - register the view with the global views hash, which is used for event
       dispatch
  */
  init: function init () {
    var childViews, layerId;

    init.base.apply(this, arguments);

    layerId = this._lastLayerId = this.get('layerId');

    // Register the view for event handling. This hash is used by
    // RootResponder to dispatch incoming events.
    //@if (debug)
    if (viewManager.views[layerId]) {
      throw new Error("Developer Error: A view with layerId, '%@', already exists.  Each view must have a unique layerId.".fmt(this.get('layerId')));
    }
    //@endif
    viewManager.views[layerId] = this;

    // setup classNames
    this.classNames = this.get('classNames').slice();

    // setup child views.  be sure to clone the child views array first
    childViews = this.childViews = this.get('childViews').slice();
    this.createChildViews(); // setup child Views
  },

  /**
    Frame describes this view's current bounding rect, relative to its parent view. You
    can use this, for example, to reliably access a width for a view whose layout is
    defined with left and right. (Note that width and height values are calculated in
    the parent view's frame of reference as well, which has consequences for scaled
    views.)

    @type Rect
    @test in layoutStyle
  */
  frame: function () {
    return this.computeFrameWithParentFrame(null);
  }.property('useStaticLayout').cacheable(),    // We depend on the layout, but layoutDidChange will call viewDidResize to check the frame for us

  /**
    Computes the frame of the view by examining the view's DOM representation.
    If no representation exists, returns null.

    If the view has a parent view, the parent's bounds will be taken into account when
    calculating the frame.

    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function () {
    var layer,                            // The view's layer
        pv = this.get('parentView'),      // The view's parent view (if it exists)
        f;                                // The layer's coordinates in the document

    // need layer to be able to compute rect
    if (layer = this.get('layer')) {
      f = offset(layer); // x,y
      if (pv) { f = pv.convertFrameFromView(f, null); }

      /*
        TODO Can probably have some better width/height values - CC
        FIXME This will probably not work right with borders - PW
      */
      f.width = layer.offsetWidth;
      f.height = layer.offsetHeight;

      return f;
    }

    // Unable to compute yet
    if (this.get('hasLayout')) {
      return null;
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  },

  /** @private Call the method recursively on all child views. */
  _callOnChildViews: function (methodName, isTopDown, context) {
    var childView,
      childViews = this.get('childViews'),
      method,
      shouldContinue;

    for (var i = childViews.length - 1; i >= 0; i--) {
      childView = childViews[i];

      // We allow missing childViews in the array so ignore them.
      if (!childView) { continue; }

      // Look up the method on the child.
      method = childView[methodName];

      // Call the method on this view *before* its children.
      if (isTopDown === undefined || isTopDown) {
        shouldContinue = method.call(childView, context);
      }

      // Recurse.
      if (shouldContinue === undefined || shouldContinue) {
        childView._callOnChildViews(methodName, isTopDown, context);
      }

      // Call the method on this view *after* its children.
      if (isTopDown === false) {
        method.call(childView, context);
      }
    }
  },

  /**
    The clipping frame returns the visible portion of the view, taking into
    account the clippingFrame of the parent view.  (Note that, in contrast
    to `frame`, `clippingFrame` is in the context of the view itself, not
    its parent view.)

    Normally this will be calculated based on the intersection of your own
    clippingFrame and your parentView's clippingFrame.

    @type Rect
  */
  clippingFrame: function () {
    var f = this.get('frame');

    // FAST PATH: No frame, no clipping frame.
    if (!f) return null;

    /*jshint eqnull:true */
    var scale = (f.scale == null) ? 1 : f.scale,
        pv = this.get('parentView'),
        pcf = pv ? pv.get('clippingFrame') : null,
        ret;

    // FAST PATH: No parent clipping frame, no change. (The origin and scale are reset from parent view's
    // context to our own.)
    if (!pcf) return { x: 0, y: 0, width: f.width / scale, height: f.height / scale};

    // Get the intersection.
    ret = intersectRects(pcf, f);

    // Reorient the top-left from the parent's origin to ours.
    ret.x -= f.x;
    ret.y -= f.y;

    // If we're scaled, we have to scale the intersected rectangle from our parent's frame of reference
    // to our own.
    if (scale !== 1) {
      var scaleX, scaleY;
      // We're scaling from parent space into our space, so the scale is reversed. (Layout scale may be an array.)
      if (SC.typeOf(scale) === SC.T_ARRAY) {
        scaleX = 1 / scale[0];
        scaleY = 1 / scale[1];
      } else {
        scaleX = scaleY = 1 / scale;
      }

      // Convert the entire rectangle into our scale.
      ret.x *= scaleX;
      ret.width *= scaleX;
      ret.y *= scaleY;
      ret.height *= scaleY;
    }

    return ret;
  }.property('parentView', 'frame').cacheable(),

  /** @private
    This method is invoked whenever the clippingFrame changes, notifying
    each child view that its clippingFrame has also changed.
  */
  _sc_clippingFrameDidChange: function () {
    this.notifyPropertyChange('clippingFrame');
  },

  /**
    Removes the child view from the parent view *and* detaches it from the
    document.

    This does *not* remove the child view's layer (i.e. the node still exists,
    but is no longer in the document) and does *not* destroy the child view
    (i.e. it can still be re-attached to the document).

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached until the transition completes.  To force the view to detach
    immediately you can pass true for the optional `immediately` argument.

    If you wish to remove the child and discard it, use `removeChildAndDestroy`.

    @param {View} view The view to remove as a child view.
    @param {Boolean} [immediately=false] Forces the child view to be removed immediately regardless if it uses a transitionOut plugin.
    @see View#removeChildAndDestroy
    @returns {View} receiver
  */
  removeChild: function (view, immediately) {
    if (view.get('isAttached')) {
      view._doDetach(immediately);
    }

    // If the view will transition out, wait for the transition to complete
    // before orphaning the view entirely.
    if (!immediately && view.get('viewState') === CoreView.ATTACHED_BUILDING_OUT) {
      view.addObserver('isAttached', this, this._orphanChildView);
    } else {
      view._doOrphan();
    }

    return this;
  },

  /**
    Removes the child view from the parent view, detaches it from the document
    *and* destroys the view and its layer.

    Note that if the child view uses a transitionOut plugin, it will not be
    fully detached and destroyed until the transition completes.  To force the
    view to detach immediately you can pass true for the optional `immediately`
    argument.

    If you wish to remove the child and keep it for further re-use, use
    `removeChild`.

    @param {View} view The view to remove as a child view and destroy.
    @param {Boolean} [immediately=false] Forces the child view to be removed and destroyed immediately regardless if it uses a transitionOut plugin.
    @see View#removeChild
    @returns {View} receiver
  */
  removeChildAndDestroy: function (view, immediately) {
    if (view.get('isAttached')) {
      view._doDetach(immediately);
    }

    // If the view will transition out, wait for the transition to complete
    // before destroying the view entirely.
    if (view.get('isAttached') && view.get('transitionOut') && !immediately) {
      view.addObserver('isAttached', this, this._destroyChildView);
    } else {
      view.destroy(); // Destroys the layer and the view.
    }

    return this;
  },

  /**
    Removes all children from the parentView *and* destroys them and their
    layers.

    Note that if any child view uses a transitionOut plugin, it will not be
    fully removed until the transition completes.  To force all child views to
    remove immediately you can pass true as the optional `immediately` argument.

    Tip: If you know that there are no transitions for the child views,
    you should pass true to optimize the document removal.

    @param {Boolean} [immediately=false] Forces all child views to be removed immediately regardless if any uses a transitionOut plugin.
    @returns {View} receiver
  */
  removeAllChildren: function (immediately) {
    var childViews = this.get('childViews'),
      len = childViews.get('length'),
      i;

    // OPTIMIZATION!
    // If we know that we're removing all children and we are rendered, lets do the document cleanup in one sweep.
    // if (immediately && this.get('_isRendered')) {
    //   var layer,
    //     parentNode;

    //   // If attached, detach and track our parent node so we can re-attach.
    //   if (this.get('isAttached')) {
    //     layer = this.get('layer');
    //     parentNode = layer.parentNode;

    //     this._doDetach();
    //   }

    //   // Destroy our layer and thus all the children's layers in one move.
    //   this.destroyLayer();

    //   // Remove all the children.
    //   for (i = len - 1; i >= 0; i--) {
    //     this.removeChildAndDestroy(childViews.objectAt(i), immediately);
    //   }

    //   // Recreate our layer (now empty).
    //   this.createLayer();

    //   // Reattach our layer.
    //   if (parentNode && !this.get('isAttached')) { this._doAttach(parentNode); }
    // } else {
      for (i = len - 1; i >= 0; i--) {
        this.removeChildAndDestroy(childViews.objectAt(i), immediately);
      }
    // }

    return this;
  },

  /**
    Removes the view from its parentView, if one is found.  Otherwise
    does nothing.

    @returns {View} receiver
  */
  removeFromParent: function () {
    var parent = this.get('parentView');
    if (parent) { parent.removeChild(this); }

    return this;
  },

  /** @private Observer for child views that are being discarded after transitioning out. */
  _destroyChildView: function (view) {
    // Commence destroying of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._destroyChildView);
      view.destroy();
    }
  },

  /** @private Observer for child views that are being orphaned after transitioning out. */
  _orphanChildView: function (view) {
    // Commence orphaning of the view once it is detached.
    if (!view.get('isAttached')) {
      view.removeObserver('isAttached', this, this._orphanChildView);
      view._doOrphan();
    }
  },

  /**
    Completely destroys a view instance so that it may be garbage collected.

    You must call this method on a view to destroy the view (and all of its
    child views). This will remove the view from any parent, detach the
    view's layer from the DOM if it is attached and clear the view's layer
    if it is rendered.

    Once a view is destroyed it can *not* be reused.

    @returns {View} receiver
  */
  destroy: function destroy () {
    // Fast path!
    if (this.get('isDestroyed')) { return this; }

    // Do generic destroy. It takes care of mixins and sets isDestroyed to true.
    // Do this first, since it cleans up bindings that may apply to parentView
    // (which we will soon null out).
    var ret = destroy.base.apply(this, arguments);

    // If our parent is already destroyed, then we can defer destroying ourself
    // and our own child views momentarily.
    if (this.getPath('parentView.isDestroyed')) {
      // Complete the destroy in a bit.
      this.invokeNext(this._destroy);
    } else {
      // Immediately remove the layer if attached (ignores transitionOut). This
      // will detach the layer for all child views as well.
      if (this.get('isAttached')) {
        this._doDetach(true);
      }

      // Clear the layer if rendered.  This will clear all child views layer
      // references as well.
      if (this.get('_isRendered')) {
        this._doDestroyLayer();
      }

      // Complete the destroy.
      this._destroy();
    }

    // Remove the view from the global hash.
    delete viewManager.views[this.get('layerId')];

    // Destroy any children.  Loop backwards since childViews will shrink.
    var childViews = this.get('childViews');
    for (var i = childViews.length - 1; i >= 0; i--) {
      childViews[i].destroy();
    }

    return ret;
  },

  /** @private */
  _destroy: function () {
    // Orphan the view if adopted.
    this._doOrphan();

    delete this.page;
  },

  /**
    This method is called when your view is first created to setup any  child
    views that are already defined on your class.  If any are found, it will
    instantiate them for you.

    The default implementation of this method simply steps through your
    childViews array, which is expects to either be empty or to contain View
    designs that can be instantiated

    Alternatively, you can implement this method yourself in your own
    subclasses to look for views defined on specific properties and then build
     a childViews array yourself.

    Note that when you implement this method yourself, you should never
    instantiate views directly.  Instead, you should use
    this.createChildView() method instead.  This method can be much faster in
    a production environment than creating views yourself.

    @returns {View} receiver
  */
  createChildViews: function () {
    var childViews = this.get('childViews'),
        len        = childViews.length,
        isNoLongerValid = false,
        idx, key, view;

    this.beginPropertyChanges();

    // swap the array
    for (idx = 0; idx < len; ++idx) {
      key = view = childViews[idx];

      // is this is a key name, lookup view class
      if (typeof key === SC.T_STRING) {
        view = this[key];
      } else {
        key = null;
      }

      if (!view) {
        //@if (debug)
        SC.warn("Developer Warning: The child view named '%@' was not found in the view, %@.  This child view will be ignored.".fmt(key, this));
        //@endif

        // skip this one.
        isNoLongerValid = true;
        childViews[idx] = null;
        continue;
      }

      // createChildView creates the view if necessary, but also sets
      // important properties, such as parentView
      view = this.createChildView(view);
      if (key) { this[key] = view; } // save on key name if passed

      childViews[idx] = view;
    }

    // Set childViews to be only the valid array.
    if (isNoLongerValid) { this.set('childViews', childViews.compact()); }

    this.endPropertyChanges();
    return this;
  },

  /**
    Instantiates a view to be added to the childViews array during view
    initialization. You generally will not call this method directly unless
    you are overriding createChildViews(). Note that this method will
    automatically configure the correct settings on the new view instance to
    act as a child of the parent.

    If the given view is a class, then createdByParent will be set to true on
    the returned instance.

    @param {Class} view A view class to create or view instance to prepare.
    @param {Object} [attrs={}] attributes to add
    @returns {View} new instance
    @test in createChildViews
  */
  createChildView: function (view, attrs) {
    // Create the view if it is a class.
    if (view.isClass) {
      // attrs should always exist...
      if (!attrs) { attrs = {}; }

      // clone the hash that was given so we do not pollute it if it's being reused
      else { attrs = SC.clone(attrs); }

      // Assign the parentView & page to ourself.
      attrs.parentView = this;
      if (!attrs.page) { attrs.page = this.page; }

      // Track that we created this view.
      attrs.createdByParent = true;

      // Insert the autoMixins if defined
      var applyMixins = this.autoMixins;
      if (!!applyMixins) {
        applyMixins = SC.clone(applyMixins);
        applyMixins.push(attrs);
        view = view.create.apply(view, applyMixins);
      } else {
        view = view.create(attrs);
      }
    // Assign the parentView if the view is an instance.
    // TODO: This should not be accepting view instances, for the purpose of lazy code elsewhere in the framework.
    //       We should ensure users of `createChildViews` are using appendChild and other manipulation methods.
    } else {
      view.set('parentView', this);
      view._adopted();

      if (!view.get('page')) { view.set('page', this.page); }
    }

    return view;
  },

  /** walk like a duck */
  isView: true,

  /**
    Default method called when a selectstart event is triggered. This event is
    only supported by IE. Used in sproutcore to disable text selection and
    IE8 accelerators. The accelerators will be enabled only in
    text selectable views. In FF and Safari we use the css style 'allow-select'.

    If you want to enable text selection in certain controls is recommended
    to override this function to always return true , instead of setting
    isTextSelectable to true.

    For example in textfield you do not want to enable textSelection on the text
    hint only on the actual text you are entering. You can achieve that by
    only overriding this method.

    @param evt {Event} the selectstart event
    @returns true if selectable
  */
  selectStart: function (evt) {
    return this.get('isTextSelectable');
  },

  /**
    Used to block the contextMenu per view.

    @param evt {Event} the contextmenu event
    @returns true if the contextmenu will be allowed to show up
  */
  contextMenu: function (evt) {
    if (this.get('isContextMenuEnabled')) {
      evt.allowDefault();
      return true;
    }
  },

  // ------------------------------------------------------------------------
  // Transitions
  //

  /**
    The transition plugin to use when this view is appended to the DOM.

    CoreView uses a pluggable transition architecture where the transition
    setup, execution and cleanup can be handled by a specified transition
    plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      View.BOUNCE_IN
      View.FADE_IN
      View.SLIDE_IN
      View.SCALE_IN
      View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the ViewTransitionProtocol protocol.

    @type Object (ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionIn: null,

  /**
    The options for the given transition in plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, View.SLIDE_IN accepts options
    like:

        transitionInOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionInOptions: null,

  /**
    The transition plugin to use when this view is removed from the DOM.

    View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      View.BOUNCE_OUT
      View.FADE_OUT
      View.SLIDE_OUT
      View.SCALE_OUT
      View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the ViewTransitionProtocol protocol.

    @type Object (ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionOut: null,

  /**
    The options for the given transition out plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, View.SLIDE accepts options
    like:

        transitionOutOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionOutOptions: null,

  /**
    The transition plugin to use when this view is made shown from being
    hidden.

    CoreView uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      View.BOUNCE_IN
      View.FADE_IN
      View.SLIDE_IN
      View.SCALE_IN
      View.SPRING_IN

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the ViewTransitionProtocol protocol.

    @type Object (ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionShow: null,

  /**
    The options for the given transition show plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, View.SLIDE accepts options
    like:

        transitionShowOptions: {
          direction: 'left',
          duration: 0.25,
          timing: 'ease-in-out'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionShowOptions: null,

  /**
    The transition plugin to use when this view is hidden after being shown.

    View uses a pluggable transition architecture where the transition setup,
    execution and cleanup can be handled by a specified transition plugin.

    There are a number of pre-built transition plugins available in the
    foundation framework:

      View.BOUNCE_OUT
      View.FADE_OUT
      View.SLIDE_OUT
      View.SCALE_OUT
      View.SPRING_OUT

    You can even provide your own custom transition plugins.  Just create a
    transition object that conforms to the ViewTransitionProtocol protocol.

    @type Object (ViewTransitionProtocol)
    @default null
    @since Version 1.10
  */
  transitionHide: null,

  /**
    The options for the given transition hide plugin.

    These options are specific to the current transition plugin used and are
    used to modify the transition animation.  To determine what options
    may be used for a given plugin and to see what the default options are,
    see the documentation for the transition plugin being used.

    Most transitions will accept a duration and timing option, but may
    also use other options.  For example, View.SLIDE accepts options
    like:

        transitionHideOptions: {
          direction: 'right',
          duration: 0.15,
          timing: 'ease-in'
        }

    @type Object
    @default null
    @since Version 1.10
  */
  transitionHideOptions: null,

  // ............................................
  // Patches
  //

  /** @private
    Override this method to apply design modes to this view and
    its children.
    @see View
  */
  updateDesignMode: function (lastDesignMode, designMode) {}
});

CoreView.mixin(
  /** @scope CoreView */ {

  /** @private walk like a duck -- used by Page */
  isViewClass: true,

  /**
    This method works just like extend() except that it will also preserve
    the passed attributes in case you want to use a view builder later, if
    needed.

    @param {Object} attrs Attributes to add to view
    @returns {Class} View subclass to create
    @function
  */
  design: function () {
    if (this.isDesign) {
      // @if (debug)
      Logger.warn("Developer Warning: .design() was called twice for %@.".fmt(this));
      // @endif
      return this;
    }

    var ret = this.extend.apply(this, arguments);
    ret.isDesign = true;
    // if (ViewDesigner) {
    //   ViewDesigner.didLoadDesign(ret, this, A(arguments));
    // }
    return ret;
  },

  extend: function () {
    var last = arguments[arguments.length - 1];

    if (last && !SC.none(last.theme)) {
      last.themeName = last.theme;
      delete last.theme;
    }

    return SC.Object.extend.apply(this, arguments);
  },

  /**
    Helper applies the layout to the prototype.
  */
  layout: function (layout) {
    this.prototype.layout = layout;
    return this;
  },

  /**
    Helper applies the classNames to the prototype
  */
  classNames: function (sc) {
    sc = (this.prototype.classNames || []).concat(sc);
    this.prototype.classNames = sc;
    return this;
  },

  /**
    Help applies the tagName
  */
  tagName: function (tg) {
    this.prototype.tagName = tg;
    return this;
  },

  /**
    Helper adds the childView
  */
  childView: function (cv) {
    var childViews = this.prototype.childViews || [];
    if (childViews === this.superclass.prototype.childViews) {
      childViews = childViews.slice();
    }
    childViews.push(cv);
    this.prototype.childViews = childViews;
    return this;
  },

  /**
    Helper adds a binding to a design
  */
  bind: function (keyName, path) {
    var p = this.prototype, s = this.superclass.prototype;
    var bindings = p._bindings;
    if (!bindings || bindings === s._bindings) {
      bindings = p._bindings = (bindings || []).slice();
    }

    keyName = keyName + "Binding";
    p[keyName] = path;
    bindings.push(keyName);

    return this;
  },

  /**
    Helper sets a generic property on a design.
  */
  prop: function (keyName, value) {
    this.prototype[keyName] = value;
    return this;
  },

  /**
    Used to construct a localization for a view.  The default implementation
    will simply return the passed attributes.
  */
  localization: function (attrs, rootElement) {
    // add rootElement
    if (rootElement) attrs.rootElement = CoreQuery(rootElement)[0];
    return attrs;
  },

  /**
    Creates a view instance, first finding the DOM element you name and then
    using that as the root element.  You should not use this method very
    often, but it is sometimes useful if you want to attach to already
    existing HTML.

    @param {String|Element} element
    @param {Object} attrs
    @returns {View} instance
  */
  viewFor: function (element, attrs) {
    var args = SC.A(arguments); // prepare to edit
    if (SC.none(element)) {
      args.shift(); // remove if no element passed
    } else args[0] = { rootElement: CoreQuery(element)[0] };
    var ret = this.create.apply(this, arguments);
    args = args[0] = null;
    return ret;
  },

  /**
    Create a new view with the passed attributes hash.  If you have the
    Designer module loaded, this will also create a peer designer if needed.
  */
  create: function () {
    var last = arguments[arguments.length - 1];

    if (last && last.theme) {
      last.themeName = last.theme;
      delete last.theme;
    }

    var C = this, ret = new C(arguments);
    // if (ViewDesigner) {
    //   ViewDesigner.didCreateView(ret, SC.A(arguments));
    // }
    return ret;
  },

  /**
    Applies the passed localization hash to the component views.  Call this
    method before you call create().  Returns the receiver.  Typically you
    will do something like this:

    view = View.design({...}).loc(localizationHash).create();

    @param {Object} loc
    @param rootElement {String} optional rootElement with prepped HTML
    @returns {View} receiver
  */
  loc: function (loc) {
    var childLocs = loc.childViews;
    delete loc.childViews; // clear out child views before applying to attrs

    this.applyLocalizedAttributes(loc);
    // if (ViewDesigner) {
    //   ViewDesigner.didLoadLocalization(this, SC.A(arguments));
    // }

    // apply localization recursively to childViews
    var childViews = this.prototype.childViews, idx = childViews.length,
      viewClass;
    while (--idx >= 0) {
      viewClass = childViews[idx];
      loc = childLocs[idx];
      if (loc && viewClass && typeof viewClass === SC.T_STRING) SC.String.loc(viewClass, loc);
    }

    return this; // done!
  },

  /**
    Internal method actually updates the localized attributes on the view
    class.  This is overloaded in design mode to also save the attributes.
  */
  applyLocalizedAttributes: function (loc) {
    SC.mixin(this.prototype, loc);
  },

  // This have been moved to the separate view manager, to save us loads of recursive dependencies.
  // views: {}

});

CoreView.mixin(viewStates);
CoreView.mixin(coreViewEnabledSupport);


// .......................................................
// OUTLET BUILDER
//

/**
  Generates a computed property that will look up the passed property path
  the first time you try to get the value.  Use this whenever you want to
  define an outlet that points to another view or object.  The root object
  used for the path will be the receiver.
*/
export const outlet = function (path, root) {
  return function (key) {
    return (this[key] = SC.objectForPropertyPath(path, (root !== undefined) ? root : this));
  }.property();
};

/** @private on unload clear cached divs. */
CoreView.unload = function () {
  // delete view items this way to ensure the views are cleared.  The hash
  // itself may be owned by multiple view subclasses.
  var views = viewManager.views;
  if (views) {
    for (var key in views) {
      if (!views.hasOwnProperty(key)) continue;
      delete views[key];
    }
  }
};

