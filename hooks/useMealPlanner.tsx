import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from "date-fns";
import { toast } from 'react-hot-toast';
import {
  createMealPlan,
  updateMealPlan,
  getMealPlanById,
  getUserMealPlans,
  deleteMealPlan,
  duplicateMealPlan,
  getMealPlanByWeek
} from "@/app/api/(meal-planner)/mealplanner";

export const useMealPlanner = (token: string | null | undefined, initialDate: Date) => {
  // State
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [allWeekPlans, setAllWeekPlans] = useState<any>({});
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentWeekPlanId, setCurrentWeekPlanId] = useState<string | null>(null);

  // Derived values
  const currentWeekKey = useMemo(() => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    return format(startDate, "yyyy-MM-dd");
  }, [currentDate]);

  const currentWeekPlan = useMemo(() => {
    return allWeekPlans[currentWeekKey] || {};
  }, [allWeekPlans, currentWeekKey]);

  const weekDates = useMemo(() => {
    const dates = [];
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });

    for (let i = 0; i < 7; i++) {
      dates.push(addDays(startDate, i));
    }

    return dates;
  }, [currentDate]);

  // Fetch saved plans
  useEffect(() => {
    if (!token) return;

    async function fetchSavedPlans() {
      setIsLoading(true);
      try {
        const response = await getUserMealPlans(token);

        if (response.success && response.data) {
          const formattedPlans = response.data.map((plan: any) => ({
            id: plan._id,
            _id: plan._id,
            name: plan.name,
            date: new Date(plan.week), 
            week: new Date(plan.week),
            plan: plan.plan, 
            notes: plan.notes
          }));

          setSavedPlans(formattedPlans);
        }
      } catch (error) {
        console.error("Error fetching saved plans:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSavedPlans();
  }, [token]);

  // Auto-load current week's meal plan
  useEffect(() => {
    if (!token) return;

    const fetchCurrentWeekMealPlan = async () => {
      setInitialLoading(true);
      
      try {
        // Format the current week for the API call
        const weekDateStr = format(currentDate, "yyyy-MM-dd");
        const response = await getMealPlanByWeek(weekDateStr, token);

        if (response.success && response.data) {
          // Store the current plan ID for future updates
          setCurrentWeekPlanId(response.data._id);
          
          // Convert backend plan format to frontend format
          const frontendPlan = convertBackendToFrontendPlan(response.data.plan);
          
          // Update the allWeekPlans state with this plan
          setAllWeekPlans((prev: any) => ({
            ...prev,
            [currentWeekKey]: frontendPlan
          }));
          
          toast.success(`Loaded meal plan: ${response.data.name}`, {
            id: 'autoload',
            duration: 2000
          });
        }
      } catch (error) {
        console.error("Error auto-loading meal plan:", error);
        // Silent failure for auto-loading
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCurrentWeekMealPlan();
  }, [token, currentWeekKey]); 

  // Helper function to convert backend plan format to frontend format
  const convertBackendToFrontendPlan = (backendPlan: any) => {
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

    // Build the frontend plan with the exact structure expected
    for (const [backendDay, meals] of Object.entries(backendPlan || {})) {
      const frontendDay = dayMap[backendDay.toLowerCase()];

      if (frontendDay) {
        frontendPlan[frontendDay] = {};

        for (const [mealType, mealData] of Object.entries(meals as any)) {
          const recipeRef = (mealData as any).recipeDetails;
          let recipeData: any = null;

          if (typeof recipeRef === "string") {
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
            // Create the meal data matching frontend expectations
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
    
    return frontendPlan;
  };

  // Handle meal manipulation
  const handleAddMealToWeek = (mealInfo: { day: string, mealType: string }, recipe: any) => {
    const { day, mealType } = mealInfo;

    setAllWeekPlans((prev: any) => {
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
  };

  const handleRemoveMealFromWeek = (mealInfo: { day: string, mealType: string }) => {
    const { day, mealType } = mealInfo;

    setAllWeekPlans((prev: any) => {
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
  };

  // Plan saving & loading
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
      Object.values(currentWeekPlan).forEach((dayMeals: any) => {
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

        if (backendDay && Object.keys(meals as any).length > 0) {
          backendPlan[backendDay] = {};

          Object.entries(meals as any).forEach(([mealType, mealData]) => {
            const recipe = (mealData as any).recipe;

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

      const response = await createMealPlan(planData, token);

      // Success case
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

        // Store the plan ID for this week
        setCurrentWeekPlanId(response.data._id);

        setSavedPlans((prev) => [...prev, savedPlan]);

        toast.success(`Plan "${name}" has been saved!`, {
          id: "saveplan",
          icon: "💾"
        });
        return;
      }

      // Plan already exists case
      if (
        response.message &&
        response.message.includes("already have a meal plan")
      ) {
        toast("A meal plan for this week already exists", {
          id: "saveplan",
          icon: "ℹ️",
          style: { borderRadius: "10px", background: "#333", color: "#fff" }
        });

        if (response.existingPlan && response.existingPlan.id) {
          if (
            confirm(`A meal plan for this week already exists. Would you like to update it instead?`)
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

        if (backendDay && Object.keys(meals as any).length > 0) {
          backendPlan[backendDay] = {};

          Object.entries(meals as any).forEach(([mealType, mealData]) => {
            const recipe = (mealData as any).recipe;

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

      const updateData = {
        name,
        plan: backendPlan,
        notes: notes || "",
        isActive: true,
      };

      const response = await updateMealPlan(planId, updateData, token);

      if (response.success && response.data) {
        setSavedPlans((prev) =>
          prev.map((plan) => {
            if (plan.id === planId || plan._id === planId) {
              return {
                ...plan,
                name: response.data.name,
                plan: response.data.plan,
                notes: response.data.notes
              };
            }
            return plan;
          })
        );

        toast.success(`Plan "${name}" has been updated!`, {
          id: "saveplan" 
        });
      } else {
        toast.error(response.message || "Failed to update meal plan", {
          id: "saveplan"
        });
      }
    } catch (error) {
      console.error("Error updating meal plan:", error);
      toast.error("Failed to update meal plan. Please try again.", {
        id: "saveplan"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPlan = async (plan: any, onSuccessCallback?: () => void) => {
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
        // Store the plan ID for this week
        setCurrentWeekPlanId(response.data._id);
        
        // Transform backend plan to frontend format
        const frontendPlan = convertBackendToFrontendPlan(response.data.plan);
        
        // Update the weekly plan in the planner
        setAllWeekPlans((prev: any) => {
          const updated = { ...prev };
          
          // Update the plan for the week it corresponds to
          const planWeek = startOfWeek(new Date(response.data.week), {
            weekStartsOn: 1
          });
          const planWeekKey = format(planWeek, "yyyy-MM-dd");
          
          updated[planWeekKey] = frontendPlan;
          return updated;
        });
  
        // Set the current date to match the plan's week
        setCurrentDate(startOfWeek(new Date(response.data.week), { weekStartsOn: 1 }));
  
        toast.success(`Loaded plan "${response.data.name}"`, {
          id: "loadplan"
        });
        
        // Execute the success callback if provided
        // This is where the tab navigation would happen
        if (onSuccessCallback) {
          onSuccessCallback();
        }
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

  const handleDeletePlan = async (planId: string) => {
    if (!token) {
      toast.error("You must be logged in to delete meal plans");
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

        // If we deleted the current week's plan, clear the current week plan ID
        if (planId === currentWeekPlanId) {
          setCurrentWeekPlanId(null);
        }

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

  const handleDuplicatePlan = async (id: string, targetWeek?: Date) => {
    if (!token) {
      toast.error("You must be logged in to duplicate meal plans");
      return;
    }

    setIsLoading(true);
    toast.loading("Duplicating meal plan...", { id: "duplicateplan" });

    try {
      const targetWeekStr: any = targetWeek ? format(targetWeek, 'yyyy-MM-dd') : undefined;
      const response = await duplicateMealPlan(id,token, targetWeekStr! );

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

        // Load the duplicated plan into the current view
        const duplicatedWeekStart = startOfWeek(new Date(response.data.week), { weekStartsOn: 1 });
        setCurrentDate(duplicatedWeekStart);
        setCurrentWeekPlanId(response.data._id);
        
        // Transform and set plan data
        const frontendPlan = convertBackendToFrontendPlan(response.data.plan);
        const weekKey = format(duplicatedWeekStart, "yyyy-MM-dd");
        
        setAllWeekPlans((prev: any) => ({
          ...prev,
          [weekKey]: frontendPlan
        }));

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

  return {
    currentDate,
    setCurrentDate,
    weekDates,
    currentWeekKey,
    currentWeekPlan,
    currentWeekPlanId,
    allWeekPlans,
    setAllWeekPlans,
    savedPlans,
    isLoading,
    initialLoading,
    handleAddMealToWeek,
    handleRemoveMealFromWeek,
    handleSavePlan,
    handleUpdatePlan,
    handleLoadPlan,
    handleDeletePlan,
    handleDuplicatePlan,
    convertBackendToFrontendPlan,
  };
};