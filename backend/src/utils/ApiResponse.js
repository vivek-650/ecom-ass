/**
 * Consistent success envelope for every endpoint: { success, data, message }.
 * Keeps the frontend's response unwrapping (see frontend/src/api/client.js) generic.
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      data: this.data,
      message: this.message,
    });
  }
}
