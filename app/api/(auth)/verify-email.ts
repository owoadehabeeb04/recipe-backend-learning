import axios from "axios"
interface veryifyEmail {
  email: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// VERIFY EMAIL 
export const verifyEmail = async (payload: veryifyEmail) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-email`, payload);
    return response.data || response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data?.message || 'Verification failed');
    }
    throw error;
  }
}


interface verifyOtp {
    email: string;
    otp: string;
}
export const verifyOTP = async (payload: verifyOtp) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, payload);
    return response.data || response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(error.response?.data?.message || 'Verification failed');
    }
    throw error;
  }
}

interface resetPasswordData {
    email: string;
    password: string;
} 
export const resetPassword = async (payload: resetPasswordData) => {
    try {
          const response = await axios.post(`${API_URL}/auth/reset-password`, payload);
    return response.data || response;

    } catch (error) {
           if (axios.isAxiosError(error)) {
      console.error(error.response?.data?.message || 'Verification failed');
    }
    throw error;
   
    }
}


