export async function GET(
  _request: Request
) {
  const resp = await fetch(`${process.env.PYTHON_SERVER_URL}/get-deaths-prediction`);
  const data = await resp.json();
  return Response.json({ data });
};
