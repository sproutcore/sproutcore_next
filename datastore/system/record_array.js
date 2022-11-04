// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

// sc_require('models/record');
import { SC } from '../../core/core.js';
import { Record } from '../models/record.js';
import { Query } from './query.js';

/**
  @class

  A `RecordArray` is a managed list of records (instances of your `Record`
  model classes).

  Using RecordArrays
  ---

  Most often, RecordArrays contain the results of a `Query`. You will generally not
  create or modify record arrays yourselves, instead using the ones returned from calls
  to `Store#find` with either a record type or a query.

  The membership of these query-backed record arrays is managed by the store, which
  searches already-loaded records for local queries, and defers to your data source
  for remote ones (see `Query` documentation for more details). Since membership
  in these record arrays is managed by the store, you will not generally add, remove
  or rearrange them here (see `isEditable` below).

  Query-backed record arrays have a status property which reflects the store's progress
  in fulfilling the query. See notes on `status` below.

  (Note that instances of `Query` are dumb descriptor objects which do not have a
  status or results of their own. References to a query's status or results should be
  understood to refer to those of its record array.)

  Internal Notes
  ---

  This section is about `RecordArray` internals, and is only intended for those
  who need to extend this class to do something special.

  A `RecordArray` wraps an array of store keys, listed on its `storeKeys`
  property. If you request a record from the array, e.g. via `objectAt`,
  the `RecordArray` will convert the requested store key to a record
  suitable for public use.

  The list of store keys is usually managed by the store. If you are using
  your `RecordArray` with a query, you should manage the results via the
  store, and not try to directly manipulate the results via the array. If you
  are managing the array's store keys yourself, then any array-like operation
  will be translated into similar calls on the underlying `storeKeys` array.
  This underlying array can be a real array, or, if you wish to implement
  incremental loading, it may be a `SparseArray`.

  If the record array is created with an `Query` object (as is almost always the
  case), then the record array will also consult the query for various delegate
  operations such as determining if the record array should update automatically
  whenever records in the store changes. It will also ask the query to refresh the
  `storeKeys` list whenever records change in the store.

  @since SproutCore 1.0
*/

export const RecordArray = SC.Object.extend(SC.Enumerable, SC.Array,
  /** @scope RecordArray.prototype */ {

  //@if(debug)
  /* BEGIN DEBUG ONLY PROPERTIES AND METHODS */

  /* @private */
  toString: function toStr () {
    var statusString = this.statusString(),
      storeKeys = this.get('storeKeys'),
      query = this.get('query'),
      length = this.get('length');
    const sup = toStr.base.apply(this, arguments);
    return "%@({\n    query: %@,\n    storeKeys: [%@],\n    length: %@,\n    … }) %@".fmt(sup, query, storeKeys, length, statusString);
  },

  /** @private */
  statusString: function() {
    var ret = [], status = this.get('status');

    for (var prop in Record) {
      if (prop.match(/[A-Z_]$/) && Record[prop] === status) {
        ret.push(prop);
      }
    }

    return ret.join(" ");
  },

  /* END DEBUG ONLY PROPERTIES AND METHODS */
  //@endif

  /**
    The store that owns this record array.  All record arrays must have a
    store to function properly.

    NOTE: You **MUST** set this property on the `RecordArray` when creating
    it or else it will fail.

    @type Store
  */
  store: null,

  /**
    The `Query` object this record array is based upon.  All record arrays
    **MUST** have an associated query in order to function correctly.  You
    cannot change this property once it has been set.

    NOTE: You **MUST** set this property on the `RecordArray` when creating
    it or else it will fail.

    @type Query
  */
  query: null,

  /**
    The array of `storeKeys` as retrieved from the owner store.

    @type Array
  */
  storeKeys: null,

  /** @private The cache of previous store keys so that we can avoid unnecessary updates. */
  _prevStoreKeys: null,

  /**
    Reflects the store's current status in fulfilling the record array's query. Note
    that this status is not directly related to the status of the array's records:

    - The store returns local queries immediately, regardless of any first-time loading
      they may trigger. Because local queries are not performed until any of its
      contents is requested (lazy), the default status of the returned local query is
      `BUSY_REFRESH`, and will only be updated after the query has been performed.
      Note that by default, local queries are limited to 100ms processing time per run
      loop, so very complex queries may take several run loops to return to `READY` status.
      You can edit `RecordArray.QUERY_MATCHING_THRESHOLD` to change this duration.
    - The store fulfills remote queries by passing them to your data source's `fetch`
      method. While fetching, it sets your array's status to `BUSY_LOADING` or
      `BUSY_REFRESH`. Once your data source has finished fetching (successfully or
      otherwise), it will call the appropriate store methods (e.g. `dataSourceDidFetchQuery`
      or `dataSourceDidErrorQuery`), which will update the query's array's status.

    The intended behavior is that a record array only will become `READY` when all records
    have been loaded and the query itself has been fully performed.
    However, it may happen that a record array returned for a remote query
    will get a `READY` status before the query itself has been fully performed.
    A record array will not reflect the `DIRTY` status of any of its records.

    @type Number
  */
  status: SC.EMPTY,

  /**
    The current editable state of the query. If this record array is not backed by a
    query, it is assumed to be editable.

    @property
    @type Boolean
  */
  isEditable: function() {
    var query = this.get('query');
    return query ? query.get('isEditable') : true;
  }.property('query').cacheable(),

  // ..........................................................
  // ARRAY PRIMITIVES
  //

  /** @private
    Returned length is a pass-through to the `storeKeys` array.
		@property
  */
  length: function() {
    this.flush(); // cleanup pending changes
    var storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.get('length') : 0;
  }.property('storeKeys').cacheable(),

  /** @private
    A cache of materialized records. The first time an instance of Record is
    created for a store key at a given index, it will be saved to this array.

    Whenever the `storeKeys` property is reset, this cache is also reset.

    @type Array
  */
  _scra_records: null,

  /** @private
    Looks up the store key in the `storeKeys array and materializes a
    records.

    @param {Number} idx index of the object
    @param {Boolean} omitMaterializing
    @return {Record} materialized record
  */
  objectAt: function(idx, omitMaterializing) {

    this.flush(); // cleanup pending if needed

    var recs      = this._scra_records,
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'),
        storeKey, ret ;

    if (!storeKeys || !store) return undefined; // nothing to do
    if (recs && (ret=recs[idx])) return ret ; // cached

    // not in cache, materialize
    if (!recs) this._scra_records = recs = [] ; // create cache
    storeKey = storeKeys.objectAt(idx, omitMaterializing);

    if (storeKey) {
      // if record is not loaded already, then ask the data source to
      // retrieve it
      if (store.peekStatus(storeKey) === Record.EMPTY) {
        if (omitMaterializing) return undefined;
        store.retrieveRecord(null, null, storeKey);
      }
      recs[idx] = ret = store.materializeRecord(storeKey);
    }
    return ret ;
  },

  /** @private - optimized forEach loop. */
  forEach: function(callback, target) {
    this.flush();

    var recs      = this._scra_records,
        storeKeys = this.get('storeKeys'),
        store     = this.get('store'),
        len       = storeKeys ? storeKeys.get('length') : 0,
        idx, storeKey, rec;

    if (!storeKeys || !store) return this; // nothing to do
    if (!recs) recs = this._scra_records = [] ;
    if (!target) target = this;

    for(idx=0;idx<len;idx++) {
      rec = recs[idx];
      if (!rec) {
        rec = recs[idx] = store.materializeRecord(storeKeys.objectAt(idx));
      }
      callback.call(target, rec, idx, this);
    }

    return this;
  },

  /** @private
    Replaces a range of records starting at a given index with the replacement
    records provided. The objects to be inserted must be instances of Record
    and must have a store key assigned to them.

    Note that most RecordArrays are *not* editable via `replace()`, since they
    are generated by a rule-based Query. You can check the `isEditable` property
    before attempting to modify a record array.

    @param {Number} idx start index
    @param {Number} amt count of records to remove
    @param {RecordArray} recs the records that should replace the removed records

    @returns {RecordArray} receiver, after mutation has occurred
  */
  replace: function(idx, amt, recs) {

    this.flush(); // cleanup pending if needed

    var storeKeys = this.get('storeKeys'),
        len       = recs ? (recs.get ? recs.get('length') : recs.length) : 0,
        i, keys;

    if (!storeKeys) throw new Error("Unable to edit an RecordArray that does not have its storeKeys property set.");

    if (!this.get('isEditable')) RecordArray.NOT_EDITABLE.throw();

    // map to store keys
    keys = [] ;
    for(i=0;i<len;i++) keys[i] = recs.objectAt(i).get('storeKey');

    // pass along - if allowed, this should trigger the content observer
    storeKeys.replace(idx, amt, keys);
    return this;
  },

  /**
    Returns true if the passed record can be found in the record array.  This is
    provided for compatibility with Set.

    @param {Record} record
    @returns {Boolean}
  */
  contains: function(record) {
    return this.indexOf(record)>=0;
  },

  /** @private
    Returns the first index where the specified record is found.

    @param {Record} record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  indexOf: function(record, startAt) {
    if (!SC.kindOf(record, Record)) {
      //@if(debug)
      SC.Logger.warn("Developer Warning: Used RecordArray's `indexOf` on %@, which is not an Record. RecordArray only works with records.".fmt(record));
      SC.Logger.trace();
      //@endif
      return -1; // only takes records
    }

    this.flush();

    var storeKey  = record.get('storeKey'),
        storeKeys = this.get('storeKeys');

    return storeKeys ? storeKeys.indexOf(storeKey, startAt) : -1;
  },

  /** @private
    Returns the last index where the specified record is found.

    @param {Record} record
    @param {Number} startAt optional starting index
    @returns {Number} index
  */
  lastIndexOf: function(record, startAt) {
    if (!SC.kindOf(record, Record)) {
      //@if(debug)
      SC.Logger.warn("Developer Warning: Using RecordArray's `lastIndexOf` on %@, which is not an Record. RecordArray only works with records.".fmt(record));
      SC.Logger.trace();
      //@endif
      return -1; // only takes records
    }

    this.flush();

    var storeKey  = record.get('storeKey'),
        storeKeys = this.get('storeKeys');
    return storeKeys ? storeKeys.lastIndexOf(storeKey, startAt) : -1;
  },

  /**
    Adds the specified record to the record array if it is not already part
    of the array.  Provided for compatibility with `Set`.

    @param {Record} record
    @returns {RecordArray} receiver
  */
  add: function(record) {
    if (!SC.kindOf(record, Record)) return this ;
    if (this.indexOf(record)<0) this.pushObject(record);
    return this ;
  },

  /**
    Removes the specified record from the array if it is not already a part
    of the array.  Provided for compatibility with `Set`.

    @param {Record} record
    @returns {RecordArray} receiver
  */
  remove: function(record) {
    if (!SC.kindOf(record, Record)) return this ;
    this.removeObject(record);
    return this ;
  },

  // ..........................................................
  // HELPER METHODS
  //

  /**
    Extends the standard Enumerable implementation to return results based
    on a Query if you pass it in.

    @param {Query} query a Query object
		@param {Object} target the target object to use

    @returns {RecordArray}
  */
  find: function(original, query, target) {
    if (query && query.isQuery) {
      return this.get('store').find(query.queryWithScope(this));
    } else return original.apply(this, SC.$A(arguments).slice(1));
  }.enhance(),

  /**
    Call whenever you want to refresh the results of this query.  This will
    notify the data source, asking it to refresh the contents.

    @returns {RecordArray} receiver
  */
  refresh: function() {
    this.get('store').refreshQuery(this.get('query'));
    return this;
  },

  /**
    Will recompute the results of the attached `Query`. Useful if your query
    is based on computed properties that might have changed.

    This method is for local use only, operating only on records that have already
    been loaded into your store. If you wish to re-fetch a remote query via your
    data source, use `refresh()` instead.

    @returns {RecordArray} receiver
  */
  reload: function() {
    this.flush(true);
    return this;
  },

  /**
    Destroys the record array.  Releases any `storeKeys`, and deregisters with
    the owner store.

    @returns {RecordArray} receiver
  */
  destroy: function destroy () {
    if (!this.get('isDestroyed')) {
      this.get('store').recordArrayWillDestroy(this);
    }

    destroy.base.apply(this, arguments);
  },

  // ..........................................................
  // STORE CALLBACKS
  //

  // **NOTE**: `storeWillFetchQuery()`, `storeDidFetchQuery()`,
  // `storeDidCancelQuery()`, and `storeDidErrorQuery()` are tested implicitly
  // through the related methods in `Store`.  We're doing it this way
  // because eventually this particular implementation is likely to change;
  // moving some or all of this code directly into the store. -CAJ

  /** @private
    Called whenever the store initiates a refresh of the query.  Sets the
    status of the record array to the appropriate status.

    @param {Query} query
    @returns {RecordArray} receiver
  */
  storeWillFetchQuery: function(query) {
    var status = this.get('status'),
        K      = Record;
    if ((status === K.EMPTY) || (status === K.ERROR)) status = K.BUSY_LOADING;
    if (status & K.READY) status = K.BUSY_REFRESH;
    this.setIfChanged('status', status);
    return this ;
  },

  /** @private
    Called whenever the store has finished fetching a query.

    @param {Query} query
    @returns {RecordArray} receiver
  */
  storeDidFetchQuery: function(query) {
    // only set to ready clean if the query has been remote and the server fetched it
    if (query.get('isRemote')) this.setIfChanged('status', Record.READY_CLEAN);
    else this.flush();
    return this ;
  },

  /** @private
    Called whenever the store has cancelled a refresh.  Sets the
    status of the record array to the appropriate status.

    @param {Query} query
    @returns {RecordArray} receiver
  */
  storeDidCancelQuery: function(query) {
    var status = this.get('status'),
        K      = Record;
    if (status === K.BUSY_LOADING) status = K.EMPTY;
    else if (status === K.BUSY_REFRESH) status = K.READY_CLEAN;
    this.setIfChanged('status', status);
    return this ;
  },

  /** @private
    Called whenever the store encounters an error while fetching.  Sets the
    status of the record array to the appropriate status.

    @param {Query} query
    @returns {RecordArray} receiver
  */
  storeDidErrorQuery: function(query) {
    this.setIfChanged('status', Record.ERROR);
    return this ;
  },

  /** @private
    Called by the store whenever it changes the state of certain store keys. If
    the receiver cares about these changes, it will mark itself as dirty and add
    the changed store keys to the _scq_changedStoreKeys index set.

    The next time you try to access the record array, it will call `flush()` and
    add the changed keys to the underlying `storeKeys` array if the new records
    match the conditions of the record array's query.

    @param {Array} storeKeys the effected store keys
    @param {Set} recordTypes the record types for the storeKeys.
    @returns {RecordArray} receiver
  */
  storeDidChangeStoreKeys: function(storeKeys, recordTypes) {
    var query =  this.get('query');
    // fast path exits
    if (query.get('location') !== Query.LOCAL) return this;
    if (!query.containsRecordTypes(recordTypes)) return this;

    // ok - we're interested.  mark as dirty and save storeKeys.
    var changed = this._scq_changedStoreKeys;
    if (!changed) changed = this._scq_changedStoreKeys = SC.IndexSet.create();
    changed.addEach(storeKeys);

    this.set('needsFlush', true);
    if (this.get('storeKeys')) {
      this.flush();
    }

    return this;
  },

  /**
    Applies the query to any pending changed store keys, updating the record
    array contents as necessary.  This method is called automatically anytime
    you access the RecordArray to make sure it is up to date, but you can
    call it yourself as well if you need to force the record array to fully
    update immediately.

    Currently this method only has an effect if the query location is
    `Query.LOCAL`.  You can call this method on any `RecordArray` however,
    without an error.

    @param {Boolean} _flush to force it - use reload() to trigger it
    @returns {RecordArray} receiver
  */
  flush: function(_flush) {
    // Are we already inside a flush?  If so, then don't do it again, to avoid
    // never-ending recursive flush calls.  Instead, we'll simply mark
    // ourselves as needing a flush again when we're done.
    if (this._insideFlush) {
      this.set('needsFlush', true);
      return this;
    }

    if (!this.get('needsFlush') && !_flush) return this; // nothing to do
    this.set('needsFlush', false); // avoid running again.

    // fast exit
    var query = this.get('query'),
        store = this.get('store');
    if (!store || !query || query.get('location') !== Query.LOCAL) {
      return this;
    }

    this._insideFlush = true;

    // OK, actually generate some results
    var storeKeys = this.get('storeKeys'),
        changed   = this._scq_changedStoreKeys,
        didChange = false,
        K         = Record,
        storeKeysToPace = [],
        startDate = new Date(),
        rec, status, recordType, sourceKeys, scope, included, readyPacing;

    // if we have storeKeys already, just look at the changed keys
    var oldStoreKeys = storeKeys;
    if (storeKeys && !_flush) {

      if (changed) {
        changed.forEach(function(storeKey) {
          if(storeKeysToPace.length>0 || new Date()-startDate>RecordArray.QUERY_MATCHING_THRESHOLD) {
            storeKeysToPace.push(storeKey);
            return;
          }
          // get record - do not include EMPTY or DESTROYED records
          status = store.peekStatus(storeKey);
          if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
            rec = store.materializeRecord(storeKey);
            included = !!(rec && query.contains(rec));
          } else included = false ;

          // if storeKey should be in set but isn't -- add it.
          if (included) {
            if (storeKeys.indexOf(storeKey)<0) {
              if (!didChange) storeKeys = storeKeys.copy();
              storeKeys.pushObject(storeKey);
            }
          // if storeKey should NOT be in set but IS -- remove it
          } else {
            if (storeKeys.indexOf(storeKey)>=0) {
              if (!didChange) storeKeys = storeKeys.copy();
              storeKeys.removeObject(storeKey);
            } // if (storeKeys.indexOf)
          } // if (included)

        }, this);
        // make sure resort happens
        didChange = true ;

      } // if (changed)

    // if no storeKeys, then we have to go through all of the storeKeys
    // and decide if they belong or not.  ick.
    } else {

      // collect the base set of keys.  if query has a parent scope, use that
      if (scope = query.get('scope')) {
        sourceKeys = scope.flush().get('storeKeys');
      // otherwise, lookup all storeKeys for the named recordType...
      } else if (recordType = query.get('expandedRecordTypes')) {
        sourceKeys = SC.IndexSet.create();
        recordType.forEach(function(cur) {
          sourceKeys.addEach(store.storeKeysFor(cur));
        });
      }

      // loop through storeKeys to determine if it belongs in this query or
      // not.
      storeKeys = [];
      sourceKeys.forEach(function(storeKey) {
        if(storeKeysToPace.length>0 || new Date()-startDate>RecordArray.QUERY_MATCHING_THRESHOLD) {
          storeKeysToPace.push(storeKey);
          return;
        }

        status = store.peekStatus(storeKey);
        if (!(status & K.EMPTY) && !((status & K.DESTROYED) || (status === K.BUSY_DESTROYING))) {
          rec = store.materializeRecord(storeKey);
          if (rec && query.contains(rec)) storeKeys.push(storeKey);
        }
      });

      didChange = true ;
    }

    // if we reach our threshold of pacing we need to schedule the rest of the
    // storeKeys to also be updated. Set status to BUSY_REFRESH to indicate pacing.
    if (storeKeysToPace.length > 0) {
      this.set('status', Record.BUSY_REFRESH);
      this.invokeNext(function () {
        if (!this || this.get('isDestroyed')) return;
        this.set('needsFlush', true);
        this._scq_changedStoreKeys = SC.IndexSet.create().addEach(storeKeysToPace);
        this.flush();
      });
    }
    else {
      // either ready with pacing or no pacing needed, set status to ready after storekeys are set
      readyPacing = true;
    }

    // clear set of changed store keys
    if (changed) changed.clear();

    // Clear the flushing flag.
    // NOTE: Do this now, because any observers of storeKeys could trigger a call
    // to flush (ex. by calling get('length') on the RecordArray).
    this._insideFlush = false;

    // only resort and update if we did change
    if (didChange) {

      // storeKeys must be a new instance because orderStoreKeys() works on it
      if (storeKeys && (storeKeys===oldStoreKeys)) {
        storeKeys = storeKeys.copy();
      }

      storeKeys = Query.orderStoreKeys(storeKeys, query, store);
      if (SC.compare(oldStoreKeys, storeKeys) !== 0){
        this.set('storeKeys', SC.clone(storeKeys)); // replace content
      }
    }
    if (readyPacing) {
      this.set('status', Record.READY_CLEAN);
      // make sure that observers will be fired even if the status
      // was already READY_CLEAN
      if (didChange) this.notifyPropertyChange('status');
    }
    return this;
  },

  /**
    Set to `true` when the query is dirty and needs to update its storeKeys
    before returning any results.  `RecordArray`s always start dirty and become
    clean the first time you try to access their contents.

    @type Boolean
  */
  needsFlush: true,

  // ..........................................................
  // EMULATE ERROR API
  //

  /**
    Returns `true` whenever the status is `Record.ERROR`.  This will allow
    you to put the UI into an error state.

		@property
    @type Boolean
  */
  isError: function() {
    return !!(this.get('status') & Record.ERROR);
  }.property('status').cacheable(),

  /**
    Returns the receiver if the record array is in an error state.  Returns
    `null` otherwise.

		@property
    @type Record
  */
  errorValue: function() {
    return this.get('isError') ? val(this.get('errorObject')) : null ;
  }.property('isError').cacheable(),

  /**
    Returns the current error object only if the record array is in an error
    state. If no explicit error object has been set, returns
    `Record.GENERIC_ERROR.`

		@property
    @type Error
  */
  errorObject: function() {
    if (this.get('isError')) {
      var store = this.get('store');
      return store.readQueryError(this.get('query')) || Record.GENERIC_ERROR;
    } else return null ;
  }.property('isError').cacheable(),

  // ..........................................................
  // INTERNAL SUPPORT
  //

  propertyWillChange: function propertyWillChange (key) {
    if (key === 'storeKeys') {
      var storeKeys = this.get('storeKeys');
      var len = storeKeys ? storeKeys.get('length') : 0;

      this.arrayContentWillChange(0, len, 0);
    }

    return propertyWillChange.base.apply(this, arguments);
  },

  /** @private
    Invoked whenever the `storeKeys` array changes.  Observes changes.
  */
  _storeKeysDidChange: function() {
    var storeKeys = this.get('storeKeys');

    var prev = this._prevStoreKeys, oldLen, newLen;

    if (storeKeys === prev) { return; } // nothing to do

    if (prev) {
      prev.removeArrayObservers({
        target: this,
        willChange: this.arrayContentWillChange,
        didChange: this._storeKeysContentDidChange
      });

      oldLen = prev.get('length');
    } else {
      oldLen = 0;
    }

    this._prevStoreKeys = storeKeys;
    if (storeKeys) {
      storeKeys.addArrayObservers({
        target: this,
        willChange: this.arrayContentWillChange,
        didChange: this._storeKeysContentDidChange
      });

      newLen = storeKeys.get('length');
    } else {
      newLen = 0;
    }

    this._storeKeysContentDidChange(0, oldLen, newLen);

  }.observes('storeKeys'),

  /** @private
    If anyone adds an array observer on to the record array, make sure
    we flush so that the observers don't fire the first time length is
    calculated.
  */
  addArrayObservers: function() {
    this.flush();
    return SC.Array.addArrayObservers.apply(this, arguments);
  },

  /** @private
    Invoked whenever the content of the `storeKeys` array changes.  This will
    dump any cached record lookup and then notify that the enumerable content
    has changed.
  */
  _storeKeysContentDidChange: function(start, removedCount, addedCount) {
    if (this._scra_records) this._scra_records.length=0 ; // clear cache

    this.arrayContentDidChange(start, removedCount, addedCount);
  },

  /** @private */
  init: function init () {
    init.base.apply(this, arguments);
    this._storeKeysDidChange();
  }

});

RecordArray.mixin(/** @scope RecordArray.prototype */{

  /**
    Standard error throw when you try to modify a record that is not editable

    @type Error
  */
  NOT_EDITABLE: SC.$error("RecordArray is not editable"),

  /**
    Number of milliseconds to allow a query matching to run for. If this number
    is exceeded, the query matching will be paced so as to not lock up the
    browser (by essentially splitting the work with an invokeNext)

    @type Number
  */
  QUERY_MATCHING_THRESHOLD: 100
});
