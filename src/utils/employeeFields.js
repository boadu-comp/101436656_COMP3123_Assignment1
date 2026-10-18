const EMPLOYEE_FIELDS = Object.freeze([
  'first_name', 'last_name', 'email', 'position',
  'salary', 'date_of_joining', 'department'
]);

function pickEmployeeFields(body) {
  return Object.fromEntries(
    EMPLOYEE_FIELDS
      .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
      .map((field) => [field, body[field]])
  );
}

function isEmployeeOwner(employeeOwnerId, userId) {
  return String(employeeOwnerId) === String(userId);
}

module.exports = { EMPLOYEE_FIELDS, pickEmployeeFields, isEmployeeOwner };
