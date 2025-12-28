import { Plus } from "lucide-react";
import Image from "next/image";
import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";

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
  onClick: () => void;
  mealLabel: string;
  icon: React.ReactNode;
}

export const MealSlotItem: React.FC<MealSlotItemProps> = memo(({ 
  mealData, 
  onClick, 
  mealLabel, 
  icon 
}) => {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);

  const getMealColor = () => {
    switch(mealLabel.toLowerCase()) {
      case 'breakfast':
        return 'border-l-amber-500 bg-amber-500/10';
      case 'lunch':
        return 'border-l-emerald-500 bg-emerald-500/10';
      case 'dinner':
        return 'border-l-indigo-500 bg-indigo-500/10';
      default:
        return 'border-l-primary bg-primary/10';
    }
  };

  const getMealIconColor = () => {
    switch(mealLabel.toLowerCase()) {
      case 'breakfast':
        return 'bg-amber-500';
      case 'lunch':
        return 'bg-emerald-500';
      case 'dinner':
        return 'bg-indigo-500';
      default:
        return 'bg-primary';
    }
  };

  return (
    <Card
      onClick={handleClick}
      className={`
        group cursor-pointer transform transition-all duration-200 ease-out
        will-change-transform hover:scale-[1.02] hover:-translate-y-1 p-0 overflow-hidden
        ${mealData.recipe 
          ? `border-l-4 ${getMealColor()} hover:shadow-lg` 
          : 'border-2 border-dashed border-border hover:border-primary hover:bg-primary/5'
        }
      `}
    >
      {mealData.recipe ? (
        <>
          {/* Image Section - REDUCED HEIGHT */}
          <div className="relative w-full h-20 sm:h-24 bg-muted overflow-hidden">
            {mealData.recipe.featuredImage ? (
              <Image 
                src={mealData.recipe.featuredImage} 
                alt={mealData.recipe.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Meal Label Overlay - SMALLER SIZE */}
            <div className="absolute top-1.5 left-1.5">
              <div className="flex items-center px-1.5 py-0.5 bg-background/95 backdrop-blur-sm rounded-full shadow-sm border border-border">
                <div className={`w-2.5 h-2.5 rounded-full ${getMealIconColor()} mr-1 flex items-center justify-center`}>
                  <span className="scale-[0.4] text-white">{icon}</span>
                </div>
                <span className="text-[10px] font-medium text-foreground">{mealLabel}</span>
              </div>
            </div>
          </div>
          
          {/* Content Section - REDUCED PADDING AND FONT SIZES */}
          <div className="p-2 sm:p-3">
            <h4 className="font-semibold text-foreground text-xs sm:text-sm mb-1.5 line-clamp-1 group-hover:text-primary transition-colors">
              {mealData.recipe.title}
            </h4>
            
            {/* Tags - SMALLER DESIGN */}
            <div className="flex flex-wrap gap-1">
              {mealData.recipe.category && (
                <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-[10px] rounded-md font-medium">
                  {mealData.recipe.category}
                </span>
              )}
              {mealData.recipe.difficulty && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-medium ${
                  mealData.recipe.difficulty === 'easy' 
                    ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30' 
                    : mealData.recipe.difficulty === 'medium'
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30'
                }`}>
                  {mealData.recipe.difficulty}
                </span>
              )}
              {mealData.recipe.cookingTime && (
                <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md font-medium border border-primary/30">
                  {mealData.recipe.cookingTime}m
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Empty State - REDUCED SIZE */
        <div className="flex flex-col items-center justify-center py-4 sm:py-5 text-muted-foreground min-h-[80px] p-2 sm:p-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-muted flex items-center justify-center mb-2 group-hover:bg-primary/10 transition-colors">
            <span className="text-muted-foreground group-hover:text-primary transition-colors scale-75">{icon}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">
            <Plus size={12} className="mr-1" />
            <span>Add {mealLabel}</span>
          </div>
        </div>
      )}
    </Card>
  );
});

MealSlotItem.displayName = 'MealSlotItem';