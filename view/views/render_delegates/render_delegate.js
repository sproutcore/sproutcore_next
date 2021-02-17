// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../../core/core.js';
import { HUGE_CONTROL_SIZE, JUMBO_CONTROL_SIZE, LARGE_CONTROL_SIZE, REGULAR_CONTROL_SIZE, SMALL_CONTROL_SIZE, TINY_CONTROL_SIZE } from '../../system/constants.js';

/**
  @class
  Base class for all render delegates.

  You should use RenderDelegate or a subclass of it as the base for all
  of your render delegates. RenderDelegate offers many helper methods
  and can be simpler to subclass between themes than `Object`.

  Creating & Subclassing
  ===
  You create render delegates just like you create Objects:

      MyTheme.someRenderDelegate = RenderDelegate.create({ ... });

  You can subclass a render delegate and use that:

      MyTheme.RenderDelegate = RenderDelegate.extend({ ... });
      MyTheme.someRenderDelegate = MyTheme.RenderDelegate.create({});

  And you can even subclass instances or RenderDelegate:

      MyTheme.someRenderDelegate = RenderDelegate.create({ ... });
      MyTheme.otherRenderDelegate = MyTheme.someRenderDelegate.create({ ... });

      // this allows you to subclass another theme's render delegate:
      MyTheme.buttonRenderDelegate = BaseTheme.buttonRenderDelegate.create({ ... });

  For render delegates, subclassing and instantiating are the same.

  falseTE: Even though `.extend` and `.create` technically do the same thing,
  convention dictates that you use `.extend` for RenderDelegates that
  will be used primarily as base classes, and `create` for RenderDelegates
  that you expect to be instances.

  Rendering and Updating
  ===
  Render delegates are most commonly used for two things: rendering and updating
  DOM representations of controls.

  Render delegates use their `render` and `update` methods to do this:

      render: function(dataSource, context) {
        // rendering tasks here
        // example:
        context.begin('div').addClass('title')
          .text(dataSource.get('title')
        .end();
      },

      update: function(dataSource, jquery) {
        // updating tasks here
        // example:
        jquery.find('.title').text(dataSource.get('title'));
      }

  Variables
  ===
  The data source provides your render delegate with all of the information
  needed to render. However, the render delegate's consumer--usually a view--
  may need to get information back.

  For example, `AutoResize` resizes controls to fit their text. You can use
  it to size a button to fit its title. But it can't just make the button
  have the same width as its title: it needs to be a little larger to make room
  for the padding to the left and right sides of the title.

  This padding will vary from theme to theme.

  You can specify properties on the render delegate like any other property:

      MyRenderDelegate = RenderDelegate.create({
        autoSizePadding: 10
        ...
      });

  But there are multiple sizes of buttons; shouldn't the padding change as
  well? You can add hashes for the various control sizes and override properties:

      RenderDelegate.create({
        autoSizePadding: 10,

        'sc-jumbo-size': {
          autoResizePadding: 20
        }

  For details, see the discussion on size helpers below.

  You can also calculate values for the data source. In this example, we calculate
  the autoSizePadding to equal half the data source's height:

      RenderDelegate.create({
        autoSizePaddingFor: function(dataSource) {
          if (dataSource.get('frame')) {
            return dataSource.get('frame').height / 2;
          }
        }


  When ButtonView tries to get `autoSizePadding`, the render delegate will look for
  `autoSizePaddingFor`. It will be called if it exists. Otherwise, the property will
  be looked up like normal.

  Note: To support multiple sizes, you must also render the class name; see size
  helper discussion below.

  Helpers
  ===
  RenderDelegate have "helper methods" to assist the rendering process.
  There are a few built-in helpers, and you can add your own.

  Sizing Helpers
  -------------------------
  As discussed previously, you can create hashes of properties for each size.
  However, to support sizing, you must render the size's class name.

  Use the `addSizeClassName` and `updateSizeClassName` methods:

      RenderDelegate.create({
        render: function(dataSource, context) {
          // if you want to include a class name for the control size
          // so you can style it via CSS, include this line:
          this.addSizeClassName(dataSource, context);

          ...
        },

        update: function(dataSource, jquery) {
          // and don't forget to use its companion in update as well:
          this.updateSizeClassName(dataSource, jquery);

          ...
        }
      });

  Controls that allow multiple sizes should also be able to automatically choose
  the correct size based on the `layout` property supplied by the user. To support
  this, you can add properties to your size hashes:

      'sc-regular-size': {
        // to match _only_ 24px-high buttons
        height: 24,

        // or, alternatively, to match ones from 22-26:
        minHeight: 20, maxHeight: 26,

        // you can do the same for width if you wanted
        width: 100
      }

  The correct size will be calculated automatically when `addSlizeClassName` is
  called. If the view explicitly supplies a control size, that size will be used;
  otherwise, it will be calculated automatically based on the properties in your
  size hash.

  Adding Custom Helpers
  ---------------------
  You can mix your own helpers into this base class by calling
  RenderDelegate.mixin; they will be available to all render delegates:

      RenderDelegate.mixin({
        myHelperMethod: function(dataSource) { ... }
      });


  You can then use the helpers from your render delegates:

      MyTheme.someRenderDelegate = RenderDelegate.create({
        className: 'some-thingy',
        render: function(dataSource, context) {
          this.myHelperMethod(dataSource);
        }
      });


  By convention, all render delegate methods should take a `dataSource` as
  their first argument. If they do any rendering or updating, their second
  argument should be the `RenderContext` or `jQuery` object to use.

  In addition, helpers like these are only meant for methods that should
  be made available to _all_ render delegates. If your method is specific
  to just one, add it directly; if it is specific to just a few in your
  own theme, consider just using mixins or subclassing RenderDelegate:

      // If you use it in a couple of render delegates, perhaps a mixin
      // would be best:
      MyTheme.MyRenderHelper = {
        helper: function(dataSource) {
          ...
        }
      };

      MyTheme.myRenderDelegate = RenderDelegate.create(MyTheme.MyRenderHelper, {
        render: function(dataSource, context) { ... }
      });


      // If you use it in all render delegates in your theme, perhaps it
      // would be better to create an entire subclass of
      // RenderDelegate:
      MyTheme.RenderDelegate = RenderDelegate.extend({
        helper: function(dataSource) {
          ...
        }
      });

      MyTheme.myRenderDelegate = MyTheme.RenderDelegate.create({
        render: function(dataSource, context) { ... }
      });

  Data Sources
  ===
  Render delegates get the content to be rendered from their data sources.

  A data source can be any object, so long as the object implements
  the following methods:

  - `get(propertyName)`: Returns a value for a given property.
  - `didChangeFor(context, propertyName)`: Returns true if any properties
    listed have changed since the last time `didChangeFor` was called with
    the same context.

  And the following properties (to be accessed through `.get`):

  - `theme`: The theme being used to render.
  - `renderState`: An empty hash for the render delegate to save state in.
    While render delegates are _usually_ completely stateless, there are
    cases where they may need to save some sort of state.
*/

const K = function () {};

export const RenderDelegate = /** @scope RenderDelegate.prototype */{

  // docs will look more natural if these are all considered instance
  // methods/properties.

  /**
    Creates a new render delegate based on this one. When you want to
    create a render delegate, you call this:

        MyTheme.myRenderDelegate = RenderDelegate.create({
          className: 'my-render-delegate',
          render: function(dataSource, context) {
            // your code here...
          }
        })
  */
  create: function() {
    var ret = SC.beget(this);

    var idx, len = arguments.length;
    for (idx = 0; idx < len; idx++) {
      ret.mixin(arguments[idx]);
    }

    return ret;
  },

  /**
    Adds extra capabilities to this render delegate.

    You can use this to add helpers to all render delegates:

        RenderDelegate.reopen({
          myHelperMethod: function(dataSource) { ... }
        });

  */
  reopen: function(mixin) {
    var i, v;
    for (i in mixin) {
      v = mixin[i];
      if (!mixin.hasOwnProperty(i)) {
        continue;
      }

      if (typeof v === 'function' && v !== this[i]) {
        v.base = this[i] || K;
      }

      if (v && v.isEnhancement && v !== this[i]) {
        v = SC._enhance(this[i] || SC.K, v);
      }

      this[i] = v;
    }
  },

  /**
    Returns the specified property from this render delegate.
    Implemented to match Object's API.
  */
  get: function(propertyName) { return this[propertyName]; },

  /**
    Gets or generates the named property for the specified
    dataSource. If a method `propertyName + 'For'` is found,
    it will be used to compute the value, `dataSource`
    being passed as an argument. Otherwise, it will simply
    be looked up on the render delegate.

    NOTE: this implementation is a reference implementation. It
    is overridden in the sizing code (helpers/sizing.js) to be
    size-sensitive.
  */
  // getPropertyFor: function(dataSource, propertyName) {
  //   if (this[propertyName + 'For']) {
  //     return this[propertyName + 'For'](dataSource, propertyName);
  //   }

  //   return this[propertyName];
  // },

  /**
    All render delegates should have a class name. Any time a render delegate is
    used, this name should be added as a class name (`View`s do this
    automatically).
  */
  className: undefined,

  /**
    Writes the DOM representation of this render delegate to the
    supplied `RenderContext`, using the supplied `dataSource`
    for any data needed.

    @method
    @param {DataSource} dataSource An object from which to get
    data. See documentation on data sources above.
    @param {RenderContext} context A context to render DOM into.
  */
  render: function(dataSource, context) {

  },

  /**
    Updates the DOM representation of this render delegate using
    the supplied `jQuery` instance and `dataSource`.

    @method
    @param {DataSource} dataSource An object from which to get
    data. See documentation on data sources above.
    @param {jQuery} jquery A jQuery instance containing the DOM
    element to update. This will be the DOM generated by `render()`.
  */
  update: function(dataSource, jQuery) {

  },

  /**
      A list of size names to look for when automatically determining
      control size. By default, this has all of the SproutCore control sizes.
    */
  sizes: [
    TINY_CONTROL_SIZE, SMALL_CONTROL_SIZE,
    REGULAR_CONTROL_SIZE, LARGE_CONTROL_SIZE,
    HUGE_CONTROL_SIZE, JUMBO_CONTROL_SIZE
  ],

  /**
    Determines the correct size for the given data source, and returns the
    hash, if any, representing it.
  
    The hashes to choose from are properties on the render delegate. You define
    them with the same name as you would use for styling. For example,
    SC.REGULAR_CONTROL_SIZE uses a property name 'sc-regular-size':
  
        SC.RenderDelegate.create({
          'sc-regular-size': {
            // my properties here
          }
  
    If no matching size is found, the hash (if any) for SC.REGULAR_CONTROL_SIZE
    will be returned.
  
    @param {DataSource} dataSource The data source in which to find `controlSize`
    or `frame` and to determine the size for.
  
    @returns {Hash undefined}
  */
  sizeFor: function(dataSource) {
    var controlSize = dataSource.get('controlSize'), size, idx, len;

    // if there is a control size set on the control
    // then we need to use it, and give an error if we
    // don't have it.
    if (controlSize) {
      if (!this[controlSize]) {
        // create a hash for the control size
        this[controlSize] = {};
      }

      size = this[controlSize];

      // make sure there's a name on the size for use as class name
      if (!size.name) {
        size.name = controlSize;
      }

      return size;
    }

    // try to determine control size for the supplied frame
    // TODO: cache this in dataSource.renderState
    var frame = dataSource.get('frame');
    if (!frame) {
      size = this['sc-regular-size'];

      // create the size hash if needed
      if (!size) { size = this['sc-regular-size'] = {}; }
      if (!size.name) { size.name = 'sc-regular-size'; }
      return size;
    }

    // loop to automatically find size
    for (idx = 0; idx < len; idx++) {
      key = sizes[idx];
      size = this[key];

      // when the size is not defined, skip it.
      if (!size) {
        continue;
      }

      if (
        // if no auto-size-selection params are supplied, then we cannot
        // automatically select a size...
        (
          size.width === undefined && size.height === undefined && 
          size.minHeight === undefined && size.minWidth === undefined &&
          size.maxHeight === undefined && size.maxWidth === undefined
        ) ||

        // otherwise, if any are defined and are non-equal
        (size.width !== undefined && frame.width !== size.width) ||
        (size.minWidth !== undefined && frame.width < size.minWidth) ||
        (size.maxWidth !== undefined && frame.width > size.maxWidth) ||

        (size.height !== undefined && frame.height !== size.height) ||
        (size.minHeight !== undefined && frame.height < size.minHeight) ||
        (size.maxHeight !== undefined && frame.height < size.maxHeight)
      ) {
        continue;
      }

      // the size needs a name to use as a class name. If one is not already
      // present, set it to the key.
      if (!size.name) {
        size.name = key;
      }

      return size;
    }

    // hardcoded to return regular size if defined
    size = this['sc-regular-size'];

    // create the size hash if needed
    if (!size) { size = this['sc-regular-size'] = {}; }
    if (!size.name) { size.name = 'sc-regular-size'; }


    return size;
  },

  /**
    Determines the proper size for the dataSource, and then renders the class
    name corresponding to that size.
  */
  addSizeClassName: function(dataSource, context) {
    var size = this.sizeFor(dataSource);
    if (size) {
      context.addClass(size.name);
    }
  },

  /**
    Determines the proper size for the dataSource, and then updates
    the DOM to include that size's class name.
  */
  updateSizeClassName: function(dataSource, jquery) {
    var size = this.sizeFor(dataSource);
    if (size) {
      jquery.addClass(size.name);
    }
  },

  /**
    Retrieves the given property for the specified data source. This property
    may be static, or may be computed specifically for this data source. This
    version fo `getPropertyFor` will check in your size hashes to see if any
    properties have been overridden.
    
    @param {DataSource} dataSource The data source to get the property
    for. Some properties may differ based on the data source; for instance,
    some may have different values depending on size.
    @param {String} propertyName The name of the property to retrieve.
  */
  getPropertyFor: function(dataSource, propertyName) {
    var size = this.sizeFor(dataSource);
    if (size) {
      if (size[propertyName + 'For']) {
        return size[propertyName + 'For'](dataSource, propertyName);
      } else if (size[propertyName] !== undefined) {
        return size[propertyName];
      }
    }

    if (this[propertyName + 'For']) {
      return this[propertyName + 'For'];
    }

    return this[propertyName];
  }
  
};

// create and extend are technically identical.
RenderDelegate.extend = RenderDelegate.create;

// and likewise, as this is both a class and an instance, mixin makes
// sense instead of reopen...
RenderDelegate.mixin = RenderDelegate.reopen;
