import { NextRequest } from 'next/server';
import { pool } from '../db';
import format from 'pg-format';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const query = format(
    `SELECT h.*, i.name AS disease FROM health_history h
    JOIN customer c USING (customer_id)
    JOIN users u USING (user_id)
    JOIN infirmity i USING (infirmity_id)
    WHERE u.email = %L;`,
    email
  );
  const healthHistory = (await pool.query(query)).rows;
  return Response.json(healthHistory);
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const query = format(
    `INSERT INTO health_history (relation, infirmity_id, customer_id)
    VALUES (
      %L,
      (SELECT infirmity_id FROM infirmity WHERE cdc_cod_code = %L),
      (SELECT customer_id FROM customer WHERE user_id = (
        SELECT user_id FROM users WHERE email = %L
      ))
    );`,
    body.relation,
    body.cdcCode,
    body.email
  );
  await pool.query(query);
  const selectQuery = format(
    `SELECT h.*, i.name AS disease FROM health_history h
    JOIN customer c USING (customer_id)
    JOIN users u USING (user_id)
    JOIN infirmity i USING (infirmity_id)
    WHERE u.email = %L;`,
    body.email
  );
  const healthHistory = (await pool.query(selectQuery)).rows;
  return Response.json(healthHistory);
};
