/*
A set of default settings used throughout the framework
*/

const settings = {

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
 * @returns {Boolean|Number|String}
 */
export function setSetting(name, value) {
  settings[name] = value;
  return value;
}