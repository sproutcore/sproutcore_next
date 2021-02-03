// ==========================================================================
// Project:   SproutCore - JavaScript Application Framework
// Copyright: ©2006-2011 Strobe Inc. and contributors.
//            Portions ©2008-2011 Apple Inc. All rights reserved.
// License:   Licensed under MIT license (see license.js)
// ==========================================================================


/**
  The list of browsers that are automatically identified.

  @readonly
  @enum {string}
*/
export const BROWSER = {
  android: 'android',
  blackberry: 'blackberry',
  chrome: 'chrome',
  firefox: 'firefox',
  ie: 'ie',
  opera: 'opera',
  safari: 'safari',
  unknown: 'unknown'
};

/**
  The list of browser specific object prefixes, these are matched to the
  browser engine.

  @readonly
  @enum {string}
*/
export const CLASS_PREFIX = {
  gecko: 'Moz',
  opera: 'O',
  presto: 'O',
  trident: 'Ms', // Note the uppercase 'M'
  webkit: 'WebKit' // Note the uppercase 'K'
};

/**
  The list of browser specific CSS prefixes, these are matched to the
  browser engine.

  @readonly
  @enum {string}
*/
export const CSS_PREFIX = {
  gecko: '-moz-',
  opera: '-o-',
  presto: '-o-',
  trident: '-ms-',
  webkit: '-webkit-'
};

/**
  The list of devices that are automatically identified.

  @readonly
  @enum {string}
*/
export const DEVICE = {
  android: 'android',
  blackberry: 'blackberry',
  desktop: 'desktop',
  ipad: 'ipad',
  iphone: 'iphone',
  ipod: 'ipod',
  mobile: 'mobile'
};

/**
  The list of browser specific DOM prefixes, these are matched to the
  browser engine.

  @readonly
  @enum {string}
*/
export const DOM_PREFIX = {
  gecko: 'Moz',
  opera: 'O',
  presto: 'O',
  trident: 'ms',
  webkit: 'Webkit'
};

/**
  The list of browser engines that are automatically identified.

  @readonly
  @enum {string}
*/
export const ENGINE = {
  gecko: 'gecko',
  opera: 'opera',
  presto: 'presto',
  trident: 'trident',
  webkit: 'webkit'
};

/**
  The list of operating systems that are automatically identified.

  @readonly
  @enum {string}
*/
export const OS = {
  android: 'android',
  blackberry: 'blackberry',
  ios: 'ios',
  linux: 'linux',
  mac: 'mac',
  win: 'windows'
};


/**
  Detects browser properties based on the given userAgent and language.

  @private
*/
const detectBrowser = function (userAgent, language) {
  let browser = {},
      device,
      engineAndVersion,
      isIOSDevice,
      conExp = '(?:[\\/:\\::\\s:;])', // Match the connecting character
      numExp = '(\\S+[^\\s:;:\\)]|)', // Match the "number"
      nameAndVersion,
      os, osAndVersion,
      override;

  // Use the current values if none are provided.
  userAgent = (userAgent || navigator.userAgent).toLowerCase();
  language = language || navigator.language;

  // Calculations to determine the device.  See DEVICE.
  device =
    userAgent.match(new RegExp('(android|ipad|iphone|ipod|blackberry)')) ||
    userAgent.match(new RegExp('(mobile)')) ||
    ['', DEVICE.desktop];

  /**
    @name browser.device
    @type DEVICE|BROWSER.unknown
  */
  browser.device = device[1];


  // It simplifies further matching by recognizing this group of devices.
  isIOSDevice =
    browser.device === DEVICE.ipad ||
    browser.device === DEVICE.iphone ||
    browser.device === DEVICE.ipod;


  // Calculations to determine the name and version.  See BROWSER.

  nameAndVersion =
    // Match the specific names first, avoiding commonly spoofed browsers.
    userAgent.match(new RegExp('(opera|chrome|firefox|android|blackberry)' + conExp + numExp)) ||
    userAgent.match(new RegExp('(ie|safari)' + conExp + numExp)) ||
    userAgent.match(new RegExp('(trident)')) ||
    ['', BROWSER.unknown, '0'];

  // If the device is an iOS device, use BROWSER.safari for browser.name.
  if (isIOSDevice) { nameAndVersion[1] = BROWSER.safari; }

  // If a `Version` number is found, use that over the `Name` number
  override = userAgent.match(new RegExp('(version)' + conExp + numExp));
  if (override) { nameAndVersion[2] = override[2]; }
  // If there is no `Version` in Safari, don't use the Safari number since it is
  // the Webkit number.
  else if (nameAndVersion[1] === BROWSER.safari) { nameAndVersion[2] = '0'; }
  else if (nameAndVersion[1] === ENGINE.trident) {
    // Special handling for IE11 (no 'ie' component, only 'trident' + 'rv')
    nameAndVersion[1] = BROWSER.ie;
    this._ieVersion = nameAndVersion[2];
    nameAndVersion[2] = userAgent.match(new RegExp('(rv)' + conExp + numExp))[2];
  }

  /**
    @name browser.name
    @type BROWSER|BROWSER.unknown
  */
  browser.name = nameAndVersion[1];

  /**
    @name browser.version
    @type { String }
  */
  browser.version = nameAndVersion[2];


  // Calculations to determine the engine and version.  See ENGINE.
  engineAndVersion =
    // Match the specific engines first, avoiding commonly spoofed browsers.
    userAgent.match(new RegExp('(presto)' + conExp + numExp)) ||
    userAgent.match(new RegExp('(opera|trident|webkit|gecko)' + conExp + numExp)) ||
    ['', BROWSER.unknown, '0'];

  // If the browser is BROWSER.ie, use ENGINE.trident.
  override = browser.name === BROWSER.ie ? ENGINE.trident : false;
  if (override) { engineAndVersion[1] = override; }

  // If the engineVersion is unknown and the browser is BROWSER.ie, use
  // browser.version for browser.engineVersion.
  override = browser.name === BROWSER.ie && engineAndVersion[2] === '0';
  if (override) { engineAndVersion[2] = browser.version; }

  // If a `rv` number is found, use that over the engine number (except for IE11+ where 'rv' now indicates the browser version).
  override = userAgent.match(new RegExp('(rv)' + conExp + numExp));
  if (override && engineAndVersion[1] !== ENGINE.trident) { engineAndVersion[2] = override[2]; }


  /**
    @name browser.engine
    @type ENGINE|BROWSER.unknown
  */
  browser.engine = engineAndVersion[1];

  /**
    @name browser.engineVersion
    @type String
  */
  browser.engineVersion = engineAndVersion[2];

  /**
    The prefix of browser specific methods on this platform.

    @name browser.domPrefix
    @type String
  */
  browser.domPrefix = DOM_PREFIX[browser.engine];

  /**
    The prefix of browser specific properties on this platform.

    @name browser.classPrefix
    @type String
  */
  browser.classPrefix = CLASS_PREFIX[browser.engine];

  /**
    The prefix of browser specific CSS properties on this platform.

    @name browser.cssPrefix
    @type String
  */
  browser.cssPrefix = CSS_PREFIX[browser.engine];


  // If we don't know the name of the browser, use the name of the engine.
  if (browser.name === BROWSER.unknown) { browser.name = browser.engine; }

  // Calculations to determine the os and version.  See OS.
  osAndVersion =
    // Match the specific names first, avoiding commonly spoofed os's.
    userAgent.match(new RegExp('(blackberry)')) ||
    userAgent.match(new RegExp('(android|iphone(?: os)|windows(?: nt))' + conExp + numExp)) ||
    userAgent.match(new RegExp('(os|mac(?: os)(?: x))' + conExp + numExp)) ||
    userAgent.match(new RegExp('(linux)')) ||
    [null, BROWSER.unknown, '0'];

  // Normalize the os name.
  if (isIOSDevice) { os = OS.ios; }
  else if (osAndVersion[1] === 'mac os x' || osAndVersion[1] === 'mac os') { os = OS.mac; }
  else if (osAndVersion[1] === 'windows nt') { os = OS.win; }
  else { os = osAndVersion[1]; }

  // Normalize the os version.
  osAndVersion[2] = osAndVersion[2] ? osAndVersion[2].replace(/_/g, '.') : '0';


  /**
    @name browser.os
    @type OS|BROWSER.unknown
  */
  browser.os = os;

  /**
    @name browser.osVersion
    @type String
  */
  browser.osVersion = osAndVersion[2];

  /**
    @name browser.language
    @type String
  */
  browser.language = language.split('-', 1)[0];

  /**
    @name browser.countryCode
    @type String
  */
  browser.countryCode = language.split('-')[1] ? language.split('-')[1].toLowerCase() : undefined;

  /** @deprecated Version 1.7. Use browser.name.  See BROWSER for possible values.
    @name browser.current
    @type String
  */
  browser.current = browser.name;

  return browser;
};


/** @class

  This object contains information about the browser environment SproutCore is
  running in. This includes the following properties:

    - browser.device                  ex. DEVICE.ipad
    - browser.name                    ex. BROWSER.chrome
    - browser.version                 ex. '16.0.2.34'
    - browser.os                      ex. OS.mac
    - browser.osVersion               ex. '10.6'
    - browser.engine                  ex. ENGINE.webkit
    - browser.engineVersion           ex. '533.29'
    - browser.cssPrefix               ex. '-webkit-'
    - browser.classPrefix            ex. 'WebKit'
    - browser.domPrefix               ex. 'webkit'

  Note: User agent sniffing does not provide guaranteed results and spoofing may
  affect the accuracy.  Therefore, as a general rule, it is much better
  to rely on the browser's verified capabilities in platform. But if you must
  write browser specific code, understand that browser does an exceptional
  job at identifying the current browser.

  Based on the unit test samples, the most stable browser properties appear to
  be `engine` and `engineVersion`.

  @since Version 1.0
*/
export const detectedBrowser = detectBrowser();
