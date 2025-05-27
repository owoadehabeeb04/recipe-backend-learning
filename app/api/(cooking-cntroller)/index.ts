import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}` : 'http://localhost:3001';

interface CookingSession {
  sessionId: string;
  status: 'not_started' | 'started_cooking' | 'cooking_in_progress' | 'completed' | 'didnt_cook';
  startedAt: string | null;
  completedAt?: string | null;
  isVerifiedCook: boolean;
  totalCookingTime?: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Helper function to create auth headers
const createAuthHeaders = (token: string) => {
  return { Authorization: `Bearer ${token}` };
};

// Recipe interaction API functions
export const recipeInteractionApi = {
  // Start cooking a recipe
  startCooking: async (
    recipeId: string, 
    options?: {
      fromMealPlan?: boolean;
      mealPlanId?: string;
      token: string;
    }
  ): Promise<CookingSession> => {
    try {
      const { fromMealPlan = false, mealPlanId = null, token } = options || {} as any;
      
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const response = await axios.post<ApiResponse<CookingSession>>(
        `${API_URL}/cooking/start`,
        {
          recipeId,
          fromMealPlan,
          mealPlanId
        },
        { headers: createAuthHeaders(token) }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error starting cooking session:', error);
      throw error;
    }
  },
  
  // Complete cooking (Done Cooking)
  completeCooking: async (
    recipeId: string,
    options: {
      sessionId?: string;
      cookingTime?: number; // in minutes
      rating?: number;
      notes?: string;
      token: string;
    }
  ): Promise<CookingSession> => {
    try {
      const { sessionId, cookingTime, rating, notes, token } = options;
      
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const response = await axios.post<ApiResponse<CookingSession>>(
        `${API_URL}/cooking/complete`,
        {
          recipeId,
          sessionId,
          cookingTime,
          rating,
          notes
        },
        { headers: createAuthHeaders(token) }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error completing cooking:', error);
      throw error;
    }
  },
  
  abandonCooking: async (
    recipeId: string,
    options: {
      sessionId?: string;
      reason?: string;
      token: string;
    }
  ): Promise<CookingSession> => {
    try {
      const { sessionId, reason, token } = options;
      
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const response = await axios.post<ApiResponse<CookingSession>>(
        `${API_URL}/cooking/didnt-cook`,
        {
          recipeId,
          sessionId,
          reason
        },
        { headers: createAuthHeaders(token) }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error abandoning cooking session:', error);
      throw error;
    }
  },
  
  // Get cooking status for a recipe
  getCookingStatus: async (
    recipeId: string,
    token: string
  ): Promise<{
    hasCookingHistory: boolean;
    currentStatus: 'not_started' | 'started_cooking' | 'cooking_in_progress' | 'completed' | 'didnt_cook';
    isVerifiedCook: boolean;
    sessionId: string | null;
    startedAt: string | null;
    completedAt: string | null;
    totalCookingTime: number;
  }> => {
    try {
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      const response = await axios.get<ApiResponse<{
        hasCookingHistory: boolean;
        currentStatus: 'not_started' | 'started_cooking' | 'cooking_in_progress' | 'completed' | 'didnt_cook';
        isVerifiedCook: boolean;
        sessionId: string | null;
        startedAt: string | null;
        completedAt: string | null;
        totalCookingTime: number;
      }>>(
        `${API_URL}/cooking/status/${recipeId}`,
        { headers: createAuthHeaders(token) }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error getting cooking status:', error);
      throw error;
    }
  },
  
  // Track step completion (optional - for detailed tracking)
  trackStepCompletion: async (
    recipeId: string,
    stepNumber: number,
    options: {
      sessionId: string;
      token: string;
    }
  ): Promise<void> => {
    try {
      const { sessionId, token } = options;
      
      if (!token) {
        throw new Error('Authentication token is required');
      }
      
      await axios.post(
        `${API_URL}/cooking/track-step`,
        {
          recipeId,
          stepNumber,
          sessionId
        },
        { headers: createAuthHeaders(token) }
      );
    } catch (error) {
      console.error('Error tracking step completion:', error);
      throw error;
    }
  }
};