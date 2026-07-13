# Antigravity Rules for Attendy (attendance-app)

This ruleset guides coding standards, architectural patterns, and guidelines for the Attendy project.

---

## 1. Core Tech Stack & Standards

- **Runtime**: Node.js (v18+) with ES Modules (`type: "module"` in `package.json`).
- **Imports**: Use ESM import/export syntax. Always include the file extension in relative imports (e.g., `import helper from './helper.js'`).
- **Framework**: Express.js for REST API endpoints.
- **Database**: MongoDB via Mongoose ORM.
- **Formatting**: Code MUST conform to Prettier formatting rules configured in `.prettierrc`.

---

## 2. Directory Structure & Architecture

Maintain the existing architectural separation of concerns:

- **Routes (`/routes`)**: Define endpoints and associate them with controllers and middleware. Do not put business logic in route files.
- **Controllers (`/controllers`)**: Handle request parsing, validate inputs, interact with models or services, and send HTTP responses.
- **Models (`/models`)**: Define Mongoose schemas, indexes, and custom schema methods/statics.
- **Middlewares (`/middlewares`)**: Common interceptors like authentication checkers, error handlers, and input validators.
- **Database (`/db`)**: Database connection setup and lifecycle management.
- **Utils (`/utils`)**: Stateless utility functions, constants, or logging helpers.

---

## 3. Database & Mongoose Guidelines

- Always define models with proper schemas and options.
- Set `{ timestamps: true }` on schemas where appropriate.
- Export both the Mongoose schema and the Model.
- Prefer Mongoose query helper methods or statics for complex data fetching.

---

## 4. Error Handling & Logging

- **Logging**: Use the configured `winston` logger from the utils directory. Do not use raw `console.log`.
- **Async Error Handling**: Wrap async route/controller logic in `try/catch` or use an async handler wrapper to catch and forward errors to the Express error middleware.
- **Status Codes**: Return appropriate HTTP response statuses:
  - `200 OK` / `201 Created` for success
  - `400 Bad Request` for validation failures
  - `401 Unauthorized` / `403 Forbidden` for auth failures
  - `404 Not Found` for missing resources
  - `500 Internal Server Error` for system crashes

---

## 5. Security Practices

- Never commit credentials, API keys, or JWT secrets. Use environment variables managed via `dotenv`.
- Verify JWT tokens in route middleware, not on a per-controller basis.
- Hash passwords using `bcrypt` before storing.
