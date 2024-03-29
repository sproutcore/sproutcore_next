// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

import { SC } from '../../core/core.js';
import { DataSource, MIXED_STATE } from "./data_source.js";

// sc_require('data_sources/data_source');

/** @class

  A cascading data source will actually forward requests onto an array of
  additional data sources, stopping when one of the data sources returns true,
  indicating that it handled the request.

  You can use a cascading data source to tie together multiple data sources,
  treating them as a single namespace.

  ## Configuring a Cascade Data Source

  You will usually define your cascading data source in your main method after
  all the classes you have are loaded.

      MyApp.dataSource = CascadeDataSource.create({
        dataSources: "prefs youtube photos".w(),

        prefs:   MyApp.PrefsDataSource.create({ root: "/prefs" }),
        youtube: YouTube.YouTubeDataSource.create({ apiKey: "123456" }),
        photos:  MyApp.PhotosDataSource.create({ root: "photos" })

      });

      MyApp.store.set('dataSource', MyApp.dataSource);

  Note that the order you define your dataSources property will determine the
  order in which requests will cascade from the store.

  Alternatively, you can use a more jQuery-like API for defining your data
  sources:

      MyApp.dataSource = CascadeDataSource.create()
        .from(MyApp.PrefsDataSource.create({ root: "/prefs" }))
        .from(YouTube.YouTubeDataSource.create({ apiKey: "123456" }))
        .from(MyApp.PhotosDataSource.create({ root: "photos" }));

      MyApp.store.set('dataSource', MyApp.dataSource);

  In this case, the order you call from() will determine the order the request
  will cascade.

  
  @since SproutCore 1.0
*/
export const CascadeDataSource = DataSource.extend(
  /** @scope CascadeDataSource.prototype */ {

  /**
    The data sources used by the cascade, in the order that they are to be
    followed.  Usually when you define the cascade, you will define this
    array.

    @type Array
  */
  dataSources: null,

  /**
    Add a data source to the list of sources to use when cascading.  Used to
    build the data source cascade effect.

    @param {DataSource} dataSource a data source instance to add.
    @returns {CascadeDataSource} receiver
  */
  from: function(dataSource) {
    var dataSources = this.get('dataSources');
    if (!dataSources) this.set('dataSources', dataSources = []);
    dataSources.push(dataSource);
    return this ;
  },

  // ..........................................................
  // STORE ENTRY POINTS
  //

  /** @private - just cascades */
  fetch: function(store, query) {
    var sources = this.get('dataSources'),
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;

    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.fetch ? source.fetch.apply(source, arguments) : false;
      ret = this._handleResponse(ret, cur);
    }

    return ret ;
  },


  /** @private - just cascades */
  retrieveRecords: function(store, storeKeys, ids) {
    var sources = this.get('dataSources'),
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;

    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.retrieveRecords.apply(source, arguments);
      ret = this._handleResponse(ret, cur);
    }

    return ret ;
  },

  /** @private - just cascades */
  commitRecords: function(store, createStoreKeys, updateStoreKeys, destroyStoreKeys, params) {
    var sources = this.get('dataSources'),
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;

    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.commitRecords.apply(source, arguments);
      ret = this._handleResponse(ret, cur);
    }

    return ret ;
  },

  /** @private - just cascades */
  cancel: function(store, storeKeys) {
    var sources = this.get('dataSources'),
        len     = sources ? sources.length : 0,
        ret     = false,
        cur, source, idx;

    for(idx=0; (ret !== true) && idx<len; idx++) {
      source = sources.objectAt(idx);
      cur = source.cancel.apply(source, arguments);
      ret = this._handleResponse(ret, cur);
    }

    return ret ;
  },

  // ..........................................................
  // INTERNAL SUPPORT
  //

  /** @private */
  init: function init () {
    init.base.apply(this, arguments);

    // if a dataSources array is defined, look for any strings and lookup
    // the same on the data source.  Replace.
    var sources = this.get('dataSources'),
        idx     = sources ? sources.get('length') : 0,
        source;
    while(--idx>=0) {
      source = sources[idx];
      if (SC.typeOf(source) === SC.T_STRING) sources[idx] = this.get(source);
    }

  },

  /** @private - Determine the proper return value. */
  _handleResponse: function(current, response) {
    if (response === true) return true ;
    else if (current === false) return (response === false) ? false : MIXED_STATE ;
    else return MIXED_STATE ;
  }

});
