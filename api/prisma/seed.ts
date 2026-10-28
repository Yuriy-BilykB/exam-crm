/**
 * Seed the default admin and, when the orders table is empty, import the
 * legacy orders dump into the current Order model.
 *
 * Run with: npm run db:seed (or: npx prisma db seed)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import { Role } from '../src/generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL as string),
});

/** Tokenize the VALUES portion of the mysqldump INSERT. */
function parseInsertValues(sql: string): (string | null)[][] {
  const marker = sql.indexOf('VALUES');
  if (marker === -1) return [];
  const body = sql.slice(marker + 'VALUES'.length);
  const rows: (string | null)[][] = [];
  let i = 0;

  while (i < body.length) {
    while (i < body.length && body[i] !== '(') {
      if (body[i] === ';') return rows;
      i++;
    }
    if (i >= body.length) break;
    i++;
    const row: (string | null)[] = [];

    while (i < body.length) {
      while (i < body.length && /\s/.test(body[i])) i++;
      if (body[i] === ')') {
        i++;
        break;
      }

      let value: string | null;
      if (body[i] === "'") {
        i++;
        let text = '';
        while (i < body.length) {
          const char = body[i];
          if (char === '\\') {
            text += body[i + 1] ?? '';
            i += 2;
          } else if (char === "'") {
            if (body[i + 1] === "'") {
              text += "'";
              i += 2;
            } else {
              i++;
              break;
            }
          } else {
            text += char;
            i++;
          }
        }
        value = text;
      } else {
        let text = '';
        while (i < body.length && body[i] !== ',' && body[i] !== ')') {
          text += body[i++];
        }
        text = text.trim();
        value = text.toUpperCase() === 'NULL' ? null : text;
      }
      row.push(value);
      while (i < body.length && /\s/.test(body[i])) i++;
      if (body[i] === ',') i++;
      else if (body[i] === ')') {
        i++;
        break;
      }
    }
    rows.push(row);
  }
  return rows;
}

function clean(value: string | null): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === '' || trimmed === '<blank>' ? null : trimmed;
}

function toInt(value: string | null): number | null {
  if (value == null) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const normalized = value.replace(' ', 'T').replace(/(\.\d{3})\d*/, '$1');
  const date = new Date(`${normalized}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function seedAdmin() {
  const email = 'admin@gmail.com';
  const password = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, password, name: 'Admin', role: Role.admin, isActive: true },
  });
  console.log('✔ admin user ready');
}

async function seedOrders() {
  const existing = await prisma.order.count();
  if (existing > 0) {
    console.log(`↷ orders already present (${existing}); skipping dump import`);
    return;
  }

  const sql = readFileSync(join(__dirname, 'orders.sql'), 'utf8');
  const rows = parseInsertValues(sql);
  if (rows.length === 0 || rows.some((row) => row.length < 15)) {
    throw new Error('orders.sql did not contain valid legacy order rows');
  }

  // Legacy dump columns: id, name, surname, email, phone, age, course,
  // course_format, course_type, sum, alreadyPaid, created_at, utm, msg, status.
  const orders = rows.map((row) => ({
    id: toInt(row[0]) ?? undefined,
    name: clean(row[1]),
    surname: clean(row[2]),
    email: clean(row[3]),
    phone: clean(row[4]),
    age: toInt(row[5]),
    course: clean(row[6]),
    courseFormat: clean(row[7]),
    courseType: clean(row[8]),
    sum: toInt(row[9]),
    alreadyPaid: toInt(row[10]),
    createdAt: parseDate(row[11]),
    utm: clean(row[12]),
    message: clean(row[13]),
    status: clean(row[14]),
  }));

  const result = await prisma.order.createMany({ data: orders });
  console.log(`✔ imported ${result.count} orders`);
}

async function main() {
  await seedAdmin();
  await seedOrders();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seed complete.');
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
