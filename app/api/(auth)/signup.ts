import axios from "axios"
interface SignUpFormData {
  username: string;
  email: string;
  password: string;
  role?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const signUp = async (payload: SignUpFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, payload);
    return response.data || response;
  } catch (error) {
    console.error(error)
    return error
  }
}

export const adminSignUp = async (payload: SignUpFormData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register/admin`, payload);
    return response.data || response;
  } catch (error) {
    console.error(error)
    return error
  }
}
