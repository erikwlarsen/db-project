import React, { useState, useEffect, FormEvent } from 'react';
import type { HealthHistory, PersonalInfo, Disease } from '@/app/types';
import { PersonalInfoDisplay } from '@/app/components/PersonalInfoDisplay';

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [hhLoading, setHhLoading] = useState(true);
  const [infoFilledOut, setInfoFilledOut] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>();
  const [healthHistory, setHealthHistory] = useState<HealthHistory[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [diseasesLoading, setDiseasesLoading] = useState(true);
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
  useEffect(() => {
    fetchData();
    fetchFamilyHealthHistory();
    fetchAllDiseases();
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
      {/* this is where they fill out the data that goes in the customer table */}
      {/* require this data to get a quote */}
      {/* Maybe they add their family health history here, and can update quotes based on updates to health history */}
      <h2>Get a quote</h2>

      {/* Please choose any of the items below that are in your family's health history */}
      {/* then, calculate estimated 2023 death rates based on those items. Get %
      of total death rates from those. Then somehow derive a life insurance cost from that.
      Save quotes and display them in a little list */}
      {/*  */}
    </div>
  );
};
