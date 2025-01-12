'use client';

import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { LoginResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { login } from '@/services/api/authservice';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconLock, IconLogin, IconUser } from '@tabler/icons-react';
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
    <Container size={'md'} px={'md'} py={'xl'}>
      <Stack align='stretch'>
        <Center mb={'md'}>
          <Title order={2} c={'white'}>Kirjaudu sisään</Title>
        </Center>
        <Stack>
          <Fieldset variant='default' radius={'md'} pt={'md'} disabled={isLoggedIn}>
            <form onSubmit={handleSubmit}>
              <Stack gap={'lg'}>
                <TextInput
                  size='md'
                  label="Käyttäjätunnus tai sähköposti"
                  placeholder='Käyttäjätunnus tai sähköposti'
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  leftSection={<IconUser size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <PasswordInput
                  size='md'
                  label="Salasana"
                  name="password"
                  placeholder='Salasana'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftSection={<IconLock size={20}/>}
                  leftSectionPointerEvents='none'
                />
                
                {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
                <Button 
                  leftSection={<IconLogin />} 
                  type="submit" 
                  size='md' 
                  my={'xs'}
                  radius={'md'}
                  loading={loading} 
                  loaderProps={{ type: 'dots' }}
                  disabled={!password || !emailOrUsername}
                >
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
