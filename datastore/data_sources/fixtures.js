// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================
import { SC } from '../../core/core.js';
import { Query } from "../system/query.js";
import { Store } from '../system/store.js';
import { DataSource, MIXED_STATE } from "./data_source.js";
import { Record } from '../models/record.js';

// sc_require('data_sources/data_source');
// sc_require('models/record');

/** @class

  TODO: Describe Class

  @since SproutCore 1.0
*/
export const FixturesDataSource = DataSource.extend(
  /** @scope FixturesDataSource.prototype */ {

  /**
    If true then the data source will asynchronously respond to data requests
    from the server.  If you plan to replace the fixture data source with a
    data source that talks to a real remote server (using Ajax for example),
    you should leave this property set to true so that Fixtures source will
    more accurately simulate your remote data source.

    If you plan to replace this data source with something that works with
    local storage, for example, then you should set this property to false to
    accurately simulate the behavior of your actual data source.

    @type Boolean
  */
  simulateRemoteResponse: false,

  /**
    If you set simulateRemoteResponse to true, then the fixtures source will
    assume a response latency from your server equal to the msec specified
    here.  You should tune this to simulate latency based on the expected
    performance of your server network.  Here are some good guidelines:

     - 500: Simulates a basic server written in PHP, Ruby, or Python (not twisted) without a CDN in front for caching.
     - 250: (Default) simulates the average latency needed to go back to your origin server from anywhere in the world.  assumes your servers itself will respond to requests < 50 msec
     - 100: simulates the latency to a "nearby" server (i.e. same part of the world).  Suitable for simulating locally hosted servers or servers with multiple data centers around the world.
     - 50: simulates the latency to an edge cache node when using a CDN.  Life is really good if you can afford this kind of setup.

    @type Number
  */
  latency: 50,

  // ..........................................................
  // CANCELLING
  //

  /** @private */
  cancel: function(store, storeKeys) {
    return false;
  },


  // ..........................................................
  // FETCHING
  //

  /** @private */
  fetch: function(store, query) {

    // can only handle local queries out of the box
    if (query.get('location') !== Query.LOCAL) {
      throw('Fixture data source can only fetch local queries');
    }

    if (!query.get('recordType') && !query.get('recordTypes')) {
      throw('Fixture data source can only fetch queries with one or more record types');
    }

    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._fetch, this.get('latency'), store, query);

    } else this._fetch(store, query);
  },

  /** @private
    Actually performs the fetch.
  */
  _fetch: function(store, query) {

    // NOTE: Assumes recordType or recordTypes is defined.  checked in fetch()
    var recordType = query.get('recordType'),
        recordTypes = query.get('recordTypes') || [recordType];

    // load fixtures for each recordType
    recordTypes.forEach(function(recordType) {
      if (SC.typeOf(recordType) === SC.T_STRING) {
        recordType = SC.objectForPropertyPath(recordType);
      }

      if (recordType) this.loadFixturesFor(store, recordType);
    }, this);

    // notify that query has now loaded - puts it into a READY state
    store.dataSourceDidFetchQuery(query);
  },

  // ..........................................................
  // RETRIEVING
  //

  /** @private */
  retrieveRecords: function(store, storeKeys) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;

    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._retrieveRecords, latency, store, storeKeys);
    } else this._retrieveRecords(store, storeKeys);

    return ret ;
  },

  _retrieveRecords: function(store, storeKeys) {

    storeKeys.forEach(function(storeKey) {
      var ret        = [],
          recordType = Store.recordTypeFor(storeKey),
          id         = store.idFor(storeKey),
          hash       = this.fixtureForStoreKey(store, storeKey);
      ret.push(storeKey);
      store.dataSourceDidComplete(storeKey, hash, id);
    }, this);
  },

  // ..........................................................
  // UPDATE
  //

  /** @private */
  updateRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;

    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._updateRecords, latency, store, storeKeys);
    } else this._updateRecords(store, storeKeys);

    return ret ;
  },

  _updateRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var hash = store.readDataHash(storeKey);
      this.setFixtureForStoreKey(store, storeKey, hash);
      store.dataSourceDidComplete(storeKey);
    }, this);
  },


  // ..........................................................
  // CREATE RECORDS
  //

  /** @private */
  createRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency');

    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._createRecords, latency, store, storeKeys);
    } else this._createRecords(store, storeKeys);

    return true ;
  },

  _createRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          dataHash   = store.readDataHash(storeKey),
          fixtures   = this.fixturesFor(recordType);

      if (!id) id = this.generateIdFor(recordType, dataHash, store, storeKey);
      this._invalidateCachesFor(recordType, storeKey, id);
      fixtures[id] = dataHash;

      store.dataSourceDidComplete(storeKey, null, id);
    }, this);
  },

  // ..........................................................
  // DESTROY RECORDS
  //

  /** @private */
  destroyRecords: function(store, storeKeys, params) {
    // first let's see if the fixture data source can handle any of the
    // storeKeys
    var latency = this.get('latency'),
        ret     = this.hasFixturesFor(storeKeys) ;
    if (!ret) return ret ;

    if (this.get('simulateRemoteResponse')) {
      this.invokeLater(this._destroyRecords, latency, store, storeKeys);
    } else this._destroyRecords(store, storeKeys);

    return ret ;
  },


  _destroyRecords: function(store, storeKeys) {
    storeKeys.forEach(function(storeKey) {
      var id         = store.idFor(storeKey),
          recordType = store.recordTypeFor(storeKey),
          fixtures   = this.fixturesFor(recordType);

      this._invalidateCachesFor(recordType, storeKey, id);
      if (id) delete fixtures[id];
      store.dataSourceDidDestroy(storeKey);
    }, this);
  },

  // ..........................................................
  // INTERNAL METHODS/PRIMITIVES
  //

  /**
    Load fixtures for a given fetchKey into the store
    and push it to the ret array.

    @param {Store} store the store to load into
    @param {Record} recordType the record type to load
    @param {Array} ret is passed, array to add loaded storeKeys to.
    @returns {FixturesDataSource} receiver
  */
  loadFixturesFor: function(store, recordType, ret) {
    var hashes   = [],
        dataHashes, i, storeKey ;

    dataHashes = this.fixturesFor(recordType);

    for(i in dataHashes){
      storeKey = recordType.storeKeyFor(i);
      if (store.peekStatus(storeKey) === Record.EMPTY) {
        hashes.push(dataHashes[i]);
      }
      if (ret) ret.push(storeKey);
    }

    // only load records that were not already loaded to avoid infinite loops
    if (hashes && hashes.length>0) store.loadRecords(recordType, hashes);

    return this ;
  },


  /**
    Generates an id for the passed record type.  You can override this if
    needed.  The default generates a storekey and formats it as a string.

    @param {Class} recordType Subclass of Record
    @param {Object} dataHash the data hash for the record
    @param {Store} store the store
    @param {Number} storeKey store key for the item
    @returns {String}
  */
  generateIdFor: function(recordType, dataHash, store, storeKey) {
    return "@id%@".fmt(Store.generateStoreKey());
  },

  /**
    Based on the storeKey it returns the specified fixtures

    @param {Store} store the store
    @param {Number} storeKey the storeKey
    @returns {Object} data hash or null
  */
  fixtureForStoreKey: function(store, storeKey) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    return fixtures ? fixtures[id] : null;
  },

  /**
    Update the data hash fixture for the named store key.

    @param {Store} store the store
    @param {Number} storeKey the storeKey
    @param {Object} dataHash
    @returns {FixturesDataSource} receiver
  */
  setFixtureForStoreKey: function(store, storeKey, dataHash) {
    var id         = store.idFor(storeKey),
        recordType = store.recordTypeFor(storeKey),
        fixtures   = this.fixturesFor(recordType);
    this._invalidateCachesFor(recordType, storeKey, id);
    fixtures[id] = dataHash;
    return this ;
  },

  /**
    Get the fixtures for the passed record type and prepare them if needed.
    Return cached value when complete.

    @param {Record} recordType
    @returns {Object} data hashes
  */
  fixturesFor: function(recordType) {
    // get basic fixtures hash.
    if (!this._fixtures) this._fixtures = {};
    var fixtures = this._fixtures[SC.guidFor(recordType)];
    if (fixtures) return fixtures ;

    // need to load fixtures.
    var dataHashes = recordType ? recordType.FIXTURES : null,
        len        = dataHashes ? dataHashes.length : 0,
        primaryKey = recordType ? recordType.prototype.primaryKey : 'guid',
        idx, dataHash, id ;

    this._fixtures[SC.guidFor(recordType)] = fixtures = {} ;
    for(idx=0;idx<len;idx++) {
      dataHash = dataHashes[idx];
      id = dataHash[primaryKey];
      if (!id) id = this.generateIdFor(recordType, dataHash);
      fixtures[id] = dataHash;
    }
    return fixtures;
  },

  /**
    Returns true if fixtures for a given recordType have already been loaded

    @param {Record} recordType
    @returns {Boolean} storeKeys
  */
  fixturesLoadedFor: function(recordType) {
    if (!this._fixtures) return false;
    var ret = [], fixtures = this._fixtures[SC.guidFor(recordType)];
    return fixtures ? true: false;
  },

  /**
    Resets the fixtures to their original values.

    @returns {FixturesDataSource} receiver
  */
  reset: function(){
    this._fixtures = null;
    return this;
  },

  /**
    Returns true or MIXED_STATE if one or more of the storeKeys can be
    handled by the fixture data source.

    @param {Array} storeKeys the store keys
    @returns {Boolean} true if all handled, MIXED_STATE if some handled
  */
  hasFixturesFor: function(storeKeys) {
    var ret = false ;
    storeKeys.forEach(function(storeKey) {
      if (ret !== MIXED_STATE) {
        var recordType = Store.recordTypeFor(storeKey),
            fixtures   = recordType ? recordType.FIXTURES : null ;
        if (fixtures && fixtures.length && fixtures.length>0) {
          if (ret === false) ret = true ;
        } else if (ret === true) ret = MIXED_STATE ;
      }
    }, this);

    return ret ;
  },

  /** @private
    Invalidates any internal caches based on the recordType and optional
    other parameters.  Currently this only invalidates the storeKeyCache used
    for fetch, but it could invalidate others later as well.

    @param {Record} recordType the type of record modified
    @param {Number} storeKey optional store key
    @param {String} id optional record id
    @returns {FixturesDataSource} receiver
  */
  _invalidateCachesFor: function(recordType, storeKey, id) {
    var cache = this._storeKeyCache;
    if (cache) delete cache[SC.guidFor(recordType)];
    return this ;
  }

});


