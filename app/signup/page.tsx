'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorResponse, SignUpResponse } from '@/lib/types/responses';
import { showNotification } from '@/lib/notifications/notifications';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';
import { signup } from '@/services/api/authservice';
import { HttpClientError } from '@/services/httpClient';
import { handleApiError } from '@/lib/utils/handleApiError';
import { IconAt, IconLock, IconUser } from '@tabler/icons-react';

export default function Page() {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isFormValid, setIsFormValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
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
    setError(null);

    try {
      const signupResponse: SignUpResponse = await signup(formData);
      const linkedCatchesCount = signupResponse.data.linkedCatchesCount;
      const linkedName = signupResponse.data.linkedName;
      console.log(signupResponse.message, 'linkedCatchesCount:', linkedCatchesCount);

      const message = linkedCatchesCount > 0 
        ? `${signupResponse.message}. Linked ${linkedCatchesCount} catches caught by ${linkedName} to the new account.` 
        : signupResponse.message;

      showNotification('success', message, { withTitle: false, duration: linkedCatchesCount > 0 ? 10000 : 4000 });

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
    setIsFormValid(formRef.current?.checkValidity() ?? false)
  };

  return (
    <Container size={'xs'} px="md" py="xl">
      <Stack align="stretch">
        <Center mb="md">
          <Title order={2} c={'white'}>Rekisteröidy</Title>
        </Center>
        <Stack>
          <Fieldset variant="default" radius={'md'} pt={'md'} disabled={loading}>
            <form onSubmit={handleSubmit} onChange={handleFormChange} ref={formRef}>
              <Stack gap="md">
                <TextInput
                  size="md"
                  label="Käyttäjätunnus"
                  placeholder="Käyttäjätunnus"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  error={fieldErrors.username} // Display validation error
                  leftSection={<IconUser size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <TextInput
                  size="md"
                  label="Etunimi"
                  name="firstName"
                  placeholder='Etunimi'
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.firstName}
                  leftSection={<IconUser size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <TextInput
                  size="md"
                  label="Sukunimi"
                  name="lastName"
                  placeholder='Sukunimi'
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.lastName}
                  leftSection={<IconUser size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <TextInput
                  size="md"
                  label="Sähköposti"
                  // type="email"
                  name="email"
                  placeholder='Sähköposti'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={fieldErrors.email}
                  leftSection={<IconAt size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <PasswordInput
                  size="md"
                  label="Salasana"
                  name="password"
                  placeholder="Salasana"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={fieldErrors.password}
                  leftSection={<IconLock size={20}/>}
                  leftSectionPointerEvents='none'
                />
                <PasswordInput
                  size="md"
                  label="Vahvista salasana"
                  name="confirmPassword"
                  placeholder="Vahvista salasana"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  leftSection={<IconLock size={20}/>}
                  leftSectionPointerEvents="none"
                  error={formData.confirmPassword && formData.password !== formData.confirmPassword ? 'Salasanat eivät täsmää' : null}
                />
                {/* {error && <Text color="red" size="sm">{error}</Text>} */}
                <Button my={'xs'} radius={'md'} type="submit" size="md" loading={loading} loaderProps={{ type: 'dots' }} disabled={!isFormValid || formData.password !== formData.confirmPassword}>
                  Rekisteröidy
                </Button>
              </Stack>
            </form>
          </Fieldset>
          <Stack align="center" lh="xs" ta="center" mt="lg">
            <Text size="md">
              Onko sinulla jo käyttäjätili?<br />
              <Link href="/login">
                <span style={{ color: '#0070f3', textDecoration: 'underline' }}>Kirjaudu sisään tästä</span>
              </Link>
            </Text>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
