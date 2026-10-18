const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { EMPLOYEE_FIELDS } = require('../utils/employeeFields');

function requireObjectBody(req, _res, next) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return next(new ApiError(400, 'Expected a JSON object in the request body'));
  }
  next();
}

function allowOnlyBodyFields(allowed, requireAtLeastOne = false) {
  return (req, _res, next) => {
    const keys = Object.keys(req.body);
    const unexpected = keys.filter((field) => !allowed.includes(field));
    if (unexpected.length) {
      return next(new ApiError(400, 'Request contains unsupported fields',
        unexpected.map((field) => ({ field, message: 'Field is not allowed' }))));
    }
    if (requireAtLeastOne && keys.length === 0) {
      return next(new ApiError(400, 'Provide at least one field to update'));
    }
    next();
  };
}

function validateRequest(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((error) => ({
    field: error.path || error.param || 'unknown',
    message: error.msg
  }));
  logger.warn('Request validation failed', { path: req.path, method: req.method, count: errors.length });
  next(new ApiError(400, 'Request validation failed', errors));
}

function textField(name, max, required) {
  let check = body(name);
  check = required ? check.exists().withMessage(`${name} is required`).bail()
    : check.optional();
  return check.isString().withMessage(`${name} must be a string`).bail()
    .trim().isLength({ min: 1, max })
    .withMessage(`${name} must be 1 to ${max} characters`);
}

function emailField(required) {
  let check = body('email');
  check = required ? check.exists().withMessage('email is required').bail()
    : check.optional();
  return check.isString().withMessage('email must be a string').bail()
    .isEmail().withMessage('A valid email is required').bail()
    .isLength({ max: 254 }).withMessage('Email is too long')
    .normalizeEmail();
}

function salaryField(required) {
  let check = body('salary');
  check = required ? check.exists().withMessage('salary is required').bail()
    : check.optional();
  return check.isFloat({ gt: 0, lt: 1000000000 })
    .withMessage('salary must be a positive number below 1,000,000,000')
    .toFloat();
}

function joiningDateField(required) {
  let check = body('date_of_joining');
  check = required ? check.exists().withMessage('date_of_joining is required').bail()
    : check.optional();
  return check.isISO8601({ strict: true, strictSeparator: true })
    .withMessage('date_of_joining must be a real ISO 8601 date (YYYY-MM-DD)')
    .toDate();
}

function employeeFieldRules(required) {
  return [
    textField('first_name', 60, required),
    textField('last_name', 60, required),
    emailField(required),
    textField('position', 100, required),
    salaryField(required),
    joiningDateField(required),
    textField('department', 100, required)
  ];
}

const signupValidation = [
  requireObjectBody,
  allowOnlyBodyFields(['username', 'email', 'password']),
  body('username').exists().withMessage('username is required').bail()
    .isString().withMessage('username must be a string').bail()
    .trim().isLength({ min: 3, max: 30 }).withMessage('username must be 3 to 30 characters')
    .matches(/^[A-Za-z0-9_]+$/).withMessage('username may contain only letters, digits, underscores')
    .toLowerCase(),
  emailField(true),
  body('password').exists().withMessage('password is required').bail()
    .isString().withMessage('password must be a string').bail()
    .isLength({ min: 8, max: 72 }).withMessage('password must be 8 to 72 characters')
    .matches(/[a-z]/).withMessage('password needs a lowercase letter')
    .matches(/[A-Z]/).withMessage('password needs an uppercase letter')
    .matches(/[0-9]/).withMessage('password needs a number')
];

const loginValidation = [
  requireObjectBody,
  allowOnlyBodyFields(['username', 'email', 'password']),
  body('username').optional().isString().withMessage('username must be a string').bail()
    .trim().isLength({ min: 3, max: 30 }).withMessage('Invalid username')
    .toLowerCase(),
  emailField(false),
  body('password').exists().withMessage('password is required').bail()
    .isString().withMessage('password must be a string').bail()
    .notEmpty().withMessage('password cannot be empty')
];

const createEmployeeValidation = [
  requireObjectBody,
  allowOnlyBodyFields(EMPLOYEE_FIELDS),
  ...employeeFieldRules(true)
];

const updateEmployeeValidation = [
  requireObjectBody,
  allowOnlyBodyFields(EMPLOYEE_FIELDS, true),
  ...employeeFieldRules(false)
];

const employeeParamValidation = [
  param('eid').isMongoId().withMessage('eid must be a valid MongoDB ObjectId')
];
const deleteEmployeeQueryValidation = [
  query('eid').isMongoId().withMessage('eid query parameter must be a valid MongoDB ObjectId'),
  query().custom((value) => {
    if (Object.keys(value).some((key) => key !== 'eid')) {
      throw new Error('Only eid is supported in the query string');
    }
    return true;
  }).withMessage('Only eid is supported in the query string')
];

module.exports = {
  validateRequest, signupValidation, loginValidation,
  createEmployeeValidation, updateEmployeeValidation,
  employeeParamValidation, deleteEmployeeQueryValidation
};
