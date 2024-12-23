import { NextResponse } from 'next/server';
import { ErrorResponse } from '@/lib/types/responses';
import { ZodError } from 'zod';
import { CustomError } from './customError';

export const handleError = (
  error: unknown,
  message: string = 'An unexpected error occurred',
  statusCode: number = 500
): NextResponse<ErrorResponse> => {
  console.error('Error: ', error);

  let errorCode = 'UnknownError'; // Default error code
  let details: any[] = []; // Default empty details array

  if (error instanceof ZodError) {
    errorCode = 'ValidationError';
    details = error.errors.map((e) => ({
      path: e.path,
      message: e.message,
    }));
    message = 'Validation failed';
    statusCode = 400;
  } else if (error instanceof CustomError) {
    errorCode = error.name;
    details = [error.message];
    statusCode = error.statusCode;
  } else if (error instanceof Error) {
    // Handle general errors
    errorCode = error.name;
    details = [error.message];
  }
  const response: ErrorResponse = {
    error: errorCode,
    message,
    details,
  };

  return NextResponse.json(response, { status: statusCode });
};