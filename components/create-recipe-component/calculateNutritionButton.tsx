import { Ingredient } from "@/types/recipe";
import { calculateNutrition } from "@/utils";
import React from "react";


interface CalculateNutritionButtonProps {
  ingredients: Ingredient[];
  isCalculatingNutrition: boolean;
  setNutrition: (data: any) => void;
  setIsCalculatingNutrition: (isCalculating: boolean) => void;
}

const CalculateNutritionButton: React.FC<CalculateNutritionButtonProps> = ({
  ingredients,
  isCalculatingNutrition,
  setNutrition,
  setIsCalculatingNutrition
}) => {
  const handleCalculate = () => {
    calculateNutrition(ingredients, setNutrition, setIsCalculatingNutrition);
  };

  return (
    <div className="mt-2 text-right">
      <button
        type="button"
        onClick={handleCalculate}
        disabled={ingredients.length === 0 || isCalculatingNutrition}
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition"
      >
        {isCalculatingNutrition ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </>
        ) : (
          <>Calculate Nutrition</>
        )}
      </button>
    </div>
  );
};

export default CalculateNutritionButton;