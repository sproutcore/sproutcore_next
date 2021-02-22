
import { SC } from '../../core/core.js';
import { Record } from './record.js';
import { RecordAttribute } from './record_attribute.js';

// ..........................................................
// STANDARD ATTRIBUTE TRANSFORMS
//

// Object, String, Number just pass through.

/** @private - generic converter for Boolean records */
RecordAttribute.registerTransform(Boolean, {
  /** @private - convert an arbitrary object value to a boolean */
  to: function(obj) {
    return SC.none(obj) ? null : !!obj;
  }
});

/** @private - generic converter for Numbers */
RecordAttribute.registerTransform(Number, {
  /** @private - convert an arbitrary object value to a Number */
  to: function(obj) {
    return SC.none(obj) ? null : Number(obj) ;
  }
});

/** @private - generic converter for Strings */
RecordAttribute.registerTransform(String, {
  /** @private -
    convert an arbitrary object value to a String
    allow null through as that will be checked separately
  */
  to: function(obj) {
    if (!(typeof obj === SC.T_STRING) && !SC.none(obj) && obj.toString) {
      obj = obj.toString();
    }
    return obj;
  }
});

/** @private - generic converter for Array */
RecordAttribute.registerTransform(Array, {
  /** @private - check if obj is an array
  */
  to: function(obj) {
    if (!SC.isArray(obj) && !SC.none(obj)) {
      obj = [];
    }
    return obj;
  },

  observesChildren: ['[]']
});

/** @private - generic converter for Object */
RecordAttribute.registerTransform(Object, {
  /** @private - check if obj is an object */
  to: function(obj) {
    if (!(typeof obj === 'object') && !SC.none(obj)) {
      obj = {};
    }
    return obj;
  }
});

/** @private - generic converter for Record-type records */
RecordAttribute.registerTransform(Record, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    var store = parentRecord.get('store');
    if (SC.none(id) || (id==="")) return null;
    else return store.find(recordType, id);
  },

  /** @private - convert a record instance to a record id */
  from: function(record) { return record ? record.get('id') : null; }
});

/** @private - generic converter for transforming computed record attributes */
RecordAttribute.registerTransform(SC.T_FUNCTION, {

  /** @private - convert a record id to a record instance */
  to: function(id, attr, recordType, parentRecord) {
    recordType = recordType.apply(parentRecord);
    var store = parentRecord.get('store');
    return store.find(recordType, id);
  },

  /** @private - convert a record instance to a record id */
  from: function(record) { return record.get('id'); }
});

/** @private - generic converter for Date records */
RecordAttribute.registerTransform(Date, {

  /** @private - convert a string to a Date */
  to: function(str, attr) {

    // If a null or undefined value is passed, don't
    // do any normalization.
    if (SC.none(str)) { return str; }

    var ret ;
    str = str.toString() || '';

    if (attr.get('useIsoDate')) {
      var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
             "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\\.([0-9]+))?)?" +
             "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?",
          d      = str.match(new RegExp(regexp)),
          offset = 0,
          date   = new Date(d[1], 0, 1),
          time ;

      if (d[3]) { date.setMonth(d[3] - 1); }
      if (d[5]) { date.setDate(d[5]); }
      if (d[7]) { date.setHours(d[7]); }
      if (d[8]) { date.setMinutes(d[8]); }
      if (d[10]) { date.setSeconds(d[10]); }
      if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
      if (d[14]) {
         offset = (Number(d[16]) * 60) + Number(d[17]);
         offset *= ((d[15] === '-') ? 1 : -1);
      }

      offset -= date.getTimezoneOffset();
      time = (Number(date) + (offset * 60 * 1000));

      ret = new Date();
      ret.setTime(Number(time));
    } else ret = new Date(Date.parse(str));
    return ret ;
  },

  _dates: {},

  /** @private - pad with leading zeroes */
  _zeropad: function(num) {
    return ((num<0) ? '-' : '') + ((num<10) ? '0' : '') + Math.abs(num);
  },

  /** @private - convert a date to a string */
  from: function(date) {

    if (SC.none(date)) { return null; }

    var ret = this._dates[date.getTime()];
    if (ret) return ret ;

    // figure timezone
    var zp = this._zeropad,
        tz = 0-date.getTimezoneOffset()/60;

    tz = (tz === 0) ? 'Z' : '%@:00'.fmt(zp(tz));

    this._dates[date.getTime()] = ret = "%@-%@-%@T%@:%@:%@%@".fmt(
      zp(date.getFullYear()),
      zp(date.getMonth()+1),
      zp(date.getDate()),
      zp(date.getHours()),
      zp(date.getMinutes()),
      zp(date.getSeconds()),
      tz) ;

    return ret ;
  }
});

if (SC.DateTime && !RecordAttribute.transforms[SC.guidFor(SC.DateTime)]) {

  /**
    Registers a transform to allow `DateTime` to be used as a record
    attribute, ie `Record.attr(DateTime);`
  */

  RecordAttribute.registerTransform(SC.DateTime, {

    /** @private
      Convert a String to a DateTime
    */
    to: function(str, attr) {
      if (SC.none(str) || SC.instanceOf(str, SC.DateTime)) return str;
      if(attr.get('useUnixTime')) {
        if(SC.typeOf(str) === SC.T_STRING) { str = parseInt(str); }
        if(isNaN(str) || SC.typeOf(str) !== SC.T_NUMBER) { str = 0; }
        return SC.DateTime.create({ milliseconds: str*1000, timezone: 0 });
      }
      if (SC.instanceOf(str, Date)) return SC.DateTime.create(str.getTime());
      var format = attr.get('format');
      return SC.DateTime.parse(str, format ? format : SC.DateTime.recordFormat);
    },

    /** @private
      Convert a DateTime to a String
    */
    from: function(dt, attr) {
      if (SC.none(dt)) return dt;
      if (attr.get('useUnixTime')) {
        return dt.get('milliseconds')/1000;
      }
      var format = attr.get('format');
      return dt.toFormattedString(format ? format : SC.DateTime.recordFormat);
    }
  });

}

/**
  Parses a coreset represented as an array.
 */
RecordAttribute.registerTransform(SC.Set, {
  to: function(value, attr, type, record, key) {
    return SC.Set.create(value);
  },

  from: function(value, attr, type, record, key) {
    return value.toArray();
  },

  observesChildren: ['[]']
});

