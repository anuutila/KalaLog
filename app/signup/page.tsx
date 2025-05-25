'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconAt, IconLock, IconUser, IconUserPlus } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import { showNotification } from '@/lib/notifications/notifications';
import { SignUpResponse } from '@/lib/types/responses';
import { UserRole } from '@/lib/types/user';
import { handleApiError } from '@/lib/utils/handleApiError';
import { signup } from '@/services/api/authservice';
import { HttpClientError } from '@/services/httpClient';

export default function Page() {
  const tAll = useTranslations();
  const t = useTranslations('SignupPage');
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.VIEWER, // Default role
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name]: '', // Clear error for this field when user types
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const signupResponse: SignUpResponse = await signup(formData);
      const linkedCatchesCount = signupResponse.data.linkedCatchesCount;
      const linkedName = signupResponse.data.linkedName;
      console.log(signupResponse.message, 'linkedCatchesCount:', linkedCatchesCount);

      const message =
        linkedCatchesCount > 0
          ? `${signupResponse.message}. Linked ${linkedCatchesCount} catches caught by ${linkedName} to the new account.`
          : signupResponse.message;

      showNotification('success', message, tAll, { withTitle: false, duration: linkedCatchesCount > 0 ? 10000 : 4000 });

      // Redirect to login page after successful registration
      router.push('/login');
    } catch (error) {
      if (error instanceof HttpClientError && error.errorCode === 'ValidationError' && error.details) {
        // Map validation errors to field errors
        const newFieldErrors: { [key: string]: string } = {};
        error.details.forEach((detail) => {
          const fieldName = detail.path[0] as string;
          newFieldErrors[fieldName] = detail.message;
        });
        setFieldErrors(newFieldErrors); // Update form field errors
      } else {
        handleApiError(error); // Centralized handling for other errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = () => {
    setIsFormValid(formRef.current?.checkValidity() ?? false);
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
          <Fieldset variant="default" radius="md" pt="md" disabled={loading}>
            <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
              <Stack gap="md">
                <TextInput
                  size="md"
                  label={t('Username')}
                  placeholder={t('Username')}
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  error={fieldErrors.username} // Display validation error
                  leftSection={<IconUser size={20} />}
                  leftSectionPointerEvents="none"
                />
                <TextInput
                  size="md"
                  label={t('FirstName')}
                  placeholder={t('FirstName')}
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.firstName}
                  leftSection={<IconUser size={20} />}
                  leftSectionPointerEvents="none"
                />
                <TextInput
                  size="md"
                  label={t('LastName')}
                  placeholder={t('LastName')}
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.lastName}
                  leftSection={<IconUser size={20} />}
                  leftSectionPointerEvents="none"
                />
                <TextInput
                  size="md"
                  label={t('Email')}
                  // type="email"
                  name="email"
                  placeholder={t('Email')}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={fieldErrors.email}
                  leftSection={<IconAt size={20} />}
                  leftSectionPointerEvents="none"
                />
                <PasswordInput
                  size="md"
                  label={t('Password')}
                  placeholder={t('Password')}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={fieldErrors.password}
                  leftSection={<IconLock size={20} />}
                  leftSectionPointerEvents="none"
                />
                <PasswordInput
                  size="md"
                  label={t('ConfirmPassword')}
                  placeholder={t('ConfirmPassword')}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  leftSection={<IconLock size={20} />}
                  leftSectionPointerEvents="none"
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? t('PasswordMismatch')
                      : null
                  }
                />
                <Button
                  leftSection={<IconUserPlus />}
                  my="xs"
                  radius="md"
                  type="submit"
                  size="md"
                  loading={loading}
                  loaderProps={{ type: 'dots' }}
                  disabled={!isFormValid || formData.password !== formData.confirmPassword}
                >
                  {t('Signup')}
                </Button>
              </Stack>
            </form>
          </Fieldset>
          <Stack align="center" lh="xs" ta="center" mt="lg">
            <Text size="md">
              {t('AlreadyHaveAccount')}
              <br />
              <Link href="/login">
                <span style={{ color: '#0070f3', textDecoration: 'underline' }}>{t('Login')}</span>
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
