import axios from "axios";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface GoogleCalendarTimes {
  breakfast?: { hour: number; minute: number };
  lunch?: { hour: number; minute: number };
  dinner?: { hour: number; minute: number };
}

/**
 * Connect meal plan to Google Calendar
 * Creates events in the user's Google Calendar for each meal in the plan
 */
// export const connectMealPlanToGoogleCalendar = async (
//   mealPlanId: string,
//   accessToken: string,
//   options: {
//     timeZone?: string;
//     mealTimes?: GoogleCalendarTimes;
//   } = {},
//   token: string | null | undefined
// ) => {
//   if (!token) {
//     return {
//       success: false,
//       message: "Authentication token is required"
//     };
//   }

//   if (!accessToken) {
//     return {
//       success: false,
//       message: "Google Calendar access token is required"
//     };
//   }

//   try {
//     const response = await axios.post(
//       `${API_URL}/meal-planner/${mealPlanId}/calendar/connect`,
//       {
//         accessToken,
//         timeZone: options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
//         mealTimes: options.mealTimes || {
//           breakfast: { hour: 8, minute: 0 },
//           lunch: { hour: 12, minute: 30 },
//           dinner: { hour: 19, minute: 0 },
//         }
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return {
//       success: true,
//       data: response.data.data,
//       message: "Meal plan connected to Google Calendar successfully"
//     };
//   } catch (error: any) {
//     console.error("Error connecting meal plan to Google Calendar:", error);
    
//     // Handle Google Auth specific errors
//     if (error.response?.status === 401 && error.response?.data?.message?.includes("authentication failed")) {
//       return {
//         success: false,
//         message: "Google Calendar authentication failed. Please reauthorize the app.",
//         requiresReauth: true,
//         status: error.response?.status
//       };
//     }
    
//     return {
//       success: false,
//       message: error.response?.data?.message || error.message || "Failed to connect meal plan to Google Calendar",
//       status: error.response?.status
//     };
//   }
// };

/**
 * Disconnect meal plan from Google Calendar
 * Removes the calendar events created for this meal plan
 */
// export const disconnectMealPlanFromGoogleCalendar = async (
//   mealPlanId: string,
//   accessToken: string,
//   token: string | null | undefined
// ) => {
//   if (!token) {
//     return {
//       success: false,
//       message: "Authentication token is required"
//     };
//   }

//   if (!accessToken) {
//     return {
//       success: false,
//       message: "Google Calendar access token is required"
//     };
//   }

//   try {
//     const response = await axios.post(
//       `${API_URL}/meal-planner/${mealPlanId}/calendar/disconnect`,
//       {
//         accessToken
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );

//     return {
//       success: true,
//       data: response.data.data,
//       message: "Meal plan disconnected from Google Calendar successfully"
//     };
//   } catch (error: any) {
//     console.error("Error disconnecting meal plan from Google Calendar:", error);
    
//     return {
//       success: false,
//       message: error.response?.data?.message || error.message || "Failed to disconnect meal plan from Google Calendar",
//       status: error.response?.status
//     };
//   }
// };

/**
 * Check if a meal plan is connected to Google Calendar
 */
export const getMealPlanCalendarStatus = async (
  mealPlanId: string, 
  token: string | null | undefined
) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }
  
  try {
    const response = await axios.get(
      `${API_URL}/meal-planner/${mealPlanId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success && response.data.data) {
      return {
        success: true,
        data: {
          connectedToCalendar: response.data.data.connectedToCalendar || false,
          calendarConnectionDate: response.data.data.calendarConnectionDate,
          calendarEvents: response.data.data.calendarEvents || []
        },
        message: "Calendar connection status retrieved successfully"
      };
    }
    
    return {
      success: false,
      message: "Failed to retrieve calendar connection status"
    };
  } catch (error: any) {
    console.error("Error getting meal plan calendar status:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to get meal plan calendar status",
      status: error.response?.status
    };
  }
};

/**
 * Helper function to get Google OAuth token from browser storage
 */
export const getGoogleAuthToken = (): string | null => {
  try {
    // Try to retrieve token from both localStorage and sessionStorage
    const tokenFromLocal = localStorage.getItem('google_calendar_token');
    const tokenFromSession = sessionStorage.getItem('google_calendar_token');
    
    return tokenFromLocal || tokenFromSession || null;
  } catch (error) {
    console.error("Error retrieving Google auth token from storage:", error);
    return null;
  }
};

/**
 * Helper function to save Google OAuth token to browser storage
 */
export const saveGoogleAuthToken = (token: string, remember: boolean = false): void => {
  try {
    // Save to either localStorage (long-term) or sessionStorage (session-only)
    if (remember) {
      localStorage.setItem('google_calendar_token', token);
    } else {
      sessionStorage.setItem('google_calendar_token', token);
    }
  } catch (error) {
    console.error("Error saving Google auth token to storage:", error);
  }
};

/**
 * Helper function to clear Google OAuth token from browser storage
 */
export const clearGoogleAuthToken = (): void => {
  try {
    localStorage.removeItem('google_calendar_token');
    sessionStorage.removeItem('google_calendar_token');
  } catch (error) {
    console.error("Error clearing Google auth token from storage:", error);
  }
};

/**
 * Helper to initialize Google Auth API
 */
export const initGoogleAuth = async (clientId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    // Check if Google API is already loaded
    if (window.gapi) {
      window.gapi.load('auth2', {
        callback: () => {
          try {
            const googleAuth = window.gapi.auth2.init({
              client_id: clientId,
              scope: 'https://www.googleapis.com/auth/calendar'
            });
            resolve(googleAuth);
          } catch (error) {
            reject(error);
          }
        },
        onerror: reject
      });
    } else {
      reject(new Error('Google API not loaded'));
    }
  });
};

// Add TypeScript interface for window with gapi
declare global {
  interface Window {
    gapi: any;
  }
}




// import axios from "axios";
// import { API_URL } from "../config";

interface GoogleCalendarTimes {
  breakfast?: { hour: number; minute: number };
  lunch?: { hour: number; minute: number };
  dinner?: { hour: number; minute: number };
  snack?: { hour: number; minute: number };
}

/**
 * Connect meal plan to Google Calendar
 */
export const connectMealPlanToGoogleCalendar = async (
  mealPlanId: string,
  accessToken: string,
  options: {
    timeZone?: string;
    mealTimes?: GoogleCalendarTimes;
  } = {},
  token: string | null | undefined
) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }

  if (!accessToken) {
    return {
      success: false,
      message: "Google Calendar access token is required"
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/meal-planner/${mealPlanId}/calendar/connect`,
      {
        accessToken,
        timeZone: options.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        mealTimes: options.mealTimes || {
          breakfast: { hour: 8, minute: 0 },
          lunch: { hour: 12, minute: 30 },
          dinner: { hour: 19, minute: 0 },
          snack: { hour: 16, minute: 0 }
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Meal plan connected to Google Calendar successfully"
    };
  } catch (error: any) {
    console.error("Error connecting meal plan to Google Calendar:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to connect meal plan to Google Calendar",
      status: error.response?.status
    };
  }
};

/**
 * Disconnect meal plan from Google Calendar
 */
export const disconnectMealPlanFromGoogleCalendar = async (
  mealPlanId: string,
  accessToken: string,
  token: string | null | undefined
) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }

  if (!accessToken) {
    return {
      success: false,
      message: "Google Calendar access token is required"
    };
  }

  try {
    const response = await axios.post(
      `${API_URL}/meal-planner/${mealPlanId}/calendar/disconnect`,
      {
        accessToken
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return {
      success: true,
      data: response.data.data,
      message: "Meal plan disconnected from Google Calendar successfully"
    };
  } catch (error: any) {
    console.error("Error disconnecting meal plan from Google Calendar:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to disconnect meal plan from Google Calendar",
      status: error.response?.status
    };
  }
};

/**
 * Open Google OAuth popup
 */
export const openGoogleAuthPopup = () => {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google Client ID is not configured");
  }

  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  
  const popup = window.open(
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google-callback')}` +
    `&response_type=token` +
    `&scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}` +
    `&prompt=consent`,
    'googleLogin',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    throw new Error("Popup blocked! Please allow popups for this site.");
  }

  return popup;
};