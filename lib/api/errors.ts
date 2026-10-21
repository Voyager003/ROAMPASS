import type { ProblemDetail } from './types';

/**
 * A non-2xx response from the backend, carrying its RFC 9457 body.
 * Thrown by the API client on the server; Server Actions turn it into a plain result object
 * before anything reaches a Client Component (class instances are not serializable).
 */
export class ApiError extends Error {
  readonly problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail ?? problem.code);
    this.name = 'ApiError';
    this.problem = problem;
  }

  get status(): number {
    return this.problem.status;
  }

  get code(): string {
    return this.problem.code;
  }
}

export function notFound(code: string, detail: string): ApiError {
  return new ApiError({ status: 404, code, detail });
}

export function conflict(code: string, detail: string): ApiError {
  return new ApiError({ status: 409, code, detail });
}

export function badRequest(code: string, detail: string): ApiError {
  return new ApiError({ status: 400, code, detail });
}
