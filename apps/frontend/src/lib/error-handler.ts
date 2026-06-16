import { ApiError } from './api-client';

const errorMessages: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Please sign in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'This action conflicts with the current state.',
  422: 'The submitted data is invalid.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again.',
  503: 'Service is temporarily unavailable. Please try again later.',
};

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return errorMessages[error.statusCode] ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}
