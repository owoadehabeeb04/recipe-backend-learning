import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const getShoppingList = async (token: string, mealPlannerId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/meal-planner/${mealPlannerId}/shopping-list`, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );    
     return response
    } catch (error) {
      console.error('Error fetching shopping list:', error)
    }
  };


  export const getCategorizedShoppingList = async (token: string, mealPlannerId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/meal-planner/${mealPlannerId}/shopping-list/categorized`, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );    
     return response
    } catch (error) {
      console.error('Error fetching categorized shopping list:', error)
    }
  };


  export const getPrintableShoppingList = async (token: string, mealPlannerId: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/meal-planner/${mealPlannerId}/shopping-list/printable`, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );    
     return response
    } catch (error) {
      console.error('Error fetching printable shopping list:', error)
    }
  };