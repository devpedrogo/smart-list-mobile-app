import axios from 'axios';
import { getDeviceId } from '@/api/deviceId';
/** Representa um erro retornado pela API e guarda também o código HTTP. */
export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}
/** IMPORTANTE: A variável é a origem do Spring, SEM /api/v1. */
const baseHost = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
export const api = axios.create({
  baseURL: `${baseHost}/api/v1`,
  timeout: 15000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});
api.interceptors.request.use(async config => {
  config.headers.set('X-Device-ID', await getDeviceId());
  return config;
});
api.interceptors.response.use(
  response => response,
  error => {
    if (axios.isAxiosError(error)) {
      if (!error.response) return Promise.reject(new Error('Sem conexão com a API. Verifique o endereço do servidor e a rede.'));
      const data: unknown = error.response.data;
      const detail = data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message : `Erro HTTP ${error.response.status}`;
      const fieldErrors = data && typeof data === 'object' && 'errors' in data &&
        typeof data.errors === 'object' && data.errors !== null
        ? Object.values(data.errors).filter((value): value is string => typeof value === 'string')
        : [];
      const message = fieldErrors.length ? `${detail}: ${fieldErrors.join('; ')}` : detail;
      return Promise.reject(new ApiError(message, error.response.status));
    }
    return Promise.reject(error);
  },
);
