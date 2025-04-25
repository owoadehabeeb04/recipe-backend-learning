import React, { useState } from 'react';
import { format, parseISO, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Recipe } from '@/types/recipe';
import { ChevronLeft, Calendar, Clock, ChefHat, Download, Printer, Share2, ShoppingBag } from 'lucide-react';

interface MealPlanDay {
  [mealType: string]: {
    mealType: string;
    recipe: any;
  };
}

interface MealPlan {
  _id: string;
  name: string;
  week: string; // ISO date string
  plan: {
    [day: string]: MealPlanDay;
  };
  notes?: string;
}

interface MealPlannerDetailsProps {
  mealPlan: MealPlan;
  weekId: string;
}

const MealPlannerDetails: React.FC<MealPlannerDetailsProps> = ({ mealPlan, weekId }) => {
  const [activeTab, setActiveTab] = useState<'plan' | 'shopping'>('plan');
  const weekStart = parseISO(mealPlan.week);
  
  // Generate array of days for the week
  const days = Array(7).fill(0).map((_, i) => {
    const date = addDays(weekStart, i);
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM'),
      fullDate: format(date, 'yyyy-MM-dd'),
    };
  });

  // Function to count total recipes
  const countRecipes = () => {
    let count = 0;
    Object.values(mealPlan.plan).forEach(day => {
      count += Object.keys(day).length;
    });
    return count;
  };

  const getAllIngredients = () => {
    const ingredients: {[key: string]: {quantity: number, unit: string, name: string}} = {};
    
    Object.values(mealPlan.plan).forEach(day => {
      Object.values(day).forEach(meal => {
        if (meal.recipe && meal.recipe.ingredients) {
          meal.recipe.ingredients.forEach(ing => {
            const key = ing.name.toLowerCase();
            if (ingredients[key]) {
              if (ingredients[key].unit === ing.unit) {
                ingredients[key].quantity += ing.quantity || 0;
              } else {
                const newKey = `${key}-${ingredients[key].unit || 'multiple'}`;
                ingredients[newKey] = ing;
              }
            } else {
              ingredients[key] = ing;
            }
          });
        }
      });
    });

    // Convert to array and sort alphabetically
    return Object.values(ingredients).sort((a, b) => a.name.localeCompare(b.name));
  };

  const totalRecipes = countRecipes();
  const allIngredients = getAllIngredients();

  // Group ingredients by category if available
  const ingredientsByCategory: {[key: string]: any[]} = {};
  allIngredients.forEach(ing => {
    const category = ing.category || 'Other';
    if (!ingredientsByCategory[category]) {
      ingredientsByCategory[category] = [];
    }
    ingredientsByCategory[category].push(ing);
  });
  
  // Categories in a logical order for shopping
  const orderedCategories = [
    'Produce',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Bakery',
    'Pantry',
    'Canned Goods',
    'Frozen Foods',
    'Condiments & Spices',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header section */}
        <div className="mb-8">
          <Link href="/dashboard/meal-planner" className="inline-flex items-center text-white hover:text-purple-300 mb-6 group transition-colors">
            <ChevronLeft className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Meal Planner</span>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                {mealPlan.name}
              </h1>
              
              <div className="flex items-center mt-2 text-purple-300">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
                </span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
              <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-lg border border-purple-600/30 flex items-center transition">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              
              <button className="px-4 py-2 bg-pink-600/20 hover:bg-pink-600/30 text-white rounded-lg border border-pink-600/30 flex items-center transition">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              
              <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-lg border border-purple-600/30 flex items-center transition">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>
          
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">Total Days</h3>
              <p className="text-2xl font-bold text-white mt-1">7 days</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">Total Recipes</h3>
              <p className="text-2xl font-bold text-white mt-1">{totalRecipes} recipes</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">Ingredients</h3>
              <p className="text-2xl font-bold text-white mt-1">{allIngredients.length} items</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">Created On</h3>
              <p className="text-2xl font-bold text-white mt-1">{format(new Date(), 'MMM d')}</p>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mb-6 flex border-b border-purple-900/30">
          <button
            className={`pb-3 px-4 text-lg font-medium border-b-2 -mb-[1px] ${
              activeTab === 'plan'
                ? 'border-pink-500 text-white'
                : 'border-transparent text-purple-300 hover:text-white'
            } transition-colors`}
            onClick={() => setActiveTab('plan')}
          >
            Meal Plan
          </button>
          <button
            className={`pb-3 px-4 text-lg font-medium border-b-2 -mb-[1px] ${
              activeTab === 'shopping'
                ? 'border-pink-500 text-white'
                : 'border-transparent text-purple-300 hover:text-white'
            } transition-colors`}
            onClick={() => setActiveTab('shopping')}
          >
            Shopping List
          </button>
        </div>
        
        {activeTab === 'plan' ? (
          /* Meal plan content */
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {days.map((day) => (
              <div key={day.fullDate} className="bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl overflow-hidden">
                {/* Day header */}
                <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-3 text-center">
                  <p className="font-medium text-white">{day.dayName}</p>
                  <p className="text-xl font-bold text-white">{day.dayNumber}</p>
                  <p className="text-xs text-white/80">{day.month}</p>
                </div>
                
                {/* Meals for the day */}
                <div className="p-3">
                  {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                    const meal = mealPlan.plan[day.dayName]?.[mealType];
                    return (
                      <div key={mealType} className="mb-4 last:mb-0">
                        <p className="text-xs font-medium text-purple-300 uppercase mb-1">
                          {mealType}
                        </p>
                        {meal ? (
                          <Link href={`/dashboard/recipe/${meal.recipe._id}`} className="block">
                            <motion.div 
                              whileHover={{ y: -2 }}
                              className="bg-purple-800/30 border border-purple-700/30 rounded-lg p-3 hover:border-purple-500/50 transition-colors"
                            >
                              <div className="flex items-center">
                                {meal.recipe.featuredImage ? (
                                  <div className="w-10 h-10 bg-purple-900/50 rounded-md mr-3 overflow-hidden flex-shrink-0">
                                    <img 
                                      src={meal.recipe.featuredImage} 
                                      alt={meal.recipe.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 bg-purple-900/50 rounded-md mr-3 flex items-center justify-center flex-shrink-0">
                                    <ChefHat className="w-5 h-5 text-purple-300" />
                                  </div>
                                )}
                                
                                <div>
                                  <h4 className="font-medium text-white text-sm line-clamp-2">
                                    {meal.recipe.title}
                                  </h4>
                                  {meal.recipe.cookingTime && (
                                    <div className="flex items-center mt-1">
                                      <Clock className="w-3 h-3 text-purple-300 mr-1" />
                                      <span className="text-xs text-purple-300">
                                        {meal.recipe.cookingTime} min
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </Link>
                        ) : (
                          <div className="bg-purple-900/20 border border-purple-800/30 rounded-lg p-3 flex justify-center items-center h-[70px]">
                            <p className="text-xs text-purple-400/70">No recipe selected</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Shopping list content */
          <div className="bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-pink-400" />
                Shopping List
              </h2>
              
              <div className="flex space-x-3 mt-3 sm:mt-0">
                <button className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-lg border border-purple-600/30 flex items-center transition">
                  <Printer className="h-4 w-4 mr-2" />
                  Print List
                </button>
              </div>
            </div>
            
            {Object.keys(ingredientsByCategory).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orderedCategories.map(category => {
                  const ingredients = ingredientsByCategory[category];
                  if (!ingredients || ingredients.length === 0) return null;
                  
                  return (
                    <div key={category} className="bg-purple-900/20 border border-purple-800/30 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-600/60 to-pink-600/60 py-2 px-4">
                        <h3 className="font-medium text-white">{category}</h3>
                      </div>
                      <ul className="p-4 divide-y divide-purple-800/30">
                        {ingredients.map((ing, idx) => (
                          <li key={idx} className="py-2 flex items-center">
                            <input 
                              type="checkbox" 
                              className="mr-3 h-4 w-4 rounded border-purple-500 text-pink-500 focus:ring focus:ring-pink-500/30 focus:ring-offset-0 bg-purple-900/50"
                            />
                            <span className="text-white">
                              {ing.quantity && ing.quantity > 0 ? (
                                <span className="text-purple-300">{ing.quantity} {ing.unit} </span>
                              ) : null}
                              {ing.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No ingredients found</h3>
                <p className="text-purple-300">Add recipes to your meal plan to generate a shopping list.</p>
              </div>
            )}
            
            {/* Notes section */}
            {mealPlan.notes && (
              <div className="mt-8 bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Notes</h3>
                <p className="text-purple-200">{mealPlan.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerDetails;