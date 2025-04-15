import { useAuthStore } from "@/app/store/authStore";
import axios from "axios"
interface LoginFormData {
  email: string;
  password: string;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
console.log({API_URL})
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token from Zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Added token from auth store');
    } else {
      console.log('No token in auth store');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);



export const login = async (payload: LoginFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, payload);
    return response.data || response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data?.message || 'Signup failed');
    }
    throw error;
  }
}