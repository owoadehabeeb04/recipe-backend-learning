// router.get('/', getAllRecipes)

import { useAuthStore } from "@/app/store/authStore";
import axios from "axios";

// // Protected routes (require user authentication)
// router.get('/recipeStats', verifyToken, getStatistics)
// router.get('/recentRecipes', verifyToken, getYourRecentRecipes)

// // Admin-only routes
// router.patch('/edit-recipe', verifyToken, isAdmin, editRecipe)
// router.post('/create-recipe', verifyToken, isAdmin, createRecipe)
// router.delete('/delete-recipe', verifyToken, isAdmin, deleteRecipe)
// router.get('/admin', verifyToken, isAdmin, getAdminRecipes)


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
// get all recipes
export interface RecipeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: string;
}
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include token from Zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('Added token from auth store');
    } else {
      console.log('No token in auth store');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Now update your getAllRecipes function to use this api instance
export const getAllRecipes = async (params?: RecipeQueryParams) => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.sort) queryParams.append('sort', params.sort);
    }

    const url = `/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log("Fetching recipes from:", url);
    // We don't need to pass token - the interceptor will add it
    
    const response = await api.get(url);

    return response.data;
  } catch (error: any) {
    console.error("Error in getAllRecipes:", error);
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to fetch recipes" 
    };
  }
};

// view recipe details
export const getRecipeDetails = async (id: string | null) => {
  if (!id) {
    return {
      success: false,
      message: "Recipe ID is required"
    };
  }
  
  
  try {
    const response = await api.get(`/recipes/${id}`);
    
    console.log("Recipe details response:", response.data);
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || "Recipe details retrieved successfully"
    };
  } catch (error: any) {
    console.error("Error fetching recipe details:", error);
    
    return { 
      success: false, 
      message: error.response?.data?.message || "Failed to fetch recipe details",
      status: error.response?.status
    };
  }
}