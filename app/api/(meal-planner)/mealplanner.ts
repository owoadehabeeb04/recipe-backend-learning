import axios from 'axios';
import { format, parseISO, startOfWeek } from 'date-fns';

/**
 * Type definitions
 */

export interface MealPlanRecipe {
  mealType: string;
  recipe: string; // Recipe ID
}

export interface DayPlan {
  [mealType: string]: MealPlanRecipe;
}

export interface MealPlanData {
  name: string;
  week: string | Date;
  plan: {
    [day: string]: DayPlan;
  };
  notes?: string;
  isActive?: boolean;
}

export interface MealPlanResponse {
  success: boolean;
  message: string;
  data?: any;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  error?: string;
  existingPlan?: {
    id: string;
    name: string;
    week: string;
  };
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Create a new meal plan
 */
export const createMealPlan = async (mealPlanData: MealPlanData, token: string): Promise<MealPlanResponse> => {
  try {
    // Format date if it's a Date object
    const formattedData = { ...mealPlanData };
    if (formattedData.week instanceof Date) {
      // Get start of week (Monday)
      const weekStart = startOfWeek(formattedData.week, { weekStartsOn: 1 });
      formattedData.week = format(weekStart, 'yyyy-MM-dd');
    }
    
    const response = await axios.post(`${API_URL}/meal-planner` , formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Return the error from the API
      return error.response.data as MealPlanResponse;
    }
    
    // Generic error
    return {
      success: false,
      message: 'Failed to create meal plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get all meal plans for the authenticated user
 */
export const getUserMealPlans = async (
  token: string | null | undefined,
  options: { page?: number; limit?: number; active?: boolean } = {}
): Promise<MealPlanResponse> => {
  try {
    const { page = 1, limit = 10, active } = options;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    if (active !== undefined) {
      queryParams.append('active', active.toString());
    }
    
    const response = await axios.get(`${API_URL}/meal-planner?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MealPlanResponse;
    }
    
    return {
      success: false,
      message: 'Failed to retrieve meal plans',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get a meal plan by week
 */
export const getMealPlanByWeek = async (weekDate: Date | string, token: string | null): Promise<MealPlanResponse> => {
  try {
    // Format the week date if it's a Date object
    let formattedWeek: string;
    
    if (weekDate instanceof Date) {
      // Get start of week (Monday)
      const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
      formattedWeek = format(weekStart, 'yyyy-MM-dd');
    } else {
      formattedWeek = weekDate;
    }
    
    const response = await axios.get(`${API_URL}/meal-planner/by-week/${weekDate}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MealPlanResponse;
    }
    
    return {
      success: false,
      message: 'Failed to retrieve meal plan for this week',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get a specific meal plan by ID
 */
export const getMealPlanById = async (id: string, token: string): Promise<MealPlanResponse> => {
  try {
    const response = await axios.get(`${API_URL}/meal-planner/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MealPlanResponse;
    }
    
    return {
      success: false,
      message: 'Failed to retrieve meal plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Update an existing meal plan
 */
export const updateMealPlan = async (
  id: string,
  updateData: Partial<MealPlanData>,
  token: string
): Promise<MealPlanResponse> => {
  try {
    // Format date if it's a Date object
    const formattedData = { ...updateData };
    if (formattedData.week instanceof Date) {
      // Get start of week (Monday)
      const weekStart = startOfWeek(formattedData.week, { weekStartsOn: 1 });
      formattedData.week = format(weekStart, 'yyyy-MM-dd');
    }
    
    const response = await axios.patch(`${API_URL}/meal-planner/${id}`, formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MealPlanResponse;
    }
    
    return {
      success: false,
      message: 'Failed to update meal plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Delete a meal plan
 */
export const deleteMealPlan = async (id: string, token: string): Promise<MealPlanResponse> => {
  try {
    const response = await axios.delete(`${API_URL}/meal-planner/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      return error.response.data as MealPlanResponse;
    }
    
    return {
      success: false,
      message: 'Failed to delete meal plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Duplicate an existing meal plan
 */
export const duplicateMealPlan = async (id: string, token: string, targetWeek: Date | undefined): Promise<MealPlanResponse> => {
  try {
    // First, get the existing meal plan
    const getMealPlanResponse = await getMealPlanById(id, token);
    
    if (!getMealPlanResponse.success || !getMealPlanResponse.data) {
      return getMealPlanResponse;
    }
    
    // Create a new meal plan with the existing data
    const existingPlan = getMealPlanResponse.data;
    const newMealPlan: MealPlanData = {
      name: `${existingPlan.name} (Copy)`,
      week: targetWeek || new Date(), // Use target week if provided, otherwise current week
      plan: existingPlan.plan,
      notes: existingPlan.notes,
    };
    
    // Create the duplicated plan
    return await createMealPlan(newMealPlan, token);
  } catch (error) {
    return {
      success: false,
      message: 'Failed to duplicate meal plan',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};






// Add these functions to your existing mealPlanApi.ts file

/**
 * Generate a basic shopping list from a meal plan
 */
export const generateShoppingList = async (mealPlanId: string, token: string): Promise<MealPlanResponse> => {
    try {
      const response = await axios.get(`${API_URL}/meal-planner/${mealPlanId}/shopping-list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as MealPlanResponse;
      }
      
      return {
        success: false,
        message: 'Failed to generate shopping list',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  
  /**
   * Generate a categorized shopping list from a meal plan
   */
  export const generateCategorizedShoppingList = async (mealPlanId: string, token: string): Promise<MealPlanResponse> => {
    try {
      const response = await axios.get(`${API_URL}/meal-planner/${mealPlanId}/shopping-list/categorized`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data as MealPlanResponse;
      }
      
      return {
        success: false,
        message: 'Failed to generate categorized shopping list',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  
  /**
   * Generate a printable shopping list from a meal plan
   */
  export const generatePrintableShoppingList = async (
    mealPlanId: string, 
    token: string, 
    format: 'json' | 'text' = 'json'
  ): Promise<MealPlanResponse | string> => {
    try {
      const response = await axios.get(`${API_URL}/meal-planner/${mealPlanId}/shopping-list/printable`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: { format },
        responseType: format === 'text' ? 'text' : 'json'
      });
      
      if (format === 'text') {
        return response.data; 
      }
      
      return response.data; 
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (format === 'text') {
          return `Error: ${error.response.data.message || 'Failed to generate printable shopping list'}`;
        }
        return error.response.data as MealPlanResponse;
      }
      
      if (format === 'text') {
        return `Error: Failed to generate printable shopping list`;
      }
      
      return {
        success: false,
        message: 'Failed to generate printable shopping list',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };
  export const mealPlanStats = async (mealPlanId: string, token: string | null | undefined) => {
    if (!token) {
      return {
        success: false,
        message: "Authentication token is required"
      };
    }
    
    try {
      const response = await axios.get(`${API_URL}/meal-planner/${mealPlanId}/stats`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      return {
        success: true,
        data: response.data,
        message: "Meal plan stats retrieved successfully"
      };
    } catch (error: any) {
      console.error("Error fetching meal plan stats:", error);
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || "Failed to retrieve meal plan stats",
        status: error.response?.status
      };
    }
  };



  // Get shopping list with check status
export const getShoppingListStatus = async (mealPlanId: string, token: string | null | undefined) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }
  
  try {
    const response = await axios.get(`${API_URL}/meal-planner/${mealPlanId}/shopping-list/status`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return {
      success: true,
      data: response.data.data,
      message: "Shopping list retrieved successfully"
    };
  } catch (error: any) {
    console.error("Error fetching shopping list:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to retrieve shopping list",
      status: error.response?.status
    };
  }
};

// Update shopping list item check status
export const updateShoppingListItems = async (
  mealPlanId: string, 
  data: {
    items?: string[],
    category?: string,
    checked?: boolean,
    checkAll?: boolean
  }, 
  token: string | null | undefined
) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }
  
  try {
    const response = await axios.patch(
      `${API_URL}/meal-planner/${mealPlanId}/shopping-list/check`, 
      data,
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
      message: "Shopping list updated successfully"
    };
  } catch (error: any) {
    console.error("Error updating shopping list:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to update shopping list",
      status: error.response?.status
    };
  }
};

// Reset shopping list (uncheck all items)
export const resetShoppingList = async (mealPlanId: string, token: string | null | undefined) => {
  if (!token) {
    return {
      success: false,
      message: "Authentication token is required"
    };
  }
  
  try {
    const response = await axios.post(
      `${API_URL}/meal-planner/${mealPlanId}/shopping-list/reset`,
      {},
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
      message: "Shopping list reset successfully"
    };
  } catch (error: any) {
    console.error("Error resetting shopping list:", error);
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to reset shopping list",
      status: error.response?.status
    };
  }
};

// Convenience function to check/uncheck individual items
export const toggleShoppingListItem = async (
  mealPlanId: string,
  itemName: string,
  isChecked: boolean,
  token: string | null | undefined
) => {
  return updateShoppingListItems(
    mealPlanId,
    {
      items: [itemName],
      checked: isChecked
    },
    token
  );
};

// Convenience function to check/uncheck category
export const toggleShoppingListCategory = async (
  mealPlanId: string,
  category: string,
  isChecked: boolean,
  token: string | null | undefined
) => {
  return updateShoppingListItems(
    mealPlanId,
    {
      category,
      checked: isChecked
    },
    token
  );
};

// Convenience function to check/uncheck all items
export const toggleAllShoppingListItems = async (
  mealPlanId: string,
  isChecked: boolean,
  token: string | null | undefined
) => {
  return updateShoppingListItems(
    mealPlanId,
    {
      checkAll: true,
      checked: isChecked
    },
    token
  );
};


