import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ErrorResponse } from '@/lib/types/responses';
import { CustomError } from './customError';

export const handleError = (
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred',
  defaultStatusCode: number = 500
): NextResponse<ErrorResponse> => {
  console.error('Error: ', error);

  let statusCode = defaultStatusCode;
  let errorCode = 'UnknownError'; // Default error code
  let message = defaultMessage; // Default message
  let details: any[] = []; // Additional error details

  if (error instanceof ZodError) {
    // Handle Zod validation errors
    errorCode = 'ValidationError';
    details = error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
    statusCode = 400;
  } else if (error instanceof CustomError) {
    // Handle custom errors
    errorCode = error.name;
    message = error.message || defaultMessage;
    details = [error.message];
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    // Handle generic errors
    errorCode = error.name;
    message = error.message || defaultMessage;
    details = [error.message];
  }
  const response: ErrorResponse = {
    errorCode,
    message,
    details,
  };

  return NextResponse.json<ErrorResponse>(response, { status: statusCode });
};
