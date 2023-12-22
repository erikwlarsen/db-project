import { NextRequest } from 'next/server';
import { pool } from '../db';
import format from 'pg-format';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const query = format(
    'SELECT * FROM customer c JOIN users u ON u.user_id = c.user_id WHERE email = %L;',
    email
  );
  const [customer] = (await pool.query(query)).rows;
  if (!customer) {
    return Response.json({ msg: 'CUSTOMER_NOT_FOUND' }, { status: 404 });
  }
  return Response.json({
    custFirstName: customer.cust_first_name,
    custLastName: customer.cust_last_name,
    custMiddleInitial: customer.cust_middle_initial,
    custDob: customer.cust_dob,
    custSsn: customer.ssn_tin,
    custSuffix: customer.cust_suffix,
  });
};

export async function POST(request: Request) {
  const body = await request.json();
  const args = [
    body.custLastName,
    body.custFirstName,
    body.custMiddleInitial,
    body.custSuffix,
    body.custDob,
    body.custSsn,
    body.email,
  ];
  const query = format(
    `INSERT INTO customer
      (cust_last_name, cust_first_name, cust_middle_initial, cust_suffix, cust_dob, ssn_tin, user_id)
    VALUES (
      %L, %L, %L, %L, %L, %L,
      (SELECT user_id FROM users WHERE email = %L)
    );`,
    ...args
  );
  await pool.query(query);
  return new Response('OK', { status: 201 });
};
