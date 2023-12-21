import React, { useState, useEffect, FormEvent } from 'react';
import type { PersonalInfo } from '@/app/types';
import { PersonalInfoDisplay } from '@/app/components/PersonalInfoDisplay';

export default function Landing() {
  const [loading, setLoading] = useState(true);
  const [infoFilledOut, setInfoFilledOut] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>();
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
  useEffect(() => {
    fetchData();
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
  return (
    <div>
      <h1>LANDING PAGE</h1>
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
      <form>

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
