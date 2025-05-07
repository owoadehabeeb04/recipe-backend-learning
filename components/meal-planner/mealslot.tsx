import { Plus } from "lucide-react";
import Image from "next/image";

interface MealData {
  recipe?: {
    featuredImage?: string;
    title: string;
    category?: string;
    difficulty?: string;
    cookingTime?: number;
  };
}

interface MealSlotItemProps {
  mealData: MealData;
  onClick: (recipe: MealData['recipe'] | null) => void;
  mealLabel: string;
  icon: React.ReactNode;
}

export const MealSlotItem: React.FC<MealSlotItemProps> = ({ mealData, onClick, mealLabel, icon }) => {
    const handleClick = () => {
      // Pass the recipe if it exists, allowing the parent to know if it's a new selection or edit
      onClick(mealData.recipe || null);
    };

    // Determine background gradient based on meal type
    const getMealGradient = () => {
      switch(mealLabel.toLowerCase()) {
        case 'breakfast':
          return 'from-amber-600/20 to-orange-700/20 hover:from-amber-600/30 hover:to-orange-700/30';
        case 'lunch':
          return 'from-emerald-600/20 to-teal-700/20 hover:from-emerald-600/30 hover:to-teal-700/30';
        case 'dinner':
          return 'from-indigo-600/20 to-violet-700/20 hover:from-indigo-600/30 hover:to-violet-700/30';
        default:
          return 'from-purple-600/20 to-pink-700/20 hover:from-purple-600/30 hover:to-pink-700/30';
      }
    };
    // console.log('Meal Slot Item:', mealData, mealLabel);
    // console.log('meal featured image', mealData.recipe?.featuredImage);
    return (
      <div 
        onClick={handleClick}
        className={`transition cursor-pointer group relative overflow-hidden rounded-xl
          ${mealData.recipe 
            ? `bg-gradient-to-br ${getMealGradient()} backdrop-blur-sm border border-white/10 shadow-lg hover:shadow-xl` 
            : 'bg-gray-900/30 border border-dashed border-gray-700 hover:border-purple-400 hover:bg-gray-800/40 p-4'
          }`
        }
      >
        {/* Glass effect overlay */}
        <div className="absolute inset-0 backdrop-blur-[1px] opacity-30 bg-gradient-to-br from-white/5 to-transparent"></div>
        
        <div className="relative">
          {mealData.recipe ? (
            <>
              {/* Image on top */}
              <div className="w-full h-32 overflow-hidden bg-gray-800 shadow-md">
                {mealData.recipe.featuredImage ? (
                  <Image 
                    src={mealData.recipe.featuredImage} 
                    alt={mealData.recipe.title}
                    width={64}
                    height={32}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                
                {/* Meal label as an overlay on the image */}
                <div className="absolute top-2 left-2 flex items-center">
                  <span className="px-2 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-xs flex items-center border border-white/20">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 mr-1.5 flex items-center justify-center">
                      <span className="scale-75">{icon}</span>
                    </span>
                    {mealLabel}
                  </span>
                </div>
              </div>
              
              {/* Content below image */}
              <div className="p-3">
                <h4 className="font-medium text-white group-hover:text-purple-200 transition mb-2 line-clamp-1">
                  {mealData.recipe.title}
                </h4>
                
                <div className="flex flex-wrap gap-1">
                  {mealData.recipe.category && (
                    <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md text-white text-xs rounded-full border border-white/20">
                      {mealData.recipe.category}
                    </span>
                  )}
                  {mealData.recipe.difficulty && (
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${
                      mealData.recipe.difficulty === 'easy' 
                        ? 'bg-green-900/40 text-green-300 border-green-700/30' 
                        : mealData.recipe.difficulty === 'medium'
                          ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/30'
                          : 'bg-red-900/40 text-red-300 border-red-700/30'
                    }`}>
                      {mealData.recipe.difficulty}
                    </span>
                  )}
                  {mealData.recipe.cookingTime && (
                    <span className="px-2 py-0.5 bg-blue-900/40 text-blue-300 text-xs rounded-full border border-blue-700/30">
                      {mealData.recipe.cookingTime} min
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-gray-400 h-full">
              <div className="w-12 h-12 rounded-full bg-gray-800/60 flex items-center justify-center mb-3 group-hover:bg-purple-900/30 transition-colors">
                {icon}
              </div>
              <div className="flex items-center">
                <Plus size={16} className="mr-1" />
                <span>Add {mealLabel}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };