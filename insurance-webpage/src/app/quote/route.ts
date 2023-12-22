import { NextRequest } from 'next/server';
import { pool } from '../db';
import format from 'pg-format';

export const dynamic = 'force-dynamic';

const FACTOR_COST = 500;

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  const query = format(
    `SELECT q.* FROM quotes q
    JOIN customer USING (customer_id)
    JOIN users u USING (user_id)
    WHERE u.email = %L
    ORDER BY quote_id DESC;`,
    email
  );
  const quoteRows = (await pool.query(query)).rows;
  return Response.json(quoteRows.map(q => ({
    quoteId: q.quote_id,
    costPerMonth: q.cost_per_month,
    policyLength: q.policy_length,
    coverageAmount: q.coverage_amount,
    createdAt: q.created_at,
  })));
};

const getRelationDegree = (relation: string) => {
  switch(relation) {
    case 'self':
      return 0;
    case 'parent':
    case 'sibling':
      return 1;
    case 'aunt_or_uncle':
    case 'grandparent':
      return 2;
    default:
      return 3;
  }
};

type Factor = { name: string; deaths: number; relationDegree: number };

const getPolicyLengthMultiplier = (policyLength: number) => {
  return policyLength / 30;
};

const getCoverageAmountBase = (coverageAmount: number) => {
  const range = 1000;
  const maxAmount = 10000000;
  return coverageAmount / maxAmount * range;
};

const getAgeMultiplier = (age: number) => age / 35;

const getFactorCost = (factors: Factor[], totalDeaths: number) => {
  const totalFactorRatio = factors.reduce((acc, f) => acc + (f.deaths / totalDeaths) * (4 - f.relationDegree), 0);
  return totalFactorRatio * FACTOR_COST;
};

const calculateCost = (
  factors: Factor[],
  policyLength: number,
  coverageAmount: number,
  totalDeaths: number,
  dob: Date
) => {
  const thisYear = new Date().getFullYear();
  const birthYear = dob.getFullYear();
  const roughAge = thisYear - birthYear;
  const base = getCoverageAmountBase(coverageAmount);
  const ageMultiplier =  getAgeMultiplier(roughAge);
  const lengthMultiplier = getPolicyLengthMultiplier(policyLength);
  const factorCost = getFactorCost(factors, totalDeaths);
  return Math.floor(base * ageMultiplier * lengthMultiplier + factorCost);
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const hhQuery = format(
    `SELECT h.relation, i.name AS disease, c.cust_dob FROM health_history h
    JOIN customer c USING (customer_id)
    JOIN users u USING (user_id)
    JOIN infirmity i USING (infirmity_id)
    WHERE u.email = %L;`,
    body.email
  );
  const dobQuery = format(
    `SELECT cust_dob FROM customer
    JOIN users u USING (user_id)
    WHERE u.email = %L;`,
    body.email
  );
  const [healthHistoryResult, deathsResp, dobResult] = await Promise.all([
    pool.query(hhQuery),
    fetch(`${process.env.PYTHON_SERVER_URL}/deaths-prediction`),
    pool.query(dobQuery)
  ]);
  const { rows } = healthHistoryResult as { rows: { disease: string, relation: string }[] };
  const deathsPrediction: [string, number][] = Object.entries(await deathsResp.json());
  const zeroDeaths = ['', 0] as const;
  const factors = rows.map((h) => ({
    name: h.disease,
    deaths: (deathsPrediction.find(([name]) => name === h.disease) || zeroDeaths)[1],
    relationDegree: getRelationDegree(h.relation),
  }));
  const totalDeaths = deathsPrediction.reduce((acc, [, deaths]) => acc + deaths, 0);
  const dob = new Date(dobResult.rows[0].cust_dob);
  const costPerMonth = calculateCost(factors, body.policyLength, body.coverageAmount, totalDeaths, dob);
  const query = format(
    `INSERT INTO quotes (cost_per_month, customer_id, policy_length, coverage_amount, created_at)
    VALUES (
      %L,
      (SELECT customer_id FROM customer WHERE user_id = (
        SELECT user_id FROM users WHERE email = %L
      )),
      %L,
      %L,
      NOW()
    );`,
    costPerMonth,
    body.email,
    body.policyLength,
    body.coverageAmount
  );
  await pool.query(query);
  const selectQuery = format(
    `SELECT q.* FROM quotes q
    JOIN customer USING (customer_id)
    JOIN users u USING (user_id)
    WHERE u.email = %L
    ORDER BY quote_id DESC;`,
    body.email
  );
  const quoteRows = (await pool.query(selectQuery)).rows;
  return Response.json(quoteRows.map(q => ({
    quoteId: q.quote_id,
    costPerMonth: q.cost_per_month,
    policyLength: q.policy_length,
    coverageAmount: q.coverage_amount,
    createdAt: q.created_at,
  })));
};
