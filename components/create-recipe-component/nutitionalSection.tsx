import React from "react";
import { motion } from "framer-motion";
import { Ingredient, NutritionData } from "@/types/recipe";
import { calculateNutrition } from "@/utils";

interface NutritionSectionProps {
  nutrition: NutritionData;
  ingredients: Ingredient[]; // Add ingredients prop
  isCalculatingNutrition: boolean;
  setNutrition: (data: NutritionData) => void; // Add setNutrition function
  setIsCalculatingNutrition: (isCalculating: boolean) => void; // Add setIsCalculatingNutrition function
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
  nutrition,
  ingredients,
  isCalculatingNutrition,
  setNutrition,
  setIsCalculatingNutrition
}) => {
  if (!nutrition) return null;
  
  // Calculate macronutrient percentages based on calorie contribution
  const totalCalFromMacros = Math.max(1, (nutrition.protein * 4) + (nutrition.carbs * 4) + (nutrition.fat * 9));
  
  const proteinPercent = Math.round((nutrition.protein * 4 / totalCalFromMacros) * 100);
  const carbsPercent = Math.round((nutrition.carbs * 4 / totalCalFromMacros) * 100);
  const fatPercent = Math.round((nutrition.fat * 9 / totalCalFromMacros) * 100);
  
  // Create the actual handler that calls the calculation function
  const handleCalculateNutrition = () => {
    calculateNutrition(ingredients, setNutrition, setIsCalculatingNutrition);
  };
  
  console.log({nutrition})
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mt-8 p-6 bg-gray-800/50 border border-white/10 backdrop-blur-sm rounded-xl shadow-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Nutritional Information</h3>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium text-white">{nutrition.calories} calories</span>
          <span className="text-sm text-gray-400">per serving</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Protein */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-purple-400">Protein</span>
            <span className="text-gray-300">{nutrition.protein}g ({proteinPercent}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-purple-600 h-2.5 rounded-full" 
              style={{ width: `${proteinPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-blue-400">Carbs</span>
            <span className="text-gray-300">{nutrition.carbs}g ({carbsPercent}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-500 h-2.5 rounded-full" 
              style={{ width: `${carbsPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Fat */}
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-medium text-amber-400">Fat</span>
            <span className="text-gray-300">{nutrition.fat}g ({fatPercent}%)</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-amber-500 h-2.5 rounded-full" 
              style={{ width: `${fatPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Additional nutrition info in a grid */}
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
          {nutrition.sugar !== undefined && (
            <div>
              <span className="text-sm text-gray-400">Sugar</span>
              <p className="font-medium text-white">{nutrition.sugar}g</p>
            </div>
          )}
          
          {nutrition.fiber !== undefined && (
            <div>
              <span className="text-sm text-gray-400">Fiber</span>
              <p className="font-medium text-white">{nutrition.fiber}g</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>* Nutritional values are estimated based on ingredients</p>
      </div>
      
      <button
        type="button"
        onClick={handleCalculateNutrition} // This will now call the actual calculation function
        disabled={isCalculatingNutrition}
        className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCalculatingNutrition ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Recalculating...
          </>
        ) : (
          <>Calculate Nutrition</>
        )}
      </button>
    </motion.div>
  );
};

export default NutritionSection;