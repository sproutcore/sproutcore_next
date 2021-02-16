import { $error } from "../error.js";
import { SCObject } from "../object.js";

/**
  Standard error thrown by `Scanner` when it runs out of bounds

  @static
  @constant
  @type Error
*/
export const SCANNER_OUT_OF_BOUNDS_ERROR = $error("Out of bounds.");

/**
  Standard error thrown by `Scanner` when  you pass a value not an integer.

  @static
  @constant
  @type Error
*/
export const SCANNER_INT_ERROR = $error("Not an int.");

/**
  Standard error thrown by `SCanner` when it cannot find a string to skip.

  @static
  @constant
  @type Error
*/
export const SCANNER_SKIP_ERROR = $error("Did not find the string to skip.");

/**
  Standard error thrown by `Scanner` when it can any kind a string in the
  matching array.

  @static
  @constant
  @type Error
*/
export const SCANNER_SCAN_ARRAY_ERROR = $error("Did not find any string of the given array to scan.");


/** @class

  A Scanner reads a string and interprets the characters into numbers. You
  assign the scanner's string on initialization and the scanner progresses
  through the characters of that string from beginning to end as you request
  items.

  Scanners are used by `DateTime` to convert strings into `DateTime` objects.

  @since SproutCore 1.0
  @author Martin Ottenwaelter
*/
export const Scanner = SCObject.extend(
  /** @scope Scanner.prototype */ {
  
    /**
      The string to scan. You usually pass it to the create method:
  
          Scanner.create({string: 'May, 8th'});
  
      @type String
    */
    string: null,
  
    /**
      The current scan location. It is incremented by the scanner as the
      characters are processed.
      The default is 0: the beginning of the string.
  
      @type Number
    */
    scanLocation: 0,
  
    /**
      Reads some characters from the string, and increments the scan location
      accordingly.
  
      @param {Number} len The amount of characters to read
      @throws {SCANNER_OUT_OF_BOUNDS_ERROR} If asked to read too many characters
      @returns {String} The characters
    */
    scan: function(len) {
      if (this.scanLocation + len > this.length) SCANNER_OUT_OF_BOUNDS_ERROR.throw();
      var str = this.string.substr(this.scanLocation, len);
      this.scanLocation += len;
      return str;
    },
  
    /**
      Reads some characters from the string and interprets it as an integer.
  
      @param {Number} min_len The minimum amount of characters to read
      @param {Number} [max_len] The maximum amount of characters to read (defaults to the minimum)
      @throws {SCANNER_INT_ERROR} If asked to read non numeric characters
      @returns {Number} The scanned integer
    */
    scanInt: function(min_len, max_len) {
      if (max_len === undefined) max_len = min_len;
      var str = this.scan(max_len);
      var re = new RegExp("^\\d{" + min_len + "," + max_len + "}");
      var match = str.match(re);
      if (!match) SCANNER_INT_ERROR.throw();
      if (match[0].length < max_len) {
        this.scanLocation += match[0].length - max_len;
      }
      return parseInt(match[0], 10);
    },
  
    /**
      Attempts to skip a given string.
  
      @param {String} str The string to skip
      @throws {SCANNER_SKIP_ERROR} If the given string could not be scanned
      @returns {Boolean} true if the given string was successfully scanned, false otherwise
    */
    skipString: function(str) {
      if (this.scan(str.length) !== str) SCANNER_SKIP_ERROR.throw();
      return true;
    },
  
    /**
      Attempts to scan any string in a given array.
  
      @param {Array} ary the array of strings to scan
      @throws {SCANNER_SCAN_ARRAY_ERROR} If no string of the given array is found
      @returns {Number} The index of the scanned string of the given array
    */
    scanArray: function(ary) {
      for (var i = 0, len = ary.length; i < len; i++) {
        if (this.scan(ary[i].length) === ary[i]) {
          return i;
        }
        this.scanLocation -= ary[i].length;
      }
      SCANNER_SCAN_ARRAY_ERROR.throw();
    }
  
  });
  
  