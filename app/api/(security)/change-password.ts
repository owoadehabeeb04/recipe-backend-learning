import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChangePasswordPayload {
email: string | undefined;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (payload: ChangePasswordPayload, token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/change-password`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        status: error.response?.status || 500,
        message: error.response?.data?.message || 'Failed to change password',
        error: error.response?.data || error.message
      };
    }
    
    // Handle other types of errors
    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
      error: String(error)
    };
  }
};