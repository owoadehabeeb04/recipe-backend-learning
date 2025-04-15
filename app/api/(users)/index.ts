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
      `${API_URL}/users/edit-user/${userId}`,
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


// get all users api
// export const getAllUsers = async (token: string) => {
//   try {
//     const response = await axios.get(`${API_URL}/users`, {
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${token}`
//       }
//     });

//     // Log the response structure to verify what's returned
//     console.log('API response structure:', response.data);

//     return {
//       success: true,
//       data: response.data.data || response.data.users || [], 
//       pagination: response.data.pagination,
//       message: response.data.message || 'Users fetched successfully'
//     };
//   } catch (error) {
//     console.error('Error fetching users:', error);
    
//     if (axios.isAxiosError(error)) {
//       return {
//         success: false,
//         data: [],
//         message: error.response?.data?.message || error.message,
//         status: error.response?.status
//       };
//     }
    
//     return {
//       success: false,
//       data: [],
//       message: error instanceof Error ? error.message : 'An unknown error occurred'
//     };
//   }
// }

export const getAllUsers = async (token: string | null | undefined, queryParams = '') => {
  try {
    const endpoint = `${API_URL}/users${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await axios.get(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};



export const getSingleUser = async (token: string | null | undefined, userId: string)=> {
  try{
const response = await axios.get(`${API_URL}/users/${userId}`, {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})
return response.data
  } catch(error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
}


export const deleteUser = async (token: string | null | undefined, userId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/users/delete/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};