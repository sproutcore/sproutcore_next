/*
A set of default settings used throughout the framework
*/

const settings = {
  debug: false
};

/**
 * Retrieve the current setting value for name
 *
 * @export
 * @param {String} name
 * @returns {Boolean|Number|String}
 */
export function getSetting(name) {
  return settings[name] || false; // if undefined, return false
}

/**
 * Set the setting by name to value
 *
 * @export
 * @param {String} name
 * @param {Boolean|Number|String} value
 * @param {Boolean} [overWrite] Optional: set to false to prevent overwrite
 * @returns {Boolean|Number|String}
 */
export function setSetting(name, value, overWrite = true) {
  settings[name] = value;
  return value;
}
