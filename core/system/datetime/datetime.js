import { Comparable } from "../../mixins/comparable.js";
import { Copyable } from "../../mixins/copyable.js";
import { Freezable } from "../../mixins/freezable.js";
import { clone, none, typeOf } from "../base.js";
import { T_NUMBER } from "../constants.js";
import { $error } from "../error.js";
import { loadLangFiles } from "../locale.js";
import { Logger } from "../logger.js";
import { SCObject } from "../object.js";
import { readyMixin } from "../ready.js";
import { SCString } from "../string.js";
import { Scanner } from "./scanner.js";


/**
  Standard error thrown when trying to compare two dates in different
  timezones.

  @static
  @constant
  @type Error
*/
export const DATETIME_COMPAREDATE_TIMEZONE_ERROR = $error("Can't compare the dates of two DateTimes that don't have the same timezone.");

/**
  Standard ISO8601 date format

  @static
  @type String
  @default '%Y-%m-%dT%H:%M:%S%Z'
  @constant
*/
export const DATETIME_ISO8601 = '%Y-%m-%dT%H:%M:%S%Z';
/** @class

  A class representation of a date and time. It's basically a wrapper around
  the Date javascript object, KVO-friendly and with common date/time
  manipulation methods.

  This object differs from the standard JS Date object, however, in that it
  supports time zones other than UTC and that local to the machine on which
  it is running.  Any time zone can be specified when creating an
  `DateTime` object, e.g.

      // Creates a DateTime representing 5am in Washington, DC and 10am in London
      var d = DateTime.create({ hour: 5, timezone: 300 }); // -5 hours from UTC
      var e = DateTime.create({ hour: 10, timezone: 0 }); // same time, specified in UTC

  and it is true that `d.isEqual(e)`.

  The time zone specified upon creation is permanent, and any calls to
  `get()` on that instance will return values expressed in that time zone. So,

      d.get('hour') returns 5.
      e.get('hour') returns 10.

  but

      d.get('milliseconds') === e.get('milliseconds')

  is true, since they are technically the same position in time.

  You can also use DateTime as a record attribute on a data model.

      Record.attr(DateTime); // Default format is ISO8601. See `DateTime.recordFormat`
      Record.attr(DateTime, { format: '%d/%m/%Y' }); // Attribute stored as a string in '%d/%m/%Y' format
      Record.attr(DateTime, { useUnixTime: true }); // Attribute stored as a number in Unix time

  @author Martin Ottenwaelter
  @author Jonathan Lewis
  @author Josh Holt
  @since SproutCore 1.0
*/
export const DateTime = SCObject.extend(Freezable, Copyable,
  /** @scope DateTime.prototype */ {
  
    /**
      @private
  
      Internal representation of a date: the number of milliseconds
      since January, 1st 1970 00:00:00.0 UTC.
  
      @property
      @type {Number}
    */
    _ms: 0,
  
    /** @read-only
      The offset, in minutes, between UTC and the object's timezone.
      All calls to `get()` will use this time zone to translate date/time
      values into the zone specified here.
  
      @type Number
    */
    timezone: 0,
  
    /**
      A `DateTime` instance is frozen by default for better performance.
  
      @type Boolean
    */
    isFrozen: true,
  
    /**
      Returns a new `DateTime` object where one or more of the elements have been adjusted
      according to the `options` parameter. The possible options that can be adjusted are `timezone`,
      `year`, `month`, `day`, `hour`, `minute`, `second` and `millisecond`.
  
      This is particularly useful when we want to get to a certain date or time based on an existing
      date or time without having to know all the elements of the existing date.
  
      For example, say we needed a datetime for midnight on whatever day we are given. The easiest
      way to do this is to take the datetime we are given and adjust it. For example,
  
          var midnight = someDate.adjust({ hour: 24 }); // Midnight on whatever day `someDate` is.
  
      ### Adjusting Time
  
      The time options, `hour`, `minute`, `second`, `millisecond`, are reset cascadingly by default.
      So for example, if only the hour is passed, then the minute, second, and millisecond will be set
      to 0. Or for another example, if the hour and minute are passed, then second and millisecond
      would be set to 0. To disable this simply pass `false` as the second argument to `adjust`.
  
      ### Adjusting Timezone
  
      If a time zone is passed in the options hash, all dates and times are assumed to be local to it,
      and the returned `DateTime` instance has that time zone. If none is passed, it defaults to
      the value of `DateTime.timezone`.
  
      Note that passing only a time zone does not affect the actual milliseconds since Jan 1, 1970,
      only the time zone in which it is expressed when displayed.
  
      @param {Object} options the amount of date/time to advance the receiver
      @param {Boolean} [resetCascadingly] whether to reset the time elements cascadingly from hour down to millisecond. Default `true`.
      @returns {DateTime} copy of receiver
    */
    adjust: function(options, resetCascadingly) {
      var timezone;
  
      options = options ? clone(options) : {};
      timezone = (options.timezone !== undefined) ? options.timezone : (this.timezone !== undefined) ? this.timezone : 0;
  
      return this.constructor._adjust(options, this._ms, timezone, resetCascadingly)._createFromCurrentState();
    },
  
    /**
      Returns a new `DateTime` object where one or more of the elements have been advanced
      according to the `options` parameter. The possible options that can be advanced are `year`,
      `month`, `day`, `hour`, `minute`, `second` and `millisecond`.
  
      Note, you should not use floating point values as it might give unpredictable results.
  
      @param {Object} options the amount of date/time to advance the receiver
      @returns {DateTime} copy of the receiver
    */
    advance: function(options) {
      return this.constructor._advance(options, this._ms, this.timezone)._createFromCurrentState();
    },
  
    /**
      Generic getter.
  
      The properties you can get are:
  
        - `year`
        - `month` (January is 1, contrary to JavaScript Dates for which January is 0)
        - `day`
        - `dayOfWeek` (Sunday is 0)
        - `hour`
        - `minute`
        - `second`
        - `millisecond`
        - `milliseconds`, the number of milliseconds since
          January, 1st 1970 00:00:00.0 UTC
        - `elapsed`, the number of milliseconds until (-), or since (+), the date.
        - `isLeapYear`, a boolean value indicating whether the receiver's year
          is a leap year
        - `daysInMonth`, the number of days of the receiver's current month
        - `dayOfYear`, January 1st is 1, December 31th is 365 for a common year
        - `week` or `week1`, the week number of the current year, starting with
          the first Sunday as the first day of the first week (00..53)
        - `week0`, the week number of the current year, starting with
          the first Monday as the first day of the first week (00..53)
        - `lastMonday`, `lastTuesday`, etc., `nextMonday`,
          `nextTuesday`, etc., the date of the last or next weekday in
          comparison to the receiver.
  
      @param {String} key the property name to get
      @return the value asked for
    */
    unknownProperty: function(key) {
      return this.constructor._get(key, this._ms, this.timezone);
    },
  
    /**
      Formats the receiver according to the given format string. Should behave
      like the C strftime function.
  
      The format parameter can contain the following characters:
  
        - `%a` -- The abbreviated weekday name ("Sun")
        - `%A` -- The full weekday name ("Sunday")
        - `%b` -- The abbreviated month name ("Jan")
        - `%B` -- The full month name ("January")
        - `%c` -- The preferred local date and time representation
        - `%d` -- Day of the month (01..31)
        - `%D` -- Day of the month (0..31)
        - `%E` -- Elapsed time, according to localized text formatting strings. See below.
        - `%h` -- Hour of the day, 24-hour clock (0..23)
        - `%H` -- Hour of the day, 24-hour clock (00..23)
        - `%i` -- Hour of the day, 12-hour clock (1..12)
        - `%I` -- Hour of the day, 12-hour clock (01..12)
        - `%j` -- Day of the year (001..366)
        - `%m` -- Month of the year (01..12)
        - `%M` -- Minute of the hour (00..59)
        - `%o` -- The day's ordinal abbreviation ('st', 'nd', 'rd', etc.)
        - `%p` -- Meridian indicator ("AM" or "PM")
        - `%S` -- Second of the minute (00..60)
        - `%s` -- Milliseconds of the second (000..999)
        - `%U` -- Week number of the current year,
            starting with the first Sunday as the first
            day of the first week (00..53)
        - `%W` -- Week number of the current year,
            starting with the first Monday as the first
            day of the first week (00..53)
        - `%N` -- ISO-8601 numeric representation of the day of the week (1 for Monday through 7 for Sunday)
        - `%w` -- Day of the week (Sunday is 0, 0..6)
        - `%x` -- Preferred representation for the date alone, no time
        - `%X` -- Preferred representation for the time alone, no date
        - `%y` -- Year without a century (00..99)
        - `%Y` -- Year with century
        - `%Z` -- Time zone (ISO 8601 formatted)
        - `%%` -- Literal "%" character
  
      The Elapsed date format is a special, SproutCore specific formatting
      feature which will return an accurate-ish, human readable indication
      of elapsed time. For example, it might return "In 5 minutes", or "A year
      ago".
  
      For example,
  
          var date = DateTime.create();
  
          date.toFormattedString("%E"); // "Right now"
  
          date.advance({ minute: 4 });
          date.toFormattedString("%E"); // "In 4 minutes"
  
          date.advance({ day: -7 });
          date.toFormattedString("%E"); // "About a week ago"
  
      To customize the output for the %E formatter, override the date
      localization strings inside of in your app.  The English localization
      strings used are:
  
          '_DateTime.now' : 'Right now',
          '_DateTime.secondIn' : 'In a moment',
          '_DateTime.secondsIn' : 'In %e seconds',
          '_DateTime.minuteIn' : 'In a minute',
          '_DateTime.minutesIn' : 'In %e minutes',
          '_DateTime.hourIn' : 'An hour from now',
          '_DateTime.hoursIn' : 'In about %e hours',
          '_DateTime.dayIn' : 'Tomorrow at %i:%M %p',
          '_DateTime.daysIn' : '%A at %i:%M %p',
          '_DateTime.weekIn' : 'Next week',
          '_DateTime.weeksIn' : 'In %e weeks',
          '_DateTime.monthIn' : 'Next month',
          '_DateTime.monthsIn' : 'In %e months',
          '_DateTime.yearIn' : 'Next year',
          '_DateTime.yearsIn' : 'In %e years',
  
          '_DateTime.secondAgo' : 'A moment ago',
          '_DateTime.secondsAgo' : '%e seconds ago',
          '_DateTime.minuteAgo' : 'A minute ago',
          '_DateTime.minutesAgo' : '%e minutes ago',
          '_DateTime.hourAgo' : 'An hour ago',
          '_DateTime.hoursAgo' : 'About %e hours ago',
          '_DateTime.dayAgo' : 'Yesterday at %i:%M %p',
          '_DateTime.daysAgo' : '%A at %i:%M %p',
          '_DateTime.weekAgo' : 'About a week ago',
          '_DateTime.weeksAgo' : '%e weeks ago',
          '_DateTime.monthAgo' : 'About a month ago',
          '_DateTime.monthsAgo' : '%e months ago',
          '_DateTime.yearAgo' : 'Last year',
          '_DateTime.yearsAgo' : '%e years ago'
  
      Notice the special "%e" parameter in the localized strings.  This will be
      replaced with the number of intervals (seconds, minutes, weeks, etc) that
      are appropriate.
  
      @param {String} format the format string
      @return {String} the formatted string
    */
    toFormattedString: function(fmt) {
      return this.constructor._toFormattedString(fmt, this._ms, this.timezone);
    },
  
    /**
      Formats the receiver according ISO 8601 standard. It is equivalent to
      calling toFormattedString with the `'%Y-%m-%dT%H:%M:%S%Z'` format string.
  
      @return {String} the formatted string
    */
    toISO8601: function(){
      return this.constructor._toFormattedString(DATETIME_ISO8601, this._ms, this.timezone);
    },
  
     /**
       Returns the suffix of the date for use in english eg 21st 22nd 22rd
      speech.
  
      @return {String}
     */
    dayOrdinal: function(){
       return this.get('day').ordinal();
     }.property(),
  
    /**
      @private
  
      Creates a string representation of the receiver.
  
      (Debuggers often call the `toString` method. Because of the way
      `DateTime` is designed, calling `DateTime._toFormattedString` would
      have a nasty side effect. We shouldn't therefore call any of
      `DateTime`'s methods from `toString`)
  
      @returns {String}
    */
    toString: function() {
      return "UTC: " +
             new Date(this._ms).toUTCString() +
             ", timezone: " +
             this.timezone;
    },
  
    /**
      Returns `true` if the passed `DateTime` is equal to the receiver, ie: if their
      number of milliseconds since January, 1st 1970 00:00:00.0 UTC are equal.
      This is the preferred method for testing equality.
  
      @see DateTime#compare
      @param {DateTime} aDateTime the DateTime to compare to
      @returns {Boolean}
    */
    isEqual: function(aDateTime) {
      return this.constructor.compare(this, aDateTime) === 0;
    },
  
    /**
      Returns a copy of the receiver. Because of the way `DateTime` is designed,
      it just returns the receiver.
  
      @returns {DateTime}
    */
    copy: function() {
      return this;
    },
  
    /**
      Returns a copy of the receiver with the timezone set to the passed
      timezone. The returned value is equal to the receiver (ie `Compare`
      returns 0), it is just the timezone representation that changes.
  
      If you don't pass any argument, the target timezone is assumed to be 0,
      ie UTC.
  
      Note that this method does not change the underlying position in time,
      but only the time zone in which it is displayed. In other words, the underlying
      number of milliseconds since Jan 1, 1970 does not change.
  
      @return {DateTime}
    */
    toTimezone: function(timezone) {
      if (timezone === undefined) timezone = 0;
      return this.advance({ timezone: timezone - this.timezone });
    }
  
  });
  
  DateTime.mixin(Comparable,
  /** @scope DateTime */ {
  
    /**
      The default format (ISO 8601) in which DateTimes are stored in a record.
      Change this value if your backend sends and receives dates in another
      format.
  
      This value can also be customized on a per-attribute basis with the format
      property. For example:
  
          Record.attr(DateTime, { format: '%d/%m/%Y %H:%M:%S' })
  
      @type String
      @default DATETIME_ISO8601
    */
    recordFormat: DATETIME_ISO8601,
  
    /**
      @type Array
      @default ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    */
    dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  
    /**
      @private
  
      The English day names used for the 'lastMonday', 'nextTuesday', etc., getters.
  
      @type Array
    */
    _englishDayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  
    /**
      @type Array
      @default ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    */
    abbreviatedDayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  
    /**
      @type Array
      @default ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    */
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  
    /**
      @type Array
      @default ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    */
    abbreviatedMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  
    /**
      @type Array
      @default ['AM', 'PM']
    */
    AMPMNames:['AM', 'PM'],
  
    /**
      @private
  
      The unique internal `Date` object used to make computations. Better
      performance is obtained by having only one Date object for the whole
      application and manipulating it with `setTime()` and `getTime()`.
  
      Note that since this is used for internal calculations across many
      `DateTime` instances, it is not guaranteed to store the date/time that
      any one `DateTime` instance represents.  So it might be that
  
          this._date.getTime() !== this._ms
  
      Be sure to set it before using for internal calculations if necessary.
  
      @type Date
    */
    _date: new Date(),
  
    /**
      @private
  
      The offset, in minutes, between UTC and the currently manipulated
      `DateTime` instance.
  
      @type Number
    */
    _tz: 0,
  
    /**
      The offset, in minutes, between UTC and the local system time. This
      property is computed at loading time and should never be changed.
  
      @type Number
      @default new Date().getTimezoneOffset()
      @constant
    */
    timezone: new Date().getTimezoneOffset(),
  
    /**
      @private
  
      A cache of `DateTime` instances. If you attempt to create a `DateTime`
      instance that has already been created, then it will return the cached
      value.
  
      @type Object
    */
    _dt_cache: {},
  
    /**
      @private
  
      The index of the latest cached value. Used with `_DT_CACHE_MAX_LENGTH` to
      limit the size of the cache.
  
      @type Number
    */
    _dt_cache_index: -1,
  
    /**
      @private
  
      The maximum length of `_dt_cache`. If this limit is reached, then the cache
      is overwritten, starting with the oldest element.
  
      @type Number
    */
    _DT_CACHE_MAX_LENGTH: 1000,
  
    /**
      @private
  
      Both args are optional, but will only overwrite `_date` and `_tz` if
      defined. This method does not affect the DateTime instance's actual time,
      but simply initializes the one `_date` instance to a time relevant for a
      calculation. (`this._date` is just a resource optimization)
  
      This is mainly used as a way to store a recursion starting state during
      internal calculations.
  
      'milliseconds' is time since Jan 1, 1970.
      'timezone' is the current time zone we want to be working in internally.
  
      Returns a hash of the previous milliseconds and time zone in case they
      are wanted for later restoration.
    */
    _setCalcState: function(ms, timezone) {
      var previous = {
        milliseconds: this._date.getTime(),
        timezone: this._tz
      };
  
      if (ms !== undefined) this._date.setTime(ms);
      if (timezone !== undefined) this._tz = timezone;
  
      return previous;
    },
  
    /**
      @private
  
      By this time, any time zone setting on 'hash' will be ignored.
      'timezone' will be used, or the last this._tz.
    */
    _setCalcStateFromHash: function(hash, timezone) {
      var tz = (timezone !== undefined) ? timezone : this._tz; // use the last-known time zone if necessary
      var ms = this._toMilliseconds(hash, this._ms, tz); // convert the hash (local to specified time zone) to milliseconds (in UTC)
      return this._setCalcState(ms, tz); // now call the one we really wanted
    },
  
    /**
      @private
      @see DateTime#unknownProperty
    */
    _get: function(key, start, timezone) {
      var ms, doy, m, y, firstDayOfWeek, dayOfWeek, dayOfYear, prefix, suffix;
      var currentWeekday, targetWeekday;
      var d = this._date;
      var originalTime, v = null;
  
      // Set up an absolute date/time using the given milliseconds since Jan 1, 1970.
      // Only do it if we're given a time value, though, otherwise we want to use the
      // last one we had because this `_get()` method is recursive.
      //
      // Note that because these private time calc methods are recursive, and because all DateTime instances
      // share an internal this._date and `this._tz` state for doing calculations, methods
      // that modify `this._date` or `this._tz` should restore the last state before exiting
      // to avoid obscure calculation bugs.  So we save the original state here, and restore
      // it before returning at the end.
      originalTime = this._setCalcState(start, timezone); // save so we can restore it to how it was before we got here
  
      // Check this first because it is an absolute value -- no tweaks necessary when calling for milliseconds
      if (key === 'milliseconds') {
        v = d.getTime();
      }
      else if (key === 'timezone') {
        v = this._tz;
      }
  
      // 'nextWeekday' or 'lastWeekday'.
      // We want to do this calculation in local time, before shifting UTC below.
      if (v === null) {
        prefix = key.slice(0, 4);
        suffix = key.slice(4);
        if (prefix === 'last' || prefix === 'next') {
          currentWeekday = this._get('dayOfWeek', start, timezone);
          targetWeekday = this._englishDayNames.indexOf(suffix);
          if (targetWeekday >= 0) {
            var delta = targetWeekday - currentWeekday;
            if (prefix === 'last' && delta >= 0) delta -= 7;
            if (prefix === 'next' && delta <  0) delta += 7;
            this._advance({ day: delta }, start, timezone);
            v = this._createFromCurrentState();
          }
        }
      }
  
      if (v === null) {
        // need to adjust for alternate display time zone.
        // Before calculating, we need to get everything into a common time zone to
        // negate the effects of local machine time (so we can use all the 'getUTC...() methods on Date).
        if (timezone !== undefined) {
          this._setCalcState(d.getTime() - (timezone * 60000), 0); // make this instance's time zone the new UTC temporarily
        }
  
        // simple keys
        switch (key) {
          case 'year':
            v = d.getUTCFullYear(); //TODO: investigate why some libraries do getFullYear().toString() or getFullYear()+""
            break;
          case 'month':
            v = d.getUTCMonth()+1; // January is 0 in JavaScript
            break;
          case 'day':
            v = d.getUTCDate();
            break;
          case 'dayOfWeek':
            v = d.getUTCDay();
            break;
          case 'hour':
            v = d.getUTCHours();
            break;
          case 'minute':
            v = d.getUTCMinutes();
            break;
          case 'second':
            v = d.getUTCSeconds();
            break;
          case 'millisecond':
            v = d.getUTCMilliseconds();
            break;
          case 'elapsed':
            v = +new Date() - d.getTime() - (timezone * 60000);
            break;
        }
  
        // isLeapYear
        if ((v === null) && (key === 'isLeapYear')) {
          y = this._get('year');
          v = (y%4 === 0 && y%100 !== 0) || y%400 === 0;
        }
  
        // daysInMonth
        if ((v === null) && (key === 'daysInMonth')) {
          switch (this._get('month')) {
            case 4:
            case 6:
            case 9:
            case 11:
              v = 30;
              break;
            case 2:
              v = this._get('isLeapYear') ? 29 : 28;
              break;
            default:
              v = 31;
              break;
          }
        }
  
        // dayOfYear
        if ((v === null) && (key === 'dayOfYear')) {
          ms = d.getTime(); // save time
          doy = this._get('day');
          this._setCalcStateFromHash({ day: 1 });
          for (m = this._get('month') - 1; m > 0; m--) {
            this._setCalcStateFromHash({ month: m });
            doy += this._get('daysInMonth');
          }
          d.setTime(ms); // restore time
          v = doy;
        }
  
        // week, week0 or week1
        if ((v === null) && (key.slice(0, 4) === 'week')) {
          // firstDayOfWeek should be 0 (Sunday) or 1 (Monday)
          firstDayOfWeek = key.length === 4 ? 1 : parseInt(key.slice('4'), 10);
          dayOfWeek = this._get('dayOfWeek');
          dayOfYear = this._get('dayOfYear') - 1;
          if (firstDayOfWeek === 0) {
            v = parseInt((dayOfYear - dayOfWeek + 7) / 7, 10);
          }
          else {
            v = parseInt((dayOfYear - (dayOfWeek - 1 + 7) % 7 + 7) / 7, 10);
          }
        }
      }
  
      // restore the internal calculation state in case someone else was in the
      // middle of a calculation (we might be recursing).
      this._setCalcState(originalTime.milliseconds, originalTime.timezone);
  
      return v;
    },
  
    /**
      @private
  
      Sets the internal calculation state to something specified.
    */
    _adjust: function(options, start, timezone, resetCascadingly) {
      var ms = this._toMilliseconds(options, start, timezone, resetCascadingly);
      this._setCalcState(ms, timezone);
      return this; // for chaining
    },
  
    /**
      @private
      @see DateTime#advance
    */
    _advance: function(options, start, timezone) {
      var opts = options ? clone(options) : {};
      var tz;
  
      for (var key in opts) {
        opts[key] += this._get(key, start, timezone);
      }
  
      // The time zone can be advanced by a delta as well, so try to use the
      // new value if there is one.
      tz = (opts.timezone !== undefined) ? opts.timezone : timezone; // watch out for zero, which is acceptable as a time zone
  
      return this._adjust(opts, start, tz, false);
    },
  
    /*
      @private
  
      Converts a standard date/time options hash to an integer representing that position
      in time relative to Jan 1, 1970
    */
    _toMilliseconds: function(options, start, timezone, resetCascadingly) {
      var opts = options ? clone(options) : {};
      var d = this._date;
      var previousMilliseconds = d.getTime(); // rather than create a new Date object, we'll reuse the instance we have for calculations, then restore it
      var ms, tz;
  
      // Initialize our internal for-calculations Date object to our current date/time.
      // Note that this object was created in the local machine time zone, so when we set
      // its params later, it will be assuming these values to be in the same time zone as it is.
      // It's ok for start to be null, in which case we'll just keep whatever we had in 'd' before.
      if (!none(start)) {
        d.setTime(start); // using milliseconds here specifies an absolute location in time, regardless of time zone, so that's nice
      }
  
      // We have to get all time expressions, both in 'options' (assume to be in time zone 'timezone')
      // and in 'd', to the same time zone before we can any calculations correctly.  So because the Date object provides
      // a suite of UTC getters and setters, we'll temporarily redefine 'timezone' as our new
      // 'UTC', so we don't have to worry about local machine time.  We do this by subtracting
      // milliseconds for the time zone offset.  Then we'll do all our calculations, then convert
      // it back to real UTC.
  
      // (Zero time zone is considered a valid value.)
      tz = (timezone !== undefined) ? timezone : (this.timezone !== undefined) ? this.timezone : 0;
      d.setTime(d.getTime() - (tz * 60000)); // redefine 'UTC' to establish a new local absolute so we can use all the 'getUTC...()' Date methods
  
      // the time options (hour, minute, sec, millisecond)
      // reset cascadingly (see documentation)
      if (resetCascadingly === undefined || resetCascadingly === true) {
        if ( !none(opts.hour) && none(opts.minute)) {
          opts.minute = 0;
        }
        if (!(none(opts.hour) && none(opts.minute)) &&
            none(opts.second)) {
          opts.second = 0;
        }
        if (!(none(opts.hour) && none(opts.minute) && none(opts.second)) &&
            none(opts.millisecond)) {
          opts.millisecond = 0;
        }
      }
  
      // Get the current values for any not provided in the options hash.
      // Since everything is in 'UTC' now, use the UTC accessors.  We do this because,
      // according to javascript Date spec, you have to set year, month, and day together
      // if you're setting any one of them.  So we'll use the provided Date.UTC() method
      // to get milliseconds, and we need to get any missing values first...
      if (none(opts.year))        opts.year = d.getUTCFullYear();
      if (none(opts.month))       opts.month = d.getUTCMonth() + 1; // January is 0 in JavaScript
      if (none(opts.day))         opts.day = d.getUTCDate();
      if (none(opts.hour))        opts.hour = d.getUTCHours();
      if (none(opts.minute))      opts.minute = d.getUTCMinutes();
      if (none(opts.second))      opts.second = d.getUTCSeconds();
      if (none(opts.millisecond)) opts.millisecond = d.getUTCMilliseconds();
  
      // Ask the JS Date to calculate milliseconds for us (still in redefined UTC).  It
      // is best to set them all together because, for example, a day value means different things
      // to the JS Date object depending on which month or year it is.  It can now handle that stuff
      // internally as it's made to do.
      ms = Date.UTC(opts.year, opts.month - 1, opts.day, opts.hour, opts.minute, opts.second, opts.millisecond);
  
      // Now that we've done all our calculations in a common time zone, add back the offset
      // to move back to real UTC.
      d.setTime(ms + (tz * 60000));
      ms = d.getTime(); // now get the corrected milliseconds value
  
      // Restore what was there previously before leaving in case someone called this method
      // in the middle of another calculation.
      d.setTime(previousMilliseconds);
  
      return ms;
    },
  
    /**
      Returns a new `DateTime` object advanced according the the given parameters.
      The parameters can be:
  
       - none, to create a `DateTime` instance initialized to the current
         date and time in the local timezone,
       - a integer, the number of milliseconds since
         January, 1st 1970 00:00:00.0 UTC
       - a options hash that can contain any of the following properties: year,
         month, day, hour, minute, second, millisecond, timezone
  
      Note that if you attempt to create a `DateTime` instance that has already
      been created, then, for performance reasons, a cached value may be
      returned.
  
      The timezone option is the offset, in minutes, between UTC and local time.
      If you don't pass a timezone option, the date object is created in the
      local timezone. If you want to create a UTC+2 (CEST) date, for example,
      then you should pass a timezone of -120.
  
      @param options one of the three kind of parameters described above
      @returns {DateTime} the DateTime instance that corresponds to the
        passed parameters, possibly fetched from cache
    */
    create: function() {
      var arg = arguments.length === 0 ? {} : arguments[0];
      var timezone;
  
      // if simply milliseconds since Jan 1, 1970 are given, just use those
      if (typeOf(arg) === T_NUMBER) {
        arg = { milliseconds: arg };
      }
  
      // Default to local machine time zone if none is given
      timezone = (arg.timezone !== undefined) ? arg.timezone : this.timezone;
      if (timezone === undefined) timezone = 0;
  
      // Desired case: create with milliseconds if we have them.
      // If we don't, convert what we have to milliseconds and recurse.
      if (!none(arg.milliseconds)) {
  
        // quick implementation of a FIFO set for the cache
        var key = 'nu' + arg.milliseconds + timezone, cache = this._dt_cache;
        var ret = cache[key];
        if (!ret) {
          var previousKey, idx = this._dt_cache_index, C = this;
          ret = cache[key] = new C([{ _ms: arg.milliseconds, timezone: timezone }]);
          idx = this._dt_cache_index = (idx + 1) % this._DT_CACHE_MAX_LENGTH;
          previousKey = cache[idx];
          if (previousKey !== undefined && cache[previousKey]) delete cache[previousKey];
          cache[idx] = key;
        }
        return ret;
      }
      // otherwise, convert what we have to milliseconds and try again
      else {
        var now = new Date();
  
        return this.create({ // recursive call with new arguments
          milliseconds: this._toMilliseconds(arg, now.getTime(), timezone, arg.resetCascadingly),
          timezone: timezone
        });
      }
    },
  
    /**
      @private
  
      Calls the `create()` method with the current internal `_date` value.
  
      @return {DateTime} the DateTime instance returned by create()
    */
    _createFromCurrentState: function() {
      return this.create({
        milliseconds: this._date.getTime(),
        timezone: this._tz
      });
    },
  
    /**
      Returns a `DateTime` object created from a given string parsed with a given
      format. Returns `null` if the parsing fails.
  
      @see DateTime#toFormattedString for a description of the format parameter
      @param {String} str the string to parse
      @param {String} fmt the format to parse the string with
      @returns {DateTime} the DateTime corresponding to the string parameter
    */
    parse: function(str, fmt) {
      // Declared as an object not a literal since in some browsers the literal
      // retains state across function calls
      var re = new RegExp('(?:%([aAbBcdDhHiIjmMpsSUWwxXyYZ%])|(.))', "g");
      var d, parts, opts = {}, check = {}, scanner = Scanner.create({string: str});
  
      if (none(fmt)) fmt = DATETIME_ISO8601;
  
      try {
        while ((parts = re.exec(fmt)) !== null) {
          switch(parts[1]) {
            case 'a': check.dayOfWeek = scanner.scanArray(this.abbreviatedDayNames); break;
            case 'A': check.dayOfWeek = scanner.scanArray(this.dayNames); break;
            case 'b': opts.month = scanner.scanArray(this.abbreviatedMonthNames) + 1; break;
            case 'B': opts.month = scanner.scanArray(this.monthNames) + 1; break;
            case 'c': throw new Error("%c is not implemented");
            case 'd':
            case 'D': opts.day = scanner.scanInt(1, 2); break;
            case 'e': throw new Error("%e is not implemented");
            case 'E': throw new Error("%E is not implemented");
            case 'h':
            case 'H': opts.hour = scanner.scanInt(1, 2); break;
            case 'i':
            case 'I': opts.hour = scanner.scanInt(1, 2); break;
            case 'j': throw new Error("%j is not implemented");
            case 'm': opts.month = scanner.scanInt(1, 2); break;
            case 'M': opts.minute = scanner.scanInt(1, 2); break;
            case 'p': opts.meridian = scanner.scanArray(this.AMPMNames); break;
            case 'S': opts.second = scanner.scanInt(1, 2); break;
            case 's': opts.millisecond = scanner.scanInt(1, 3); break;
            case 'U': throw new Error("%U is not implemented");
            case 'W': throw new Error("%W is not implemented");
            case 'w': throw new Error("%w is not implemented");
            case 'x': throw new Error("%x is not implemented");
            case 'X': throw new Error("%X is not implemented");
            case 'y': opts.year = scanner.scanInt(2); opts.year += (opts.year > 70 ? 1900 : 2000); break;
            case 'Y': opts.year = scanner.scanInt(4); break;
            case 'Z':
              var modifier = scanner.scan(1);
              if (modifier === 'Z') {
                opts.timezone = 0;
              } else if (modifier === '+' || modifier === '-' ) {
                var h = scanner.scanInt(2);
                if (scanner.scan(1) !== ':') scanner.scan(-1);
                var m = scanner.scanInt(2);
                opts.timezone = (modifier === '+' ? -1 : 1) * (h*60 + m);
              }
              break;
            case '%': scanner.skipString('%'); break;
            default:  scanner.skipString(parts[0]); break;
          }
        }
      } catch (e) {
        Logger.error('DateTime.createFromString ' + e.toString());
        return null;
      }
  
      if (!none(opts.meridian) && !none(opts.hour)) {
        if ((opts.meridian === 1 && opts.hour !== 12) ||
            (opts.meridian === 0 && opts.hour === 12)) {
          opts.hour = (opts.hour + 12) % 24;
        }
        delete opts.meridian;
      }
  
      d = this.create(opts);
  
      if (!none(check.dayOfWeek) && d.get('dayOfWeek') !== check.dayOfWeek) {
        return null;
      }
  
      return d;
    },
  
    /**
      @private
  
      Converts the x parameter into a string padded with 0s so that the string’s
      length is at least equal to the len parameter.
  
      @param {Object} x the object to convert to a string
      @param {Number} the minimum length of the returned string
      @returns {String} the padded string
    */
    _pad: function(x, len) {
      var str = '' + x;
      if (len === undefined) len = 2;
      while (str.length < len) str = '0' + str;
      return str;
    },
  
    /**
      @private
      @see DateTime#_toFormattedString
    */
    __toFormattedString: function(part, start, timezone) {
      var hour, offset;
  
      // Note: all calls to _get() here should include only one
      // argument, since _get() is built for recursion and behaves differently
      // if arguments 2 and 3 are included.
      //
      // This method is simply a helper for this._toFormattedString() (one underscore);
      // this is only called from there, and _toFormattedString() has already
      // set up the appropriate internal date/time/timezone state for it.
  
      switch(part[1]) {
        case 'a': return this.abbreviatedDayNames[this._get('dayOfWeek')];
        case 'A': return this.dayNames[this._get('dayOfWeek')];
        case 'b': return this.abbreviatedMonthNames[this._get('month')-1];
        case 'B': return this.monthNames[this._get('month')-1];
        case 'c': return this._date.toString();
        case 'd': return this._pad(this._get('day'));
        case 'D': return this._get('day');
        case 'E': return this._toFormattedString(this.__getElapsedStringFormat(start, timezone), start, timezone);
        case 'h': return this._get('hour');
        case 'H': return this._pad(this._get('hour'));
        case 'i':
          hour = this._get('hour');
          return (hour === 12 || hour === 0) ? 12 : (hour + 12) % 12;
        case 'I':
          hour = this._get('hour');
          return this._pad((hour === 12 || hour === 0) ? 12 : (hour + 12) % 12);
        case 'j': return this._pad(this._get('dayOfYear'), 3);
        case 'm': return this._pad(this._get('month'));
        case 'M': return this._pad(this._get('minute'));
        case 'o': return this._get('day').ordinal();
        case 'p': return this._get('hour') > 11 ? this.AMPMNames[1] : this.AMPMNames[0];
        case 'S': return this._pad(this._get('second'));
        case 's': return this._pad(this._get('millisecond'), 3);
        case 'u': return this._pad(this._get('utc')); //utc
        case 'U': return this._pad(this._get('week0'));
        case 'W': return this._pad(this._get('week1'));
        case 'N': return this._get('dayOfWeek') || 7;
        case 'w': return this._get('dayOfWeek');
        case 'x': return this._date.toDateString();
        case 'X': return this._date.toTimeString();
        case 'y': return this._pad(this._get('year') % 100);
        case 'Y': return this._get('year');
        case 'Z':
          offset = -1 * timezone;
          return (offset >= 0 ? '+' : '-') +
                 this._pad(parseInt(Math.abs(offset)/60, 10)) +
                 ':' +
                 this._pad(Math.abs(offset)%60);
        case '%': return '%';
      }
    },
  
    /**
      @private
      @see DateTime#toFormattedString
    */
    _toFormattedString: function(format, start, timezone) {
      var that = this;
  
      // need to move into local time zone for these calculations
      this._setCalcState(start - (timezone * 60000), 0); // so simulate a shifted 'UTC' time
  
      return format.replace(/\%([aAbBcdeEDhHiIjmMNopsSUWwxXyYZ\%])/g, function() {
        var v = that.__toFormattedString.call(that, arguments, start, timezone);
        return v;
      });
    },
  
    /**
      This will tell you which of the two passed `DateTime` is greater by
      comparing their number of milliseconds since
      January, 1st 1970 00:00:00.0 UTC.
  
      @param {DateTime} a the first DateTime instance
      @param {DateTime} b the second DateTime instance
      @returns {Number} -1 if a < b,
                         +1 if a > b,
                         0 if a == b
    */
    compare: function(a, b) {
      if (none(a) || none(b)) throw new Error("You must pass two valid dates to compare()");
      var ma = a.get('milliseconds');
      var mb = b.get('milliseconds');
      return ma < mb ? -1 : ma === mb ? 0 : 1;
    },
  
    /**
      This will tell you which of the two passed DateTime is greater
      by only comparing the date parts of the passed objects. Only dates
      with the same timezone can be compared.
  
      @param {DateTime} a the first DateTime instance
      @param {DateTime} b the second DateTime instance
      @returns {Number} -1 if a < b,
                         +1 if a > b,
                         0 if a == b
      @throws {DATETIME_COMPAREDATE_TIMEZONE_ERROR} if the passed arguments
        don't have the same timezone
    */
    compareDate: function(a, b) {
      if (none(a) || none(b)) throw new Error("You must pass two valid dates to compareDate()");
      if (a.get('timezone') !== b.get('timezone')) DATETIME_COMPAREDATE_TIMEZONE_ERROR.throw();
      var ma = a.adjust({hour: 0}).get('milliseconds');
      var mb = b.adjust({hour: 0}).get('milliseconds');
      return ma < mb ? -1 : ma === mb ? 0 : 1;
    },
  
    /**
      Returns the interval of time between the two passed in DateTimes in units
      according to the format.
  
      You can display the difference in weeks (w), days (d), hours (h), minutes (M)
      or seconds (S).
  
      @param {DateTime} a the first DateTime instance
      @param {DateTime} b the second DateTime instance
      @param {String} format the interval to get the difference in
    */
    difference: function(a, b, format) {
      if (none(a) || none(b)) throw new Error("You must pass two valid dates to difference()");
      var ma = a.get('milliseconds'),
          mb = b.get('milliseconds'),
          diff = mb - ma,
          divider;
  
      switch(format) {
      case 'd':
      case 'D':
        divider = 864e5;  // day: 1000 * 60 * 60 * 24
        break;
      case 'h':
      case 'H':
        divider = 36e5; // hour: 1000 * 60 * 60
        break;
      case 'M':
        divider = 6e4; // minute: 1000 * 60
        break;
      case 'S':
        divider = 1e3;  // second: 1000
        break;
      case 's':
        divider = 1;
        break;
      case 'W':
        divider = 6048e5; // week: 1000 * 60 * 60 * 24 * 7
        break;
      default:
        throw new Error(format + " is not supported");
      }
  
      var ret = diff/divider;
  
      return Math.round(ret);
    },

        /**
      @private
  
      Called on `document.ready`.
  
      Because localizations may have been modified by an application developer,
      we need to wait for the ready event to actually evaluate the localizations.
    */
  _setup: function() {
    DateTime.dayNames = SCString.w(SCString.loc('_SC.DateTime.dayNames'));
    DateTime.abbreviatedDayNames = SCString.w(SCString.loc('_SC.DateTime.abbreviatedDayNames'));
    DateTime.monthNames = SCString.w(SCString.loc('_SC.DateTime.monthNames'));
    DateTime.abbreviatedMonthNames = SCString.w(SCString.loc('_SC.DateTime.abbreviatedMonthNames'));
    DateTime.AMPMNames = SCString.w(SCString.loc('_SC.DateTime.AMPMNames'));
  },
  
  /**
    @private
    
    Elapsed string formatting override, as it depends on localization.
    
    @see SC.DateTime#toFormattedString
   */
  __getElapsedStringFormat: function(start, timezone) {
    
    var elapsed = Math.floor((+new Date() - this._date.getTime() - (timezone * 60000)) / 1000);
    var future = !!(elapsed < 0) ? "In" : "Ago";
    var interval = 0;
    var intervalType = "now";
    
    if(Math.abs(elapsed) > 31536000) { // 60 * 60 * 24 * 365 - years
      interval = Math.floor(Math.abs(elapsed / 31536000));
      intervalType = 'year';
    } else if(Math.abs(elapsed) > 2678400) { // 60 * 60 * 24 * 31 - months
      interval = Math.floor(Math.abs(elapsed / 2678400));
      intervalType = 'month';
    } else if(Math.abs(elapsed) > 604800) { // 60 * 60 * 24 * 7 - weeks
      interval = Math.floor(Math.abs(elapsed / 604800));
      intervalType = 'week';
    } else if(Math.abs(elapsed) > 86400) { // 60 * 60 * 24 - day
      interval = Math.floor(Math.abs(elapsed / 86400));
      intervalType = 'day';
    } else if(Math.abs(elapsed) > 3600) { // 60 * 60 - hour
      interval = Math.floor(Math.abs(elapsed / 3600));
      intervalType = 'hour';
    } else if(Math.abs(elapsed) > 60) { // 60 - minute
      interval = Math.floor(Math.abs(elapsed / 60));
      intervalType = 'minute';
    } else if(Math.abs(elapsed) > 0) { // second
      interval = Math.abs(elapsed);
      intervalType = 'second';
    }
    
    var formatString = '_SC.DateTime.now';
    if(intervalType !== 'now') {
      formatString = "_SC.DateTime.%@%@%@".fmt(intervalType, interval > 1 ? "s" : "", future);
    }
    return formatString.loc().replace('%e', interval);
  },
  
  
  
});

// readyMixin.ready(() => Datetime._setup());
loadLangFiles(async (code, dirname) => {
  await import(`./${dirname}/strings.js`);
  DateTime._setup(); 
});
