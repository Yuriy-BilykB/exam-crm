# CRM Programming School — API

Backend built with NestJS + Prisma + MySQL/MariaDB for the CRM orders & managers app.

## Requirements

- Node.js 18+
- MySQL/MariaDB (local or the cloud DB from the assignment: http://owu.linkpc.net/mysql)

## Installation

```bash
cd api
npm install
```

## Configuration

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in `.env`:
   - `DATABASE_URL` — Prisma connection string to MySQL/MariaDB
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing secrets
   - `FRONTEND_URL` — used for CORS and links sent to managers (default `http://localhost:3000`)
   - `COOKIE_SECURE` — set to `true` behind HTTPS
   - `PORT` — API port (default `5050`)
   - `SMTP_*`, `MAIL_FROM` — mail sending (currently disabled in code; safe to leave empty)
3. Apply the Prisma schema:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

## Running

```bash
# Development
npm run start:dev

# Build & production
npm run build
npm run start:prod
```

Default server address: **http://localhost:5050**

## API documentation

- Swagger UI is served at **`/api/docs`** once the server is running.
- A Postman collection is also available (see below).

## Postman

The repo includes a Postman collection:

- File: **postman/CRM-API.postman_collection.json**

Import it into Postman. For protected endpoints, run **Auth → Login** first (admin@gmail.com / admin) — the collection variable `access_token` will be saved and reused as a Bearer token for other requests.

## Default admin

On application startup, a default admin user is created (or reactivated) automatically:

- **Email:** admin@gmail.com
- **Password:** admin

(The password is stored as a bcrypt hash in the DB.)

## Main endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Login (email, password) |
| POST | /auth/refresh | Refresh the access token via the refresh cookie |
| POST | /auth/logout | Clear the refresh cookie |
| POST | /auth/set-password | Set a password via an activation/recovery token |
| GET | /auth/me | Current user (Bearer) |
| GET/POST | /groups | List groups / create a group |
| GET | /orders | Orders (pagination, sorting, filters) |
| GET | /orders/export | Export orders to Excel |
| GET | /orders/:id | Single order (with comments) |
| PATCH | /orders/:id | Update an order |
| GET | /orders/:id/comments | Order comments |
| POST | /orders/:id/comments | Add a comment (claims the order if unassigned) |
| GET | /users/:id | Get a user by id |
| GET | /admin/stats | Order counts grouped by status (admin only) |
| GET | /admin/managers | List managers/admins (pagination, admin only) |
| POST | /admin/managers | Create a manager |
| GET | /admin/managers/:id/stats | Order stats for one manager |
| POST | /admin/managers/:id/activate | Get an activation link |
| POST | /admin/managers/:id/recovery | Get a password-recovery link |
| POST | /admin/managers/:id/ban | Ban a user |
| POST | /admin/managers/:id/unban | Unban a user |

Course/format/type/status values are not served by their own endpoints — they're plain string fields on `Order`, defined as fixed lists in code (`src/common/enums.ts` on the backend, `lib/reference/lists.ts` on the frontend).

## DB schema

Tables: `users`, `orders`, `comments`, `groups`, `activation_tokens`.

Schema changes are managed with Prisma Migrate (`prisma/migrations`), not schema sync — run `npm run prisma:migrate` after pulling schema changes.
