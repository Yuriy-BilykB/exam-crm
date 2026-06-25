/**
 * Seed script.
 *
 * 1. Upserts the default admin user (admin@gmail.com / admin).
 * 2. Imports prisma/orders.sql (a flat MySQL dump of the legacy `orders` table)
 *    and normalizes each row into Client + Course + Application.
 *
 * The legacy data is "mojibake" (UTF-8 bytes stored as Latin-1), so Cyrillic
 * names come through garbled. We recover them with a Latin-1 -> UTF-8 round-trip.
 *
 * Run with:  npm run db:seed     (or: npx prisma db seed)
 */
import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as bcrypt from 'bcrypt';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../src/generated/prisma/client';
import {
  CourseName,
  CourseType,
  CourseFormat,
  ApplicationStatus,
  Role,
} from '../src/generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(process.env.DATABASE_URL as string),
});

const COURSE_NAMES = Object.values(CourseName) as string[];
const COURSE_TYPES = Object.values(CourseType) as string[];
const COURSE_FORMATS = Object.values(CourseFormat) as string[];

// ----------------------------- helpers -----------------------------

/** Recover Cyrillic stored as Latin-1-decoded UTF-8 bytes. */
function fixEncoding(s: string | null): string | null {
  if (!s) return s;
  if (!/[-ÿ]/.test(s)) return s; // pure ASCII -> unchanged
  try {
    return Buffer.from(s, 'latin1').toString('utf8');
  } catch {
    return s;
  }
}

function parseDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const iso = s.replace(' ', 'T').replace(/(\.\d{3})\d*/, '$1');
  const d = new Date(`${iso}Z`);
  return isNaN(d.getTime()) ? undefined : d;
}

function clean(s: string | null): string | null {
  if (s == null) return null;
  const t = s.trim();
  return t === '' || t === '<blank>' ? null : t;
}

/** Tokenize the `VALUES (...),(...);` portion of a mysqldump INSERT. */
function parseInsertValues(sql: string): (string | null)[][] {
  const marker = sql.indexOf('VALUES');
  if (marker === -1) return [];
  const body = sql.slice(marker + 'VALUES'.length);
  const rows: (string | null)[][] = [];
  let i = 0;
  const n = body.length;

  while (i < n) {
    while (i < n && body[i] !== '(') {
      if (body[i] === ';') return rows;
      i++;
    }
    if (i >= n) break;
    i++; // consume '('
    const row: (string | null)[] = [];

    while (i < n) {
      while (i < n && /\s/.test(body[i])) i++;
      if (body[i] === ')') {
        i++;
        break;
      }
      let value: string | null;
      if (body[i] === "'") {
        i++;
        let s = '';
        while (i < n) {
          const ch = body[i];
          if (ch === '\\') {
            s += body[i + 1] ?? '';
            i += 2;
            continue;
          }
          if (ch === "'") {
            if (body[i + 1] === "'") {
              s += "'";
              i += 2;
              continue;
            }
            i++;
            break;
          }
          s += ch;
          i++;
        }
        value = s;
      } else {
        let s = '';
        while (i < n && body[i] !== ',' && body[i] !== ')') {
          s += body[i];
          i++;
        }
        s = s.trim();
        value = s.toUpperCase() === 'NULL' ? null : s;
      }
      row.push(value);
      while (i < n && /\s/.test(body[i])) i++;
      if (body[i] === ',') {
        i++;
        continue;
      }
      if (body[i] === ')') {
        i++;
        break;
      }
    }
    rows.push(row);
  }
  return rows;
}

function toAge(raw: string | null): number | null {
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toInt(raw: string | null): number | null {
  if (raw == null) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
}

function mapStatus(raw: string | null): ApplicationStatus {
  const v = (raw ?? '').trim().toLowerCase();
  if (v === 'new' || v === '') return ApplicationStatus.New;
  // Future-proof: accept any known status label.
  if (v === 'in work') return ApplicationStatus.InWork;
  if (v === 'agree' || v === 'aggre') return ApplicationStatus.Agree;
  if (v === 'disaggre') return ApplicationStatus.Disaggre;
  if (v === 'dubbing') return ApplicationStatus.Dubbing;
  return ApplicationStatus.New;
}

// ----------------------------- seeding -----------------------------

async function seedAdmin() {
  const email = 'admin@gmail.com';
  const password = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email },
    update: { password, isActive: true, role: Role.admin },
    create: { email, password, name: 'Admin', role: Role.admin, isActive: true },
  });
  console.log('✔ admin user ready (admin@gmail.com / admin)');
}

async function seedOrders() {
  const existing = await prisma.application.count();
  if (existing > 0) {
    console.log(`↷ applications already present (${existing}); skipping dump import`);
    return;
  }

  const sql = readFileSync(join(__dirname, 'orders.sql'), 'utf8');
  const rows = parseInsertValues(sql);
  console.log(`Parsed ${rows.length} rows from orders.sql`);

  // 1) Upsert the distinct (name, type, format) course combinations.
  const courseKey = (name: string, type: string, format: string) => `${name}|${type}|${format}`;
  const courseIdByKey = new Map<string, string>();

  for (const r of rows) {
    const name = clean(r[6]);
    const format = clean(r[7]);
    const type = clean(r[8]);
    if (
      !name || !type || !format ||
      !COURSE_NAMES.includes(name) ||
      !COURSE_TYPES.includes(type) ||
      !COURSE_FORMATS.includes(format)
    ) {
      continue;
    }
    const key = courseKey(name, type, format);
    if (courseIdByKey.has(key)) continue;
    const course = await prisma.course.upsert({
      where: {
        name_type_format: {
          name: name as CourseName,
          type: type as CourseType,
          format: format as CourseFormat,
        },
      },
      update: {},
      create: {
        name: name as CourseName,
        type: type as CourseType,
        format: format as CourseFormat,
      },
    });
    courseIdByKey.set(key, course.id);
  }
  console.log(`✔ ${courseIdByKey.size} distinct courses`);

  // 2) For each legacy row: one Client + one Application.
  let appCount = 0;
  for (const r of rows) {
    const createdAt = parseDate(r[11]);
    const name = clean(r[6]);
    const format = clean(r[7]);
    const type = clean(r[8]);
    const courseId =
      name && type && format ? courseIdByKey.get(courseKey(name, type, format)) ?? null : null;

    const client = await prisma.client.create({
      data: {
        name: fixEncoding(clean(r[1])),
        surname: fixEncoding(clean(r[2])),
        email: clean(r[3]),
        phone: clean(r[4]),
        age: toAge(r[5]),
        ...(createdAt ? { createdAt } : {}),
      },
    });

    await prisma.application.create({
      data: {
        clientId: client.id,
        courseId,
        status: mapStatus(r[14]),
        sum: toInt(r[9]),
        alreadyPaid: toInt(r[10]),
        utm: clean(r[12]),
        message: fixEncoding(clean(r[13])),
        ...(createdAt ? { createdAt } : {}),
      },
    });
    appCount++;
  }
  console.log(`✔ imported ${appCount} clients + applications`);
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
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
