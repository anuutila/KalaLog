'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconLock, IconLogin2, IconUser } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { useGlobalState } from '@/context/GlobalState';
import { showNotification } from '@/lib/notifications/notifications';
import { LoginResponse } from '@/lib/types/responses';
import { handleApiError } from '@/lib/utils/handleApiError';
import { login } from '@/services/api/authservice';

export default function Page() {
  const { isLoggedIn, setIsLoggedIn, setJwtUserInfo } = useGlobalState();
  const t = useTranslations('LoginPage');
  const tAll = useTranslations();

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginResponse: LoginResponse = await login(emailOrUsername, password);
      console.log(loginResponse.message);
      showNotification('success', loginResponse.message, tAll, { withTitle: false });

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
    <Container size="xs" px="md" py="xl">
      <Stack align="stretch">
        <Center mb="md">
          <Title order={2} c="white">
            {t('Title')}
          </Title>
        </Center>
        <Stack>
          <Fieldset variant="default" radius="md" pt="md" disabled={isLoggedIn ?? false}>
            <form onSubmit={handleSubmit}>
              <Stack gap="lg">
                <TextInput
                  size="md"
                  label={t('UsernameOrEmail')}
                  placeholder={t('UsernameOrEmail')}
                  type="text"
                  name="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  required
                  leftSection={<IconUser size={20} />}
                  leftSectionPointerEvents="none"
                />
                <PasswordInput
                  size="md"
                  label={t('Password')}
                  placeholder={t('Password')}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  leftSection={<IconLock size={20} />}
                  leftSectionPointerEvents="none"
                />
                <Button
                  leftSection={<IconLogin2 />}
                  type="submit"
                  size="md"
                  my="xs"
                  radius="md"
                  loading={loading}
                  loaderProps={{ type: 'dots' }}
                  disabled={!password || !emailOrUsername}
                >
                  {t('Login')}
                </Button>
              </Stack>
            </form>
          </Fieldset>
          <Stack align="center" lh="xs" ta="center" mt="lg">
            <Text size="md">
              {t('NoAccount')}
              <br />
              <Link href="/signup">
                <span style={{ color: '#0070f3', textDecoration: 'underline' }}>{t('Register')}</span>
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
