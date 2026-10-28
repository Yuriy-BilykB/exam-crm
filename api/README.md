# CRM Programming School — API

Backend built with NestJS + Prisma + MySQL 8 for the CRM orders & managers app.

## Requirements

- Node.js 20.19+ (or a newer supported LTS)
- The preloaded AWS RDS MySQL 8 database described in the
  [root README](../README.md#database), or Docker + Docker Compose for local MySQL 8

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
   - `DATABASE_URL` — MySQL connection string. Use the AWS RDS connection from the
     [root README](../README.md#database), or
     `mysql://root:root@localhost:3306/crm_db` for the bundled local container
   - `JWT_SECRET`, `JWT_REFRESH_SECRET` — token signing secrets. The example file includes development-only values; replace them outside local dev
   - `FRONTEND_URL` — used for CORS and generated activation/recovery links (default `http://localhost:3000`)
   - `COOKIE_SECURE` — set to `true` behind HTTPS
   - `PORT` — API port (default `5050`)
   - `SMTP_*`, `MAIL_FROM` — mail sending (currently disabled in code; safe to leave empty)
3. Generate the Prisma client:
   ```bash
   npm run prisma:generate
   ```
4. Choose the database setup below before starting the server.

## Database setup

### Preloaded cloud database (AWS RDS)

Set the AWS RDS `DATABASE_URL` from the [root README](../README.md#database) in
`api/.env`. This MySQL 8 database already contains the schema, 500 task-spec orders,
and the default admin. Start the backend directly; migrations and an order import
are unnecessary for this existing database.

### Fresh local database

After installation and configuration above, run these commands **from `api/`**:

```bash
# api/.env must use DATABASE_URL="mysql://root:root@localhost:3306/crm_db"
docker compose -f ../docker-compose.yml up -d --wait
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

The seed creates the default admin and imports 500 orders when the orders table is
empty. Log in through the frontend to see the orders; migrations and startup alone
do not import them. The container defaults to
`MYSQL_ROOT_PASSWORD=root` and `MYSQL_DATABASE=crm_db`; if you override these,
update `DATABASE_URL` to match.

The seed skips the import when orders already exist. To replace existing orders,
use the dedicated import command below; it deletes comments on replaced orders,
while users and groups are retained.
See [Import legacy orders](#import-legacy-orders) for details.

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

Import it into Postman. For protected endpoints, run **Auth → Login** first (admin@gmail.com / admin) — the collection variable `accessToken` will be saved and reused as a Bearer token for other requests.

## Default admin

On application startup, a default admin user is created only if it does not already exist:

- **Email:** admin@gmail.com
- **Password:** admin

(The password is stored as a bcrypt hash in the DB.)
Existing admin accounts and their passwords are not changed on startup.

## Import legacy orders

After applying migrations, use the UTF-8 dump in `prisma/orders.sql`:

```bash
npm run db:import-orders          # show the target and existing order count
npm run db:import-orders -- --apply
```

The import maps the legacy columns to the current orders table and replaces its rows
in a transaction. Comments on replaced orders are deleted; users, groups, and
migration history are retained.

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
| GET | /users/:id | Get own user data, or any user's data as an admin |
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

Schema changes are managed with Prisma Migrate (`prisma/migrations`), not schema
sync. Apply checked-in migrations with `npx prisma migrate deploy`, as shown
above. `npm run prisma:migrate` is for developing new schema changes.
