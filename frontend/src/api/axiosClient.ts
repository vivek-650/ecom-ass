import axios, { AxiosError } from 'axios';
import { authToken } from '@/utils/authToken';
import type { ApiEnvelope } from '@/types';

const baseURL = import.meta.env.VITE_API_BASE_URL as string;

// A hung upstream (e.g. the DB provider having a slow moment) should fail
// fast with a clear error instead of leaving the UI spinning indefinitely.
export const axiosClient = axios.create({ baseURL, timeout: 15_000 });

// Every request rides on our own JWT (see utils/authToken.ts) — this is the
// single place that attaches it, bridging login (POST /auth/login) to every
// other request's requireAuth middleware on the backend.
axiosClient.interceptors.request.use((config) => {
  const token = authToken.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export class ApiRequestError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiEnvelope<null> & { message?: string }>) => {
    const message =
      error.code === 'ECONNABORTED'
        ? 'The server is taking too long to respond — please try again'
        : error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new ApiRequestError(message, error.response?.status));
  }
);

/** Unwraps the backend's { success, data, message } envelope into just `data`. */
export async function unwrap<T>(promise: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
  const response = await promise;
  return response.data.data;
}
