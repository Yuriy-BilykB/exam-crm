# CRM Programming School — Web

Next.js frontend for the CRM orders and managers app.

## Requirements

- Node.js 20+
- Running API server, normally at `http://localhost:5050`

## Installation

```bash
cd web
npm install
cp .env.example .env.local
```

`web/.env.local` should contain:

```bash
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## Running

```bash
npm run dev
```

Open http://localhost:3000. The app redirects to the login page.

Default admin credentials:

- **Email:** `admin@gmail.com`
- **Password:** `admin`

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```
