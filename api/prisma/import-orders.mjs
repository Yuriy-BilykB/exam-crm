import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as mariadb from 'mariadb';

const dumpPath = fileURLToPath(new URL('./orders.sql', import.meta.url));
const source = new TextDecoder('utf-8', { fatal: true }).decode(readFileSync(dumpPath));
const inserts = source.split(/\r?\n/).filter((line) => line.startsWith('INSERT INTO `orders` VALUES '));

if (inserts.length !== 1 || !inserts[0].endsWith(';') || !/[А-Яа-яІіЇїЄєҐґ]/u.test(inserts[0])) {
  throw new Error('orders.sql must contain one complete UTF-8 orders INSERT with Cyrillic data');
}

// The source has 15 legacy columns; the current table also has manager_id and group_id.
const columns = [
  'id', 'name', 'surname', 'email', 'phone', 'age', 'course', 'course_format',
  'course_type', 'sum', 'alreadyPaid', 'created_at', 'utm', 'msg', 'status',
];
const insert = inserts[0].replace(
  'INSERT INTO `orders` VALUES ',
  `INSERT INTO \`orders\` (${columns.map((column) => `\`${column}\``).join(', ')}) VALUES `,
);

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('Set DATABASE_URL in api/.env');
const target = new URL(databaseUrl);
if (target.protocol !== 'mysql:') throw new Error('DATABASE_URL must use mysql://');

const apply = process.argv.slice(2).includes('--apply');
if (process.argv.slice(2).some((arg) => arg !== '--apply')) {
  throw new Error('Usage: npm run db:import-orders -- [--apply]');
}

const connection = await mariadb.createConnection({
  host: target.hostname,
  port: Number(target.port || 3306),
  user: decodeURIComponent(target.username),
  password: decodeURIComponent(target.password),
  database: target.pathname.slice(1),
  charset: 'utf8mb4',
});

let inTransaction = false;
try {
  await connection.query('SET NAMES utf8mb4');
  const fields = await connection.query('SHOW COLUMNS FROM `orders`');
  const existingColumns = new Set(fields.map((field) => field.Field));
  const requiredColumns = [...columns, 'manager_id', 'group_id'];
  if (requiredColumns.some((column) => !existingColumns.has(column))) {
    throw new Error('Target orders table does not match the current Prisma schema');
  }

  const [{ count: before }] = await connection.query('SELECT COUNT(*) AS count FROM `orders`');
  console.log(`Target: ${target.hostname}/${target.pathname.slice(1)}; existing orders: ${before}`);
  if (!apply) {
    console.log('Source: api/prisma/orders.sql; run with --apply to replace orders.');
  } else {
    await connection.beginTransaction();
    inTransaction = true;
    // Comments on replaced orders are removed by the orders foreign key cascade.
    await connection.query('DELETE FROM `orders`');
    const result = await connection.query(insert);
    const [{ count, firstId, lastId }] = await connection.query(
      'SELECT COUNT(*) AS count, MIN(`id`) AS firstId, MAX(`id`) AS lastId FROM `orders`',
    );
    const samples = await connection.query(
      'SELECT `id`, `surname`, `msg` FROM `orders` WHERE `id` IN (3, 490) ORDER BY `id`',
    );
    if (
      Number(result.affectedRows) !== 500 || Number(count) !== 500 ||
      Number(firstId) !== 1 || Number(lastId) !== 500 ||
      samples[0]?.surname !== 'бонато' ||
      samples[1]?.msg !== 'Чи є ще можливість попасти на курс 06.06?'
    ) {
      throw new Error('Imported order count or UTF-8 sample does not match the source dump');
    }
    await connection.commit();
    inTransaction = false;
    console.log('Imported 500 orders with verified Cyrillic data.');
  }
} catch (error) {
  if (inTransaction) await connection.rollback();
  throw error;
} finally {
  await connection.end();
}
