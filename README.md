# COMP3123 Assignment 1: Secure Employee Management REST API
A RESTful backend built with Node.js, Express, MongoDB and Mongoose. Users can register, sign in with a username or email, receive a JWT, and manage only the employees they created. No frontend is required for this assignment.
Course: COMP3123 Full Stack Development
Assignment: Assignment 1
Student ID: 101436656
Database name: comp3123_assignment1
Due date: October 18, 2026 
GitHub repository: https://github.com/boadu-comp/101436656_COMP3123_Assignment1
1. Technology stack
- Node.js 20+ and Express 4
- MongoDB and Mongoose ODM
- JWT (jsonwebtoken) to authenticate requests
- bcryptjs (12 salt rounds) to hash passwords
- express-validator to validate request bodies, IDs and query strings
- helmet for security-related HTTP headers
- express-rate-limit for 429 Too Many Requests protection
- winston for JSON logs written locally
- dotenv for configuration secrets
- Postman to test the API
2. Project structure
101436656_COMP3123_Assignment1/
├── src/
│   ├── app.js                   Express app, security middleware, routes and /health
│   ├── server.js                Database connection and server startup
│   ├── config/
│   │   ├── database.js          Mongoose connection
│   │   └── env.js               Environment variable loading and checks
│   ├── controllers/
│   │   ├── userController.js    Registration and login
│   │   └── employeeController.js  Employee CRUD, authorization checks
│   ├── middleware/
│   │   ├── authenticate.js      Verify JWT and resolve the signed-in user
│   │   ├── errorHandler.js      Central error handler and unknown routes
│   │   ├── rateLimiters.js      Auth + general request throttling
│   │   └── requestLogger.js     Record HTTP method/path/status/timing
│   ├── models/
│   │   ├── User.js              User schema, hash password before save
│   │   └── Employee.js          Employee schema, required `user` reference
│   ├── routes/
│   │   ├── userRoutes.js
│   │   └── employeeRoutes.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   ├── asyncHandler.js
│   │   ├── employeeFields.js    Allowed input fields and ownership helper
│   │   └── logger.js
│   └── validators/requestValidators.js
├── tests/employeeFields.test.js
├── scripts/check-syntax.js
├── postman/COMP3123_Assignment1.postman_collection.json
├── screenshots/
├── logs/.gitkeep
├── .gitignore
├── package.json
└── README.md
3. Installation and configuration (Mac or Windows)
Prerequisites: Install Node.js 20 or later, Postman and Git. You also need MongoDB Community Server or a MongoDB Atlas cluster.
3.1 Clone the repository and install dependencies
Clone the repository using the real GitHub URL:
git clone https://github.com/boadu-comp/101436656_COMP3123_Assignment1.git
cd 101436656_COMP3123_Assignment1
npm install
If you already have the project open locally in VS Code, you do not need to clone it again. Open a terminal in that project's root folder and run npm install.
3.2 Set up environment variables
Copy the safe example configuration into a local .env file:
cp .env.example .env
On Windows Command Prompt use copy .env.example .env instead of cp.
Edit .env:
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/comp3123_assignment1
JWT_SECRET=your_own_random_secret_at_least_32_characters_long
JWT_EXPIRES_IN=1h
NODE_ENV=development
Generate a random JWT secret rather than using the example:
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
Copy that output into JWT_SECRET in .env. Never add .env to GitHub, email it, or include it in your ZIP.
3.3 Start or verify MongoDB
MongoDB Atlas (used for this assignment): MongoDB Atlas is a cloud-hosted database service. You do not need to start a MongoDB server manually on your Mac. Instead:
1. Sign in to MongoDB Atlas and open the existing cluster (for this project, Week06Cluster).
2. Confirm the cluster is available.
3. Under Network Access, confirm your current IP address is allowed.
4. Under Database Access, confirm your database user has the required permissions.
5. In the local .env file, set MONGODB_URI to your private Atlas connection string. Place /comp3123_assignment1 after the host and before any ? options.
6. Start Express using npm run dev. The application connects to Atlas when it starts, and the terminal should display MongoDB connected.
Your Atlas URI will resemble the following placeholder only. Do not publish a URI with a real password:
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@YOUR-CLUSTER.mongodb.net/comp3123_assignment1?retryWrites=true&w=majority
URL-encode reserved characters in the password when necessary. Actual database credentials must remain in .env only and must not appear in screenshots, documentation or GitHub.
Local MongoDB (alternative): Start the locally installed MongoDB server before launching the app. Use MONGODB_URI=mongodb://127.0.0.1:27017/comp3123_assignment1. MongoDB creates the database after data is first saved; you can inspect it in MongoDB Compass.
3.4 Start the Express application
Run the server:
npm run dev
Or use npm start without automatic restarts. When successful, the terminal prints a MongoDB connection message and API running at http://localhost:3000.
3.5 Check the connection and API
Visit http://localhost:3000/health. Expect HTTP 200 and JSON including:
{
  "success": true,
  "status": "ok",
  "database": "connected"
}
The real response also includes uptime, timestamp and environment. If MongoDB is unavailable at startup, the server intentionally refuses to start. Check .env and MongoDB first.
4. Required REST API endpoints
Base URL: http://localhost:3000
HTTP method	Route	Success	Authorization
POST	/api/v1/user/signup	201 Created	Public
POST	/api/v1/user/login	200 OK	Public
GET	/api/v1/emp/employees	200 OK	Bearer JWT
POST	/api/v1/emp/employees	201 Created	Bearer JWT
GET	/api/v1/emp/employees/:eid	200 OK	Bearer JWT + owner
PUT	/api/v1/emp/employees/:eid	200 OK	Bearer JWT + owner
DELETE	/api/v1/emp/employees?eid=xxx	204 No Content	Bearer JWT + owner
GET	/health	200 OK	Public


Important: The DELETE request uses ?eid= in the query string, not a URL path segment, to match the assignment.
4.1 Sign up
POST /api/v1/user/signup with JSON:
{
  "username": "demo_user_a",
  "email": "demo.a@example.com",
  "password": "StudyDemoA1!"
}
Responds 201 with a user object that has _id, username, email, created_at, updated_at. The password is never returned. Username and email are unique (stored lowercased). Sample passwords used in this README/Postman are demonstration-only and not real credentials.
4.2 Log in using username OR email
POST /api/v1/user/login:
{
  "username": "demo_user_a",
  "password": "StudyDemoA1!"
}
Alternatively, use "email": "demo.a@example.com" in place of username. A valid login returns 200 and data.token, data.token_type, data.expires_in and a public user profile. Invalid credentials return 401.
4.3 Attach the JWT to protected routes
All /api/v1/emp routes must include the header:
Authorization: Bearer YOUR_JWT_TOKEN
In Postman, the Authorization tab can use Bearer Token with the token from login. JWTs expire after 1h by default; log in again if necessary. The JWT payload includes the signing authority's sub (subject), which is the signed-in user's MongoDB ID. The backend verifies the signature, expected issuer and expiry and rejects an invalid or missing token.
4.4 Create an employee
POST /api/v1/emp/employees with Bearer token and JSON:
{
  "first_name": "Alex",
  "last_name": "Rivera",
  "email": "alex.rivera@example.com",
  "position": "Software Developer",
  "salary": 68000,
  "date_of_joining": "2026-01-12",
  "department": "IT"
}
Responds 201 with the employee, plus user containing the authenticated owner's MongoDB ObjectId. Never supply user yourself: the server uses the verified JWT, and unsupported input fields are rejected.
4.5 List, retrieve, update and delete employees
- GET /api/v1/emp/employees returns only that JWT holder's employees, even if other users have created employees.
- GET /api/v1/emp/employees/EMPLOYEE_ID returns one owned employee.
- PUT /api/v1/emp/employees/EMPLOYEE_ID accepts allowed fields to update, such as { "position": "Senior Developer", "salary": 73000 }. It does not allow updating the employee owner.
- DELETE /api/v1/emp/employees?eid=EMPLOYEE_ID responds 204 with no response body.
Valid employee properties: first_name, last_name, email, position, salary, date_of_joining, department. IDs must be valid MongoDB ObjectIds.
5. Database models and relationship
Users: _id, username, email, password (bcrypt hash), created_at, updated_at.
Employees: _id, first_name, last_name, email, position, salary, date_of_joining, department, user, created_at, updated_at.
Employee.user is a required Mongoose ObjectId referring to the User model, which represents a one-to-many relationship (one user creates many employees). The ownership field is immutable.
Ownership is enforced in the database query for lists, and via a server-side ownership check before retrieving a single record, modifying it or deleting it. A user cannot override ownership by supplying a user field or changing eid in the URL. This API responds 403 Forbidden when a valid authenticated user tries to access an existing employee owned by someone else. Unknown records respond 404 Not Found.
6. Input validation
All user-controlled JSON, employee IDs and query parameters are validated with express-validator.
- Signup: username 3-30 chars (letters/digits/underscores), valid unique email, password 8-72 chars containing lowercase, uppercase, digit.
- Login: password and exactly one of username/email.
- Employee create: all seven employee data fields required and validated; positive salary, ISO-8601 joining date, email format and reasonable lengths.
- Employee update: at least one allowed field; validated with the same rules.
- Employee path/query ID: a valid MongoDB ObjectId.
- Unknown fields (including user/owner input), malformed JSON and missing fields are rejected.
Validation failures return 400 and JSON with a message and an errors array containing field names and messages only. Passwords and input values are never copied into validation errors. Unique-key violations return 409 Conflict.
7. Security implementation
7.1 Password hashing
User.js hashes newly created/modified passwords with bcrypt (12 rounds) before MongoDB saves the user. The raw password is not stored, and the hashed password is excluded from normal user queries and all public JSON responses. During login bcrypt.compare checks the candidate against the stored hash.
7.2 JWT authentication and authorization
On successful login the server signs a time-limited JWT using the secret stored in .env. The authenticate middleware validates its signature, HS256 algorithm, issuer, expiration and user existence. Employee authorization always uses the user identity from this verified JWT, not from client-controlled JSON or query fields. A missing, invalid or expired token returns 401 Unauthorized.
7.3 Helmet
helmet() adds security-related HTTP response headers to reduce exposure to common web risks. For evidence, use Postman to inspect /health response headers, for example X-Content-Type-Options: nosniff or X-Frame-Options: SAMEORIGIN (depending on installed Helmet version).
7.4 Rate limiting
Two in-memory IP-based limiters are configured. Both have a 15-minute window:
Request group	Limit per IP per 15 minutes
Login and signup combined	10 requests
General API requests	500 requests


After exceeding the allowed number, the request returns HTTP 429 Too Many Requests with JSON saying to try again later. Rate limiting helps slow brute-force credential guessing and abuse. The counters are in memory, so they reset on server restart. In production, a shared external rate-limit store would be preferable across multiple servers.
7.5 Environment variables
PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV come from .env. The real file is gitignored. .env.example documents the configuration with no real credentials.
8. HTTP responses and centralized errors
Status	Example usage
200 OK	Login, GET, PUT, health check
201 Created	User registration, employee creation
204 No Content	Successful DELETE (no response body)
400 Bad Request	Invalid email/salary/date/ObjectId, missing fields, malformed JSON
401 Unauthorized	Invalid credentials, missing/invalid/expired JWT
403 Forbidden	Another user's employee exists, but requester is not the owner
404 Not Found	Employee or route does not exist
409 Conflict	Duplicate username or email
429 Too Many Requests	Login/signup or general rate limit exceeded
500 Internal Server Error	Unexpected server/database error


Errors use a consistent shape:
{
  "success": false,
  "message": "Request validation failed",
  "errors": [ { "field": "salary", "message": "salary must be a positive number below 1,000,000,000" } ]
}
A centralized error middleware catches unexpected errors and hides stack traces, tokens, passwords and connection credentials from API responses. Incorrect route paths return JSON 404.
9. Health check
GET /health is public and confirms that the Express server responds. It includes status, database (connected/disconnected), process uptime, timestamp and environment. Startup checks ensure the MongoDB connection is established before the server starts accepting API requests.
10. Local application logs
Winston writes JSON lines to the locally created:
- logs/combined.log: requests, startup, authentication attempts and failures, successful employee operations, validation/authorization failures and errors.
- logs/errors.log: unexpected server errors.
Logged information includes timestamps, HTTP method/path/status/duration, event type and (when available) the authenticated user ID. The logger does not record request bodies, passwords, JWTs, Authorization headers, database passwords or query values.
An empty logs/errors.log is normal if no error-level events have occurred. The .gitignore prevents generated .log files from being committed automatically. docs/sample-log.jsonl demonstrates the format; for grading, take a screenshot of your real logs/combined.log after running tests, or include sanitized real evidence if your instructor wants the actual log files.
11. How to test in Postman
1. Confirm the MongoDB Atlas cluster is available (or start local MongoDB), then start Express with npm run dev.
2. In Postman, Import postman/COMP3123_Assignment1.postman_collection.json.
3. Check collection variable baseUrl is http://localhost:3000 (or change if needed).
4. Run the first four folders in order. They create two users, sign them in, create employees, test CRUD, reject cross-user access and delete both employees.
5. The scripts automatically save tokenA, tokenB, employeeAId, employeeBId in Postman collection variables. Avoid printing tokens in screenshots.
6. The fifth folder is optional and separate. Run its login request at least 11 times in a fresh 15-minute window to demonstrate rate limiting and 429. Doing it with other tests can lock out signup/login while the window is active.
7. Use a fresh local database or new test usernames if you run sign-up tests repeatedly, because registered users are unique. Invalid test data must never be used as real personal information.
Extra test cases included: invalid token, missing token, cross-user GET/PUT/DELETE, duplicate username, salary validation, invalid employee ID, unsupported owner field, malformed JSON and non-existing employee. For further cases required by the rubric, manually change request values (e.g. invalid email/date, expired token) and capture results.
The API collection has demonstration credentials only. Replace with distinct dummy test credentials when you repeat a fresh test run. If sharing collection, ensure it contains no live production credentials or JWTs.
Other tests: The rubric also calls for invalid email/password/date and missing-field inputs, plus expired-token behavior. The provided collection covers many cases, and you can create additional manual Postman requests for any missing cases. Screenshot HTTP statuses and redact tokens.
To run the local code checks:
npm run check
npm test
These are code syntax and helper unit tests. They are not a substitute for running MongoDB and all Postman API requests. Do not claim that integration tests passed unless you actually run them.
12. MongoDB evidence
After creating both users and their employees, open MongoDB Compass or Atlas's collection viewer. Capture screenshots showing:
1. Database named comp3123_assignment1.
2. The users collection with two sample user documents.
3. Password values looking like bcrypt hashes (typically starting $2a$ or $2b$) rather than plaintext.
4. The employees collection with multiple employee documents.
5. Each employee's user ObjectId linking to its owner in the users collection.
Capture the database before running the two cleanup DELETE requests if you want your employee documents to remain visible in the screenshots. Save the screenshots in screenshots/, along with Postman evidence for signup, login, CRUD, authorization, validation, rate limiting, Helmet response headers, /health, and the sanitized local logs. Mask JWTs, passwords, database secrets and personal information before saving or submitting.
