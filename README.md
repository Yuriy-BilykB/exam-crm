# CRM Programming School

CRM for handling a coding school's applications (orders). Two roles — **admin** and
**manager**: applications with pagination / sorting / filtering, comments, inline
editing, groups, Excel export, and an admin panel to manage managers (activation,
ban, password recovery, per-status statistics).

## Stack

| | |
|---|---|
| **Backend** | NestJS 11, Prisma 7 (MySQL), JWT auth (access token + httpOnly refresh cookie), ExcelJS |
| **Frontend** | Next.js 16 (App Router), React Query 5, nuqs, Tailwind CSS 4 |
| **Database** | Cloud MySQL 8 (AWS RDS), or a local MySQL via Docker |

Repository layout:

```
.
├── api/                  # NestJS backend
├── web/                  # Next.js frontend
└── docker-compose.yml    # local MySQL (optional, for dev)
```

## Requirements

- Node.js 20.19+ (or a newer supported LTS)
- Docker + Docker Compose (only if you want a local MySQL) — or any reachable MySQL 8

## Quick start

```bash
# 1. Backend
cd api
cp .env.example .env          # set DATABASE_URL (cloud RDS or local — see below)
npm install
npm run prisma:generate
# For a fresh local database, complete the Local database steps below before starting.
# The preloaded cloud database needs neither migrations nor an order import.
npm run start:dev             # http://localhost:5050

# 2. Frontend (new terminal, from the repository root)
cd web
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:5050
npm install
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000 — you are redirected to the login page. On a fresh
database, backend startup creates a default admin:

- **email:** `admin@gmail.com`
- **password:** `admin`

Later startups leave this account and its password unchanged.

> The frontend (`:3000`) calls the backend (`:5050`) directly; CORS is enabled on the
> API for `FRONTEND_URL`.

## Database

The application uses a **cloud MySQL database (AWS RDS)** — already preloaded with the
task-spec data (500 orders) and the default admin. Put this in `api/.env`:

```
DATABASE_URL="mysql://reviewer:rev_5737ebb6b0694f137f41254e@crm-db.cniog8a4ytxr.eu-west-2.rds.amazonaws.com:3306/crm_db"
```

> This is a read/write user scoped to `crm_db` only (no access to other databases or
> to the AWS account).

### Local database (optional alternative)

To run against a fresh local MySQL instead, install the backend dependencies as
shown in Quick start, set `DATABASE_URL` in `api/.env` to
`mysql://root:root@localhost:3306/crm_db`, then apply the existing migrations and
import the orders before starting the backend:

```bash
# from the repository root
docker compose up -d --wait

# api/.env: DATABASE_URL="mysql://root:root@localhost:3306/crm_db"
cd api
npx prisma migrate deploy
npm run db:import-orders          # verify the local target and current order count
npm run db:import-orders -- --apply
npm run start:dev
```

The import should report `Imported 500 orders with verified Cyrillic data.`
Backend startup then creates the default admin; log in to see the imported orders.
The import replaces existing orders and deletes their comments, so use `--apply`
only when you intend to replace those records. Users and groups are retained.

`docker-compose.yml` defaults to `MYSQL_ROOT_PASSWORD=root` and
`MYSQL_DATABASE=crm_db`. You can override them with environment variables if needed.

## API documentation

- **Swagger UI:** http://localhost:5050/api/docs (available once the backend is running)
- **Postman collection:** [`api/postman/CRM-API.postman_collection.json`](api/postman/CRM-API.postman_collection.json)

To use the Postman collection: import the file, run **Auth → Login** first (the admin
credentials are pre-filled) — the access token is captured into a collection variable
automatically, and every other request inherits `Bearer {{accessToken}}`. Adjust the
`baseUrl` variable if the API runs elsewhere.

## Environment variables

Backend env vars are validated on startup by a Zod schema
([`src/config/app-config.service.ts`](api/src/config/app-config.service.ts)) and
read through a typed `AppConfigService` rather than `process.env`. A missing or
malformed variable makes the app fail to boot with a clear error; `DATABASE_URL`
plus `JWT_SECRET` and `JWT_REFRESH_SECRET` are required. The example file includes
development-only JWT values, so after copying it you normally only need to fill in
`DATABASE_URL` for local development.

### `api/.env` (see `api/.env.example`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma connection string to MySQL. Required |
| `PORT` | Backend port (default `5050`) |
| `FRONTEND_URL` | Frontend URL, used for CORS and activation/recovery links |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets for access / refresh tokens. Required; `api/.env.example` includes development-only values |
| `COOKIE_SECURE` | `true` only when served over HTTPS (marks the refresh cookie `Secure`). Leave `false` on plain HTTP |
| `SMTP_*`, `MAIL_FROM` | Mail settings are currently unused because email sending is disabled in code. Activation and recovery endpoints return a link with `emailSent: false`; the frontend copies that link to the clipboard for the admin to share manually |

### `web/.env.local` (see `web/.env.example`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base API URL, inlined at build time (default `http://localhost:5050`) |

## Cloud database (AWS RDS)

Per the task spec's cloud-DB requirement, the database is a managed **AWS RDS
MySQL 8** instance. It is already provisioned and preloaded — just connect with the
`DATABASE_URL` shown in [Database](#database) above; no deployment steps are needed.

To populate an RDS database after applying the Prisma migrations, set its
`DATABASE_URL` in `api/.env`, then run:

```bash
cd api
npm run db:import-orders          # inspect the target and current order count
npm run db:import-orders -- --apply
```

`api/prisma/orders.sql` contains the original UTF-8 order rows. The import maps its
legacy columns to the current schema and replaces existing orders in a transaction;
comments attached to those orders are deleted by the foreign key cascade. Users,
groups, and migration history are left intact.

## Useful commands

**Backend (`api/`):**

```bash
npm run start:dev       # dev server with watch (http://localhost:5050)
npm run build           # compile to dist/
npm run start:prod      # run compiled build (node dist/main)
npm run prisma:migrate  # create / apply migrations (dev)
npm run prisma:generate # regenerate Prisma Client
npm run db:import-orders # inspect the target; add -- --apply to replace its orders
npm run lint
```

**Frontend (`web/`):**

```bash
npm run dev             # dev server (http://localhost:3000)
npm run build
npm run start
npm run lint
```

## Database dumps (task spec)

- MySQL: https://drive.google.com/file/d/1_5elESLEi3Lb_QFgDoo2NNsiP-n5O0Ow/view?usp=sharing
- MongoDB: https://drive.google.com/file/d/1NlSMLbXSiV48YV6h_8xZFX-M-UH6ThIo/view?usp=sharing
