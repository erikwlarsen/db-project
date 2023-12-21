import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, FormEvent } from 'react';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showWrongPassword, setShowWrongPassword] = useState(false);
  const router = useRouter();
 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true) // Set loading to true when the request starts
 
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch('/user', {
        method: 'PUT',
        body: JSON.stringify({ email: formData.get('email'), password: formData.get('password') }),
        headers: { 'content-type': 'application/json' },
      });
      if (response.status === 404) {
        setShowWrongPassword(false);
        setShowCreateAccount(true);
      } else if (response.status === 401) {
        setShowCreateAccount(false);
        setShowWrongPassword(true);
      }
      // Handle response if necessary
      const data = await response.json()
      if (data.loggedIn) {
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
    <h1>Login</h1>
    <form onSubmit={onSubmit}>
      <p>Email</p>
      <input type="text" name="email" />
      <p>Password</p>
      <input type="password" name="password" />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </button>
      <p hidden={!showCreateAccount}>Account not found. Please create an account by clicking the link below.</p>
      <p hidden={!showWrongPassword}>Invalid password. Please try again.</p>
      <p><Link href="/create-account">New here? Create an account to get started.</Link></p>
    </form>
  </main>
};
