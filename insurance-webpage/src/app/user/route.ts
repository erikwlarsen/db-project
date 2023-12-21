import { Pool } from 'pg';
import { hash, compare } from 'bcrypt';

const SALT_ROUNDS = 5;

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

// login
export async function PUT(request: Request) {
  const body = await request.json();
  const [user] = (await pool.query(`SELECT password FROM users WHERE email = '${body.email}';`)).rows;
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
  const [user] = (await pool.query(`
  INSERT INTO users (email, password)
  VALUES ('${body.email}', '${hashedPassword}')
  ON CONFLICT DO NOTHING
  RETURNING email;
  `)).rows;
  if (!user) {
    return Response.json({ msg: 'USER_ALREADY_EXISTS' }, { status: 400 });
  }
  return Response.json({ loggedIn: true });
};
// archive user
// export async function DELETE(request: Request) {

// };
