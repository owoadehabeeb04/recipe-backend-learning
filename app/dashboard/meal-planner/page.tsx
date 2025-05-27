"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  Plus,
  Star,
  Calendar as CalendarIcon,
  ShoppingBag,
  BookOpen,
  Save
} from "lucide-react";
import {
  CalendarHeader,
  MealPlanCalendar
} from "@/components/meal-planner/calendar";
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
import {
  createMealPlan,
  updateMealPlan,
  getMealPlanById,
  getUserMealPlans,
  deleteMealPlan,
  duplicateMealPlan
} from "../../api/(meal-planner)/mealplanner";
import { DuplicatePlanModal } from "@/components/meal-planner/duplicatePlanModal";

// Types
interface Recipe {
  _id: string;
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
        recipe: any;
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
    console.log(weekPlan[day], "weekPlan[day]");
    
    if (weekPlan[day]?.breakfast?.recipe?.length > 0) count++; 
    if (weekPlan[day]?.lunch?.recipe?.length > 0) count++;     
    if (weekPlan[day]?.dinner?.recipe?.length > 0) count++;    
  }
  return count;
};
const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ active, onClick, children, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-4 py-3 rounded-lg font-medium ${
        active
          ? "bg-purple-100 text-purple-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="ml-2">{children}</span>
    </button>
  );
};

// Main Page Component
const MealPlannerPage = () => {
  const [currentDate, setCurrentDate] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [allWeekPlans, setAllWeekPlans] = useState<WeekPlanStore>({});
  const [selectedMealInfo, setSelectedMealInfo] = useState<{
    day: string;
    mealType: string;
  } | null>(null);
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
    return format(startDate, "yyyy-MM-dd");
  }, [currentDate]);

  const currentWeekPlan = useMemo(() => {
    return allWeekPlans[currentWeekKey] || {};
  }, [allWeekPlans, currentWeekKey]);
  //
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToCurrentWeek = () =>
    setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const updateWeekPlan = (weekKey: string, newPlan: any) => {
    setAllWeekPlans((prev) => ({
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

    setAllWeekPlans((prev) => {
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
      icon: "🗑️",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff"
      }
    });

    setShowRecipeSelector(false);
    setSelectedMealInfo(null);
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!selectedMealInfo) return;

    const { day, mealType } = selectedMealInfo;

    setAllWeekPlans((prev) => {
      const newAllPlans = { ...prev };
      const currentPlan = newAllPlans[currentWeekKey]
        ? { ...newAllPlans[currentWeekKey] }
        : {};

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
      icon: "🍽️",
      style: {
        borderRadius: "10px",
        background: "#333",
        color: "#fff"
      }
    });
  };

  useEffect(() => {
    if (!token) return;

    async function fetchSavedPlans() {
      setIsLoading(true);
      try {
        const response = await getUserMealPlans(token);
        //({response})

        if (response.success && response.data) {
          const formattedPlans = response.data.map((plan: any) => ({
            id: plan._id,
            _id: plan._id,
            name: plan.name,
            date: new Date(plan.week), 
            week: new Date(plan.week),
            plan: plan.plan, 
            notes: plan.notes,
            connectedToCalendar: plan.connectedToCalendar || false,
            calendarEvents: plan.calendarEvents || [],
            createdAt: new Date(plan.createdAt || new Date()),
            updatedAt: new Date(plan.updatedAt || new Date()) ,
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

  useEffect(() => {
    if (!token) return;

    const fetchRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        // Fetch user recipes
        const recipeResponse = await getAllRecipes();
        if (recipeResponse.success && recipeResponse.data) {
          setRecipes(recipeResponse.data);
        }

        // Also fetch favorite recipes
        const favoritesResponse = await getFavorites(token);
        if (favoritesResponse.success && favoritesResponse.data) {
          // Mark favorite recipes
          const favoriteIds = new Set(
            favoritesResponse.data.map((fav: any) => fav.recipe._id || fav.recipe.id)
          );
          
          // Update existing recipes with favorite status
          setRecipes(prev => 
            prev.map(recipe => ({
              ...recipe,
              isFavorite: favoriteIds.has(recipe.id) || favoriteIds.has(recipe._id)
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("Failed to load recipes");
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, [token]);

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
      Object.values(currentWeekPlan).forEach((dayMeals) => {
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
      const backendPlan: { [key: string]: any } = {};

      // Map frontend days to backend days
      const dayMap = {
        Mon: "monday",
        Tue: "tuesday",
        Wed: "wednesday",
        Thu: "thursday",
        Fri: "friday",
        Sat: "saturday",
        Sun: "sunday"
      };

      Object.entries(currentWeekPlan).forEach(([frontendDay, meals]) => {
        const backendDay = dayMap[frontendDay as keyof typeof dayMap];

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
        notes: notes || ""
      };

      //("Sending to backend:", planData);

      const response = await createMealPlan(planData, token);

      // Clear success case
      if (response.success && response.data) {
        const savedPlan = {
          id: response.data._id,
          _id: response.data._id,
          name: response.data.name,
          date: new Date(response.data.week),
          week: new Date(response.data.week),
          plan: response.data.plan,
          notes: response.data.notes,
          connectedToCalendar: response.data.connectedToCalendar || false,
          calendarEvents: response.data.calendarEvents || [],
          createdAt: new Date(response.data.createdAt || new Date()),
          updatedAt: new Date(response.data.updatedAt || new Date())
        };

        setSavedPlans((prev) => [...prev, savedPlan]);

        toast.success(`Plan "${name}" has been saved!`, {
          id: "saveplan",
          icon: "💾"
        });
        return;
      }

      if (
        response.message &&
        response.message.includes("already have a meal plan")
      ) {
        toast("A meal plan for this week already exists", {
          id: "saveplan",
          icon: "ℹ️",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff"
          }
        });
        console.log(response.existingPlan, "EXISTING PLAN");

        if (response.existingPlan && response.existingPlan.id) {
          if (
            confirm(
              `A meal plan for this week already exists. Would you like to update it instead?`
            )
          ) {
            handleUpdatePlan(response.existingPlan.id, name, notes);
          } else {
            toast("Save cancelled. Your existing plan was not modified.", {
              id: "saveplan",
              icon: "ℹ️"
            });
          }
        } else {
          toast.error("Can't update the existing plan: missing plan ID", {
            id: "saveplan"
          });
        }
        return;
      }

      // Generic error case
      toast.error(response.message || "Failed to save meal plan", {
        id: "saveplan"
      });
    } catch (error) {
      console.error("Error saving meal plan:", error);
      toast.error("Failed to save meal plan. Please try again.", {
        id: "saveplan"
      });
    } finally {
      setIsLoading(false);
      setShowSaveModal(false);
    }
  };

  const handleUpdatePlan = async (
    planId: string,
    name: string,
    notes?: string
  ) => {
    if (!token) {
      toast.error("You must be logged in to update meal plans");
      return;
    }

    setIsLoading(true);

    try {
      // Create the plan data for the backend in the expected format
      const backendPlan: {
        [key: string]: { [key: string]: { mealType: string; recipe: string } };
      } = {};

      // Map frontend days to backend days
      const dayMap = {
        Mon: "monday",
        Tue: "tuesday",
        Wed: "wednesday",
        Thu: "thursday",
        Fri: "friday",
        Sat: "saturday",
        Sun: "sunday"
      };

      // Build the plan structure directly
      Object.entries(currentWeekPlan).forEach(([frontendDay, meals]) => {
        const backendDay = dayMap[frontendDay as keyof typeof dayMap];

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

          if (Object.keys(backendPlan[backendDay]).length === 0) {
            delete backendPlan[backendDay];
          }
        }
      });
      console.log({backendPlan})
      const updateData = {
        name,
        plan: backendPlan,
        notes: notes || "",
        isActive: true,
      };
      console.log(updateData, 'FUCKING DEBUG THIS SHIII !')

      const response = await updateMealPlan(planId, updateData, token);

      if (response.success && response.data) {
        setSavedPlans((prev) =>
          prev.map((plan) => {
            if (plan.id === planId || plan._id === planId) {
              return {
                ...plan,
                name: response.data.name,
                plan: response.data.plan,
                notes: response.data.notes,
                date: new Date(response.data.week),
                week: new Date(response.data.week),
                connectedToCalendar: response.data.connectedToCalendar || false,
                calendarEvents: response.data.calendarEvents || [],
                createdAt: new Date(response.data.createdAt || new Date()),
                updatedAt: new Date(response.data.updatedAt || new Date())
              };
            }
            return plan;
          })
        );

        toast.success(`Plan "${name}" has been updated!`, {});
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
        setSavedPlans((prev) =>
          prev.filter((plan) => plan.id !== planId && plan._id !== planId)
        );

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

  const handleViewPlan = (plan: SavedPlan) => {
    setSelectedPlan(plan);
    setShowPlanDetailsModal(true);
  };

  const handleViewPlanDetails = (plan: SavedPlan) => {
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

  const handleLoadPlan = async (plan: SavedPlan, options?: { preserveTab?: boolean }) => {
    if (!token || !plan.id) {
      toast.error("Unable to load meal plan");
      return;
    }
    if (!options?.preserveTab) {
      setActiveTab("planner");
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
        const dayMap: { [key: string]: string } = {
          monday: "Mon",
          tuesday: "Tue",
          wednesday: "Wed",
          thursday: "Thu",
          friday: "Fri",
          saturday: "Sat",
          sunday: "Sun"
        };

        // Build the frontend plan with the exact structure expected by MealSlotItem
        for (const [backendDay, meals] of Object.entries(response.data.plan)) {
      
          const frontendDay = dayMap[backendDay.toLowerCase()];

          if (frontendDay) {
            frontendPlan[frontendDay] = {};

            for (const [mealType, mealData] of Object.entries(meals as any)) {
              console.log(mealType, mealData);
              const recipeRef = (mealData as any).recipeDetails;
              let recipeData = null;

              if (typeof recipeRef === "string") {
                console.log({ recipeRef });
                // Create a simple placeholder with the ID
                recipeData = {
                  _id: recipeRef,
                  id: recipeRef,
                  title: `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
                  category: mealType
                };
              } else if (recipeRef && typeof recipeRef === "object") {
                // Recipe is already an object
                recipeData = recipeRef;
              }

              if (recipeData) {
                //({recipeData})
                console.log({ recipeData });
                // Create the meal data exactly matching the MealSlotItem expectations
                frontendPlan[frontendDay][mealType] = {
                  mealType,
                  recipe: {
                    featuredImage:
                      recipeData.featuredImage || recipeData.image || "",
                    title:
                      recipeData.title ||
                      recipeData.name ||
                      `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} Recipe`,
                    category: recipeData.category || mealType,
                    difficulty: recipeData.difficulty || undefined,
                    cookingTime:
                      recipeData.cookingTime ||
                      recipeData.prepTime ||
                      undefined,
                    id: recipeData._id || recipeData.id,
                    _id: recipeData._id || recipeData.id,
                    description: recipeData.description || "",
                    ingredients: recipeData.ingredients || [],
                    instructions: recipeData.instructions || []
                  }
                };
              }
            }
          }
        }

        
        // Update current week key based on the plan's week
        const planWeek = startOfWeek(new Date(response.data.week), {
          weekStartsOn: 1
        });
        const planWeekKey = format(planWeek, "yyyy-MM-dd");

        // Update the weekly plan in the planner
        setAllWeekPlans((prev) => {
          const updated = { ...prev };
          // If we already have meals for this week, merge them
          if (updated[planWeekKey]) {
            // Deep merge the existing plan and new plan
            const mergedPlan = { ...updated[planWeekKey] };
            
            // Merge each day from the loaded plan
            for (const day in frontendPlan) {
              if (!mergedPlan[day]) {
                mergedPlan[day] = {};
              }
              
              // Merge meals for this day
              for (const mealType in frontendPlan[day]) {
                mergedPlan[day][mealType] = frontendPlan[day][mealType];
              }
            }
            
            updated[planWeekKey] = mergedPlan;
          } else {
            // No existing plan for this week, just use the loaded one
            updated[planWeekKey] = frontendPlan;
          }
          
          return updated;
        });
        //(allWeekPlans, 'ALL WEEK PLANS')
        //({allWeekPlans})

        // Set the current date to match the plan's week
        // This will automatically update currentWeekKey through the useMemo dependency
        setCurrentDate(planWeek);

        // Switch to planner view
        setActiveTab("planner");

        toast.success(`Loaded plan "${response.data.name}"`, {
          id: "loadplan"
        });
      } else {
        toast.error(response.message || "Failed to load meal plan", {
          id: "loadplan"
        });
      }
    } catch (error) {
      console.error("Error loading meal plan:", error);
      toast.error("Failed to load meal plan. Please try again.", {
        id: "loadplan"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMostRecentPlan = useCallback(async () => {
    if (!token || savedPlans.length === 0) return;
    
    // Sort plans by date (newest first)
    const sortedPlans = [...savedPlans].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    // Find plan for current week if exists
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekFormatted = format(currentWeekStart, 'yyyy-MM-dd');
    
    const currentWeekPlan = sortedPlans.find(plan => {
      const planWeekStart = startOfWeek(new Date(plan.date), { weekStartsOn: 1 });
      return format(planWeekStart, 'yyyy-MM-dd') === currentWeekFormatted;
    });
    
    // Load current week plan if exists, otherwise load most recent
    const planToLoad = currentWeekPlan || sortedPlans[0];
    if (planToLoad) {
      await handleLoadPlan(planToLoad);
    }
  }, [token, savedPlans, handleLoadPlan]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (savedPlans.length > 0 && !isLoading && !initialLoadComplete) {
      loadMostRecentPlan().then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, [savedPlans, isLoading, initialLoadComplete, loadMostRecentPlan]);

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
  const [planToDuplicate, setPlanToDuplicate] = useState<SavedPlan | null>(
    null
  );

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
        setSavedPlans((prev) => [...prev, duplicatedPlan]);

        toast.success(`Plan duplicated as "${duplicatedPlan.name}"`, {
          id: "duplicateplan",
          icon: "📋"
        });
      } else {
        toast.error(response.message || "Failed to duplicate meal plan", {
          id: "duplicateplan"
        });
      }
    } catch (error) {
      console.error("Error duplicating meal plan:", error);
      toast.error("Failed to duplicate meal plan. Please try again.", {
        id: "duplicateplan"
      });
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

  useEffect(()=> {
console.log({savedPlans})
  }, [])
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl mb-8 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Meal Planner</h1>
          <div className="flex gap-3">
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
        </div>
      )}

      {activeTab === "grocery" && (
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Weekly Grocery List</h2>
          <GroceryList weekPlan={currentWeekPlan} />
        </div>
      )}

      {activeTab === "saved" && (
        <div className="bg-white p-6 rounded-xl  shadow-md">
          <h2 className="text-2xl text-gray-700  font-bold mb-4">
            Your Saved Plans
          </h2>

          {savedPlans.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlans.map((plan) => {
                //(plan, 'PLAN AFTER MAPPINGGGG')

                return (
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
                          {format(plan.date, "MMM d, yyyy")}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-white/80 mb-4">
                        <div className="flex items-center mr-4">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>7 days</span>
                        </div>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1.5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                          <span>{countMeals(plan.plan)} meals</span>
                        </div>
                      </div>

                      <div className="flex -space-x-1.5 mb-5">
                        {["breakfast", "lunch", "dinner"].map((mealType) => (
                          <div
                            key={mealType}
                            className={`w-5 h-5 rounded-full border ${
                              mealType === "breakfast"
                                ? "bg-[color:var(--amber-600)]/50 border-[color:var(--amber-500)]/30"
                                : mealType === "lunch"
                                  ? "bg-[color:var(--emerald-600)]/50 border-[color:var(--emerald-500)]/30"
                                  : "bg-[color:var(--blue-600)]/50 border-[color:var(--blue-500)]/30"
                            }`}
                            title={`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} meals`}
                          ></div>
                        ))}
                        <div className="w-5 h-5 rounded-full bg-[color:var(--purple-800)]/50 border border-[color:var(--purple-700)]/30 text-white flex items-center justify-center text-xs">
                          +
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-4">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                No saved plans yet
              </h3>
              <p className="mt-1 text-gray-500">
                Create and save your first meal plan
              </p>
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
            currentWeekPlan[selectedMealInfo.day]?.[selectedMealInfo.mealType]
              ?.recipe || null
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
          id={selectedPlan.id || selectedPlan._id || ""}
          countMeals={countMeals}
          plan={selectedPlan}
          onClose={() => setShowPlanDetailsModal(false)}
          onLoad={(plan) => handleLoadPlan(plan, { preserveTab: activeTab === "saved" })}
                    onViewDetails={() => handleViewPlanDetails(selectedPlan)}
          onDelete={() => {
            handleDeletePlan(selectedPlan.id || selectedPlan._id || "");
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
