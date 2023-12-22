export type PersonalInfo = {
  custFirstName: string;
  custLastName: string;
  custMiddleInitial: string;
  custDob: string;
  custSsn: string;
  custSuffix: string;
};

export type HealthHistory = {
  relation: string;
  disease: string;
  health_history_id: number;
};

export type Disease = {
  name: string;
  cdcCode: string;
};

export type Quote = {
  quoteId: number;
	costPerMonth: number;
	policyLength: number;
	coverageAmount: number;
	createdAt: string;
};
