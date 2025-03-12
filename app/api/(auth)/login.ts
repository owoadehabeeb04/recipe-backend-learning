import axios from "axios"
interface LoginFormData {
  email: string;
  password: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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