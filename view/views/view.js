
import { SC } from '../../core/core.js';
import { CoreView } from './core_view.js';
import { isPercentage } from './utils/utils.js';
import { accelerationSupport } from './view/acceleration.js';
import { animationSupport } from './view/animation.js';
import { cursorSupport } from './view/cursor.js';
import { viewEnabledSupport } from './view/enabled.js';
import { keyboardSupport } from './view/keyboard.js';
import { layoutSupport, LAYOUT_AUTO, staticViewLayout } from './view/layout.js';
import { viewLayoutStyleSupport } from './view/layout_style.js';
import { manipulationSupport } from './view/manipulation.js';
import { themingSupport } from './view/theming.js';
import { touchSupport } from './view/touch.js';
import { visibilitySupport } from './view/visibility.js';
import { designModeSupport } from './view/design_mode.js';
import { staticStackLayoutMixin } from './child_view_layouts/stack_layout.js';

/**
  @class

  Base class for managing a view.  Views provide two functions:

   1. They display – translating your application's state into drawing
     instructions for the web browser, and
   2. They react – acting as responders for incoming keyboard, mouse, and touch
     events.

  View Basics
  ====

  SproutCore's view layer is made up of a tree of View instances, nested
  using the `childViews` list – usually an array of local property names. You
  position each view by specifying a set of layout keys, like 'left', 'right',
  'width', or 'centerX', in a hash on the layout property. (See the 'layout'
  documentation for more.)

  Other than positioning, SproutCore relies on CSS for all your styling needs.
  Set an array of CSS classes on the `classNames` property, then style them with
  standard CSS. (SproutCore's build tools come with Sass support built in, too.)
  If you have a class that you want automatically added and removed as another
  property changes, take a look at `classNameBindings`.

  Different view classes do different things. The so-called "Big Five" view
  classes are LabelView, for displaying (optionally editable, optionally
  localizable) text; ButtonView, for the user to poke; CollectionView
  (most often as its subclass ListView) for displaying an array of content;
  ContainerView, for easily swapping child views in and out; and ScrollView,
  for containing larger views and allowing them to be scrolled.

  All views live in panes (subclasses of Pane, like MainPane and PanelPane),
  which are parentless views that know how to append themselves directly to the document.
  Panes also serve as routers for events, like mouse, touch and keyboard events, that are
  bound for their views. (See "View Events" below for more.)

  For best performance, you should define your view and pane instances with `extend()`
  inside an Page instance, getting them as needed with `get`. As its name suggests,
  Page's only job is to instantiate views once when first requested, deferring the
  expensive view creation process until each view is needed. Correctly using Page is
  considered an important best practice for high-performance applications.

  View Initialization
  ====

  When a view is setup, there are several methods you can override that
  will be called at different times depending on how your view is created.
  Here is a guide to which method you want to override and when:

   - `init` -- override this method for any general object setup (such as
     observers, starting timers and animations, etc) that you need to happen
     every time the view is created, regardless of whether or not its layer
     exists yet.
   - `render` -- override this method to generate or update your HTML to reflect
     the current state of your view.  This method is called both when your view
     is first created and later anytime it needs to be updated.
   - `update` -- Normally, when a view needs to update its content, it will
     re-render the view using the render() method.  If you would like to
     override this behavior with your own custom updating code, you can
     replace update() with your own implementation instead.
   - `didCreateLayer` -- the render() method is used to generate new HTML.
     Override this method to perform any additional setup on the DOM you might
     need to do after creating the view.  For example, if you need to listen
     for events.
   - `willDestroyLayer` -- if you implement didCreateLayer() to setup event
     listeners, you should implement this method as well to remove the same
     just before the DOM for your view is destroyed.
   - `didAppendToDocument` -- in theory all DOM setup could be done
     in didCreateLayer() as you already have a DOM element instantiated.
     However there is cases where the element has to be first appended to the
     Document because there is either a bug on the browser or you are using
     plugins which objects are not instantiated until you actually append the
     element to the DOM. This will allow you to do things like registering
     DOM events on flash or quicktime objects.
   - `willRemoveFromDocument` -- This method is called on the view immediately
     before its layer is removed from the DOM. You can use this to reverse any
     setup that is performed in `didAppendToDocument`.

  View Events
  ====

  One of SproutCore's optimizations is application-wide event delegation: SproutCore
  handles and standardizes events for you before sending them through your view layer's
  chain of responding views. You should never need to attach event listeners to elements;
  instead, just implement methods like `click`, `doubleClick`, `mouseEntered` and
  `dataDragHover` on your views.

  Note that events generally bubble up an event's responder chain, which is made up of the
  targeted view (i.e. the view whose DOM element received the event), and its chain of
  parentViews up to its pane. (In certain rare cases, you may wish to manipulate the responder
  chain to bypass certain views; you can do so by overriding a view's `nextResponder` property.)

  Simple mouse click events
  ----
  In many situations, all you need are clicks - in which case, just implement `click` or
  `doubleClick` on your views. Note that these events bubble up the responder chain until
  they encounter a view which implements the event method. For example, if a view and its
  parent both implement `click`, the parent will not be notified of the click. (If you want a
  view to handle the event AND allow the event to keep bubbling to its parent views, no
  problem: just be sure to return false from the event method.)
  - `click` -- Called on a view when the user clicks the mouse on a view. (Note that the view
    on which the user lifts the mouse button will receive the `click` event, regardless of
    whether the user depressed the mouse button elsewhere. If you need finer-grained control
    than this, see "Granular mouse click events" below.)
  - `doubleClick` -- Called on a view when a user has double-clicked it. Double-clicks are
    triggered when two clicks of the same button happen within eight pixels and 250ms of each
    other. (If you need finer-grained control than this, see "Granular mouse click events"
    below.) The same view may receive both `click` and `doubleClick` events.

  Note that defining application behavior directly in event handlers is usually a bad idea; you
  should follow the target/action pattern when possible. See ButtonView and ActionSupport.
  Also note that you will not need to implement event handling yourself on most built-in
  SproutCore controls.

  Note that `click` and `doubleClick` event handlers on your views will not be notified of touch
  events; you must also implement touch handling. See "Touch events" below.

  Mouse movement events
  ----
  SproutCore normalizes (and brings sanity to) mouse movement events by calculating when
  the mouse has entered and exited views, and sending the correct event to each view in
  the responder chain. For example, if a mouse moves within a parent view but crosses from
  one child view to another, the parent view will receive a mouseMoved event while the child
  views will receive mouseEntered and mouseExit events.

  In contrast to mouse click events, mouse movement events are called on the entire responder
  chain regardless of how you handle it along the way - a view and its parent, both implementing
  event methods, will both be notified of the event.

  - `mouseEntered` -- Called when the cursor first enters a view. Called on every view that has
    just entered the responder chain.
  - `mouseMoved` -- Called when the cursor moves over a view.
  - `mouseExited` -- Called when the cursor leaves a view. Called on every view that has
    just exited the responder chain.

  Granular mouse click events
  ----
  If you need more granular handling of mouse click events than what is provided by `click`
  and `doubleClick`, you can handle their atomic components `mouseDown`, `mouseDrag` and
  `mouseUp`. Like the compound events, these events bubble up their responder chain towards
  the pane until they find an event which implements the event handler method. (Again, to
  handle an event but allow it to continue bubbling, just return false.)

  It bears emphasizing that `mouseDrag` and `mouseUp` events for a given mouse click sequence
  are *only ever called* on the view which successfully responded to the `mouseDown` event. This
  gives `mouseDown` control over which view responder-chain is allowed to handle the entire
  click sequence.

  (Note that because of how events bubble up the responder chain, if a child view implements
  `mouseDown` but not `mouseDrag` or `mouseUp`, those events will bubble to its parent. This
  may cause unexpected behavior if similar events are handled at different parts of your view
  hierarchy, for example if you handle `mouseDown` in a child and a parent, and only handle
  `mouseUp` in the parent.)

  - `mouseDown` -- Called on the target view and responder chain when the user depresses a
    button. A view must implement `mouseDown` (and not return false) in order to be notified
    of the subsequent drag and up events.
  - `mouseDrag` -- Called on the target view if it handled mouseDown. A view must implement
    mouseDown (and not return false) in order to receive mouseDrag; only the view which handled a
    given click sequence's mouseDown will receive `mouseDrag` events (and will continue to
    receive them even if the user drags the mouse off of it).
  - `mouseUp` -- Called on the target view when the user lifts a mouse button. A view must
    implement mouseDown (and not return false) in order to receive mouseUp.

  SproutCore implements a higher-level API for handling in-application dragging and dropping.
  See `Drag`, `DragSourceProtocol`, `DragDataSourceProtocol`, and `DropTargetProtocol`
  for more.

  Data-drag events
  ----
  Browsers implement a parallel system of events for drags which bring something with them: for
  example, dragging text, an image, a URL or (in modern browsers) a file. They behave differently,
  and require different responses from the developer, so SproutCore implements them as a separate
  set of "data drag" events. These behave much like mouse events; the data-drag movement events
  bubble indiscriminately, and the data-drag drop event bubbles until it finds a view which handles
  it (and doesn't return false).

  By default, SproutCore cancels the default behavior of any data drag event which carries URLs
  or files, as by default these would quit the app and open the dragged item in the browser. If
  you wish to implement data drag-and-drop support in your application, you should set the event's
  dataTransfer.dropEffect property to 'copy' in a `dataDragHovered` event handler.

  - `dataDragEntered` -- Triggered when a data drag enters a view. You can use this handler to
    update the view to visually signal that a drop is possible.
  - `dataDragHovered` -- Triggered when the browser sends a dragover event to a view. If you want
    to support dropping data on your view, you must set the event's `dataTransfer.dropEffect`
    property to 'copy' (or related). Note that `dataDragHovered` is given access to dragenter
    events as well, so you do not need to worry about this in your `dataDragEntered` methods.
  - `dataDragDropped` -- If the last hover event's dropEffect was set correctly, this event will
    give the view access to the data that was dropped. This event bubbles up the responder chain
    until it finds a view which handles it (and doesn't return false).
  - `dataDragExited` -- Triggered when a data drag leaves a view. You can use this handler to
    update the view to remove the visual drop signal. This event is fired regardless of whether
    a drop occurred.


  Touch events
  ----
  Touch events can be much more complicated than mouse events: multiple touches may be in flight
  at once, and views may wish to handle average touches rather than individual touches.

  Basic support for touch events is required to make your application touch-aware. (You will not
  need to implement touch support for built-in SproutCore controls, which are touch-aware out of
  the box.) The basic touch event handlers are `touchStart` and `touchEnd`; if all you need is
  basic support then you can simply proxy these events to their mouse counterparts.

  The counterpart to `mouseDragged` is `touchesDragged`, which is passed two arguments: a special
  multitouch event object which includes methods for accessing information about all currently
  in-flight touches, and a list of touches active on the current view. If you need to check the
  status of touches currently being handled by other views, the special multitouch event object
  exposes the `touchesForView` method. It also exposes the convenient `averagedTouchesForView`
  method, which gives you easy access to an average touch center and distance. Unlike `mouseDragged`,
  `touchesDragged` does not bubble, being only called on views whic handled `touchStart` for touches
  which have moved.

  To facilitate intuitive behavior in situations like scroll views with touch handlers inside them,
  you may capture a touch from part way up its responder chain before it has a chance to bubble
  up from the target. To capture a touch, expose a method on your view called `captureTouch` which
  accepts the touch as its only argument, and which returns true if you would like to capture that
  touch. A captured touch will not bubble as normal, instead bubbling up from the capture point. Any
  child views will not have the opportunity to handle the captured event unless you implement custom
  responder swapping yourself.

  Touch events bubble differently than mouse and keyboard events. The initial reverse `captureTouch`
  bubbling is followed by regular `touchStart` bubbling; however, once this process has found a view
  that's willing to respond to the touch, further events are applied only to that view. If a view
  wishes to assign respondership for a touch to a different view, it can call one of several methods
  on the touch object. For a fuller discussion of touch events, touch responder behavior, and the touch
  object itself, see the documentation for Touch.

  Keyboard events
  ----
  The basic key events are `keyDown` and `keyUp`. In order to be notified of keyboard events,
  a view must set `acceptsFirstResponder` to `true`, and be on an active pane with
  `acceptsKeyPane` set to true. (You may also need to call `becomeFirstResponder` on your view
  on a `mouseDown`, for example, to focus it. You can verify whether your view has successfully
  received first responder status by checking `isFirstResponder`.)

  Note that key events bubble similarly to mouse click events: they will stop bubbling if they
  encounter a view which handles the event and does not return false.

  SproutCore implements a set of very convenient, higher-level keyboard events for action keys
  such as *tab*, *enter*, and the arrow keys. These are not triggered automatically, but you
  can gain access to them by proxying the keyboard event of your choice to `interpretKeyEvent`.
  For example:

        // Proxy the keyboard event to SC's built-in interpreter.
        keyDown: function(evt) {
          return this.interpretKeyEvents(evt);
        },
        // The interpreter will trigger the view's `cancel` event if the escape key was pressed.
        cancel: function(evt) {
          console.log('The escape key was pressed.'');
        }

  This will analyze the key press and fire an appropriate event. These events include, but are
  not limited to:

  - `moveUp`, `moveDown`, `moveLeft`, `moveRight` -- The arrow keys
  - `insertNewline` -- The enter key (note the lower-case 'line')
  - `cancel` -- The escape key
  - `insertTab` -- The tab key
  - `insertBacktab` -- Shift + the tab key
  - `moveToBeginningOfDocument` -- The *home* key
  - `moveToEndOfDocument` -- The *end* key
  - `pageUp` and `pageDown`
  - `moveLeftAndModifySelection` -- Shift + the left arrow
  - `selectAll` -- Ctrl + A / Cmd + A

  For a full list of available methods, see the key values on BASE_KEY_BINDINGS and
  MODIFIED_KEY_BINDINGS.


  @since SproutCore 1.0

*/
export const View = CoreView.extend(
    viewEnabledSupport, animationSupport, cursorSupport, viewLayoutStyleSupport, layoutSupport, 
    accelerationSupport, keyboardSupport, manipulationSupport, touchSupport, visibilitySupport,
    themingSupport, designModeSupport,
    /** @scope View.prototype */{
  classNames: ['sc-view'],

  displayProperties: [],

  /** @private Enhance. */
  _executeQueuedUpdates: function _executeQueuedUpdates () {
    _executeQueuedUpdates.base.apply(this, arguments);

    // Enabled
    // Update the layout style of the layer if necessary.
    if (this._enabledStyleNeedsUpdate) {
      this._doUpdateEnabledStyle();
    }

    // Layout
    // Update the layout style of the layer if necessary.
    if (this._layoutStyleNeedsUpdate) {
      this._doUpdateLayoutStyle();
    }
  },

  /** Apply the attributes to the context. */
  applyAttributesToContext: function applyAttributesToContext (context) {
    // Cursor
    var cursor = this.get('cursor');
    if (cursor) { context.addClass(cursor.get('className')); }

    // Enabled
    if (!this.get('isEnabled')) {
      context.addClass('disabled');
      context.setAttr('aria-disabled', 'true');
    }

    // Layout
    // Have to pass 'true' for second argument for legacy.
    this.renderLayout(context, true);

    if (this.get('useStaticLayout')) { context.addClass('sc-static-layout'); }

    // Background color defaults to null; for performance reasons we should ignore it
    // unless it's ever been non-null.
    var backgroundColor = this.get('backgroundColor');
    if (!SC.none(backgroundColor) || this._scv_hasBackgroundColor) {
      this._scv_hasBackgroundColor = true;
      if (backgroundColor) context.setStyle('backgroundColor', backgroundColor);
      else context.removeStyle('backgroundColor');
    }

    // Theming
    var theme = this.get('theme');
    var themeClassNames = theme.classNames, idx, len = themeClassNames.length;

    for (idx = 0; idx < len; idx++) {
      context.addClass(themeClassNames[idx]);
    }

    applyAttributesToContext.base.apply(this, arguments);

    var renderDelegate = this.get('renderDelegate');
    if (renderDelegate && renderDelegate.className) {
      context.addClass(renderDelegate.className);
    }

    // @if(debug)
    if (renderDelegate && renderDelegate.name) {
      SC.Logger.error("Render delegates now use 'className' instead of 'name'.");
      SC.Logger.error("Name '%@' will be ignored.", renderDelegate.name);
    }
    // @endif
  },

  /**
    Computes what the frame of this view would be if the parent were resized
    to the passed dimensions.  You can use this method to project the size of
    a frame based on the resize behavior of the parent.

    This method is used especially by the scroll view to automatically
    calculate when scrollviews should be visible.

    Passing null for the parent dimensions will use the actual current
    parent dimensions.  This is the same method used to calculate the current
    frame when it changes.

    @param {Rect} pdim the projected parent dimensions (optional)
    @returns {Rect} the computed frame
  */
  computeFrameWithParentFrame: function computeFrameWithParentFrame (pdim) {
    // Layout.
    var layout = this.get('layout'),
        f;

    // We can't predict the frame for static layout, so just return the view's
    // current frame (see original computeFrameWithParentFrame in views/view.js)
    if (this.get('useStaticLayout')) {
      f = computeFrameWithParentFrame.base.apply(this, arguments);
      f = f ? this._sc_adjustForBorder(f, layout) : null;
      f = f ? this._sc_adjustForScale(f, layout) : null;
      return f;
    }

    f = {
    };

    var error, layer, AUTO = LAYOUT_AUTO,
        dH, dW, //shortHand for parentDimensions
        lR = layout.right,
        lL = layout.left,
        lT = layout.top,
        lB = layout.bottom,
        lW = layout.width,
        lH = layout.height,
        lcX = layout.centerX,
        lcY = layout.centerY;

    if (lW === AUTO) {
      throw(("%@.layout() cannot use width:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (lH === AUTO) {
      throw(("%@.layout() cannot use height:auto if staticLayout is disabled").fmt(this), "%@".fmt(this), -1);
    }

    if (!pdim) { pdim = this.computeParentDimensions(layout); }
    dH = pdim.height;
    dW = pdim.width;

    // handle left aligned and left/right
    if (!SC.none(lL)) {
      if (isPercentage(lL)) {
        f.x = dW * lL;
      } else {
        f.x = lL;
      }

      if (lW !== undefined) {
        if (lW === AUTO) { f.width = AUTO; }
        else if (isPercentage(lW)) { f.width = dW * lW; }
        else { f.width = lW; }
      } else { // better have lR!
        f.width = dW - f.x;
        if (lR && isPercentage(lR)) { f.width = f.width - (lR * dW); }
        else { f.width = f.width - (lR || 0); }
      }

    // handle right aligned
    } else if (!SC.none(lR)) {
      if (SC.none(lW)) {
        if (isPercentage(lR)) {
          f.width = dW - (dW * lR);
        }
        else f.width = dW - lR;
        f.x = 0;
      } else {
        if (lW === AUTO) f.width = AUTO;
        else if (isPercentage(lW)) f.width = dW * lW;
        else f.width = (lW || 0);
        if (isPercentage(lW)) f.x = dW - (lR * dW) - f.width;
        else f.x = dW - lR - f.width;
      }

    // handle centered
    } else if (!SC.none(lcX)) {
      if (lW === AUTO) f.width = AUTO;
      else if (isPercentage(lW)) f.width = lW * dW;
      else f.width = (lW || 0);
      if (isPercentage(lcX)) f.x = (dW - f.width) / 2 + (lcX * dW);
      else f.x = (dW - f.width) / 2 + lcX;
    } else {
      f.x = 0; // fallback
      if (SC.none(lW)) {
        f.width = dW;
      } else {
        if (lW === AUTO) f.width = AUTO;
        if (isPercentage(lW)) f.width = lW * dW;
        else f.width = (lW || 0);
      }
    }

    // handle top aligned and top/bottom
    if (!SC.none(lT)) {
      if (isPercentage(lT)) f.y = lT * dH;
      else f.y = lT;
      if (lH !== undefined) {
        if (lH === AUTO) f.height = AUTO;
        else if (isPercentage(lH)) f.height = lH * dH;
        else f.height = lH;
      } else { // better have lB!
        if (lB && isPercentage(lB)) f.height = dH - f.y - (lB * dH);
        else f.height = dH - f.y - (lB || 0);
      }

    // handle bottom aligned
    } else if (!SC.none(lB)) {
      if (SC.none(lH)) {
        if (isPercentage(lB)) f.height = dH - (lB * dH);
        else f.height = dH - lB;
        f.y = 0;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (lH && isPercentage(lH)) f.height = lH * dH;
        else f.height = (lH || 0);
        if (isPercentage(lB)) f.y = dH - (lB * dH) - f.height;
        else f.y = dH - lB - f.height;
      }

    // handle centered
    } else if (!SC.none(lcY)) {
      if (lH === AUTO) f.height = AUTO;
      if (lH && isPercentage(lH)) f.height = lH * dH;
      else f.height = (lH || 0);
      if (isPercentage(lcY)) f.y = (dH - f.height) / 2 + (lcY * dH);
      else f.y = (dH - f.height) / 2 + lcY;

    // fallback
    } else {
      f.y = 0; // fallback
      if (SC.none(lH)) {
        f.height = dH;
      } else {
        if (lH === AUTO) f.height = AUTO;
        if (isPercentage(lH)) f.height = lH * dH;
        else f.height = lH || 0;
      }
    }

    f.x = Math.floor(f.x);
    f.y = Math.floor(f.y);
    if (f.height !== AUTO) f.height = Math.floor(f.height);
    if (f.width !== AUTO) f.width = Math.floor(f.width);

    // if width or height were set to auto and we have a layer, try lookup
    if (f.height === AUTO || f.width === AUTO) {
      layer = this.get('layer');
      if (f.height === AUTO) f.height = layer ? layer.clientHeight : 0;
      if (f.width === AUTO) f.width = layer ? layer.clientWidth : 0;
    }

    // Okay we have all our numbers. Let's adjust them for things.

    // First, adjust for border.
    f = this._sc_adjustForBorder(f, layout);

    // Make sure the width/height fix their min/max (note the inlining of none for performance)...
    /*jshint eqnull:true */
    if ((layout.maxHeight != null) && (f.height > layout.maxHeight)) f.height = layout.maxHeight;
    if ((layout.minHeight != null) && (f.height < layout.minHeight)) f.height = layout.minHeight;
    if ((layout.maxWidth != null) && (f.width > layout.maxWidth)) f.width = layout.maxWidth;
    if ((layout.minWidth != null) && (f.width < layout.minWidth)) f.width = layout.minWidth;

    // Finally, adjust for scale.
    f = this._sc_adjustForScale(f, layout);

    return f;
  },

  init: function init () {
    init.base.apply(this, arguments);

    // Enabled.
    // If the view is pre-configured as disabled, then go to the proper initial state.
    if (!this.get('isEnabled')) { this._doDisable(); }

    // Layout
    this._previousLayout = this.get('layout');

    // Apply the automatic child view layout if it is defined.
    var childViewLayout = this.childViewLayout;
    if (childViewLayout) {
      // Layout the child views once.
      this.set('childViewsNeedLayout', true);
      this.layoutChildViewsIfNeeded();

      // If the child view layout is live, start observing affecting properties.
      if (this.get('isChildViewLayoutLive')) {
        this.addObserver('childViews.[]', this, this._cvl_childViewsDidChange);
        // DISABLED. this.addObserver('childViewLayout', this, this._cvl_childViewLayoutDidChange);
        this.addObserver('childViewLayoutOptions', this, this._cvl_childViewLayoutDidChange);

        // Initialize the child views.
        this._cvl_setupChildViewsLiveLayout();

        // Initialize our own frame observer.
        if (!this.get('isFixedSize') && childViewLayout.layoutDependsOnSize && childViewLayout.layoutDependsOnSize(this)) {
          this.addObserver('frame', this, this._cvl_childViewLayoutDidChange);
        }
      }
    }

    // Theming
    this._lastTheme = this.get('theme');

  },

  /** @private */
  destroy: function destroy () {
    // Clean up.
    this._previousLayout = null;

    return destroy.base.apply(this);
  },

  /** CoreView.prototype. */
  removeChild: function removeChild (view) {
    // Manipulation
    if (!view) { return this; } // nothing to do
    if (view.parentView !== this) {
      throw new Error("%@.removeChild(%@) must belong to parent".fmt(this, view));
    }

    // notify views
    // TODO: Deprecate these notifications.
    if (view.willRemoveFromParent) { view.willRemoveFromParent() ; }
    if (this.willRemoveChild) { this.willRemoveChild(view) ; }

    removeChild.base.apply(this, arguments);

    return this;
  }

});


View.mixin(staticViewLayout, staticStackLayoutMixin);