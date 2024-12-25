'use client';

import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { ErrorResponse, LoginResponse, LogoutResponse } from '@/lib/types/responses';
import { Container } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const { jwtUserInfo, isLoggedIn, setIsLoggedIn, setJwtUserInfo } = useGlobalState();

  const [formData, setFormData] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse.message, errorResponse.details);
        setError(errorResponse.message);
        showNotification('error', errorResponse.message, { withTitle: true });
      } else {
        const loginResponse: LoginResponse = await response.json();
        console.log(loginResponse.message);
        showNotification('success', loginResponse.message, { withTitle: true });

        // Update global state
        setIsLoggedIn(true);
        setJwtUserInfo(loginResponse.data);

        // Redirect to user page
        router.push('/user');
      }
    } catch (error) {
      console.error('Unexpected error logging in:', error);
      showNotification('error', 'An unexpected error occurred while logging in. Please try again later.', { withTitle: true });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', { method: 'POST' });

      if (response.ok) {
        const logoutResponse: LogoutResponse = await response.json();
        console.log(logoutResponse.message);
        showNotification('success', `${logoutResponse.message} See you later ${jwtUserInfo?.firstname}! 👋`, { withTitle: false });

        // Update global state
        setIsLoggedIn(false);
        setJwtUserInfo(null);

        // Redirect to the login page
        router.push('/login');
      } else {  
        const errorResponse: ErrorResponse = await response.json();
        console.error('Failed to log out:', errorResponse.message, errorResponse.details);
        showNotification('error', 'An unexpected error occurred while logging out. Please try again.', { withTitle: true });
      }
    } catch (error) {
      console.error('Unexpected error logging out:', error);
      showNotification('error', 'An unexpected error occurred while logging out. Please try again.', { withTitle: true });
    }
  };

  return (
    <Container>
      { !isLoggedIn && <div style={{ maxWidth: '400px', margin: '0 auto', padding: '1rem' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email or Username:</label>
            <input
              type="text"
              name="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1rem' }}>
          Don’t have an account?{' '}
          <Link href="/signup">
            <span style={{ color: '#0070f3', textDecoration: 'underline' }}>Register here</span>
          </Link>
        </p> 
      </div> }
      { isLoggedIn && <div><button onClick={handleLogout}>Log Out</button></div> }
    </Container>
  );
}
