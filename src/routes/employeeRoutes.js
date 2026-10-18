const express = require('express');
const controller = require('../controllers/employeeController');
const authenticate = require('../middleware/authenticate');
const asyncHandler = require('../utils/asyncHandler');
const {
  validateRequest, createEmployeeValidation, updateEmployeeValidation,
  employeeParamValidation, deleteEmployeeQueryValidation
} = require('../validators/requestValidators');

const router = express.Router();
router.use(authenticate);
router.get('/employees', asyncHandler(controller.listEmployees));
router.post('/employees', createEmployeeValidation, validateRequest, asyncHandler(controller.createEmployee));
router.get('/employees/:eid', employeeParamValidation, validateRequest, asyncHandler(controller.getEmployee));
router.put('/employees/:eid', [...employeeParamValidation, ...updateEmployeeValidation], validateRequest, asyncHandler(controller.updateEmployee));
router.delete('/employees', deleteEmployeeQueryValidation, validateRequest, asyncHandler(controller.deleteEmployee));
module.exports = router;
