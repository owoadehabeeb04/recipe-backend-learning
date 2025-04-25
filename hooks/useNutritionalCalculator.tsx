import { Ingredient, NutritionData } from "@/types/recipe";
import { calculateNutrition } from "@/utils";
import { useState, useEffect, useRef, useCallback } from "react";

export const useNutritionCalculator = (ingredients: Ingredient[], isGenerating: boolean) => {
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  
  // Use refs to track if we've calculated nutrition for the current set of ingredients
  const calculatedRef = useRef(false);
  const prevIngredientsRef = useRef<string>("");
  
  // Create a serialized version of ingredients to compare changes
  const ingredientsKey = JSON.stringify(
    ingredients.map(ing => `${ing.quantity}${ing.unit}${ing.name}`)
  );
  
  // Reset the calculated flag when ingredients change
  useEffect(() => {
    if (ingredientsKey !== prevIngredientsRef.current) {
      calculatedRef.current = false;
      prevIngredientsRef.current = ingredientsKey;
    }
  }, [ingredientsKey]);
  
  // Auto-calculate when ingredients change significantly
  useEffect(() => {
    // Only calculate if:
    // 1. We haven't calculated this set of ingredients yet
    // 2. We have enough ingredients
    // 3. We're not already in the process of calculating
    // 4. We're not in the middle of generating a recipe
    if (
      !calculatedRef.current && 
      ingredients.length >= 3 && 
      !isCalculatingNutrition && 
      !isGenerating
    ) {
      // Add debounce to avoid too frequent calculations
      const timer = setTimeout(() => {
        calculateNutrition(ingredients, setNutrition, setIsCalculatingNutrition);
        calculatedRef.current = true;
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [ingredientsKey, ingredients.length, isGenerating, isCalculatingNutrition]);

  // Function to manually trigger calculation, memoized to prevent unnecessary rerenders
  const calculateIngredientNutrition = useCallback(() => {
    calculatedRef.current = true;
    return calculateNutrition(ingredients, setNutrition, setIsCalculatingNutrition);
  }, [ingredients]);

  // Function to reset calculation state when needed
  const resetCalculation = useCallback(() => {
    calculatedRef.current = false;
  }, []);

  return {
    nutrition,
    isCalculatingNutrition,
    setNutrition,
    setIsCalculatingNutrition,
    calculateIngredientNutrition,
    resetCalculation
  };
};