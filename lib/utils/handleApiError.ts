import { HttpClientError } from '@services/httpClient';
import { showNotification } from '../notifications/notifications';

export function handleApiError(error: unknown, context?: string): void {
  if (error instanceof HttpClientError) {
    console.error(`[${context || 'API Error'}]: `, error.errorCode, error.message, error.details);

    // Show error notification
    showNotification('error', error.message, { withTitle: true });

    // Handle validation errors
    if (error.errorCode === 'ValidationError' && error.details) {
      error.details.forEach((detail) => {
        console.error(`Validation Error [${detail.path}]: ${detail.message}`);
      });
    }
  } else {
    console.error(`[${context || 'Unexpected Error'}]: `, error);

    // Show fallback notification with context
    const message = context
      ? `An unexpected error occurred during ${context}. Please try again later.`
      : 'An unexpected error occurred. Please try again later.';

    showNotification('error', message, { withTitle: true });
  }
}
