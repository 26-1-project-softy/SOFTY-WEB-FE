import axios from 'axios';
import { setupInterceptors } from '@/services/http/interceptors';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

export const apiClient = setupInterceptors(client);
