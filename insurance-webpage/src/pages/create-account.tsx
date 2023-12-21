import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent } from 'react';

export default function CreateAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [showUserExists, setShowUserExists] = useState(false);
  const router = useRouter();
 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts
 
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get('email');
      const response = await fetch('/user', {
        method: 'POST',
        body: JSON.stringify({ email, password: formData.get('password') }),
        headers: { 'content-type': 'application/json' },
      });
      if (response.status === 400) {
        setShowUserExists(true);
      }
      // Handle response if necessary
      const data = await response.json()
      if (data.loggedIn) {
        localStorage.setItem('email', String(email));
        router.push('/landing');
      }
    } catch (error) {
      // Handle error if necessary
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }
  return <main className="flex min-h-screen flex-col items-center justify-between p-24">
    <h1>Create an account</h1>
    <form onSubmit={onSubmit}>
      <p>Email</p>
      <input type="text" name="email" />
      <p>Password</p>
      <input type="password" name="password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      <p hidden={!showUserExists}>There is already an account registered with that email. Please click the link below to log in, or use a different email.</p>
      <p><Link href="/login">Already have an account? Log in here.</Link></p>
    </form>
  </main>
};
