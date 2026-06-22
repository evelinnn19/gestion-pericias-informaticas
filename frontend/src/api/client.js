import axios from 'axios';
import { supabase } from '../lib/supabase';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_API || 'http://localhost:3000/api',
});

// Add a request interceptor to inject the Supabase auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (error) {
      console.error('Error getting Supabase session for API request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
