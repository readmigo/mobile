import { AxiosError } from 'axios';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'SERVER'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'UNKNOWN';

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: number,
    public readonly userMessage: string,
    cause?: unknown
  ) {
    super(userMessage);
    this.name = 'AppError';
    if (cause instanceof Error && cause.stack) {
      this.stack = cause.stack;
    }
  }

  /** True when retrying might succeed (5xx, network, timeout). */
  get isRetryable(): boolean {
    return this.code === 'SERVER' || this.code === 'NETWORK' || this.code === 'TIMEOUT';
  }

  /** True when the user should see a toast. False for auth/cancellation/validation. */
  get isUserActionable(): boolean {
    return this.code !== 'UNAUTHORIZED' && this.code !== 'CANCELLED' && this.code !== 'VALIDATION';
  }
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status;

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new AppError('TIMEOUT', 0, 'Request timed out, please try again', error);
    }

    if (error.code === 'ERR_CANCELED') {
      return new AppError('CANCELLED', 0, 'Request was cancelled', error);
    }

    if (!error.response) {
      return new AppError('NETWORK', 0, 'Network error, please check your connection', error);
    }

    if (status === 401) return new AppError('UNAUTHORIZED', 401, 'Please sign in again', error);
    if (status === 403) return new AppError('FORBIDDEN', 403, 'You do not have access to this', error);
    if (status === 404) return new AppError('NOT_FOUND', 404, 'Not found', error);
    if (status === 422) return new AppError('VALIDATION', 422, 'Please check the form and try again', error);
    if (status === 429) return new AppError('RATE_LIMITED', 429, 'Too many requests, please wait a moment', error);
    if (status && status >= 500) return new AppError('SERVER', status, 'Server error, please try again later', error);
  }

  if (error instanceof Error) {
    return new AppError('UNKNOWN', 0, error.message || 'Something went wrong', error);
  }

  return new AppError('UNKNOWN', 0, 'Something went wrong');
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as AxiosError).isAxiosError === true
  );
}
