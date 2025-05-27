import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Define types for API responses
interface ReviewData {
  _id: string;
  userId: string;
  username: string;
  profileImage?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  helpfulCount?: number;
}

interface ReviewAggregation {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

interface ReviewsResponse {
  reviews: ReviewData[];
  hasMore: boolean;
  nextCursor: string | null;
  currentFilter: string;
  aggregation?: ReviewAggregation;
}

interface RecipeData {
  _id: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Helper function to create auth headers
const createAuthHeaders = (token?: string | null) => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Review API functions
export const reviewsApi = {
  // Get reviews with pagination and sorting
  getReviews: async (
    recipeId: string,
    options?: {
      cursor?: string;
      limit?: number;
      sortBy?: 'rating' | 'createdAt' | 'helpful';
      sortOrder?: 'asc' | 'desc';
      token?: string;
    }
  ): Promise<ReviewsResponse> => {
    try {
      const { cursor, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', token } = options || {};
      
      // Build query params
      const params = new URLSearchParams();
      params.append('recipeId', recipeId);
      if (cursor) params.append('cursor', cursor);
      if (limit) params.append('limit', limit.toString());
      if (sortBy) params.append('sortBy', sortBy);
      if (sortOrder) params.append('sortOrder', sortOrder);
      
      const response = await axios.get<ApiResponse<ReviewsResponse>>(
        `${API_URL}/reviews?${params.toString()}`,
        { headers: createAuthHeaders(token) }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  },
  
  // Create a new review
  createReview: async (
    recipeId: string, 
    rating: number, 
    comment: string, 
    token: string
  ): Promise<ReviewData> => {
    try {
      console.log('API call with data:', { recipeId, rating, comment });
      
      const response = await axios.post<ApiResponse<ReviewData>>(
        `${API_URL}/reviews`, 
        {
          recipeId,
          rating,
          comment: comment.trim()
        },
        { 
          headers: createAuthHeaders(token) 
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },
  
  // Update an existing review
  updateReview: async (
    reviewId: string, 
    recipeId: string, 
    rating: number, 
    comment: string,
    token: string | null
  ): Promise<ReviewData> => {
    try {
      const response = await axios.patch(
        `${API_URL}/reviews`, 
        {
            reviewId,
          rating,
          comment: comment.trim()
        },
        { headers: createAuthHeaders(token) }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  },
  
  // Delete a review
  deleteReview: async (reviewId: string, token: string | null): Promise<void> => {
    try {
      await axios.delete<ApiResponse<void>>(
        `${API_URL}/reviews/${reviewId}`,
        { headers: createAuthHeaders(token) }
      );
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  },
  
  // Mark review as helpful
  markReviewHelpful: async (reviewId: string, token: string | null): Promise<ReviewData> => {
    try {
      const response = await axios.post<ApiResponse<ReviewData>>(
        `${API_URL}/reviews/${reviewId}/helpful`,
        {},
        { headers: createAuthHeaders(token) }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      throw error;
    }
  },
  
  // Get the current user's review for a specific recipe
  getUserReviewForRecipe: async (recipeId: string, token: string | null): Promise<ReviewData | null> => {
    try {
      const response = await axios.get<ApiResponse<ReviewData | null>>(
        `${API_URL}/reviews/user/${recipeId}`,
        { headers: createAuthHeaders(token) }
      );
      return response.data.data;
    } catch (error) {
      // If 404 (user hasn't reviewed yet), return null
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching user review:', error);
      throw error;
    }
  },
  
  // Get recipe details (for updated ratings)
  getRecipeDetails: async (recipeId: string, token?: string): Promise<RecipeData> => {
    try {
      const response = await axios.get<ApiResponse<RecipeData>>(
        `${API_URL}/recipes/${recipeId}`,
        { headers: createAuthHeaders(token) }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  }
};