'use client';

import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { ErrorResponse, LoginResponse, LogoutResponse } from '@/lib/types/responses';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { set } from 'mongoose';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const { jwtUserInfo, isLoggedIn, setIsLoggedIn, setJwtUserInfo } = useGlobalState();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
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

  return (
    <Container maw={{ base: '20rem', md: '25rem' }} p={'md'} pt={'xl'}>
      <Stack align='stretch'>
        <Center mb={'md'}>
          <Title order={3}>Kirjaudu sisään</Title>
        </Center>
        <Stack>
          <Fieldset variant='unstyled' disabled={isLoggedIn}>
            <form onSubmit={handleSubmit}>
              <Stack gap={'sm'}>
                <TextInput
                  size='md'
                  label="Email or Username"
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
                <PasswordInput
                  size='md'
                  label="Password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <Button type="submit" size='md' mt={'lg'} loading={loading} loaderProps={{ type: 'dots' }}>
                  Kirjaudu
                </Button>
              </Stack>
            </form>
          </Fieldset>
          <Stack align='center' lh={'xs'} ta={'center'} mt={'lg'}>
            <Text size='md'>
              Ei käyttäjää?<br />
              <Link href="/signup">
                <span style={{ color: '#0070f3', textDecoration: 'underline' }}>Rekisteröidy tästä</span>
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
