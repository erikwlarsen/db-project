export const dynamic = 'force-dynamic';

type PyDisease = { name: string; cdc_code: string; };

export async function GET(
  _request: Request
) {
  const resp = await fetch(`${process.env.PYTHON_SERVER_URL}/infirmities`);
  const data = await resp.json();
  return Response.json(data.map((d: PyDisease) => ({ name: d.name, cdcCode: d.cdc_code })));
};
