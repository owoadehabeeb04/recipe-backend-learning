import axios from 'axios';
import { error } from 'console';

// Recipe payload interface
interface payload {
  title: string;
  description: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  servings: number;
  steps: string[];
  tips: string[];
  ingredients: string[];
  featuredImage: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';


export const getRecipeBySlug = async (slug: string) => {
  try {
    const response = await axios.get(`${API_URL}/recipes/${slug}`);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || 'Recipe retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching recipe by slug:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        error: error.response?.data?.errors || 'Failed to fetch recipe'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error: 'Failed to fetch recipe'
    };
  }
};


export const createRecipe = async (payload: payload, token: string, role: string| undefined) => {
  try {
    const response = await axios.post(`${API_URL}/recipes/create-recipe`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Recipe created successfully',
      data: response.data.data
    };
  } catch (error) {
    // Error handling
    console.error('Error creating recipe:', error);
    
    // Handle axios error responses with status codes and messages
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      const statusCode = error.response?.status;
      
      return {
        success: false,
        message: errorMessage,
        status: statusCode,
        error: error.response?.data?.errors || 'Failed to create recipe'
      };
    }
    
    // Handle other types of errors
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error: 'Failed to create recipe'
    };
  }
};

/**
 * Edit an existing recipe (admin only)
 * @param recipeId ID of the recipe to edit
 * @param payload Updated recipe data
 * @param token JWT token for authentication
 * @returns Response with success status and data or error message
 */
export const editRecipe = async (recipeId: string, payload: Partial<payload>, token: string) => {
  try {
    const response = await axios.patch(`${API_URL}/recipes/edit-recipe/${recipeId}`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Recipe updated successfully',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error updating recipe:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        error: error.response?.data?.errors || 'Failed to update recipe'
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      error: 'Failed to update recipe'
    };
  }
};

/**
 * Delete a recipe (admin only)
 * @param recipeId ID of the recipe to delete
 * @param token JWT token for authentication
 * @returns Response with success status and message or error
 */
export const deleteRecipe = async (recipeId: string, token: string) => {
  try {
    const response = await axios.delete(`${API_URL}/recipes/delete-recipe/${recipeId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return {
      success: true,
      message: response.data.message || 'Recipe deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting recipe:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

/**
 * Publish or unpublish a recipe (admin only)
 * @param recipeId ID of the recipe
 * @param isPublished Boolean indicating whether to publish or unpublish
 * @param token JWT token for authentication
 * @returns Response with success status and message or error
 */
export const toggleRecipePublishStatus = async (recipeId: string, isPublished: boolean, token: string) => {
  try {
    const response = await axios.patch(
      `${API_URL}/recipes/publish/${recipeId}`,
      { isPublished },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: true,
      message: isPublished 
        ? 'Recipe published successfully' 
        : 'Recipe unpublished successfully',
      data: response.data.data
    };
  } catch (error) {
    console.error('Error toggling recipe publish status:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const getAdminRecipes = async (token: string, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/recipes/adminRecipes?page=${page}&limit=${limit}`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
      message: response.data.message || 'Admin recipes retrieved successfully'
    };
  } catch (error) {
    console.error('Error fetching admin recipes:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || error.message,
        status: error.response?.status
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const getStatistics = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/recipes/recipeStats`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error fetching statistics:', error);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch statistics',
      status: error.response?.status
    };
  }
}

export const getYourRecentRecipes = async (token: string) => {
  try {
    const response = await axios.get(
      `${API_URL}/recipes/recentRecipes`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error: any) {
    console.error('Error fetching recent recipes:', error);
    
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to fetch recent recipes',
      status: error.response?.status
    };
  }
}