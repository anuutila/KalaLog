'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorResponse, SignUpResponse } from '@/lib/types/responses';
import { showNotification } from '@/lib/notifications/notifications';
import { Button, Center, Container, Fieldset, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import Link from 'next/link';

export default function Page() {
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorResponse: ErrorResponse = await response.json();
        console.error('Error:', errorResponse);

        if (errorResponse.error === 'ValidationError' && errorResponse.details) {
          // Map validation errors to field errors
          const newFieldErrors: { [key: string]: string } = {};
          errorResponse.details.forEach((detail) => {
            const fieldName = detail.path[0] as string;
            newFieldErrors[fieldName] = detail.message;
          });
          setFieldErrors(newFieldErrors);
        } else {
          setError(errorResponse.message);
        }

        showNotification('error', errorResponse.message, { withTitle: true });
      } else {
        const signupResponse: SignUpResponse = await response.json();
        console.log(signupResponse.message);
        showNotification('success', signupResponse.message, { withTitle: false });
  
        // Redirect to login page after successful registration
        router.push('/login');
      }
    } catch (err) {
      console.error('An unexpected error occurred while signing up:', err);
      showNotification('error', 'An unexpected error occurred while signing up. Please try again later.', { withTitle: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maw={{ base: '20rem', md: '25rem' }} p="md" pt="xl">
      <Stack align="stretch">
        <Center mb="md">
          <Title order={3}>Rekisteröidy</Title>
        </Center>
        <Stack>
          <Fieldset variant="unstyled" disabled={loading}>
            <form onSubmit={handleSubmit}>
              <Stack gap="sm">
                <TextInput
                  size="md"
                  label="Käyttäjätunnus"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  error={fieldErrors.username} // Display validation error
                />
                <TextInput
                  size="md"
                  label="Etunimi"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.firstName}
                />
                <TextInput
                  size="md"
                  label="Sukunimi"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  error={fieldErrors.lastName}
                />
                <TextInput
                  size="md"
                  label="Sähköposti"
                  // type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  error={fieldErrors.email}
                />
                <PasswordInput
                  size="md"
                  label="Salasana"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={fieldErrors.password}
                />
                {error && <Text color="red" size="sm">{error}</Text>}
                <Button type="submit" size="md" mt="lg" loading={loading} loaderProps={{ type: 'dots' }}>
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
