'use client';

import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { ErrorResponse, LoginResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { login } from '@/services/api/authservice';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Page() {
  const { isLoggedIn, setIsLoggedIn, setJwtUserInfo } = useGlobalState();

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
      const loginResponse: LoginResponse = await login(emailOrUsername, password);
      console.log(loginResponse.message);
      showNotification('success', loginResponse.message, { withTitle: false });

      // Update global state
      setIsLoggedIn(true);
      setJwtUserInfo(loginResponse.data);

      // Redirect to user page
      router.push('/user');
    } catch (error) {
      handleApiError(error, 'login');
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
                  label="Käyttäjätunnus tai sähköposti"
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                />
                <PasswordInput
                  size='md'
                  label="Salasana"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
                <Button type="submit" size='md' mt={'lg'} loading={loading} loaderProps={{ type: 'dots' }}>
                  Kirjaudu
                </Button>
              </Stack>
            </form>
          </Fieldset>
          <Stack align='center' lh={'xs'} ta={'center'} mt={'lg'}>
            <Text size='md'>
              Ei vielä käyttäjätiliä?<br />
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
