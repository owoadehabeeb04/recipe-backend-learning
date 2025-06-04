import React, { useState, useEffect } from "react";
import { format, parseISO, addDays } from "date-fns";
import { motion } from "framer-motion";
import Link from "next/link";
import { Recipe } from "@/types/recipe";
import {
  normalizeIngredientsWithAI,
  categorizeIngredient
} from "@/utils/normalLizeIngredientsWithAi";
import {
  ChevronLeft,
  Calendar,
  Clock,
  ChefHat,
  Download,
  Printer,
  Share2,
  ShoppingBag
} from "lucide-react";
import ShoppingList from "../shopping-list/shoppingList";
import Image from "next/image";

interface MealPlanDay {
  [mealType: string]: {
    mealType: string;
    recipe: any;
    recipeDetails?: {
      title: string;
      featuredImage?: string;
      cookingTime?: number;
      cuisine?: string;
      difficulty?: string;
      ingredients?: {
        name: string;
        quantity: number | string;
        unit: string;
      }[];
    };
  };
}

interface MealPlan {
  _id: string;
  name: string;
  week: string; // ISO date string
  plan: {
    [day: string]: MealPlanDay;
  };
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  notes?: string;
}

interface MealPlannerDetailsProps {
  mealPlan: MealPlan;
  weekId: string;
}

const MealPlannerDetails: React.FC<MealPlannerDetailsProps> = ({
  mealPlan
}) => {
  const [activeTab, setActiveTab] = useState<"plan" | "shopping">("plan");
  const [normalizedIngredients, setNormalizedIngredients] = useState<any[]>([]);
  const [normalizedIngredientNames, setNormalizedIngredientNames] = useState<
    string[]
  >([]);
  const [isNormalizing, setIsNormalizing] = useState(false);
  const weekStart = parseISO(mealPlan.week);

  // Generate array of days for the week
  const days = Array(7)
    .fill(0)
    .map((_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        dayName: format(date, "EEEE").toLowerCase(), // Full day name, lowercase for object key matching
        displayDayName: format(date, "EEEE"), // Full day name for display
        dayNumber: format(date, "d"),
        month: format(date, "MMM"),
        fullDate: format(date, "yyyy-MM-dd")
      };
    });
  // Function to count total recipes
  // Function to count total recipes assigned in the meal plan
  const countRecipes = () => {
    let count = 0;
    Object.values(mealPlan.plan).forEach((day) => {
      // For each day, count meal slots that have recipes assigned
      Object.values(day).forEach((meal) => {

        // Check if this meal slot has a recipe assigned
        if (meal.recipeDetails && meal.recipe) {
          count += 1;
        }
      });
    });
    return count;
  };

  const getAllIngredients = () => {
    const ingredients: {
      [key: string]: { quantity: number | string; unit: string; name: string };
    } = {};
    // Keep track of all unique ingredient names
    const allIngredientNames = new Set<string>();

    Object.values(mealPlan.plan).forEach((day) => {
      Object.values(day).forEach((meal) => {
        if (meal.recipeDetails && meal.recipeDetails.ingredients) {
          meal.recipeDetails.ingredients.forEach((ing) => {
            // Add original name to our set of unique names
            allIngredientNames.add(ing.name);

            const key = ing.name.toLowerCase();
            if (ingredients[key]) {
              if (ingredients[key].unit === ing.unit) {
                if (typeof ingredients[key].quantity === "number" && typeof ing.quantity === "number") {
                  ingredients[key].quantity += ing.quantity;
                } else {
                  ingredients[key].quantity = `${ingredients[key].quantity}, ${ing.quantity}`;
                }
              } else {
                const newKey = `${key}-${ingredients[key].unit || "multiple"}`;
                ingredients[newKey] = ing;
              }
            } else {
              ingredients[key] = ing;
            }
          });
        }
      });
    });

    // Extract the unique ingredient names as an array
    const uniqueIngredientNames = Array.from(allIngredientNames).sort();

    // Save the unique ingredient names for normalization
    return {
      ingredientNames: uniqueIngredientNames,
      ingredients: Object.values(ingredients).sort((a, b) =>
        a.name.localeCompare(b.name)
      )
    };
  };

  // Use AI to normalize ingredients
  useEffect(() => {
    const normalizeIngredients = async () => {
      if (isNormalizing) return;

      setIsNormalizing(true);
      const { ingredientNames, ingredients } = getAllIngredients();

      try {
        // Call the AI to get normalization mapping
        const normalizationMap = await normalizeIngredientsWithAI(
          ingredientNames
        );

        const processedIngredients = ingredients.reduce(
          (result: { [key: string]: any }, ing) => {
            const normalizedName = normalizationMap[ing.name] || ing.name;
            const category = categorizeIngredient(normalizedName);
          
            const key = `${normalizedName}-${ing.unit || "none"}`;

            if (result[key]) {
              // If this ingredient already exists with the same unit, add quantities
              if (
                typeof result[key].quantity === "number" &&
                typeof ing.quantity === "number"
              ) {
                result[key].quantity =
                  Number(result[key].quantity) + Number(ing.quantity);
              } else {
                result[
                  key
                ].quantity = `${result[key].quantity}, ${ing.quantity}`;
              }
            } else {
              result[key] = {
                ...ing,
                normalizedName,
                category
              };
            }

            return result;
          },
          {}
        );

        // Convert the processed ingredients back to an array
        const normalizedIngredientArray = Object.values(processedIngredients);

        // Extract just the normalized names into a separate array
        const uniqueNormalizedNames = Array.from(
          new Set(normalizedIngredientArray.map((ing) => ing.normalizedName))
        ).sort();
        
        setNormalizedIngredientNames(uniqueNormalizedNames);
        setNormalizedIngredients(normalizedIngredientArray);

      } catch (error) {
        console.error("Error normalizing ingredients:", error);
      } finally {
        setIsNormalizing(false);
      }
    };

    normalizeIngredients();
  }, [mealPlan]);

  // Use the normalized ingredients instead of raw ingredients
  const ingredientList =
    normalizedIngredients.length > 0
      ? normalizedIngredients
      : getAllIngredients().ingredients;

  // Group ingredients by category
  const ingredientsByCategory: { [key: string]: any[] } = {};
  ingredientList.forEach((ing) => {
    const category = ing.category || "Other";
    if (!ingredientsByCategory[category]) {
      ingredientsByCategory[category] = [];
    }
    ingredientsByCategory[category].push(ing);
  });

  // Categories in a logical order for shopping
  const orderedCategories = [
    "Produce",
    "Meat & Seafood",
    "Dairy & Eggs",
    "Bakery",
    "Pantry",
    "Canned Goods",
    "Frozen Foods",
    "Condiments & Spices",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/10 via-black to-pink-900/10">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header section */}
        <div className="mb-8">
          <Link
            href="/dashboard/meal-planner"
            className="inline-flex items-center text-white hover:text-purple-300 mb-6 group transition-colors"
          >
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
                  {format(weekStart, "MMMM d")} -{" "}
                  {format(addDays(weekStart, 6), "MMMM d, yyyy")}
                </span>
              </div>
            </div>

            {/* <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
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
            </div> */}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">
                Total Days
              </h3>
              <p className="text-2xl font-bold text-white mt-1">7 days</p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">
                Total Meals
              </h3>
              <p className="text-2xl font-bold text-white mt-1">
                {countRecipes()} meals
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">
                Ingredients
              </h3>
              <p className="text-2xl font-bold text-white mt-1">
                {normalizedIngredientNames.length} items
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm border border-purple-600/20 rounded-xl p-4">
              <h3 className="text-sm text-purple-300 font-medium">
                Created On
              </h3>
              <p className="text-2xl font-bold text-white mt-1">
          {format(new Date(mealPlan.createdAt), "MMMM d")}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b border-purple-900/30">
          <button
            className={`pb-3 px-4 text-lg font-medium border-b-2 -mb-[1px] ${
              activeTab === "plan"
                ? "border-pink-500 text-white"
                : "border-transparent text-purple-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("plan")}
          >
            Meal Plan
          </button>
          <button
            className={`pb-3 px-4 text-lg font-medium border-b-2 -mb-[1px] ${
              activeTab === "shopping"
                ? "border-pink-500 text-white"
                : "border-transparent text-purple-300 hover:text-white"
            } transition-colors`}
            onClick={() => setActiveTab("shopping")}
          >
            Shopping List
          </button>
        </div>

        {activeTab === "plan" ? (
          /* Redesigned meal plan content with modern layout */
          <div className="grid grid-cols-1 md:grid-cols-7 gap-5">
            {days.map((day) => {
              // Convert day name to lowercase to match the plan keys
              const dayKey = day.dayName.toLowerCase();

              return (
                <div
                  key={day.fullDate}
                  className="bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl overflow-hidden flex flex-col h-full"
                >
                  {/* Enhanced day header with pattern and circular date */}
                  <div className="relative bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-4">
                    <div className="absolute inset-0 opacity-10 mix-blend-overlay" 
                         style={{backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "10px 10px"}}></div>
                         
                    {/* Improved day header layout */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white text-lg">
    {day.dayName.substring(0, 3).charAt(0).toUpperCase() + day.dayName.substring(0, 3).slice(1)}
                    
                      </h3>
                      <div className="bg-white/20 h-9 w-9 rounded-full flex items-center justify-center border border-white/30">
                        <span className="font-bold text-white">{day.dayNumber}</span>
                      </div>
                    </div>
                    <span className="text-xs text-white/70">{day.month}</span>
                  </div>

                  {/* Meals container with improved spacing */}
                  <div className="p-4 flex-1 flex flex-col space-y-4">
                    {["breakfast", "lunch", "dinner"].map((mealType) => {
                      // Access the plan data using the correct path
                      const mealForDay = mealPlan.plan[dayKey];
                      const meal = mealForDay ? mealForDay[mealType] : null;
                      
                      // Define meal type colors and icons
                      const mealTypeStyles: any = {
                        breakfast: {
                          icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                            </svg>
                          ),
                          color: "amber"
                        },
                        lunch: {
                          icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-green-400">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                            </svg>
                          ),
                          color: "green"
                        },
                        dinner: {
                          icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-400">
                              <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
                            </svg>
                          ),
                          color: "blue"
                        }
                      };
                      
                      const style = mealTypeStyles[mealType];

                      return (
                        <div key={mealType} className="flex flex-col">
                          {/* Elegant meal type header with icon */}
                          <div className="flex items-center mb-2">
                            {style.icon}
                            <span className="text-xs font-medium tracking-wider text-purple-300 uppercase ml-1.5">
                              {mealType}
                            </span>
                            <div className={`ml-2 flex-1 h-[1px] bg-gradient-to-r from-${style.color}-500/40 to-transparent`}></div>
                          </div>
                          
                          {meal && meal.recipeDetails ? (
                            <Link
                              href={`/dashboard/recipe/${
                                typeof meal.recipe === "object"
                                  ? meal.recipe._id
                                  : meal.recipe
                              }`}
                              className="block h-full"
                            >
                              <motion.div
                                whileHover={{ y: -3, boxShadow: "0 12px 20px -5px rgba(88, 28, 135, 0.3)" }}
                                transition={{ duration: 0.2 }}
                                className="bg-gradient-to-br from-purple-800/30 to-purple-900/50 border border-purple-700/30 rounded-lg overflow-hidden hover:border-purple-500/50 transition-all shadow-md h-full"
                              >
                                {/* Recipe card with improved layout */}
                                {meal.recipeDetails.featuredImage ? (
                                  <div className="relative">
                                    {/* Image with overlay gradient */}
                                    <div className="w-full h-24 relative">
                                      <Image
                                      width={1000}
                                      height={24}
                                        src={meal.recipeDetails.featuredImage}
                                        alt={meal.recipeDetails.title}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                      
                                      {/* Title overlay on image */}
                                      <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <h4 className="font-semibold text-white text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                          {meal.recipeDetails.title}
                                        </h4>
                                      </div>
                                    </div>
                                    
                                    {/* Meta information below image */}
                                    <div className="px-3 py-2">
                                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                        {meal.recipeDetails.cookingTime && (
                                          <div className="flex items-center">
                                            <Clock className="w-3 h-3 text-pink-300 mr-1 flex-shrink-0" />
                                            <span className="text-xs text-purple-200">
                                              {meal.recipeDetails.cookingTime} min
                                            </span>
                                          </div>
                                        )}
                                        
                                        {meal.recipeDetails.cuisine && (
                                          <div className="flex items-center">
                                            <span className={`w-1.5 h-1.5 rounded-full bg-${style.color}-400 mr-1`}></span>
                                            <span className="text-xs text-purple-300 truncate max-w-[100px]">
                                              {meal.recipeDetails.cuisine}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Difficulty badge */}
                                      {meal.recipeDetails.difficulty && (
                                        <div className="mt-2">
                                          <span className={`px-2 py-0.5 text-xs bg-${style.color}-600/20 text-${style.color}-200 rounded-full`}>
                                            {meal.recipeDetails.difficulty}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  /* Layout for recipes without images */
                                  <div className="p-3">
                                    <div className="flex items-start">
                                      <div className={`mr-3 h-10 w-10 rounded-lg bg-gradient-to-br from-${style.color}-600/20 to-${style.color}-700/30 flex items-center justify-center border border-${style.color}-500/20 flex-shrink-0`}>
                                        <ChefHat className={`w-5 h-5 text-${style.color}-200`} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white text-sm leading-tight mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                                          {meal.recipeDetails.title}
                                        </h4>
                                        <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                                          {meal.recipeDetails.cookingTime && (
                                            <div className="flex items-center">
                                              <Clock className="w-3 h-3 text-pink-300 mr-1 flex-shrink-0" />
                                              <span className="text-xs text-purple-200">
                                                {meal.recipeDetails.cookingTime} min
                                              </span>
                                            </div>
                                          )}
                                          
                                          {meal.recipeDetails.cuisine && (
                                            <div className="flex items-center">
                                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1"></span>
                                              <span className="text-xs text-purple-300 truncate max-w-[100px]">
                                                {meal.recipeDetails.cuisine}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                        
                                        {meal.recipeDetails.difficulty && (
                                          <div className="mt-2">
                                            <span className="px-2 py-0.5 text-xs bg-purple-700/30 text-purple-200 rounded-full">
                                              {meal.recipeDetails.difficulty}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </motion.div>
                            </Link>
                          ) : (
                            /* Empty slot with add button */
                            <div className={`bg-gradient-to-br from-${style.color}-900/10 to-purple-900/20 border border-${style.color}-800/20 rounded-lg flex justify-center items-center h-[60px] group cursor-pointer hover:border-${style.color}-700/30 transition-colors`}>
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 rounded-full bg-${style.color}-900/30 flex items-center justify-center mb-1 group-hover:bg-${style.color}-800/40 transition-colors`}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 text-${style.color}-400`}>
                                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                                  </svg>
                                </div>
                                <p className="text-xs text-purple-400/70">Add recipe</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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

            {/* Add this section to display normalized ingredient names */}
            {normalizedIngredientNames.length > 0 && (
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-800/30 rounded-lg">
                <h3 className="font-semibold text-white mb-3">
                  All Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {normalizedIngredientNames.map((name, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-700/30 text-purple-200 text-sm rounded-full"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* {Object.keys(ingredientsByCategory).length > 0 ? (
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
                        {ingredients.map((ing, idx) => {
                          
                          console.log('mapping ing', ing)
                          return (
                          <li key={idx} className="py-2 flex items-center">
                            <input 
                              type="checkbox" 
                              className="mr-3 h-4 w-4 rounded border-purple-500 text-pink-500 focus:ring focus:ring-pink-500/30 focus:ring-offset-0 bg-purple-900/50"
                            />
                            <span className="text-white">
                              {ing.quantity && ing.quantity > 0 ? (
                                <span className="text-purple-300">{ing.quantity} {ing.unit} </span>
                              ) : null}
                              {ing.normalizedName}
                            </span>
                          </li>
                        )})}
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
            )} */}

            {/* Notes section */}
            {mealPlan.notes && (
              <div className="mt-8 bg-purple-900/20 border border-purple-800/30 rounded-lg p-4">
                <h3 className="font-medium text-white mb-2">Notes</h3>
                <p className="text-purple-200">{mealPlan.notes}</p>
              </div>
            )}
              <ShoppingList mealPlanId={mealPlan._id} />

          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerDetails;
