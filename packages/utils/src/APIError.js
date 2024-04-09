/**
 * Represents an API error.
 * @class APIError
 * @extends Error
 */
class APIError extends Error {
  /**
   * Creates a new instance of the APIError class.
   * @param {string} message - The error message.
   * @param {number} status - The HTTP status code associated with the error.
   * @param {string} userMessage - The user-friendly error message.
   */
  constructor(message, status, userMessage) {
    super(message);
    this.status = status;
    this.userMessage = userMessage;
  }
}
export default APIError;
