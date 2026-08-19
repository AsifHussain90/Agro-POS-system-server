//this function is used to send the response in a standard format for all the API responses.
// It takes in the response object, message, data and status code as parameters and returns
//  a JSON response with the success status, message, data and status code.
class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
