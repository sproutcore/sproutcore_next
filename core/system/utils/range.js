// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================

  /** A zero length range at zero. */
export const ZERO_RANGE = { start: 0, length: 0 };

export const RANGE_NOT_FOUND = { start: 0, length: -1 };

  /** Returns true if the passed index is in the specified range */
export const valueInRange = function (value, range) {
  return (value >= 0) && (value >= range.start) && (value < (range.start + range.length));
};

  /** Returns first value of the range. */
export const minRange = function (range) { return range.start; };

  /** Returns the first value outside of the range. */
export const maxRange = function (range) { return (range.length < 0) ? -1 : (range.start + range.length); };

  /** Returns the union of two ranges.  If one range is null, the other
   range will be returned.  */
export const unionRanges = function (r1, r2) {
  if ((r1 == null) || (r1.length < 0)) return r2 ;
  if ((r2 == null) || (r2.length < 0)) return r1 ;

  var min = Math.min(r1.start, r2.start),
      max = Math.max(maxRange(r1), maxRange(r2)) ;
  return { start: min, length: max - min } ;
};

  /** Returns the intersection of the two ranges or SC.RANGE_NOT_FOUND */
export const intersectRanges = function (r1, r2) {
  if ((r1 == null) || (r2 == null)) return RANGE_NOT_FOUND ;
  if ((r1.length < 0) || (r2.length < 0)) return RANGE_NOT_FOUND;
  var min = Math.max(minRange(r1), minRange(r2)),
      max = Math.min(maxRange(r1), maxRange(r2)) ;
  if (max < min) return RANGE_NOT_FOUND ;
  return { start: min, length: max-min };
};

  /** Returns the difference of the two ranges or SC.RANGE_NOT_FOUND */
export const subtractRanges = function (r1, r2) {
  if ((r1 == null) || (r2 == null)) return RANGE_NOT_FOUND ;
  if ((r1.length < 0) || (r2.length < 0)) return RANGE_NOT_FOUND;
  var max = Math.max(minRange(r1), minRange(r2)),
      min = Math.min(maxRange(r1), maxRange(r2)) ;
  if (max < min) return RANGE_NOT_FOUND ;
  return { start: min, length: max-min };
};

/** Returns a clone of the range. */
export const cloneRange = function (r) {
  return { start: r.start, length: r.length };
};

/** Returns true if the two passed ranges are equal.  A null value is
  treated like RANGE_NOT_FOUND.
*/
export const rangesEqual = function(r1, r2) {
  if (r1===r2) return true ;
  if (r1 == null) return r2.length < 0 ;
  if (r2 == null) return r1.length < 0 ;
  return (r1.start == r2.start) && (r1.length == r2.length) ;
};

