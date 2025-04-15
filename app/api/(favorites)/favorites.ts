import axios from "axios";
import { RecipeQueryParams } from "../(recipe)/userRecipes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const addToFavorites = async (recipeId: string, token: string) => {
    try {
      const response = await axios.post(
        `${API_URL}/favorites`,
        { recipeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  };

  export const removeFromFavorites = async (recipeId: string, token: string) => {
    try {
      const response = await axios.delete(
        `${API_URL}/favorites/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  };  
  export const getFavorites = async (token: string | null, params?: RecipeQueryParams) => {
    
    try {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.search) queryParams.append('search', params.search);
          if (params.category) queryParams.append('category', params.category);
          if (params.sort) queryParams.append('sort', params.sort);
        }
    
      const response = await axios.get(
        `${API_URL}/favorites${queryParams.toString() ? `?${queryParams.toString()}` : ''}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  };

  

  export const checkFavoriteStatus = async (recipeId: string, token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/favorites/status/${recipeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.isFavorited || false;
    } catch (error) {
      console.error('Error getting favorites:', error);
      throw error;
    }
  };
