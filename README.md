# CRM Programming School

CRM for handling a coding school's applications (orders). Two roles — **admin** and
**manager**: applications with pagination / sorting / filtering, comments, inline
editing, groups, Excel export, and an admin panel to manage managers (activation,
ban, password recovery, per-status statistics).

## Stack

| | |
|---|---|
| **Backend** | NestJS 11, Prisma 7 (MySQL), JWT auth (access token + httpOnly refresh cookie), ExcelJS, Nodemailer |
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

- Node.js 20+
- Docker + Docker Compose (only if you want a local MySQL) — or any reachable MySQL 8

## Quick start

```bash
# 1. Backend
cd api
cp .env.example .env          # set DATABASE_URL (cloud RDS or local — see below)
npm install
npm run prisma:generate
npm run start:dev             # http://localhost:5050

# 2. Frontend (new terminal)
cd web
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:5050
npm install
npm run dev                   # http://localhost:3000
```

Open http://localhost:3000 — you are redirected to the login page. A default admin is
seeded automatically on backend startup:

- **email:** `admin@gmail.com`
- **password:** `admin`

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

To run against a local MySQL instead, start the bundled container (credentials come
from the root `.env`, already in the repo), point `DATABASE_URL` at it, apply
migrations, then load the data dump:

```bash
docker compose up -d
# api/.env: DATABASE_URL="mysql://root:root@localhost:3306/crm_db"
cd api && npm run prisma:migrate
mysql -h 127.0.0.1 -u root -proot crm_db < api/prisma/dump.sql
```

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
is the only required one — the rest have defaults.

### `api/.env` (see `api/.env.example`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma connection string to MySQL |
| `PORT` | Backend port (default `5050`) |
| `FRONTEND_URL` | Frontend URL, used for CORS and activation/recovery links |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Secrets for access / refresh tokens |
| `COOKIE_SECURE` | `true` only when served over HTTPS (marks the refresh cookie `Secure`). Leave `false` on plain HTTP |
| `SMTP_*`, `MAIL_FROM` | SMTP for emails. If `SMTP_HOST` is empty in dev, a throwaway Ethereal account is created and the preview URL is logged; in production email is skipped and the admin copies the link manually |

### `web/.env.local` (see `web/.env.example`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base API URL, inlined at build time (default `http://localhost:5050`) |

## Cloud database (AWS RDS)

Per the task spec's cloud-DB requirement, the database is a managed **AWS RDS
MySQL 8** instance. It is already provisioned and preloaded — just connect with the
`DATABASE_URL` shown in [Database](#database) above; no deployment steps are needed.

To reproduce it from scratch: create a MySQL 8 RDS instance and load the dump —

```bash
mysql -h <rds-endpoint> -u admin -p < api/prisma/dump.sql
```

The dump contains `CREATE DATABASE` / `CREATE TABLE` plus the `_prisma_migrations`
table, so no separate migration step is required.

## Useful commands

**Backend (`api/`):**

```bash
npm run start:dev       # dev server with watch (http://localhost:5050)
npm run build           # compile to dist/
npm run start:prod      # run compiled build (node dist/main)
npm run prisma:migrate  # create / apply migrations (dev)
npm run prisma:generate # regenerate Prisma Client
npm run db:seed         # manual seed (also runs automatically on startup)
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
