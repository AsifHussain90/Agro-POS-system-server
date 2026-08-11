//the purpose of this file is to handle errors in a consistent way across the application.
//  It provides a function that can be used to send error responses to the client in a standardized format.

class ApiError extends Error {
  constructor(
    statusCode,
    message = 'Something went wrong',
    errors = [],
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // Always null for error responses
    this.message = message;
    this.success = false; // Helps frontend quickly check status
    this.errors = errors; // For validation arrays (e.g., express-validator)

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
