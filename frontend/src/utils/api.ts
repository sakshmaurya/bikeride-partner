import { API_BASE_URL } from '../constants/api';

export type ApiErrorCode =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'unavailable';

export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  payload: unknown;

  constructor(
    message: string,
    status: number,
    code: ApiErrorCode,
    payload?: unknown,
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.payload = payload;
  }
}

const mapStatus = (status: number): ApiErrorCode => {
  if (status === 401) {
    return 'unauthorized';
  }
  if (status === 403) {
    return 'forbidden';
  }
  if (status === 404) {
    return 'notFound';
  }
  if (status === 409) {
    return 'conflict';
  }
  if (status === 422 || status === 400) {
    return 'validation';
  }
  if (status === 429) {
    return 'validation';
  }
  if (status === 503) {
    return 'unavailable';
  }
  return 'server';
};

export const apiRequest = async <T = unknown>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 20000,
): Promise<{ status: number; data: T }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body instanceof FormData
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...(options.headers || {}),
      },
    });

    let data: T;

    try {
      data = (await response.json()) as T;
    } catch {
      data = {} as T;
    }

    return { status: response.status, data };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408, 'timeout');
    }

    throw new ApiError(
      'Unable to connect to server. Please check your internet connection.',
      0,
      'network',
    );
  } finally {
    clearTimeout(timer);
  }
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const throwIfApiFailed = (
  status: number,
  data: { success?: boolean; message?: string },
  fallback: string,
) => {
  if (status >= 200 && status < 300 && data.success !== false) {
    return;
  }

  throw new ApiError(
    data.message || fallback,
    status,
    mapStatus(status),
    data,
  );
};
