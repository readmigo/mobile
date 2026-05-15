import { AxiosError, AxiosHeaders } from 'axios';
import { AppError, handleApiError } from '../errors';

function makeAxiosError(opts: { status?: number; code?: string }) {
  const err = new AxiosError(
    'mock',
    opts.code,
    undefined,
    undefined,
    opts.status
      ? { status: opts.status, statusText: '', headers: new AxiosHeaders(), config: {} as any, data: {} }
      : undefined
  );
  return err;
}

describe('handleApiError', () => {
  it('passes through existing AppError', () => {
    const original = new AppError('NETWORK', 0, 'x');
    expect(handleApiError(original)).toBe(original);
  });

  it('maps 401 → UNAUTHORIZED', () => {
    const err = handleApiError(makeAxiosError({ status: 401 }));
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.statusCode).toBe(401);
    expect(err.isUserActionable).toBe(false);
  });

  it('maps 429 → RATE_LIMITED', () => {
    expect(handleApiError(makeAxiosError({ status: 429 })).code).toBe('RATE_LIMITED');
  });

  it('maps 503 → SERVER (retryable)', () => {
    const err = handleApiError(makeAxiosError({ status: 503 }));
    expect(err.code).toBe('SERVER');
    expect(err.isRetryable).toBe(true);
  });

  it('maps no-response → NETWORK', () => {
    expect(handleApiError(makeAxiosError({})).code).toBe('NETWORK');
  });

  it('maps ECONNABORTED → TIMEOUT', () => {
    expect(handleApiError(makeAxiosError({ code: 'ECONNABORTED' })).code).toBe('TIMEOUT');
  });

  it('maps ERR_CANCELED → CANCELLED (not user-actionable)', () => {
    const err = handleApiError(makeAxiosError({ code: 'ERR_CANCELED' }));
    expect(err.code).toBe('CANCELLED');
    expect(err.isUserActionable).toBe(false);
  });

  it('wraps generic Error', () => {
    expect(handleApiError(new Error('boom')).code).toBe('UNKNOWN');
  });

  it('handles non-Error values', () => {
    expect(handleApiError('weird').code).toBe('UNKNOWN');
  });
});
