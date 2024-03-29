// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { browser } from '../../event/event.js';
import { device, platform } from '../../responder/responder.js';
import { LAYOUT_HORIZONTAL, LAYOUT_VERTICAL, View } from '../../view/view.js';

/** @class

  Displays a horizontal or vertical scroller.  You will not usually need to
  work with scroller views directly, but you may override this class to
  implement your own custom scrollers.

  Because the scroller uses the dimensions of its constituent elements to
  calculate layout, you may need to override the default display metrics.

  You can either create a subclass of ScrollerView with the new values, or
  provide your own in your theme:

      ScrollerView = ScrollerView.extend({
        scrollbarThickness: 14,
        capLength: 18,
        capOverlap: 14,
        buttonOverlap: 11,
        buttonLength: 41
      });

  You can change whether scroll buttons are displayed by setting the
  `hasButtons` property.

  By default, `ScrollerView` has a persistent gutter. If you would like a
  gutterless scroller that supports fading, see `OverlayScrollerView`.

  
  @since SproutCore 1.0
*/

export const ScrollerView = View.extend(
/** @scope ScrollerView.prototype */ {

  /** @private
    @type Array
    @default ['sc-scroller-view']
    @see View#classNames
  */
  classNames: ['sc-scroller-view'],

  /** @private
    @type Array
    @default ['thumbPosition', 'thumbLength', 'controlsHidden']
    @see View#displayProperties
  */
  displayProperties: ['thumbPosition', 'thumbLength', 'controlsHidden'],

  /** @private
    The WAI-ARIA role for scroller view.

    @type String
    @default 'scrollbar'
    @readOnly
  */
  ariaRole: 'scrollbar',


  // ..........................................................
  // PROPERTIES
  //

  /**
    If true, a click on the track will cause the scrollbar to scroll to that position.
    Otherwise, a click on the track will cause a page down.

    In either case, alt-clicks will perform the opposite behavior.

    @type Boolean
    @default false
  */
  shouldScrollToClick: false,

  /**
    The value of the scroller.

    The value represents the position of the scroller's thumb.

    @field
    @type Number
    @default null
  */
  value: null,

  /**
    The displayed value of the scroller.

    This is the value of the scroller constrained within the minimum and maximum values.

    @type Number
    @observes value
  */
  displayValue: function () {
    return Math.max(Math.min(this.get("value"), this.get('maximum')), this.get('minimum'));
  }.property("value", 'minimum', 'maximum').cacheable(),

  /**
    The portion of the track that the thumb should fill. Usually the
    proportion will be the ratio of the size of the scroll view's content view
    to the size of the scroll view.

    Should be specified as a value between 0.0 (minimal size) and 1.0 (fills
    the slot). Note that if the proportion is 1.0 then the control will be
    disabled.

    @type Number
    @default 0.0
  */
  proportion: 0,

  /**
    The maximum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    When set less than the height of the scroller, the scroller is disabled.

    @type Number
    @default 0
  */
  maximum: 0,

  /**
    The minimum offset value for the scroller.  This will be used to calculate
    the internal height/width of the scroller itself.

    @type Number
    @default 0
  */
  minimum: 0,

  /**
    true to enable scrollbar, false to disable it.  Scrollbars will automatically
    disable if the maximum scroll width does not exceed their capacity.

    @field
    @type Boolean
    @default true
    @observes proportion
  */
  isEnabled: function (key, value) {
    if (value !== undefined) {
      this._scsv_isEnabled = value;
    }

    if (this._scsv_isEnabled !== undefined) {
      return this._scsv_isEnabled;
    }

    return this.get('proportion') < 1;
  }.property('proportion').cacheable(),

  /** @private */
  _scsv_isEnabled: undefined,

  /**
    Determine the layout direction.  Determines whether the scrollbar should
    appear horizontal or vertical.  This must be set when the view is created.
    Changing this once the view has been created will have no effect. Possible
    values:

      - LAYOUT_VERTICAL
      - LAYOUT_HORIZONTAL

    @type String
    @default LAYOUT_VERTICAL
  */
  layoutDirection: LAYOUT_VERTICAL,

  /**
    Whether or not the scroller should display scroll buttons

    @type Boolean
    @default true
  */
  hasButtons: true,


  // ..........................................................
  // DISPLAY METRICS
  //

  /**
    The width (if vertical scroller) or height (if horizontal scroller) of the
    scrollbar.

    @type Number
    @default 14
  */
  scrollbarThickness: 14,

  /**
    The width or height of the cap that encloses the track.

    @type Number
    @default 18
  */
  capLength: 18,

  /**
    The amount by which the thumb overlaps the cap.

    @type Number
    @default 14
  */
  capOverlap: 14,

  /**
    The width or height of the up/down or left/right arrow buttons. If the
    scroller is not displaying arrows, this is the width or height of the end
    cap.

    @type Number
    @defaut 41
  */
  buttonLength: 41,

  /**
    The amount by which the thumb overlaps the arrow buttons. If the scroller
    is not displaying arrows, this is the amount by which the thumb overlaps
    the end cap.

    @type Number
    @default 9
  */
  buttonOverlap: 9,

  /**
    The minimium length that the thumb will be, regardless of how much content
    is in the scroll view.

    @type Number
    @default 20
  */
  minimumThumbLength: 20,

  // ..........................................................
  // INTERNAL SUPPORT
  //


  /** @private
    Generates the HTML that gets displayed to the user.

    The first time render is called, the HTML will be output to the DOM.
    Successive calls will reposition the thumb based on the value property.

    @param {RenderContext} context the render context
    @param {Boolean} firstTime true if this is creating a layer
    @private
  */
  render: function (context, firstTime) {
    var ariaOrientation = 'vertical',
      classNames = {},
      parentView = this.get('parentView'),
      layoutDirection = this.get('layoutDirection'),
      thumbPosition, thumbLength, thumbElement;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (layoutDirection) {
    case LAYOUT_VERTICAL:
      classNames['sc-vertical'] = true;
      break;
    case LAYOUT_HORIZONTAL:
      classNames['sc-horizontal'] = true;
      ariaOrientation = 'horizontal';
      break;
    }

    // The appearance of the scroller changes if disabled
    // Whether to hide the thumb and buttons
    classNames['controls-hidden'] = this.get('controlsHidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.setClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      context.push('<div class="track"></div>',
                    '<div class="cap"></div>');
      this.renderButtons(context, this.get('hasButtons'));
      this.renderThumb(context, layoutDirection, thumbLength, thumbPosition);

      //addressing accessibility
      context.setAttr('aria-orientation', ariaOrientation);

      //addressing accessibility
      context.setAttr('aria-valuemax', this.get('maximum'));
      context.setAttr('aria-valuemin', this.get('minimum'));
      context.setAttr('aria-valuenow', this.get('value'));
      context.setAttr('aria-controls', parentView.getPath('contentView.layerId'));
    } else {
      // The HTML has already been generated, so all we have to do is
      // reposition and resize the thumb

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);

      //addressing accessibility
      context.setAttr('aria-valuenow', this.get('value'));
      if (this.didChangeFor('render-min', 'minimum')) context.setAttr('aria-valuemin', this.get('minimum'));
      if (this.didChangeFor('render-max', 'maximum')) context.setAttr('aria-valuemax', this.get('maximum'));
    }
  },

  renderThumb: function (context, layoutDirection, thumbLength, thumbPosition) {
    var styleString;
    if (layoutDirection === LAYOUT_HORIZONTAL) styleString = 'width: ' + thumbLength + 'px; left: ' + thumbPosition + 'px;';
    else styleString = 'height: ' + thumbLength + 'px; top: ' + thumbPosition + 'px;';

    context.push('<div class="thumb" style="%@">'.fmt(styleString),
                 '<div class="thumb-center"></div>',
                 '<div class="thumb-top"></div>',
                 '<div class="thumb-bottom"></div></div>');

  },

  renderButtons: function (context, hasButtons) {
    if (hasButtons) {
      context.push('<div class="button-bottom"></div><div class="button-top"></div>');
    } else {
      context.push('<div class="endcap"></div>');
    }
  },

  // ..........................................................
  // THUMB MANAGEMENT
  //

  /** @private
    Adjusts the thumb (for backwards-compatibility calls adjustThumbPosition+adjustThumbSize by default)
  */
  adjustThumb: function (thumb, position, length) {
    this.adjustThumbPosition(thumb, position);
    this.adjustThumbSize(thumb, length);
  },

  /** @private
    Updates the position of the thumb DOM element.

    @param {Number} position the position of the thumb in pixels
  */
  adjustThumbPosition: function (thumb, thumbPosition) {
    var transformAttribute = browser.experimentalCSSNameFor('transform'),
        thumbEl = thumb[0];

    // Don't touch the DOM if the position hasn't changed.
    if (this._thumbPosition !== thumbPosition) {
      // Consider that the parent view may be animating its final position, then we need to also animate
      // our final position.
      var parentView = this.get('parentView'),
        parentIsAnimating = parentView._sc_isAnimating;

      if (platform.supportsCSSTransitions) {
        var transitionStyle = browser.experimentalStyleNameFor('transition');

        if (parentIsAnimating) {
          var duration = parentView._sc_animationDuration,
            timing = parentView._sc_animationTiming.toString();

          // Will use translation transform to position thumb.
          if (platform.supportsCSSTransforms) {
            thumbEl.style[transitionStyle] = transformAttribute + ' ' + duration + 's ' + timing;

          // Will use top/left style to position thumb.
          } else {
            switch (this.get('layoutDirection')) {
            case LAYOUT_VERTICAL:
              thumbEl.style[transitionStyle] = 'top ' + duration + 's ' + timing;
              break;
            case LAYOUT_HORIZONTAL:
              thumbEl.style[transitionStyle] = 'left ' + duration + 's ' + timing;
              break;
            }
          }

        // No duration, clear any previous transition.
        } else {
          thumbEl.style[transitionStyle] = '';
        }
      }


      // Position the thumb.
      var transformStyle;
      switch (this.get('layoutDirection')) {
      case LAYOUT_VERTICAL:

        // Use translation transform to position thumb.
        if (platform.supportsCSSTransforms) {
          transformStyle = 'translateX(0px) translateY(' + thumbPosition + 'px)';

          // TODO: Is this a necessary check?
          if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

          thumbEl.style[transformAttribute] = transformStyle;

        // Use top style to position thumb.
        } else {
          thumbEl.style.top = thumbPosition;
        }

        break;

      case LAYOUT_HORIZONTAL:
        // Use translation transform to position thumb.
        if (platform.supportsCSSTransforms) {

          transformStyle = 'translateX(' + thumbPosition + 'px) translateY(0px)';

          // TODO: Is this a necessary check?
          if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

          thumbEl.style[transformAttribute] = transformStyle;

        // Use left style to position thumb.
        } else {
          thumbEl.style.left = thumbPosition;
        }

        break;
      }
    }

    // Cache these values to check for changes.
    this._thumbPosition = thumbPosition;
  },

  /** @private */
  adjustThumbSize: function (thumb, size) {
    // Don't touch the DOM if the size hasn't changed
    if (this._thumbSize === size) return;

    switch (this.get('layoutDirection')) {
    case LAYOUT_VERTICAL:
      thumb.css('height', Math.max(size, this.get('minimumThumbLength')));
      break;
    case LAYOUT_HORIZONTAL:
      thumb.css('width', Math.max(size, this.get('minimumThumbLength')));
      break;
    }

    this._thumbSize = size;
  },

  // ..........................................................
  // SCROLLER DIMENSION COMPUTED PROPERTIES
  //

  /** @private
    Returns the total length of the track in which the thumb sits.

    The length of the track is the height or width of the scroller, less the
    cap length and the button length. This property is used to calculate the
    position of the thumb relative to the view.

    @property
  */
  trackLength: function () {
    var scrollerLength = this.get('scrollerLength');

    // Subtract the size of the top/left cap
    scrollerLength -= this.get('capLength') - this.get('capOverlap');

    // Subtract the size of the scroll buttons, or the end cap if they are
    // not shown.
    scrollerLength -= this.buttonLength - this.buttonOverlap;

    return scrollerLength;
  }.property('scrollerLength').cacheable(),

  /** @private
    Returns the height of the view if this is a vertical scroller or the width
    of the view if this is a horizontal scroller. This is used when scrolling
    up and down by page, as well as in various layout calculations.

    @type Number
  */
  scrollerLength: function () {
    switch (this.get('layoutDirection')) {
    case LAYOUT_VERTICAL:
      return this.get('frame').height;
    case LAYOUT_HORIZONTAL:
      return this.get('frame').width;
    }

    return 0;
  }.property('frame').cacheable(),

  /** @private
    The total length of the thumb. The size of the thumb is the
    length of the track times the content proportion.

    @property
  */
  thumbLength: function () {
    var value = this.get('value'),
        maximum = this.get('maximum'),
        minimum = this.get('minimum'),
        proportion = this.get('proportion'),
        length;

    // If the value is beyond the minimum or maximums, shrink our thumb length to represent the amount
    // of over scroll. Do this proportionally for the best effect!
    if (value < minimum) {
      proportion -= (minimum - value) / maximum;
    } else if (value > maximum) {
      proportion -= (value - maximum) / maximum;
    }

    length = Math.floor(this.get('trackLength') * proportion);
    length = isNaN(length) ? 0 : length;

    return Math.max(length, this.get('minimumThumbLength'));
  }.property('value', 'minimum', 'maximum', 'trackLength', 'proportion').cacheable(),

  /** @private
    The position of the thumb in the track.

    @type Number
    @isReadOnly
  */
  thumbPosition: function () {
    var displayValue = this.get('displayValue'),
        maximum = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), position;

    position = (displayValue / maximum) * (trackLength - thumbLength);
    position += capLength - capOverlap; // account for the top/left cap

    return Math.floor(isNaN(position) ? 0 : position);
  }.property('displayValue', 'maximum', 'trackLength', 'thumbLength').cacheable(),

  /** @private
    true if the maximum value exceeds the frame size of the scroller.  This
    will hide the thumb and buttons.

    @type Boolean
    @isReadOnly
  */
  controlsHidden: function () {
    return this.get('proportion') >= 1;
  }.property('proportion').cacheable(),

  // ..........................................................
  // FADE SUPPORT
  // Controls how the scroller fades in and out. Override these methods to implement
  // different fading.
  //

  /*
    Implement to support ScrollView's overlay fade procedure.

    @param {Number} duration
  */
  fadeIn: null,

  /*
    Implement to support ScrollView's overlay fade procedure.

    @param {Number} duration
  */
  fadeOut: null,

  // ..........................................................
  // MOUSE EVENTS
  //

  /** @private
    Returns the value for a position within the scroller's frame.
  */
  valueForPosition: function (pos) {
    var max = this.get('maximum'),
        trackLength = this.get('trackLength'),
        thumbLength = this.get('thumbLength'),
        capLength = this.get('capLength'),
        capOverlap = this.get('capOverlap'), value;

    value = pos - (capLength - capOverlap);
    value = value / (trackLength - thumbLength);
    value = value * max;
    return value;
  },

  /** @private
    Handles mouse down events and adjusts the value property depending where
    the user clicked.

    If the control is disabled, we ignore all mouse input.

    If the user clicks the thumb, we note the position of the mouse event but
    do not take further action until they begin to drag.

    If the user clicks the track, we adjust the value a page at a time, unless
    alt is pressed, in which case we scroll to that position.

    If the user clicks the buttons, we adjust the value by a fixed amount, unless
    alt is pressed, in which case we adjust by a page.

    If the user clicks and holds on either the track or buttons, those actions
    are repeated until they release the mouse button.

    @param evt {Event} the mousedown event
  */
  mouseDown: function (evt) {
    // Fast path, reject secondary clicks.
    if (evt.which !== 1) return false;

    if (!this.get('isEnabledInPane')) return false;

    // keep note of altIsDown for later.
    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;

    var target = evt.target,
        thumbPosition = this.get('thumbPosition'),
        clickLocation,
        scrollerLength = this.get('scrollerLength');

    // Determine the subcontrol that was clicked
    if (target.className.indexOf('thumb') >= 0) {
      // Convert the mouseDown coordinates to the view's coordinates
      clickLocation = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY });

      clickLocation.x -= thumbPosition;
      clickLocation.y -= thumbPosition;

      // Store the starting state so we know how much to adjust the
      // thumb when the user drags
      this._thumbDragging = true;
      this._thumbOffset = clickLocation;
      this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
      this._thumbPositionAtDragStart = this.get('thumbPosition');
      this._valueAtDragStart = this.get("value");
    } else if (target.className.indexOf('button-top') >= 0) {
      // User clicked the up/left button
      // Decrement the value by a fixed amount or page size
      this.decrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-top');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollUp');
      this._isScrollingUp = true;
    } else if (target.className.indexOf('button-bottom') >= 0) {
      // User clicked the down/right button
      // Increment the value by a fixed amount
      this.incrementProperty('value', (this._altIsDown ? scrollerLength : 30));
      this.makeButtonActive('.button-bottom');
      // start a timer that will continue to fire until mouseUp is called
      this.startMouseDownTimer('scrollDown');
      this._isScrollingDown = true;
    } else {
      // User clicked in the track
      var scrollToClick = this.get("shouldScrollToClick");
      if (evt.altKey) scrollToClick = !scrollToClick;

      var thumbLength = this.get('thumbLength'),
          frame = this.convertFrameFromView({ x: evt.pageX, y: evt.pageY }),
          mousePosition;

      switch (this.get('layoutDirection')) {
      case LAYOUT_VERTICAL:
        this._mouseDownLocation = mousePosition = frame.y;
        break;
      case LAYOUT_HORIZONTAL:
        this._mouseDownLocation = mousePosition = frame.x;
        break;
      }

      if (scrollToClick) {
        this.set('value', Math.min(this.get('maximum'), Math.max(this.get('minimum'), this.valueForPosition(mousePosition - (thumbLength / 2)))));

        // and start a normal mouse down
        thumbPosition = this.get('thumbPosition');

        this._thumbDragging = true;
        this._thumbOffset = { x: frame.x - thumbPosition, y: frame.y - thumbPosition };
        this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
        this._thumbPositionAtDragStart = thumbPosition;
        this._valueAtDragStart = this.get("value");
      } else {
        // Move the thumb up or down a page depending on whether the click
        // was above or below the thumb
        if (mousePosition < thumbPosition) {
          this.decrementProperty('value', scrollerLength);
          this.startMouseDownTimer('page');
        } else {
          this.incrementProperty('value', scrollerLength);
          this.startMouseDownTimer('page');
        }
      }

    }

    return true;
  },

  /** @private
    When the user releases the mouse button, remove any active
    state from the button controls, and cancel any outstanding
    timers.

    @param evt {Event} the mousedown event
  */
  mouseUp: function (evt) {
    var active = this._scs_buttonActive, ret = false, timer;

    // If we have an element that was set as active in mouseDown,
    // remove its active state
    if (active) {
      active.removeClass('active');
      ret = true;
    }

    // Stop firing repeating events after mouseup
    timer = this._mouseDownTimer;
    if (timer) {
      timer.invalidate();
      this._mouseDownTimer = null;
    }

    this._thumbDragging = false;
    this._isScrollingDown = false;
    this._isScrollingUp = false;

    return ret;
  },

  /** @private
    If the user began the drag on the thumb, we calculate the difference
    between the mouse position at click and where it is now.  We then
    offset the thumb by that amount, within the bounds of the track.

    If the user began scrolling up/down using the buttons, this will track
    what component they are currently over, changing the scroll direction.

    @param evt {Event} the mousedragged event
  */
  mouseDragged: function (evt) {
    if (!this.get('isEnabledInPane')) return false;

    var length, delta, thumbPosition,
        thumbPositionAtDragStart = this._thumbPositionAtDragStart,
        isScrollingUp = this._isScrollingUp,
        isScrollingDown = this._isScrollingDown,
        active = this._scs_buttonActive;

    // Only move the thumb if the user clicked on the thumb during mouseDown
    if (this._thumbDragging) {

      switch (this.get('layoutDirection')) {
      case LAYOUT_VERTICAL:
        delta = (evt.pageY - this._mouseDownLocation.y);
        break;
      case LAYOUT_HORIZONTAL:
        delta = (evt.pageX - this._mouseDownLocation.x);
        break;
      }

      // if we are in alt now, but were not before, update the old thumb position to the new one
      if (evt.altKey) {
        if (!this._altIsDown || (this._shiftIsDown !== evt.shiftKey)) {
          thumbPositionAtDragStart = this._thumbPositionAtDragStart = thumbPositionAtDragStart + delta;
          delta = 0;
          this._mouseDownLocation = { x: evt.pageX, y: evt.pageY };
          this._valueAtDragStart = this.get("value");
        }

        // because I feel like it. Probably almost no one will find this tiny, buried feature.
        // Too bad.
        if (evt.shiftKey) delta = -delta;

        this.set('value', Math.min(this.get('maximum'), Math.max(this.get('minimum'), Math.round(this._valueAtDragStart + delta * 2))));
      } else {
        thumbPosition = thumbPositionAtDragStart + delta;
        length = this.get('trackLength') - this.get('thumbLength');
        this.set('value', Math.min(this.get('maximum'), Math.max(this.get('minimum'), Math.round((thumbPosition / length) * this.get('maximum')))));
      }

    } else if (isScrollingUp || isScrollingDown) {
      var nowScrollingUp = false, nowScrollingDown = false;

      var topButtonRect = this.$('.button-top')[0].getBoundingClientRect();

      switch (this.get('layoutDirection')) {
      case LAYOUT_VERTICAL:
        if (evt.clientY < topButtonRect.bottom) nowScrollingUp = true;
        else nowScrollingDown = true;
        break;
      case LAYOUT_HORIZONTAL:
        if (evt.clientX < topButtonRect.right) nowScrollingUp = true;
        else nowScrollingDown = true;
        break;
      }

      if ((nowScrollingUp || nowScrollingDown) && nowScrollingUp !== isScrollingUp) {
        //
        // STOP OLD
        //

        // If we have an element that was set as active in mouseDown,
        // remove its active state
        if (active) {
          active.removeClass('active');
        }

        // Stop firing repeating events after mouseup
        this._mouseDownTimerAction = nowScrollingUp ? "scrollUp" : "scrollDown";

        if (nowScrollingUp) {
          this.makeButtonActive('.button-top');
        } else if (nowScrollingDown) {
          this.makeButtonActive('.button-bottom');
        }

        this._isScrollingUp = nowScrollingUp;
        this._isScrollingDown = nowScrollingDown;
      }
    }


    this._altIsDown = evt.altKey;
    this._shiftIsDown = evt.shiftKey;
    return true;
  },

  /** @private
    Starts a timer that fires after 300ms.  This is called when the user
    clicks a button or inside the track to move a page at a time. If they
    continue holding the mouse button down, we want to repeat that action
    after a small delay.  This timer will be invalidated in mouseUp.

    Specify "immediate" as true if it should not wait.
  */
  startMouseDownTimer: function (action, immediate) {
    this._mouseDownTimerAction = action;
    this._mouseDownTimer = SC.Timer.schedule({
      target: this,
      action: this.mouseDownTimerDidFire,
      interval: immediate ? 0 : 300
    });
  },

  /** @private
    Called by the mousedown timer.  This method determines the initial
    user action and repeats it until the timer is invalidated in mouseUp.
  */
  mouseDownTimerDidFire: function () {
    var scrollerLength = this.get('scrollerLength'),
        mouseLocation = device.get('mouseLocation'),
        thumbPosition = this.get('thumbPosition'),
        thumbLength = this.get('thumbLength'),
        timerInterval = 50;

    switch (this.get('layoutDirection')) {
    case LAYOUT_VERTICAL:
      mouseLocation = this.convertFrameFromView(mouseLocation).y;
      break;
    case LAYOUT_HORIZONTAL:
      mouseLocation = this.convertFrameFromView(mouseLocation).x;
      break;
    }

    switch (this._mouseDownTimerAction) {
    case 'scrollDown':
      this.incrementProperty('value', this._altIsDown ? scrollerLength : 30);
      break;
    case 'scrollUp':
      this.decrementProperty('value', this._altIsDown ? scrollerLength : 30);
      break;
    case 'page':
      timerInterval = 150;
      if (mouseLocation < thumbPosition) {
        this.decrementProperty('value', scrollerLength);
      } else if (mouseLocation > thumbPosition + thumbLength) {
        this.incrementProperty('value', scrollerLength);
      }
    }

    this._mouseDownTimer = Timer.schedule({
      target: this,
      action: this.mouseDownTimerDidFire,
      interval: timerInterval
    });
  },

  /** @private
    Given a selector, finds the corresponding DOM element and adds
    the 'active' class name.  Also stores the returned element so that
    the 'active' class name can be removed during mouseup.

    @param {String} the selector to find
  */
  makeButtonActive: function (selector) {
    this._scs_buttonActive = this.$(selector).addClass('active');
  }
});

/**
  A fading, transparent-backed scroll bar. Suitable for use as an overlaid scroller. (Note
  that to achieve the overlay effect, you must still set `verticalOverlay` and
  `horizontalOverlay` on your `ScrollView`.)

  @class
*/
export const OverlayScrollerView = ScrollerView.extend(
/** @scope OverlayScrollerView.prototype */{

  // ..........................................................
  // FADE SUPPORT
  // Controls how the scroller fades in and out. Override these methods to implement
  // different fading.
  //

  /*
    Supports ScrollView's overlay fade procedure.
  */
  fadeIn: function () {
    this.$().toggleClass('fade-in', true);
    this.$().toggleClass('fade-out', false);
  },

  /*
    Supports ScrollView's overlay fade procedure.
  */
  fadeOut: function () {
    this.$().toggleClass('fade-in', false);
    this.$().toggleClass('fade-out', true);
  },

  /**
    @type Array
    @default ['sc-touch-scroller-view', 'sc-overlay-scroller-view]
    @see View#classNames
  */
  classNames: ['sc-touch-scroller-view', 'sc-overlay-scroller-view'],

  /**
    @type Number
    @default 12
  */
  scrollbarThickness: 12,

  /**
    @type Number
    @default 3
  */
  capLength: 3,

  /**
    @type Number
    @default 0
  */
  capOverlap: 0,

  /**
    @type Number
    @default 3
  */
  buttonLength: 3,

  /**
    @type Number
    @default 0
  */
  buttonOverlap: 0,

  /**
    @type Boolean
    @default false
  */
  hasButtons: false,

  /** @private */
  adjustThumb: function (thumb, thumbPosition, thumbLength) {
    var transformAttribute = browser.experimentalCSSNameFor('transform'),
        thumbEl = thumb[0],
        thumbInner = this.$('.thumb-inner'),
        thumbInnerEl = thumbInner[0];

    // Don't touch the DOM if the position hasn't changed.
    if (this._thumbPosition !== thumbPosition) {
      // Consider that the parent view may be animating its final position, then we need to also animate
      // our final position.
      var parentView = this.get('parentView'),
        parentIsAnimating = parentView._sc_isAnimating;

      if (platform.supportsCSSTransitions) {
        var transitionStyle = browser.experimentalStyleNameFor('transition');

        if (parentIsAnimating) {
          var duration = parentView._sc_animationDuration,
            timing = parentView._sc_animationTiming.toString();

          // Will use translation transform to position thumb.
          if (platform.supportsCSSTransforms) {
            thumbEl.style[transitionStyle] = transformAttribute + ' ' + duration + 's ' + timing;

            if (this._thumbSize !== thumbLength) {
              thumbInnerEl.style[transitionStyle] = transformAttribute + ' ' + duration + 's ' + timing;
            }

          // Will use top/left style to position thumb.
          } else {
            switch (this.get('layoutDirection')) {
            case LAYOUT_VERTICAL:
              thumbEl.style[transitionStyle] = 'top ' + duration + 's ' + timing;

              if (this._thumbSize !== thumbLength) {
                thumbInnerEl.style[transitionStyle] = 'top ' + duration + 's ' + timing;
              }

              break;
            case LAYOUT_HORIZONTAL:
              thumbEl.style[transitionStyle] = 'left ' + duration + 's ' + timing;

              if (this._thumbSize !== thumbLength) {
                thumbInnerEl.style[transitionStyle] = 'left ' + duration + 's ' + timing;
              }

              break;
            }
          }

        // No duration, clear any previous transition.
        } else {
          thumbEl.style[transitionStyle] = '';
          thumbInnerEl.style[transitionStyle] = '';
        }
      }


      // Position the thumb.
      var transformStyle;
      switch (this.get('layoutDirection')) {
      case LAYOUT_VERTICAL:

        // Use translation transform to position thumb.
        if (platform.supportsCSSTransforms) {
          transformStyle = 'translateX(0px) translateY(' + thumbPosition + 'px)';

          // TODO: Is this a necessary check?
          if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

          thumbEl.style[transformAttribute] = transformStyle;
          // thumb.css(transformCSS, 'translate3d(0px,' + thumbPosition + 'px,0px)');

          if (this._thumbSize !== thumbLength) {
            transformStyle = 'translateX(0px) translateY(' + Math.round(thumbLength - 1044) + 'px)';

            // TODO: Is this a necessary check?
            if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

            // thumbInner.css(transformCSS, 'translate3d(0px,' + Math.round(thumbLength - 1044) + 'px,0px)');
            thumbInnerEl.style[transformAttribute] = transformStyle;
          }

        // Use top style to position thumb.
        } else {
          thumbEl.style.top = thumbPosition;

          if (this._thumbSize !== thumbLength) {
            thumbInnerEl.style.top = Math.round(thumbLength - 1044);
          }
        }

        break;

      case LAYOUT_HORIZONTAL:
        // Use translation transform to position thumb.
        if (platform.supportsCSSTransforms) {

          transformStyle = 'translateX(' + thumbPosition + 'px) translateY(0px)';

          // TODO: Is this a necessary check?
          if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

          thumbEl.style[transformAttribute] = transformStyle;
          // thumb.css(transformCSS, 'translate3d(0px,' + thumbPosition + 'px,0px)');

          if (this._thumbSize !== thumbLength) {
            transformStyle = 'translateX(' + Math.round(thumbLength - 1044) + 'px) translateY(0px)';

            // TODO: Is this a necessary check?
            if (platform.supportsCSS3DTransforms) { transformStyle += ' translateZ(0px)'; }

            // thumbInner.css(transformCSS, 'translate3d(0px,' + Math.round(thumbLength - 1044) + 'px,0px)');
            thumbInnerEl.style[transformAttribute] = transformStyle;
          }

        // Use left style to position thumb.
        } else {
          thumbEl.style.left = thumbPosition;

          if (this._thumbSize !== thumbLength) {
            thumbInnerEl.style.left = Math.round(thumbLength - 1044);
          }
        }

        break;
      }
    }

    // Cache these values to check for changes.
    this._thumbPosition = thumbPosition;
    this._thumbSize = thumbLength;
  },

  /** @private */
  render: function (context, firstTime) {
    var classNames = [],
      thumbPosition, thumbLength, thumbElement;

    // We set a class name depending on the layout direction so that we can
    // style them differently using CSS.
    switch (this.get('layoutDirection')) {
    case LAYOUT_VERTICAL:
      classNames.push('sc-vertical');
      break;
    case LAYOUT_HORIZONTAL:
      classNames.push('sc-horizontal');
      break;
    }

    // Whether to hide the thumb and buttons
    if (this.get('controlsHidden')) classNames.push('controls-hidden');

    // Change the class names of the DOM element all at once to improve
    // performance
    context.addClass(classNames);

    // Calculate the position and size of the thumb
    thumbLength = this.get('thumbLength');
    thumbPosition = this.get('thumbPosition');

    // If this is the first time, generate the actual HTML
    if (firstTime) {
      context.push('<div class="track"></div>' +
                    '<div class="cap"></div>');
      this.renderButtons(context, this.get('hasButtons'));
      this.renderThumb(context, thumbPosition, thumbLength);

    // The HTML has already been generated, so all we have to do is
    // reposition and resize the thumb
    } else {

      // If we aren't displaying controls don't bother
      if (this.get('controlsHidden')) return;

      thumbElement = this.$('.thumb');

      this.adjustThumb(thumbElement, thumbPosition, thumbLength);
    }
  },

  /** @private */
  renderThumb: function (context, thumbPosition, thumbLength) {
    var transformCSS = browser.experimentalCSSNameFor('transform'),
      thumbPositionStyle, thumbSizeStyle;

    switch (this.get('layoutDirection')) {
    case LAYOUT_VERTICAL:
      thumbPositionStyle = transformCSS + ': translate3d(0px,' + thumbPosition + 'px,0px)';
      // where is this magic number from?
      thumbSizeStyle = transformCSS + ': translateY(' + (thumbLength - 1044) + 'px)'.fmt();
      break;
    case LAYOUT_HORIZONTAL:
      thumbPositionStyle = transformCSS + ': translate3d(' + thumbPosition + 'px,0px,0px)';
      thumbSizeStyle = transformCSS + ': translateX(' + (thumbLength - 1044) + 'px)'.fmt();
      break;
    }

    context.push('<div class="thumb" style="%@;">'.fmt(thumbPositionStyle) +
                 '<div class="thumb-top"></div>' +
                 '<div class="thumb-clip">' +
                 '<div class="thumb-inner" style="%@;">'.fmt(thumbSizeStyle) +
                 '<div class="thumb-center"></div>' +
                 '<div class="thumb-bottom"></div></div></div></div>');

    // Cache these values to check for changes.
    this._thumbPosition = thumbPosition;
    this._thumbSize = thumbLength;
  }
});

