import { validationResult } from 'express-validator';

/**
 * Central validation middleware
 * Checks for validation errors and returns formatted response
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

/**
 * Validation rules for common fields
 */
export const validationRules = {
  email: {
    isEmail: {
      errorMessage: 'Invalid email format'
    },
    normalizeEmail: true
  },
  password: {
    isLength: {
      options: { min: 6 },
      errorMessage: 'Password must be at least 6 characters'
    }
  },
  name: {
    isLength: {
      options: { min: 2, max: 100 },
      errorMessage: 'Name must be between 2 and 100 characters'
    },
    trim: true
  },
  collegeId: {
    isMongoId: {
      errorMessage: 'Invalid college ID format'
    }
  },
  role: {
    isIn: {
      options: [['student', 'counselor', 'admin']],
      errorMessage: 'Role must be student, counselor, or admin'
    }
  }
};
