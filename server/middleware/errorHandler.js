/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔴 Error:', err.message);
  console.error(err.stack);

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'Duplicate entry. A record with this data already exists.',
          detail: err.detail,
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Foreign key constraint violation. Referenced record does not exist.',
          detail: err.detail,
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          success: false,
          message: `Required field missing: ${err.column}`,
        });
      case '22P02': // invalid_text_representation
        return res.status(400).json({
          success: false,
          message: 'Invalid input data type.',
        });
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Default
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };
