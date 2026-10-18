const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { pickEmployeeFields, isEmployeeOwner } = require('../utils/employeeFields');

async function getEmployeeWithOwnershipCheck(employeeId, ownerId) {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new ApiError(404, 'Employee not found');
  if (!isEmployeeOwner(employee.user, ownerId)) {
    logger.warn('Employee authorization rejected', { userId: ownerId });
    throw new ApiError(403, 'You cannot access an employee owned by another user');
  }
  return employee;
}

async function listEmployees(req, res) {
  const employees = await Employee.find({ user: req.user.id }).sort({ created_at: -1 });
  res.status(200).json({ success: true, count: employees.length, data: employees });
}

async function createEmployee(req, res) {
  const employee = await Employee.create({
    ...pickEmployeeFields(req.body),
    user: req.user.id
  });
  logger.info('Employee created', { employeeId: employee.id, userId: req.user.id });
  res.status(201).json({ success: true, message: 'Employee created', data: employee });
}

async function getEmployee(req, res) {
  const employee = await getEmployeeWithOwnershipCheck(req.params.eid, req.user.id);
  res.status(200).json({ success: true, data: employee });
}

async function updateEmployee(req, res) {
  const employee = await getEmployeeWithOwnershipCheck(req.params.eid, req.user.id);
  employee.set(pickEmployeeFields(req.body));
  const updated = await employee.save();
  logger.info('Employee updated', { employeeId: employee.id, userId: req.user.id });
  res.status(200).json({ success: true, message: 'Employee updated', data: updated });
}

async function deleteEmployee(req, res) {
  const employee = await getEmployeeWithOwnershipCheck(req.query.eid, req.user.id);
  const result = await Employee.deleteOne({ _id: employee.id, user: req.user.id });
  if (result.deletedCount !== 1) throw new ApiError(404, 'Employee not found');
  logger.info('Employee deleted', { employeeId: employee.id, userId: req.user.id });
  res.status(204).end();
}

module.exports = { listEmployees, createEmployee, getEmployee, updateEmployee, deleteEmployee };
