const express = require('express');
const { signup, login } = require('../controllers/userController');
const asyncHandler = require('../utils/asyncHandler');
const { signupValidation, loginValidation, validateRequest } = require('../validators/requestValidators');
const { authLimiter } = require('../middleware/rateLimiters');

const router = express.Router();
router.post('/signup', authLimiter, signupValidation, validateRequest, asyncHandler(signup));
router.post('/login', authLimiter, loginValidation, validateRequest, asyncHandler(login));
module.exports = router;
