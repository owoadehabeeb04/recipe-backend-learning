import { Check } from "lucide-react";

export const NutritionSummary = () => {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Weekly Nutrition</h3>
        
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Calories</span>
              <span className="font-medium">1,850 kcal/day</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Protein</span>
              <span className="font-medium">95g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Carbs</span>
              <span className="font-medium">220g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-medium text-gray-700">Fat</span>
              <span className="font-medium">60g</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 h-2 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="flex">
            <div className="text-purple-500 mr-3">
              <Check size={20} />
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Balanced Diet</h4>
              <p className="text-sm text-gray-600">Your meal plan is well-balanced with good macronutrient distribution.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };