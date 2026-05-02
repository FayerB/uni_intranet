class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }

  static badRequest(msg, errors)   { return new ApiError(400, msg, errors); }
  static unauthorized(msg = 'No autorizado') { return new ApiError(401, msg); }
  static forbidden(msg = 'Acceso denegado')  { return new ApiError(403, msg); }
  static notFound(msg = 'Recurso no encontrado') { return new ApiError(404, msg); }
  static conflict(msg)             { return new ApiError(409, msg); }
  static internal(msg = 'Error interno') { return new ApiError(500, msg); }
}

module.exports = { ApiError };
