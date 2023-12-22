import React, { useState, useEffect, FormEvent } from 'react';
import type { HealthHistory, PersonalInfo, Disease, Quote } from '@/app/types';
import { PersonalInfoDisplay } from '@/app/components/PersonalInfoDisplay';

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [hhLoading, setHhLoading] = useState(true);
  const [infoFilledOut, setInfoFilledOut] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>();
  const [healthHistory, setHealthHistory] = useState<HealthHistory[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const fetchData = async () => {
    const email = localStorage.getItem('email');
    const resp = await fetch(`/customer?email=${email}`);
    if (resp.status === 404) {
      setInfoFilledOut(false);
      setLoading(false);
    } else if (resp.status === 200) {
      const data = await resp.json();
      setPersonalInfo(data);
      setInfoFilledOut(true);
      setLoading(false);
    }
  };
  const fetchFamilyHealthHistory = async () => {
    const email = localStorage.getItem('email');
    const resp = await fetch(`/health-history?email=${email}`);
    const data = await resp.json();
    setHealthHistory(data);
    setHhLoading(false);
  };
  const fetchAllDiseases = async () => {
    const resp = await fetch('/disease');
    const data = await resp.json();
    setDiseases(data);
    setDiseasesLoading(false);
  };
  const fetchQuotes = async () => {
    const email = localStorage.getItem('email');
    const resp = await fetch(`/quote?email=${email}`);
    const data = await resp.json();
    setQuotes(data);
    setQuotesLoading(false);
  };
  useEffect(() => {
    fetchData();
    fetchFamilyHealthHistory();
    fetchAllDiseases();
    fetchQuotes();
  }, []);
  const submitPersonalInfo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = localStorage.getItem('email');
    const custFirstName = formData.get('custFirstName') as string;
    const custLastName = formData.get('custLastName') as string;
    const custMiddleInitial = formData.get('custMiddleInitial') as string;
    const custSuffix = formData.get('custSuffix') as string;
    const custSsn = formData.get('custSsn') as string;
    const custDob = formData.get('custDob') as string;
    const resp = await fetch('/customer', {
      method: 'POST',
      body: JSON.stringify({
        email,
        custFirstName,
        custLastName,
        custMiddleInitial,
        custSuffix,
        custSsn,
        custDob,
      }),
      headers: { 'content-type': 'application/json' },
    });
    if (resp.ok) {
      setPersonalInfo({
        custFirstName,
        custLastName,
        custMiddleInitial,
        custSuffix,
        custSsn,
        custDob,
      });
      setInfoFilledOut(true);
      setLoading(false);
    }
  };
  const submitHealthHistory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHhLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = localStorage.getItem('email');
    const cdcCode = formData.get('disease') as string;
    const relation = formData.get('relation') as string;
    const resp = await fetch('/health-history', {
      method: 'POST',
      body: JSON.stringify({
        email,
        cdcCode,
        relation,
      }),
      headers: { 'content-type': 'application/json' },
    });
    if (resp.ok) {
      setHealthHistory(await resp.json());
      setHhLoading(false);
    }
  };
  const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setQuotesLoading(true);
    const formData = new FormData(event.currentTarget);
    const email = localStorage.getItem('email');
    const policyLength = formData.get('policyLength') as string;
    const coverageAmount = formData.get('coverageAmount') as string;
    const resp = await fetch('/quote', {
      method: 'POST',
      body: JSON.stringify({
        email,
        policyLength: Number(policyLength),
        coverageAmount: Number(coverageAmount),
      }),
      headers: { 'content-type': 'application/json' },
    });
    if (resp.ok) {
      setQuotes(await resp.json());
      setQuotesLoading(false);
    }
  };
  return (
    <div>
      <h1>Larsen Insurance Home Page</h1>
      <h2>Personal information</h2>
      {loading ? <p>Loading...</p> : (
        infoFilledOut && personalInfo
        ? <PersonalInfoDisplay info={personalInfo} />
        : <form onSubmit={submitPersonalInfo}>
          <p>First name</p>
          <input required={true} type="text" name="custFirstName" />
          <p>Last name</p>
          <input required={true} type="text" name="custLastName" />
          <p>Middle initial</p>
          <input required={true} type="text" name="custMiddleInitial" />
          <p>Suffix</p>
          <input required={true} type="text" name="custSuffix" />
          <p>SSN</p>
          <input required={true} type="text" name="custSsn" />
          <p>Date of birth</p>
          <input required={true} type="date" name="custDob" />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Submit'}
          </button>
        </form>
      )}
      <h2>Family Health History</h2>
        {healthHistory.map((item) => (
          <p key={item.health_history_id}>
            <span><b>Relation: </b>{item.relation}</span>&nbsp;
            <span><b>Disease: </b>{item.disease}</span>
          </p>
        ))}
      <h3>Add to health history:</h3>
      <form onSubmit={submitHealthHistory}>
        <p>Relation type:</p>
        <select required={true} name="relation">
          <option value="self">self</option>
          <option value="parent">parent</option>
          <option value="sibling">sibling</option>
          <option value="grandparent">grandparent</option>
          <option value="aunt_or_uncle">aunt or uncle</option>
          <option value="cousin">cousin</option>
        </select>
        <p>Disease:</p>
        {diseasesLoading
          ? <p>Loading...</p>
          : <select required={true} name="disease">
            {diseases.map(d => <option key={d.cdcCode} value={d.cdcCode}>{d.name}</option>)}
          </select>
        }
        <button type="submit" disabled={hhLoading}>
          {hhLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      <h2>Get a quote</h2>
      
      {/* Please choose any of the items below that are in your family's health history */}
      {/* then, calculate estimated 2023 death rates based on those items. Get %
      of total death rates from those. Then somehow derive a life insurance cost from that.
      Save quotes and display them in a little list */}
      {/*  */}
      <form onSubmit={submitQuote}>
        <p>Coverage amount:</p>
        <select required={true} name="coverageAmount">
          <option value="100000">$100,000</option>
          <option value="250000">$250,000</option>
          <option value="500000">$500,000</option>
          <option value="750000">$750,000</option>
          <option value="1000000">$1,000,000</option>
          <option value="2000000">$2,000,000</option>
          <option value="5000000">$5,000,000</option>
          <option value="10000000">$10,000,000</option>
        </select>
        <p>Disease:</p>
        <select required={true} name="policyLength">
          <option value="10">10 years</option>
          <option value="15">15 years</option>
          <option value="20">20 years</option>
          <option value="25">25 years</option>
          <option value="30">30 years</option>
          <option value="35">35 years</option>
          <option value="40">40 years</option>
        </select>
        <button type="submit" disabled={quotesLoading}>
          {hhLoading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      <h3>Past quotes</h3>
      {quotesLoading ? 'Loading...' :
      <table>
        <thead>
          <tr>
            <th>Date created</th>
            <th>Cost per month</th>
            <th>Policy length</th>
            <th>Coverage amount</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.quoteId}>
              <td>{new Date(q.createdAt).toLocaleString('en-US')}</td>
              <td>${q.costPerMonth}</td>
              <td>{q.policyLength} years</td>
              <td>${q.coverageAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>}
    </div>
  );
};
