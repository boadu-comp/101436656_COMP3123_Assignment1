const test = require('node:test');
const assert = require('node:assert/strict');
const { pickEmployeeFields, isEmployeeOwner, EMPLOYEE_FIELDS } = require('../src/utils/employeeFields');

test('only permitted employee data fields are taken from client input', () => {
  const chosen = pickEmployeeFields({ first_name: 'Alex', salary: 60000, user: 'fake-user-id', _id: 'fake-id' });
  assert.deepEqual(chosen, { first_name: 'Alex', salary: 60000 });
});

test('ownership check recognizes the same owner id', () => {
  assert.equal(isEmployeeOwner('owner-123', 'owner-123'), true);
  assert.equal(isEmployeeOwner('owner-123', 'owner-456'), false);
});

test('all assignment employee fields are included', () => {
  assert.deepEqual(EMPLOYEE_FIELDS, [
    'first_name', 'last_name', 'email', 'position',
    'salary', 'date_of_joining', 'department'
  ]);
});
