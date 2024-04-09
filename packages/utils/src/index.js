import SatelliteImagingRequestStatus from "./SatelliteImagingRequestStatus.js";
import SatelliteImageManager from "./SatelliteImageManager.js";

/**
 * Converts a promise into a callback-style function.
 *
 * @param {Promise} promise - The promise to convert.
 * @returns {Promise<Array>} A promise that resolves to an array with two elements:
 *                          the first element is an error (if any), and the second element is the data.
 */
export function asCallback(promise) {
  return promise.then(
    (data) => [null, data],
    (err) => [err]
  );
}

/**
 * Checks if the given value is a valid value in the provided enum.
 *
 * @param {string} value - The value to check.
 * @param {Object} enumObj - The enum object.
 * @returns {boolean} - Returns true if the value is in the enum, otherwise false.
 */
export function isValidEnumValue(value, enumObj) {
  return Object.values(enumObj).includes(value);
}

export { SatelliteImagingRequestStatus };
export { SatelliteImageManager };
