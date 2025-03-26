import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ProfileUpdatePayload {
  username?: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImage?: string;
  phoneNumber?: string;
  socialMediaLink?: string;
}

export const updateProfile = async (payload: ProfileUpdatePayload, token: string, userId: string | undefined)  => {
  try {
    const response = await axios.post(
      `${API_URL}/user/edit-user/${userId}`,
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
        message: error.response?.data?.message || 'Failed to update profile',
        error: error.response?.data || error.message
      };
    }
    
    return {
      success: false,
      status: 500,
      message: 'An unexpected error occurred',
      error: String(error)
    };
  }
}