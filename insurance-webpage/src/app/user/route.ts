import { pool } from '../db';
import { hash, compare } from 'bcrypt';
import format from 'pg-format';

const SALT_ROUNDS = 5;

// login
export async function PUT(request: Request) {
  const body = await request.json();
  const query = format('SELECT password FROM users WHERE email = %L;', body.email);
  const [user] = (await pool.query(query)).rows;
  if (!user) {
    return Response.json({ msg: 'USER_NOT_FOUND' }, { status: 404 });
  }
  const passwordsMatch = await compare(body.password, user.password);
  if (!passwordsMatch) {
    return Response.json({ msg: 'INVALID_PASSWORD' }, { status: 401 });
  }
  return Response.json({ loggedIn: true });
};
// create user
export async function POST(request: Request) {
  const body = await request.json();
  const hashedPassword = await hash(body.password, SALT_ROUNDS);
  const query = format(
    'INSERT INTO users (email, password) VALUES (%L, %L) ON CONFLICT DO NOTHING RETURNING email;',
    body.email,
    hashedPassword
  );
  const [user] = (await pool.query(query)).rows;
  if (!user) {
    return Response.json({ msg: 'USER_ALREADY_EXISTS' }, { status: 400 });
  }
  return Response.json({ loggedIn: true });
};
// archive user
// export async function DELETE(request: Request) {

// };
