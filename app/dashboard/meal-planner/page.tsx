"use client";
import React, { useState, useEffect, useMemo } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import { Calendar, ChevronLeft, ChevronRight, Clock, Check, Plus, Star, Calendar as CalendarIcon, ShoppingBag, BookOpen, Save } from "lucide-react";
import { CalendarHeader, MealPlanCalendar } from "@/components/meal-planner/calendar";
import { GroceryList } from "@/components/meal-planner/grocerylist";
import { NutritionSummary } from "@/components/meal-planner/nutritionSummary";
import { SavedPlanDetailsModal } from "@/components/meal-planner/savedPlanDetailsModal";
import { SavePlanModal } from "@/components/meal-planner/savePlanModal";
import { getFavorites } from "@/app/api/(favorites)/favorites";
import { useAuthStore } from "@/app/store/authStore";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { RecipeSelector } from "@/components/meal-planner/recipeSelector";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createMealPlan, updateMealPlan, getMealPlanById, getUserMealPlans, deleteMealPlan, duplicateMealPlan } from "../../api/(meal-planner)/mealplanner";
import { DuplicatePlanModal } from "@/components/meal-planner/duplicatePlanModal";

// Types
interface Recipe {
  id: string;
  title: string;
  tags: string[];
  image: string;
  isFavorite?: boolean;
}

interface WeekPlanStore {
  [weekKey: string]: {
    [day: string]: {
      [mealType: string]: {
        mealType: string;
        recipe: Recipe;
      };
    };
  };
}

interface SavedPlan {
  id: string;
  _id?: string;
  name: string;
  date: Date;
  week?: Date;
  plan: {
    [day: string]: {
      [mealType: string]: {
        mealType: string;
        recipe: Recipe;
      };
    };
  };
  notes?: string;
}

// Helper functions
function getWeekDates(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

const countMeals = (weekPlan: WeekPlanStore[string]) => {
  let count = 0;
  for (const day in weekPlan) {
    //({day})
    //({weekPlan})
    //(weekPlan[day], 'weekPlan[day]')
    if (weekPlan[day]?.breakfast?.recipe) count++;
    if (weekPlan[day]?.lunch?.recipe) count++;
    if (weekPlan[day]?.dinner?.recipe) count++;
  }
  return count;
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }> = ({ active, onClick, children, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg font-medium ${
        active 
          ? 'bg-purple-100 text-purple-700' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </button>
  );
};

// Main Page Component
const MealPlannerPage = () => {
  const [currentDate, setCurrentDate] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [allWeekPlans, setAllWeekPlans] = useState<WeekPlanStore>({});
  const [selectedMealInfo, setSelectedMealInfo] = useState<{ day: string, mealType: string } | null>(null);
  const [showRecipeSelector, setShowRecipeSelector] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SavedPlan | null>(null);
  const [showPlanDetailsModal, setShowPlanDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState("planner");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();
  const router = useRouter();

  const currentWeekKey = useMemo(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    return format(startDate, 'yyyy-MM-dd');
  }, [currentDate]);

  const currentWeekPlan = useMemo(() => {
    return allWeekPlans[currentWeekKey] || {};
  }, [allWeekPlans, currentWeekKey]);
  //
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToCurrentWeek = () => setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const updateWeekPlan = (weekKey: string, newPlan: any) => {
    setAllWeekPlans(prev => ({
      ...prev,
      [weekKey]: newPlan
    }));
  };

  const handleAddMeal = (day: string, mealType: string) => {
    setSelectedMealInfo({ day, mealType });
    setShowRecipeSelector(true);
  };

  const handleRemoveMeal = () => {
    if (!selectedMealInfo) return;
    
    const { day, mealType } = selectedMealInfo;
    
    setAllWeekPlans(prev => {
      const newAllPlans = { ...prev };
      const currentPlan = { ...newAllPlans[currentWeekKey] };
      
      if (currentPlan[day]) {
        if (currentPlan[day][mealType]) {
          delete currentPlan[day][mealType];
        }
        
        if (Object.keys(currentPlan[day]).length === 0) {
          delete currentPlan[day];
        }
      }
      
      newAllPlans[currentWeekKey] = currentPlan;
      return newAllPlans;
    });
    
    toast.success(`Removed ${mealType} on ${day}`, {
      icon: '🗑️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
    
    setShowRecipeSelector(false);
    setSelectedMealInfo(null);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!selectedMealInfo) return;
    
    const { day, mealType } = selectedMealInfo;
    
    setAllWeekPlans(prev => {
      const newAllPlans = { ...prev };
      const currentPlan = newAllPlans[currentWeekKey] ? { ...newAllPlans[currentWeekKey] } : {};
      
      if (!currentPlan[day]) {
        currentPlan[day] = {};
      }
      
      currentPlan[day][mealType] = {
        mealType,
        recipe
      };
      
      newAllPlans[currentWeekKey] = currentPlan;
      return newAllPlans;
    });
    
    setShowRecipeSelector(false);
    setSelectedMealInfo(null);
    
    toast.success(`Added ${recipe.title} to ${mealType} on ${day}`, {
      icon: '🍽️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  // const handleGeneratePlan = async () => {
  //   toast.loading("Creating your personalized meal plan...", { id: "mealplan" });
    
  //   try {
  //     // 1. First, fetch the user's favorite recipes
  //     const favoritesResponse = await getFavorites(token);
  //     const favoriteRecipes = favoritesResponse.success 
  //       ? favoritesResponse.data.map(item => item.recipe) // Extract recipe objects from favorites
  //       : [];
      
  //     // 2. Also fetch a pool of high-rated recipes to fill in gaps
  //     const popularRecipesResponse = await getAllRecipes({
  //       page: 1,
  //       limit: 50,
  //     });
  //     const popularRecipes = popularRecipesResponse.status === 200 ? popularRecipesResponse.data : [];
      
  //     // Log what data we're working with
  //     // //("Favorite recipes:", favoriteRecipes);
  //     // //("Popular recipes:", popularRecipes);
      
  //     // Check if we have valid recipe objects
  //     if ((!favoriteRecipes || favoriteRecipes.length === 0) && 
  //         (!popularRecipes || popularRecipes.length === 0)) {
  //       toast.error("No recipes found to create a meal plan", { id: "mealplan" });
  //       return;
  //     }
      
  //     // 3. Combine both sets but remove duplicates
  //     const allRecipes = [...favoriteRecipes];
      
  //     // Add popular recipes that aren't already in favorites
  //     popularRecipes.forEach(recipe => {
  //       if (!allRecipes.some(r => r._id === recipe._id)) {
  //         allRecipes.push(recipe);
  //       }
  //     });
      
  //     // Validate each recipe object to ensure it has the required properties
  //     const validatedRecipes = allRecipes.filter(recipe => {
  //       // Check if recipe is a valid object
  //       if (!recipe || typeof recipe !== 'object') {
  //         console.warn("Invalid recipe object", recipe);
  //         return false;
  //       }
        
  //       // Check for title, which is essential
  //       if (!recipe.title) {
  //         console.warn("Recipe missing title", recipe);
  //         return false;
  //       }
        
  //       // Check for ID
  //       if (!recipe._id && !recipe.id) {
  //         console.warn("Recipe missing ID", recipe);
  //         return false;
  //       }
        
  //       return true;
  //     });
      
  //     // //("Validated recipes count:", validatedRecipes.length);
      
  //     if (validatedRecipes.length === 0) {
  //       toast.error("No valid recipes found to create a meal plan", { id: "mealplan" });
  //       return;
  //     }
      
  //     // 4. Generate a new plan while preserving existing selections
  //     const newPlan = { ...currentWeekPlan };
  //     let usedRecipeIds = new Set(); // Track used recipes to avoid repetition
      
  //     // First, collect all existing recipe selections to preserve them
  //     // and mark them as used in our tracking
  //     weekDates.forEach(date => {
  //       const day = format(date, 'EEE');
  //       if (newPlan[day]) {
  //         ["breakfast", "lunch", "dinner"].forEach(mealType => {
  //           if (newPlan[day][mealType] && newPlan[day][mealType].recipe) {
  //             // Ensure the recipe has an ID before adding it to used IDs
  //             const recipeId = newPlan[day][mealType].recipe._id || newPlan[day][mealType].recipe.id;
  //             if (recipeId) {
  //               usedRecipeIds.add(recipeId);
  //             }
  //           }
  //         });
  //       }
  //     });
  
  //     // Now fill in the missing slots
  //     weekDates.forEach(date => {
  //       const day = format(date, 'EEE');
  //       newPlan[day] = newPlan[day] || {};
        
  //       // For each meal type
  //       ["breakfast", "lunch", "dinner"].forEach(mealType => {
  //         // Skip if this meal already has a valid recipe assigned
  //         if (newPlan[day][mealType] && newPlan[day][mealType].recipe && 
  //             (newPlan[day][mealType].recipe.title || newPlan[day][mealType].recipe.name)) {
  //           return; // Skip this meal, it's already filled with a valid recipe
  //         }
          
  //         // Get best candidates for this meal type - focus on category match
  //         let candidates = validatedRecipes.filter(r => {
  //           // Skip recipes that are already used
  //           const recipeId = r._id || r.id;
  //           if (usedRecipeIds.has(recipeId)) {
  //             return false;
  //           }
            
  //           // Direct category match
  //           if (r.category?.toLowerCase() === mealType.toLowerCase()) {
  //             return true;
  //           }
            
  //           // For lunch/dinner, also consider main dishes
  //           if ((mealType === "lunch" || mealType === "dinner") && 
  //               (r.category?.toLowerCase() === "main dish" || 
  //                r.category?.toLowerCase() === "main course")) {
  //             return true;
  //           }
            
  //           return false;
  //         });
          
  //         // If we don't have enough candidates, expand to include recipes with similar categories
  //         if (candidates.length < 3) {
  //           const expandedCandidates = validatedRecipes.filter(r => {
  //             // Skip recipes that are already candidates or already used
  //             const recipeId = r._id || r.id;
  //             if (candidates.some(c => (c._id === recipeId || c.id === recipeId)) || 
  //                 usedRecipeIds.has(recipeId)) {
  //               return false;
  //             }
              
  //             if (mealType === "breakfast") {
  //               // Breakfast alternatives
  //               return ["brunch", "morning", "breakfast"].some(term => 
  //                 r.title.toLowerCase().includes(term) || 
  //                 r.description?.toLowerCase().includes(term)
  //               );
  //             } else if (mealType === "lunch") {
  //               // Lunch alternatives
  //               return ["salad", "sandwich", "soup", "bowl", "wrap"].some(term => 
  //                 r.title.toLowerCase().includes(term) || 
  //                 r.description?.toLowerCase().includes(term)
  //               );
  //             } else if (mealType === "dinner") {
  //               // Dinner alternatives
  //               return ["dinner", "pasta", "roast", "bake", "grill", "steak", "casserole"].some(term => 
  //                 r.title.toLowerCase().includes(term) || 
  //                 r.description?.toLowerCase().includes(term)
  //               );
  //             }
              
  //             return false;
  //           });
            
  //           // Add expanded candidates
  //           candidates = [...candidates, ...expandedCandidates];
  //         }
          
  //         // If still no candidates, allow reusing recipes (except those already used in this plan)
  //         if (candidates.length === 0) {
  //           candidates = validatedRecipes.filter(r => {
  //             const recipeId = r._id || r.id;
  //             return !usedRecipeIds.has(recipeId);
  //           });
  //         }
          
  //         // Last resort: just use any recipe if we still have none
  //         if (candidates.length === 0 && validatedRecipes.length > 0) {
  //           candidates = validatedRecipes;
  //         }
          
  //         // First try to find a favorite recipe that fits
  //         let selectedRecipe = candidates.find(r => 
  //           favoriteRecipes.some(f => (f._id === r._id || f._id === r.id))
  //         );
          
  //         // If no favorite found, try any recipe that fits
  //         if (!selectedRecipe && candidates.length > 0) {
  //           // Randomize selection a bit
  //           const randomIndex = Math.floor(Math.random() * Math.min(3, candidates.length));
  //           selectedRecipe = candidates[randomIndex];
  //         }
          
  //         // If we found a recipe, add it to the plan and mark as used
  //         if (selectedRecipe) {
  //           // Log which recipe was selected
  //           //(`Selected for ${day} ${mealType}:`, selectedRecipe.title);
            
  //           // Make sure we have all the properties we need
  //           const formattedRecipe = {
  //             id: selectedRecipe._id || selectedRecipe.id,
  //             _id: selectedRecipe._id || selectedRecipe.id,
  //             title: selectedRecipe.title,
  //             tags: selectedRecipe.tags || [],
  //             image: selectedRecipe.featuredImage || selectedRecipe.image || '',
  //             category: selectedRecipe.category || mealType, // Default to the mealType if no category
  //             description: selectedRecipe.description || '',
  //             ingredients: selectedRecipe.ingredients || [],
  //             instructions: selectedRecipe.instructions || [],
  //             isFavorite: favoriteRecipes.some(f => (f._id === selectedRecipe._id || f._id === selectedRecipe.id)),
  //             // Add any other properties you need
  //           };
            
  //           newPlan[day][mealType] = {
  //             mealType,
  //             recipe: formattedRecipe
  //           };
            
  //           usedRecipeIds.add(selectedRecipe._id || selectedRecipe.id);
  //         } else {
  //           console.warn(`No recipe selected for ${day} ${mealType}`);
  //         }
  //       });
  //     });
      
  //     // Check if we have successfully generated a plan with at least some recipes
  //     let planHasRecipes = false;
  //     weekDates.forEach(date => {
  //       const day = format(date, 'EEE');
  //       if (newPlan[day]) {
  //         ["breakfast", "lunch", "dinner"].forEach(mealType => {
  //           if (newPlan[day][mealType] && newPlan[day][mealType].recipe && 
  //               newPlan[day][mealType].recipe.title) {
  //             planHasRecipes = true;
  //           }
  //         });
  //       }
  //     });
      
  //     if (!planHasRecipes) {
  //       toast.error("Failed to generate meal plan. No recipes could be assigned.", { id: "mealplan" });
  //       return;
  //     }
      
  //     // Update the plan state for the current week only
  //     setAllWeekPlans(prev => ({
  //       ...prev,
  //       [currentWeekKey]: newPlan
  //     }));

  //     //({ allWeekPlans });
      


  //     toast.success("Your personalized meal plan is ready!", { id: "mealplan" });
      
  //   } catch (error) {
  //     console.error("Error generating meal plan:", error);
  //     toast.error("Failed to create meal plan. Please try again.", { id: "mealplan" });
  //   }
  // };

  useEffect(() => {
    if (Object.keys(allWeekPlans).length > 0) {
      localStorage.setItem('mealPlans', JSON.stringify(allWeekPlans));
    }
  }, [allWeekPlans]);

  useEffect(() => {
    const savedPlans = localStorage.getItem('mealPlans');
    if (savedPlans) {
      try {
        setAllWeekPlans(JSON.parse(savedPlans));
      } catch (e) {
        console.error("Error loading saved meal plans", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    
    async function fetchSavedPlans() {
      setIsLoading(true);
      try {
        const response = await getUserMealPlans(token);
        //({response})
        
        if (response.success && response.data) {
          // Transform backend data format to match your frontend format
          const formattedPlans = response.data.map((plan: any) => ({
            id: plan._id,
            _id: plan._id,
            name: plan.name,
            date: new Date(plan.week), // Use week as the date
            week: new Date(plan.week),
            plan: plan.plan, // Store the raw plan data without transforming
            notes: plan.notes
          }));
          
          setSavedPlans(formattedPlans);
        } else {
          console.error("Failed to fetch saved plans:", response.message);
        }
      } catch (error) {
        console.error("Error fetching saved plans:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchSavedPlans();
  }, [token]);
  // const formatPlanForFrontend = (backendPlan: any) => {
  //   const frontendPlan: any = {};
    
  //   // Map backend day names to frontend day names
  //   const dayMap: {[key: string]: string} = {
  //     'monday': 'Mon',
  //     'tuesday': 'Tue',
  //     'wednesday': 'Wed',
  //     'thursday': 'Thu',
  //     'friday': 'Fri',
  //     'saturday': 'Sat',
  //     'sunday': 'Sun'
  //   };
    
  //   // Convert each day in the plan
  //   for (const [backendDay, meals] of Object.entries(backendPlan)) {
  //     const frontendDay = dayMap[backendDay.toLowerCase()];
  //     if (frontendDay && meals) {
  //       frontendPlan[frontendDay] = {};
        
  //       // Convert each meal in the day
  //       for (const [mealType, mealData] of Object.entries(meals as any)) {
  //         // Get the recipe - could be directly in recipe field or in recipeDetails
  //         let recipe = (mealData as any).recipe;
          
  //         // If recipe is just an ID, try to get the full recipe from recipeDetails
  //         if (typeof recipe === 'string' || (!recipe.title && (mealData as any).recipeDetails)) {
  //           recipe = (mealData as any).recipeDetails;
  //         }
          
  //         if (recipe) {
  //           // Log what we're working with to debug
  //           //(`Recipe data for ${frontendDay} ${mealType}:`, recipe);
            
  //           // Transform the recipe format if needed, preserving ALL available fields
  //           const frontendRecipe = {
  //             // Essential fields with fallbacks
  //             id: recipe._id || recipe.id,
  //             _id: recipe._id || recipe.id,
  //             title: recipe.title || recipe.name || "Unknown Recipe",
              
  //             // Content fields with defaults
  //             tags: recipe.tags || [],
  //             image: recipe.featuredImage || recipe.image || '',
  //             category: recipe.category || mealType, // Default to mealType if no category
  //             description: recipe.description || '',
              
  //             // Recipe details
  //             ingredients: recipe.ingredients || [],
  //             instructions: recipe.instructions || [],
  //             prepTime: recipe.prepTime,
  //             cookTime: recipe.cookTime,
  //             servings: recipe.servings,
  //             calories: recipe.calories,
  //             protein: recipe.protein,
  //             carbs: recipe.carbs,
  //             fat: recipe.fat,
              
  //             // Additional metadata
  //             isFavorite: recipe.isFavorite || false,
  //             author: recipe.author,
  //             createdAt: recipe.createdAt,
  //             updatedAt: recipe.updatedAt,
              
  //             // Preserve any other fields that might be present
  //             ...Object.fromEntries(
  //               Object.entries(recipe).filter(([key]) => 
  //                 !['_id', 'id', 'title', 'name', 'tags', 'featuredImage', 'image', 
  //                   'category', 'description', 'ingredients', 'instructions', 
  //                   'prepTime', 'cookTime', 'servings', 'isFavorite', 'author', 
  //                   'createdAt', 'updatedAt', 'calories', 'protein', 'carbs', 'fat'].includes(key)
  //               )
  //             )
  //           };
            
  //           frontendPlan[frontendDay][mealType] = {
  //             mealType,
  //             recipe: frontendRecipe
  //           };
  //         }
  //       }
  //     }
  //   }
    
  //   return frontendPlan;
  // };

  // const formatPlanForBackend = (frontendPlan: any) => {
  //   const backendPlan: any = {};
    
  //   // Map frontend day names to backend day names
  //   const dayMap: {[key: string]: string} = {
  //     'Mon': 'monday',
  //     'Tue': 'tuesday',
  //     'Wed': 'wednesday',
  //     'Thu': 'thursday',
  //     'Fri': 'friday',
  //     'Sat': 'saturday',
  //     'Sun': 'sunday'
  //   };
    
  //   // Convert each day in the plan
  //   for (const [frontendDay, meals] of Object.entries(frontendPlan)) {
  //     const backendDay = dayMap[frontendDay];
  //     if (backendDay && meals) {
  //       // Skip empty days
  //       if (Object.keys(meals).length === 0) {
  //         continue;
  //       }
        
  //       backendPlan[backendDay] = {};
        
  //       // Convert each meal in the day
  //       for (const [mealType, mealData] of Object.entries(meals as any)) {
  //         const recipe = (mealData as any).recipe;
          
  //         if (recipe) {
  //           // Ensure we're sending both recipe ID and full recipe details
  //           backendPlan[backendDay][mealType] = {
  //             mealType,
  //             recipe: recipe._id || recipe.id, // Send ID for reference
  //             recipeDetails: {
  //               // Include all essential recipe data
  //               _id: recipe._id || recipe.id,
  //               id: recipe._id || recipe.id,
  //               title: recipe.title || recipe.name || "Untitled Recipe",
  //               image: recipe.image || recipe.featuredImage || "",
  //               tags: recipe.tags || [],
  //               category: recipe.category || "",
  //               description: recipe.description || "",
  //               ingredients: recipe.ingredients || [],
  //               instructions: recipe.instructions || [],
  //               prepTime: recipe.prepTime || "",
  //               cookTime: recipe.cookTime || "",
  //               servings: recipe.servings || 0
  //             }
  //           };
  //         }
  //       }
        
  //       // If this day has no meals after filtering, skip it
  //       if (Object.keys(backendPlan[backendDay]).length === 0) {
  //         delete backendPlan[backendDay];
  //       }
  //     }
  //   }
    
  //   // Log what we're sending to the backend
  //   //("Plan being sent to backend:", backendPlan);
    
  //   return backendPlan;
  // };

  const handleSavePlan = async (name: string, notes?: string) => {
    if (!token) {
      toast.error("You must be logged in to save meal plans");
      return;
    }
    
    setIsLoading(true);
    toast.loading("Saving your meal plan...", { id: "saveplan" });
    
    try {
      // Check if the current plan has any meals
      let hasAnyMeals = false;
      Object.values(currentWeekPlan).forEach(dayMeals => {
        if (Object.keys(dayMeals).length > 0) {
          hasAnyMeals = true;
        }
      });
      
      if (!hasAnyMeals) {
        toast.error("Cannot save an empty meal plan", { id: "saveplan" });
        setIsLoading(false);
        return;
      }
      
      // Create the plan data for the backend
      const backendPlan = {};
      
      // Map frontend days to backend days
      const dayMap = {
        'Mon': 'monday',
        'Tue': 'tuesday',
        'Wed': 'wednesday',
        'Thu': 'thursday',
        'Fri': 'friday',
        'Sat': 'saturday',
        'Sun': 'sunday'
      };
      
      // Build the plan structure directly
      Object.entries(currentWeekPlan).forEach(([frontendDay, meals]) => {
        const backendDay = dayMap[frontendDay];
        
        if (backendDay && Object.keys(meals).length > 0) {
          backendPlan[backendDay] = {};
          
          Object.entries(meals).forEach(([mealType, mealData]) => {
            const recipe = mealData.recipe;
            
            if (recipe && (recipe._id || recipe.id)) {
              backendPlan[backendDay][mealType] = {
                mealType,
                recipe: recipe._id || recipe.id
              };
            }
          });
        }
      });
      
      // Get the start of the week
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      
      // Format the data for the backend
      const planData = {
        name,
        week: weekStart,
        plan: backendPlan,
        notes: notes || ''
      };
      
      //("Sending to backend:", planData);
      
      const response = await createMealPlan(planData, token);
      //("Backend response:", response);
      
      // Clear success case
      if (response.success && response.data) {
        const savedPlan = {
          id: response.data._id,
          _id: response.data._id,
          name: response.data.name,
          date: new Date(response.data.week),
          week: new Date(response.data.week),
          plan: response.data.plan,
          notes: response.data.notes
        };
        
        setSavedPlans(prev => [...prev, savedPlan]);
        
        toast.success(`Plan "${name}" has been saved!`, {
          id: "saveplan",
          icon: "💾",
        });
        return;
      }
      
      // Check for specific message about existing plan
      if (response.message && response.message.includes("already have a meal plan")) {
        toast("A meal plan for this week already exists", { 
          id: "saveplan", 
          icon: "ℹ️", 
          style: { 
            borderRadius: "10px", 
            background: "#333", 
            color: "#fff" 
          } 
        });
        
        // Check if we have existingPlan data
        if (response.existingPlan && response.existingPlan.id) {
          if (confirm(`A meal plan for this week already exists. Would you like to update it instead?`)) {
            handleUpdatePlan(response.existingPlan.id, name, notes);
          } else {
            toast("Save cancelled. Your existing plan was not modified.", {
              id: "saveplan",
              icon: "ℹ️",
            });
          }
        } else {
          // If no existing plan ID is provided, just show the error
          toast.error("Can't update the existing plan: missing plan ID", { id: "saveplan" });
        }
        return;
      }
      
      // Generic error case
      toast.error(response.message || "Failed to save meal plan", { id: "saveplan" });
      
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast.error("Failed to save meal plan. Please try again.", { id: "saveplan" });
    } finally {
      setIsLoading(false);
      setShowSaveModal(false);
    }
  };

  const handleUpdatePlan = async (planId: string, name: string, notes?: string) => {
    if (!token) {
      toast.error("You must be logged in to update meal plans");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create the plan data for the backend in the expected format
      const backendPlan = {};
      
      // Map frontend days to backend days
      const dayMap = {
        'Mon': 'monday',
        'Tue': 'tuesday',
        'Wed': 'wednesday',
        'Thu': 'thursday',
        'Fri': 'friday',
        'Sat': 'saturday',
        'Sun': 'sunday'
      };
      
      // Build the plan structure directly
      Object.entries(currentWeekPlan).forEach(([frontendDay, meals]) => {
        const backendDay = dayMap[frontendDay];
        
        if (backendDay && Object.keys(meals).length > 0) {
          backendPlan[backendDay] = {};
          
          Object.entries(meals).forEach(([mealType, mealData]) => {
            const recipe = mealData.recipe;
            
            if (recipe && (recipe._id || recipe.id)) {
              // Just store the recipe ID as the backend expects
              backendPlan[backendDay][mealType] = {
                mealType,
                recipe: recipe._id || recipe.id
              };
            }
          });
          
          // Remove days with no meals
          if (Object.keys(backendPlan[backendDay]).length === 0) {
            delete backendPlan[backendDay];
          }
        }
      });
      
      const updateData = {
        name,
        plan: backendPlan,
        notes: notes || ''
      };
      
      //("Updating plan with data:", updateData);
      
      const response = await updateMealPlan(planId, updateData, token);
      
      if (response.success && response.data) {
        // Update the saved plan in state with the raw response data
        setSavedPlans(prev => prev.map(plan => {
          if (plan.id === planId || plan._id === planId) {
            return {
              ...plan,
              name: response.data.name,
              plan: response.data.plan, // Store the raw plan data
              notes: response.data.notes
            };
          }
          return plan;
        }));
        
        toast.success(`Plan "${name}" has been updated!`, {
          icon: "✏️",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff"
          }
        });
      } else {
        toast.error(response.message || "Failed to update meal plan");
      }
    } catch (error) {
      console.error("Error updating meal plan:", error);
      toast.error("Failed to update meal plan. Please try again.");
    } finally {
      setIsLoading(false);
      setShowSaveModal(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!token) {
      toast.error("You must be logged in to delete meal plans");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this meal plan?")) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await deleteMealPlan(planId, token);
      
      if (response.success) {
        // Remove from saved plans
        setSavedPlans(prev => prev.filter(plan => (plan.id !== planId && plan._id !== planId)));
        
        toast.success("Meal plan deleted successfully", {
          icon: "🗑️",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff"
          }
        });
      } else {
        toast.error(response.message || "Failed to delete meal plan");
      }
    } catch (error) {
      console.error("Error deleting meal plan:", error);
      toast.error("Failed to delete meal plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // const handleDuplicatePlan = async (planId: string) => {
  //   if (!token) {
  //     toast.error("You must be logged in to duplicate meal plans");
  //     return;
  //   }
    
  //   setIsLoading(true);
    
  //   try {
  //     const response = await duplicateMealPlan(planId, token);
      
  //     if (response.success && response.data) {
  //       // Store the raw plan data without formatting
  //       const duplicatedPlan: SavedPlan = {
  //         id: response.data._id,
  //         _id: response.data._id,
  //         name: response.data.name,
  //         date: new Date(response.data.week),
  //         week: new Date(response.data.week),
  //         plan: response.data.plan, // Just store the raw plan data
  //         notes: response.data.notes
  //       };
        
  //       // Add to saved plans
  //       setSavedPlans(prev => [...prev, duplicatedPlan]);
        
  //       toast.success(`Plan duplicated as "${duplicatedPlan.name}"`, {
  //         icon: "📋",
  //         style: {
  //           borderRadius: "10px",
  //           background: "#333",
  //           color: "#fff"
  //         }
  //       });
  //     } else {
  //       toast.error(response.message || "Failed to duplicate meal plan");
  //     }
  //   } catch (error) {
  //     console.error("Error duplicating meal plan:", error);
  //     toast.error("Failed to duplicate meal plan. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const handleViewPlan = (plan: SavedPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleViewPlanDetails = (plan: SavedPlan) => {
    // Format the date as YYYY-MM-DD for the URL
    let weekId;
    if (plan.week) {
      weekId = format(new Date(plan.week), "yyyy-MM-dd");
    } else if (plan.date) {
      weekId = format(new Date(plan.date), "yyyy-MM-dd");
    } else {
      weekId = format(new Date(), "yyyy-MM-dd");
    }
    
    // Navigate to the details page
    router.push(`/dashboard/meal-planner/${weekId}`);
  };


  const handleLoadPlan = async (plan: SavedPlan) => {
    if (!token || !plan.id) {
      toast.error("Unable to load meal plan");
      return;
    }
    
    setIsLoading(true);
    toast.loading("Loading meal plan...", { id: "loadplan" });
    
    try {
      // Get the full plan details from the API
      const response = await getMealPlanById(plan.id, token);
      
      if (response.success && response.data) {
        //("Loaded plan data:", response.data);
        
        // Transform backend plan to frontend format
        const frontendPlan: any = {};
        
        // Map backend day names to frontend day names
        const dayMap: {[key: string]: string} = {
          'monday': 'Mon',
          'tuesday': 'Tue',
          'wednesday': 'Wed',
          'thursday': 'Thu',
          'friday': 'Fri',
          'saturday': 'Sat',
          'sunday': 'Sun'
        };
        
        // Build the frontend plan with the exact structure expected by MealSlotItem
        for (const [backendDay, meals] of Object.entries(response.data.plan)) {
          // console.log(response.data.plan)
          // console.log(backendDay, meals)
          const frontendDay = dayMap[backendDay.toLowerCase()];
          
          if (frontendDay) {
            frontendPlan[frontendDay] = {};
            
            for (const [mealType, mealData] of Object.entries(meals as any)) {
              console.log(mealType, mealData)
              const recipeRef = (mealData as any).recipeDetails;
              let recipeData = null;
              
              if (typeof recipeRef === 'string') {
                console.log({recipeRef})
                // Create a simple placeholder with the ID
                recipeData = {
                  _id: recipeRef,
                  id: recipeRef,
                  title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
                  category: mealType
                };
              } else if (recipeRef && typeof recipeRef === 'object') {
                // Recipe is already an object
                recipeData = recipeRef;
              }
              
              if (recipeData) {
                //({recipeData})
                console.log({recipeData})
                // Create the meal data exactly matching the MealSlotItem expectations
                frontendPlan[frontendDay][mealType] = {
                  mealType,
                  recipe: {
                    // IMPORTANT: Using featuredImage instead of image
                    featuredImage: recipeData.featuredImage || recipeData.image || '',
                    title: recipeData.title || recipeData.name || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
                    category: recipeData.category || mealType,
                    // Optional fields
                    difficulty: recipeData.difficulty || undefined,
                    cookingTime: recipeData.cookingTime || recipeData.prepTime || undefined,
                    // Include other fields that might be needed
                    id: recipeData._id || recipeData.id,
                    _id: recipeData._id || recipeData.id,
                    description: recipeData.description || '',
                    ingredients: recipeData.ingredients || [],
                    instructions: recipeData.instructions || []
                  }
                };
              }
            }
          }
        }
        
        // Log the plan for debugging
        //("Transformed frontend plan:", frontendPlan);
        
        // Update current week key based on the plan's week
        const planWeek = startOfWeek(new Date(response.data.week), { weekStartsOn: 1 });
        const planWeekKey = format(planWeek, 'yyyy-MM-dd');
        
        // Update the weekly plan in the planner
        setAllWeekPlans(prev => {
          const updated = {...prev};
          updated[planWeekKey] = frontendPlan;
          return updated;
        });
        //(allWeekPlans, 'ALL WEEK PLANS')
        //({allWeekPlans})


        
        
        // Set the current date to match the plan's week
        // This will automatically update currentWeekKey through the useMemo dependency
        setCurrentDate(planWeek);
        
        // Switch to planner view
        setActiveTab("planner");
        
        toast.success(`Loaded plan "${response.data.name}"`, { id: "loadplan" });
      } else {
        toast.error(response.message || "Failed to load meal plan", { id: "loadplan" });
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
      toast.error("Failed to load meal plan. Please try again.", { id: "loadplan" });
    } finally {
      setIsLoading(false);
    }
  };
  const weekDates = useMemo(() => {
    const dates = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }
    
    return dates;
  }, [currentDate]);


  // Add a new state for showing the duplicate modal
const [showDuplicateModal, setShowDuplicateModal] = useState(false);
const [planToDuplicate, setPlanToDuplicate] = useState<SavedPlan | null>(null);

// Update the handleDuplicatePlan function
const handleDuplicatePlan = async (id: string, targetWeek?: Date) => {
  if (!token) {
    toast.error("You must be logged in to duplicate meal plans");
    return;
  }
  
  setIsLoading(true);
  toast.loading("Duplicating meal plan...", { id: "duplicateplan" });
  
  try {
    const response = await duplicateMealPlan(id, token, targetWeek);
    
    if (response.success && response.data) {
      // Create a new SavedPlan object from the response
      const duplicatedPlan = {
        id: response.data._id,
        _id: response.data._id,
        name: response.data.name,
        date: new Date(response.data.createdAt || new Date()),
        week: new Date(response.data.week),
        plan: response.data.plan,
        notes: response.data.notes || ""
      };
      
      // Add to saved plans
      setSavedPlans(prev => [...prev, duplicatedPlan]);
      
      toast.success(`Plan duplicated as "${duplicatedPlan.name}"`, {
        id: "duplicateplan",
        icon: "📋",
      });
    } else {
      toast.error(response.message || "Failed to duplicate meal plan", { id: "duplicateplan" });
    }
  } catch (error) {
    console.error("Error duplicating meal plan:", error);
    toast.error("Failed to duplicate meal plan. Please try again.", { id: "duplicateplan" });
  } finally {
    setIsLoading(false);
  }
};

// Create a wrapper function to handle the duplication flow
const startPlanDuplication = (plan: SavedPlan) => {
  setPlanToDuplicate(plan);
  setShowDuplicateModal(true);
  setShowPlanDetailsModal(false); // Close the details modal
};

// Handle confirming the duplication with a selected target week
const confirmDuplication = (targetWeek: Date) => {
  if (planToDuplicate && planToDuplicate.id) {
    handleDuplicatePlan(planToDuplicate.id, targetWeek);
  }
  setShowDuplicateModal(false);
  setPlanToDuplicate(null);
};

//({savedPlans})
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Meal Planner</h1>
          <div className="flex gap-3">
            {/* <button 
              onClick={handleGeneratePlan}
              className="px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition shadow-sm flex items-center"
            >
              <div className="mr-2">✨</div>
              Generate AI Plan
            </button> */}
            <button 
              onClick={() => setShowSaveModal(true)}
              className="px-4 py-2 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition flex items-center"
            >
              <Save size={18} className="mr-2" />
              Save Plan
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton 
          active={activeTab === "planner"} 
          onClick={() => setActiveTab("planner")}
          icon={<Calendar size={18} />}
        >
          Meal Planner
        </TabButton>
        <TabButton 
          active={activeTab === "grocery"} 
          onClick={() => setActiveTab("grocery")}
          icon={<ShoppingBag size={18} />}
        >
          Grocery List
        </TabButton>
        <TabButton 
          active={activeTab === "saved"} 
          onClick={() => setActiveTab("saved")}
          icon={<BookOpen size={18} />}
        >
          Saved Plans
        </TabButton>
      </div>
      
      {activeTab === "planner" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <CalendarHeader 
              currentDate={currentDate} 
              onPrevWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
              onToday={goToCurrentWeek}
            />
            <MealPlanCalendar 
              weekDates={weekDates}
              weekPlan={currentWeekPlan}
              onAddMeal={handleAddMeal}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GroceryList weekPlan={currentWeekPlan} />
            <NutritionSummary />
          </div>
        </div>
      )}
      
      {activeTab === "grocery" && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Weekly Grocery List</h2>
          <GroceryList weekPlan={currentWeekPlan} />
        </div>
      )}
      
      {activeTab === "saved" && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your Saved Plans</h2>
          
          {savedPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlans.map((plan) => {
                //(plan, 'PLAN AFTER MAPPINGGGG')
                
                return  (
                <div 
                  key={plan.id || plan._id} 
                  onClick={() => handleViewPlan(plan)}
                  className="bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-sm border border-[color:var(--purple-900)]/30 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[color:var(--purple-600)]/20 cursor-pointer transition group"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-white text-lg group-hover:text-white/90 transition">
                        {plan.name}
                      </h4>
                      <span className="text-xs bg-[color:var(--purple-900)]/40 text-white px-3 py-1 rounded-full border border-[color:var(--purple-700)]/40">
                        {format(plan.date, 'MMM d, yyyy')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-white/80 mb-4">
                      <div className="flex items-center mr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>7 days</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>{countMeals(plan.plan)} meals</span>
                      </div>
                    </div>
                    
                    <div className="flex -space-x-1.5 mb-5">
                      {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                        <div key={mealType} className={`w-5 h-5 rounded-full border ${
                          mealType === 'breakfast' ? 'bg-[color:var(--amber-600)]/50 border-[color:var(--amber-500)]/30' : 
                          mealType === 'lunch' ? 'bg-[color:var(--emerald-600)]/50 border-[color:var(--emerald-500)]/30' : 
                          'bg-[color:var(--blue-600)]/50 border-[color:var(--blue-500)]/30'
                        }`} title={`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} meals`}>
                        </div>
                      ))}
                      <div className="w-5 h-5 rounded-full bg-[color:var(--purple-800)]/50 border border-[color:var(--purple-700)]/30 text-white flex items-center justify-center text-xs">
                        +
                      </div>
                    </div>
                    
                    {/* <div className="flex justify-between items-center pt-3 border-t border-white/20">
                      <button 
                        className="flex items-center text-sm font-medium text-white hover:text-white/90 transition group-hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadPlan(plan);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Load Plan
                      </button>
                      
                      <div className="flex space-x-3">
                        <button 
                          className="flex items-center text-sm text-white/80 hover:text-white transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePlan(plan.id || plan._id || '');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Duplicate
                        </button>
                        
                        <button 
                          className="flex items-center text-sm text-white/80 hover:text-white transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id || plan._id || '');
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div> */}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800">No saved plans yet</h3>
              <p className="mt-1 text-gray-500">Create and save your first meal plan</p>
              <button 
                onClick={() => setActiveTab("planner")}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
              >
                Create a Plan
              </button>
            </div>
          )}
        </div>
      )}
      
      {showRecipeSelector && selectedMealInfo && (
        <RecipeSelector 
          recipes={recipes}
          isLoading={isLoadingRecipes}
          mealType={selectedMealInfo.mealType}
          onSelectRecipe={handleSelectRecipe}
          onClose={() => setShowRecipeSelector(false)}
          currentRecipe={
            currentWeekPlan[selectedMealInfo.day]?.[selectedMealInfo.mealType]?.recipe || null
          }
          onRemoveRecipe={handleRemoveMeal}
        />
      )}
      
      {showSaveModal && (
        <SavePlanModal 
          onSave={(name, notes) => handleSavePlan(name, notes)}
          onClose={() => setShowSaveModal(false)}
          isLoading={isLoading}
        />
      )}

{showPlanDetailsModal && selectedPlan && (
  <SavedPlanDetailsModal 
    countMeals={countMeals}
    plan={selectedPlan}
    onClose={() => setShowPlanDetailsModal(false)}
    onLoad={(plan) => handleLoadPlan(plan)}
    onViewDetails={() => handleViewPlanDetails(selectedPlan)}
    onDelete={() => {
      handleDeletePlan(selectedPlan.id || selectedPlan._id || '');
      setShowPlanDetailsModal(false);
    }}
    onDuplicate={() => {
      startPlanDuplication(selectedPlan);
    }}
  />
)}

{showDuplicateModal && planToDuplicate && (
  <DuplicatePlanModal
    planName={planToDuplicate.name}
    currentWeek={currentDate}
    onConfirm={confirmDuplication}
    onCancel={() => setShowDuplicateModal(false)}
  />
)}
    </div>
  );
};

export default MealPlannerPage;











// const handleLoadPlan = async (plan: SavedPlan) => {
//   if (!token || !plan.id) {
//     toast.error("Unable to load meal plan");
//     return;
//   }
  
//   setIsLoading(true);
//   toast.loading("Loading meal plan...", { id: "loadplan" });
  
//   try {
//     // Get the full plan details from the API
//     const response = await getMealPlanById(plan.id, token);
    
//     if (response.success && response.data) {
//       //("Loaded plan data:", response.data);
      
//       // Directly convert to frontend format with a simple transformation
      
//       // Update the meal planner with the loaded plan
//       setAllWeekPlans(prev => ({
//         ...prev,
//         [currentWeekKey]: response.data.plan
//       }));
//       //({weekPlans: allWeekPlans})
      
//       // Set the current date to match the plan's week
//       if (response.data.week) {
//         setCurrentDate(startOfWeek(new Date(response.data.week), { weekStartsOn: 1 }));
//       }
      
//       // Switch view to the planner tab
//       setActiveTab("planner");
      
//       toast.success(`Loaded plan "${response.data.name}"`, { id: "loadplan" });
//     } else {
//       toast.error(response.message || "Failed to load meal plan", { id: "loadplan" });
//     }
//   } catch (error) {
//     console.error("Error loading meal plan:", error);
//     toast.error("Failed to load meal plan. Please try again.", { id: "loadplan" });
//   } finally {
//     setIsLoading(false);
//   }
// };

// // Simple helper function to convert plan format - this is contained within handleLoadPlan
// const convertPlanToFrontendFormat = (backendPlan) => {
//   const frontendPlan = {};
  
//   // Day name mapping
//   const dayMap = {
//     'monday': 'Mon',
//     'tuesday': 'Tue',
//     'wednesday': 'Wed',
//     'thursday': 'Thu',
//     'friday': 'Fri',
//     'saturday': 'Sat',
//     'sunday': 'Sun'
//   };
  
//   // Convert each day and meal
//   for (const [backendDay, meals] of Object.entries(backendPlan)) {
//     const frontendDay = dayMap[backendDay.toLowerCase()];
    
//     if (frontendDay) {
//       frontendPlan[frontendDay] = {};
      
//       // Convert meals for this day
//       for (const [mealType, mealData] of Object.entries(meals)) {
//         const recipe = mealData.recipe;
        
//         // Create a recipe object - either use what we have or create a placeholder
//         let recipeObject;
        
//         if (typeof recipe === 'string') {
//           // If it's just an ID, create a placeholder recipe
//           recipeObject = {
//             _id: recipe,
//             id: recipe,
//             title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
//             description: "Recipe will be loaded when viewed",
//             image: "",
//             category: mealType,
//             ingredients: [],
//             instructions: [],
//             tags: []
//           };
//         } else if (recipe && typeof recipe === 'object') {
//           // If it's already an object, use it
//           recipeObject = recipe;
//         } else {
//           // Fallback - create a minimal placeholder
//           recipeObject = {
//             id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//             _id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
//             title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
//             description: "Missing recipe data",
//             image: "",
//             category: mealType,
//             tags: []
//           };
//         }
        
//         // Add to the frontend plan
//         frontendPlan[frontendDay][mealType] = {
//           mealType,
//           recipe: recipeObject
//         };
//       }
//     }
//   }
  
//   return frontendPlan;
// };

// // Add this debugging function
// const debugPlanData = (data: any, source: string) => {
// console.group(`Plan Data: ${source}`);
// //("Raw Data:", data);

// if (data.plan) {
//   // Sample one day to check data structure
//   const sampleDay = Object.keys(data.plan)[0];
//   if (sampleDay) {
//     const sampleDayData = data.plan[sampleDay];
//     //(`Sample day (${sampleDay}):`, sampleDayData);
    
//     // Sample one meal to check recipe structure
//     const sampleMealType = Object.keys(sampleDayData)[0];
//     if (sampleMealType) {
//       const sampleMeal = sampleDayData[sampleMealType];
//       //(`Sample meal (${sampleMealType}):`, sampleMeal);
      
//       if (sampleMeal.recipe) {
//         //("Recipe data:", sampleMeal.recipe);
//         //("Recipe ID:", sampleMeal.recipe._id || sampleMeal.recipe.id);
//         //("Recipe title:", sampleMeal.recipe.title);
//         //("Is title undefined?", sampleMeal.recipe.title === undefined);
//       }
      
//       if (sampleMeal.recipeDetails) {
//         //("RecipeDetails data:", sampleMeal.recipeDetails);
//       }
//     }
//   }
// }
// console.groupEnd();
// };