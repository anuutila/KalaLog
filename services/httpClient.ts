import { ErrorResponse } from '@/lib/types/responses';
import { CustomError } from '@/lib/utils/customError';

export class HttpClientError extends CustomError {
  public errorCode: string;
  public details?: any[];

  constructor(errorCode: string, message: string, statusCode: number, details?: any[]) {
    super(message, statusCode);
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'HttpClientError';
  }
}

export async function httpClient<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    // Parse the error response
    const errorResponse: ErrorResponse = await response.json();
    throw new HttpClientError(errorResponse.errorCode, errorResponse.message, response.status, errorResponse.details);
  }

  // Return the parsed response body
  return response.json();
}
